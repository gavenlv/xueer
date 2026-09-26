/** 首页：今日概览、中考分值一览、学科与模块（按分值排序）、快捷入口、继续学习 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getModuleMeta, liveSubjects, menuSubjects, weightOf } from '../data/subjects';
import { totalsOfModule, totalsOfSubject } from '../data/totals';
import { DAILY_LINES, ENTRY_META, MODULE_TOTALS } from '../data/summary';
import { subjectOfModule } from '../data';
import type { ModuleId } from '../types';
import { useStreak, useStudy } from '../store/StudyContext';
import { dateKey, pct, timeAgo } from '../lib/utils';
import type { ItemProgress } from '../types';
import { ProgressBar, SectionTitle, Stat, Tag } from '../components/common';
import { WeightBoard } from '../components/SubjectBoard';

const DAILY_GOAL = 20;

/**
 * 一级菜单 = 全部计分科目，按 2027—2029 广州中考满分降序（数学 150 → 体育 70）。
 * 待开发科目也列出来：分值不会因为没开发就消失，学生早看到早规划。
 */
const MENU_SUBJECTS = menuSubjects();

/** 已有内容的科目（统计、默认选中只用这些，避免默认落在一个空科目上） */
const LIVE_SUBJECTS = liveSubjects();

/**
 * 每个学科「最常用的一步」：首页快捷入口点一下就到。
 * 语文最常做的是默写，历史最常做的是整卷模拟——这是两科学习方式的差别，
 * 硬套同一个按钮反而两边都不好用。
 */
const SUBJECT_QUICK: Record<string, { to: string; label: string; icon: string }> = {
  chinese: { to: '/practice/poems', label: '古诗文默写', icon: '✍️' },
  history: { to: '/s/history/hist-exam', label: '整卷模拟考试', icon: '📝' },
};

/**
 * 首页是**总览页**，刻意不加载任何模块的正文数据：
 * 它只用 `data/summary.ts` 那份轻量清单（id / 标题 / 模块 / 题量 / 名句池），
 * 因此首屏不会被内容文本拖慢。清单由 `pnpm gen` 生成、`pnpm validate` 校验。
 *
 * @data-summary-only 声明本页只用轻量清单（校验脚本据此跳过「必须调用 useDataScope」的检查）
 */
const META_BY_ID = new Map(ENTRY_META.map((m) => [m.id, m]));

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了，早点休息';
  if (h < 11) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

export default function Home() {
  const { state } = useStudy();
  const streak = useStreak();

  const today = state.daily[dateKey()] ?? { answered: 0, correct: 0, minutes: 0 };
  const checkedToday = state.checkins.includes(dateKey());

  /**
   * 当前选中的学科。
   *
   * 默认选「最近学过的那一科」——学生上次在学历史，今天打开首页就该看见历史，
   * 而不是每次都从语文开始翻。没有任何学习记录时取第一个已上线学科（语文）。
   * 学科很多时这里也只占一行 chips，不会把首页撑长。
   */
  const [subjectId, setSubjectId] = useState<string>(() => {
    let best: { id: string; at: number } | null = null;
    for (const [id, p] of Object.entries(state.progress)) {
      if (!p.lastAt) continue;
      const meta = META_BY_ID.get(id);
      const sid = meta ? subjectOfModule(meta.moduleId) : undefined;
      if (!sid) continue;
      if (!best || p.lastAt > best.at) best = { id: sid, at: p.lastAt };
    }
    return best?.id ?? LIVE_SUBJECTS[0]?.id ?? 'chinese';
  });
  const subject = MENU_SUBJECTS.find((s) => s.id === subjectId) ?? LIVE_SUBJECTS[0] ?? MENU_SUBJECTS[0];
  const subjectTotals = subject ? totalsOfSubject(subject.id) : null;
  const quick = subject ? SUBJECT_QUICK[subject.id] : undefined;

  /* 该学科已学多少条（学科 chips 上的进度小字） */
  const studiedBySubject = useMemo(() => {
    const out: Record<string, number> = {};
    for (const id of Object.keys(state.progress)) {
      if (!(state.progress[id]?.studied ?? 0)) continue;
      const meta = META_BY_ID.get(id);
      const sid = meta ? subjectOfModule(meta.moduleId) : undefined;
      if (sid) out[sid] = (out[sid] ?? 0) + 1;
    }
    return out;
  }, [state.progress]);

  /** 学科条目数（chips 上用；来自轻量清单，不加载正文） */
  const entriesBySubject = useMemo(() => {
    const moduleToSubject = new Map<string, string>();
    for (const s of MENU_SUBJECTS) for (const m of s.modules) moduleToSubject.set(m.id, s.id);
    const out: Record<string, number> = {};
    for (const t of MODULE_TOTALS) {
      const sid = moduleToSubject.get(t.id);
      if (sid) out[sid] = (out[sid] ?? 0) + t.entries;
    }
    return out;
  }, []);
  /* 全库学习进度 */
  const overall = useMemo(() => {
    const ids = Object.keys(state.progress);
    const studied = ids.filter((id) => (state.progress[id]?.studied ?? 0) > 0).length;
    const total = ENTRY_META.length;
    let correct = 0;
    let answered = 0;
    for (const p of Object.values(state.progress)) {
      correct += p.correct ?? 0;
      answered += p.total ?? 0;
    }
    // 全局正确率改用每日统计聚合，更准确
    let dCorrect = 0;
    let dAnswered = 0;
    for (const d of Object.values(state.daily)) {
      dCorrect += d.correct;
      dAnswered += d.answered;
    }
    return {
      studied,
      total,
      accuracy: dAnswered > 0 ? Math.round((dCorrect / dAnswered) * 100) : null,
      wrongCount: Object.keys(state.wrong).length,
    };
  }, [state.progress, state.daily, state.wrong]);

  /* 继续学习：最近学过的 3 条 */
  const recent = useMemo(() => {
    return Object.entries(state.progress)
      .filter(([, p]) => p.lastAt > 0)
      .sort((a, b) => b[1].lastAt - a[1].lastAt)
      .slice(0, 3)
      .map(([id, p]) => ({ entry: META_BY_ID.get(id), progress: p }))
      .filter(
        (x): x is { entry: NonNullable<ReturnType<typeof META_BY_ID.get>>; progress: ItemProgress } =>
          x.entry !== undefined,
      );
  }, [state.progress]);

  /* 每日一句：按日期稳定选取（名句池来自轻量清单，不必加载整本诗词） */
  const dailyQuote = useMemo(() => {
    if (!DAILY_LINES.length) return null;
    const seed = Number(dateKey().replace(/-/g, ''));
    return DAILY_LINES[seed % DAILY_LINES.length];
  }, []);

  /* 收藏 */
  const starred = useMemo(
    () =>
      Object.entries(state.progress)
        .filter(([, p]) => p.starred)
        .map(([id]) => META_BY_ID.get(id))
        .filter((x): x is NonNullable<typeof x> => x !== undefined),
    [state.progress],
  );

  return (
    <div className="stack stack--lg">
      {/* 英雄区 */}
      <section className="hero slide-up">
        <div className="hero__inner">
          <h1 className="hero__title">{greeting()}，同学</h1>
          <p className="hero__desc">
            {checkedToday
              ? `今天已打卡 ✦ 连续 ${streak} 天。做几道题保持手感吧。`
              : '今日还未打卡，从一首古诗或一组字词开始吧。'}
          </p>

          <div style={{ marginTop: 18, maxWidth: 420 }}>
            <div
              className="row row--between"
              style={{ color: '#fff', fontSize: 12.5, marginBottom: 6, opacity: 0.95 }}
            >
              <span>今日目标 {DAILY_GOAL} 题</span>
              <span>
                {Math.min(today.answered, DAILY_GOAL)} / {DAILY_GOAL}
              </span>
            </div>
            <div
              className="progress"
              style={{ background: 'rgba(255,255,255,.24)', height: 8 }}
            >
              <div
                className="progress__bar"
                style={{
                  width: `${Math.min(100, pct(today.answered, DAILY_GOAL))}%`,
                  background: '#fff',
                }}
              />
            </div>
          </div>

          <div className="hero__actions">
            {recent.length ? (
              <Link
                className="btn btn--white"
                to={`/s/${getModuleMeta(recent[0].entry.moduleId)?.subject.id ?? 'chinese'}/${recent[0].entry.moduleId}/${recent[0].entry.id}`}
              >
                ▶ 继续：{recent[0].entry.title.length > 10 ? `${recent[0].entry.title.slice(0, 10)}…` : recent[0].entry.title}
              </Link>
            ) : null}
            {subject && quick ? (
              <Link className="btn btn--white" to={quick.to}>
                {quick.icon} {subject.name}
                {quick.label}
              </Link>
            ) : null}
            {subject ? (
              <Link className="btn" to={`/s/${subject.id}`}>
                进入{subject.name} →
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* 今日概览 */}
      <section className="stack stack--sm">
        <SectionTitle sub="今天的学习数据，答错和答对都会记录">今日概览</SectionTitle>
        <div className="grid grid--3">
          <Stat value={today.answered} label="今日答题" tone="#2f66d6" />
          <Stat
            value={today.answered ? `${pct(today.correct, today.answered)}%` : '—'}
            label="今日正确率"
            tone="#1a9a6c"
          />
          <Stat value={`${Math.round(today.minutes)}`} label="学习分钟" tone="#bd8a25" />
        </div>
      </section>

      {/* 每日一句 */}
      {dailyQuote ? (
        <section className="card card--pad">
          <div className="row row--between" style={{ marginBottom: 10 }}>
            <Tag tone="gold">🖋 每日一句</Tag>
            <Link
              className="small"
              to={`/s/chinese/poems/${dailyQuote.entryId}`}
              style={{ color: 'var(--c-primary)' }}
            >
              查看全篇 →
            </Link>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-kai)',
              fontSize: 20,
              lineHeight: 1.9,
              letterSpacing: '0.04em',
            }}
          >
            {dailyQuote.text}
          </div>
          <div className="small muted" style={{ marginTop: 6 }}>
            —— {dailyQuote.from}
          </div>
        </section>
      ) : null}

      {/* 中考分值一览：一级菜单的信息骨架，按满分降序 */}
      <WeightBoard currentId={subject?.id} />

      {/* 学科与模块：二级结构，一次只展示一科，切换学科不用重新进页面 */}
      <section className="stack stack--sm">
        <SectionTitle
          sub="科目按中考满分排序 · 点科目切换，模块直接进；手机端在底部栏点「📚 学科」"
          extra={
            subject ? (
              <Link className="btn btn--sm" to={`/s/${subject.id}`}>
                {subject.name}首页 →
              </Link>
            ) : null
          }
        >
          学科与模块
        </SectionTitle>

        {/* 学科切换：横向可滑，手机上也不会挤成两行 */}
        <div className="scroll-x subj-tabs">
          {MENU_SUBJECTS.map((s) => {
            const st = totalsOfSubject(s.id);
            return (
              <button
                key={s.id}
                className={`subj-tab${s.id === subject?.id ? ' is-active' : ''}`}
                style={s.id === subject?.id ? { borderColor: s.color, color: s.color } : undefined}
                onClick={() => setSubjectId(s.id)}
                aria-pressed={s.id === subject?.id}
              >
                <span className="subj-tab__icon" style={{ background: `${s.color}18` }}>
                  {s.icon}
                </span>
                <span className="subj-tab__body">
                  <span className="subj-tab__name">
                    {s.name}
                    <span className="subj-tab__score" style={{ color: s.color, marginLeft: 6 }}>
                      {s.score}分
                    </span>
                  </span>
                  <span className="subj-tab__meta">
                    {s.available ? (
                      <>
                        {entriesBySubject[s.id] ?? st.entries} 条内容 · {s.modules.length} 模块
                        {studiedBySubject[s.id] ? ` · 已学 ${studiedBySubject[s.id]}` : ''}
                      </>
                    ) : (
                      <>待开发 · {s.modules.length} 个模块待上线</>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {subject ? (
          <>
            <div className="small muted">
              {subject.icon} {subject.name}：{subject.desc}
              {` · 中考 ${subject.score} 分（占 ${weightOf(subject)}%）`}
              {subject.available && subjectTotals ? ` · 共 ${subjectTotals.questions} 道题` : ''}
            </div>
            {subject.available ? null : (
              <div className="small" style={{ color: '#8d6410' }}>
                🚧 本科目内容正在准备中，下面是可以先了解的模块轮廓，点进去可查看规划。
              </div>
            )}
            <div className="grid grid--auto">
              {subject.modules.map((m) => {
                const ms = totalsOfModule(m.id as ModuleId);
                return (
                  <Link key={m.id} className="module-card" to={`/s/${subject.id}/${m.id}`}>
                    <span className="module-card__accent" style={{ background: m.color }} />
                    <span
                      className="module-card__icon"
                      style={{ background: `${m.color}16`, color: m.color }}
                    >
                      {m.icon}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="module-card__name" style={{ display: 'block' }}>
                        {m.name}
                      </span>
                      <span className="module-card__desc" style={{ display: 'block' }}>
                        {m.desc}
                      </span>
                      <span className="module-card__foot">
                        {m.available
                          ? `${ms.entries} 条内容 · ${ms.questions} 题`
                          : '待开发 · 点进去看规划'}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        ) : null}
      </section>

      {/* 快捷入口：跨学科共用的一步直达 */}
      <section className="stack stack--sm">
        <SectionTitle sub="不用记路径，一步直达">快捷入口</SectionTitle>
        <div className="scroll-x quick-row">
          <Link className="quick" to="/s/chinese/recite">
            <span className="quick__icon">📅</span>
            <span className="quick__label">今日背诵</span>
            <span className="quick__desc">间隔重复排期</span>
          </Link>
          <Link className="quick" to="/s/history/hist-exam">
            <span className="quick__icon">📝</span>
            <span className="quick__label">整卷模拟考试</span>
            <span className="quick__desc">历史 70 分 · 60 分钟</span>
          </Link>
          <Link className="quick" to="/s/history/exam">
            <span className="quick__icon">📊</span>
            <span className="quick__label">历史考点与考情</span>
            <span className="quick__desc">重点 / 次重点 / 材料大题</span>
          </Link>
          <Link className="quick" to="/s/chinese/exam">
            <span className="quick__icon">🎯</span>
            <span className="quick__label">语文考点</span>
            <span className="quick__desc">按知识点聚合</span>
          </Link>
          <Link className="quick" to="/s/history/hist-topics">
            <span className="quick__icon">🔀</span>
            <span className="quick__label">历史中考专题</span>
            <span className="quick__desc">跨册关联与中外对比</span>
          </Link>
          <Link className="quick" to="/s/chinese/extras">
            <span className="quick__icon">🧩</span>
            <span className="quick__label">知识拓展</span>
            <span className="quick__desc">导图与拓展阅读</span>
          </Link>
          <Link className="quick" to={`/s/${subject?.id ?? 'chinese'}/wrong`}>
            <span className="quick__icon">🗂️</span>
            <span className="quick__label">错题本</span>
            <span className="quick__desc">
              {overall.wrongCount > 0 ? `${overall.wrongCount} 道待清` : '暂无错题'}
            </span>
          </Link>
        </div>
      </section>

      {/* 学习总览 */}
      <section className="card card--pad stack stack--sm">
        <SectionTitle sub="全部学科累计数据">我的进度</SectionTitle>
        <div className="row row--between small">
          <span>
            已学内容 {overall.studied} / {overall.total}
          </span>
          <span className="muted">总正确率 {overall.accuracy === null ? '—' : `${overall.accuracy}%`}</span>
        </div>
        <ProgressBar value={overall.studied} max={Math.max(1, overall.total)} />
        <div className="row row--wrap" style={{ marginTop: 6 }}>
          <Link className="btn btn--sm" to="/s/chinese/extras">
            🧩 思维导图与拓展
          </Link>
          <Link className="btn btn--sm" to="/stats">
            📊 学习报告
          </Link>
          <Link className="btn btn--sm" to={`/s/${subject?.id ?? 'chinese'}/wrong`}>
            🗂️ 错题本 {overall.wrongCount > 0 ? `(${overall.wrongCount})` : ''}
          </Link>
          {starred.length > 0 ? (
            <Tag tone="gold">⭐ 已收藏 {starred.length} 条</Tag>
          ) : null}
        </div>
      </section>

      {/* 继续学习 */}
      {recent.length > 0 ? (
        <section className="stack stack--sm">
          <SectionTitle sub="接着上次的地方继续">继续学习</SectionTitle>
          <div className="card" style={{ overflow: 'hidden' }}>
            {recent.map(({ entry, progress }) => {
              const meta = getModuleMeta(entry.moduleId);
              return (
                <Link
                  key={entry.id}
                  className="list-item"
                  to={`/s/${meta?.subject.id ?? 'chinese'}/${entry.moduleId}/${entry.id}`}
                >
                  <span
                    className="list-item__index"
                    style={{
                      background: `${meta?.module.color ?? '#2f66d6'}16`,
                      color: meta?.module.color,
                    }}
                  >
                    {meta?.module.icon}
                  </span>
                  <span className="list-item__main">
                    <span className="list-item__title">{entry.title}</span>
                    <span className="list-item__meta">
                      <span>{meta?.module.name}</span>
                      <span>·</span>
                      <span>{entry.subtitle}</span>
                    </span>
                  </span>
                  <span className="list-item__right">{timeAgo(progress.lastAt)}</span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
