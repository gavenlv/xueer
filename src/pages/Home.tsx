/** 首页：今日概览、学科入口、语文六大模块、继续学习 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getModuleMeta, SUBJECTS } from '../data/subjects';
import { allPoems } from '../data/chinese';
import { entryIndex, statsOfModule, statsOfSubject } from '../data';
import type { ModuleId } from '../types';
import { useStreak, useStudy } from '../store/StudyContext';
import { dateKey, pct, timeAgo } from '../lib/utils';
import type { Entry, ItemProgress } from '../types';
import { ProgressBar, SectionTitle, Stat, Tag } from '../components/common';

const DAILY_GOAL = 20;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了，早点休息';
  if (h < 11) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

export default function Home() {
  const { state, grade } = useStudy();
  const streak = useStreak();

  const today = state.daily[dateKey()] ?? { answered: 0, correct: 0, minutes: 0 };
  const checkedToday = state.checkins.includes(dateKey());

  /* 全库学习进度 */
  const overall = useMemo(() => {
    const ids = Object.keys(state.progress);
    const studied = ids.filter((id) => (state.progress[id]?.studied ?? 0) > 0).length;
    const total = entryIndex.size;
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
      .map(([id, p]) => ({ entry: entryIndex.get(id), progress: p }))
      .filter((x): x is { entry: Entry; progress: ItemProgress } => x.entry !== undefined);
  }, [state.progress]);

  /* 每日一句：按日期稳定选取 */
  const dailyQuote = useMemo(() => {
    const pool = allPoems.flatMap((p) =>
      (p.famousLines ?? []).map((line) => ({ line, poem: p })),
    );
    if (!pool.length) return null;
    const seed = Number(dateKey().replace(/-/g, ''));
    return pool[seed % pool.length];
  }, []);

  /* 收藏 */
  const starred = useMemo(
    () =>
      Object.entries(state.progress)
        .filter(([, p]) => p.starred)
        .map(([id]) => entryIndex.get(id))
        .filter(Boolean),
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
            <Link className="btn btn--white" to={`/practice/poems?grade=${grade}`}>
              ✍️ 古诗文默写
            </Link>
            <Link className="btn" to="/s/chinese">
              进入语文 →
            </Link>
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
              to={`/s/chinese/poems/${dailyQuote.poem.id}`}
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
            {dailyQuote.line}
          </div>
          <div className="small muted" style={{ marginTop: 6 }}>
            —— {dailyQuote.poem.dynasty}·{dailyQuote.poem.author}《{dailyQuote.poem.title}》
          </div>
        </section>
      ) : null}

      {/* 学科 */}
      <section className="stack stack--sm">
        <SectionTitle sub="语文已上线，其余学科正在建设中">选择学科</SectionTitle>
        <div className="grid grid--auto">
          {SUBJECTS.filter((s) => !s.hidden).map((s) => (
            <Link
              key={s.id}
              to={s.available ? `/s/${s.id}` : '#'}
              className={`subject-card${s.available ? '' : ' is-locked'}`}
              onClick={(e) => {
                if (!s.available) e.preventDefault();
              }}
              aria-disabled={!s.available}
            >
              <span
                className="subject-card__icon"
                style={{
                  background: s.available ? `${s.color}18` : 'var(--c-surface-3)',
                  color: s.color,
                }}
              >
                {s.icon}
              </span>
              <span className="subject-card__name">
                {s.name}
                {!s.available ? (
                  <span className="tag" style={{ marginLeft: 8 }}>
                    敬请期待
                  </span>
                ) : null}
              </span>
              <span className="subject-card__desc">{s.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 各学科模块（学科无关：新增学科会自动出现；hidden 的学科不展示） */}
      {SUBJECTS.filter((s) => s.available && !s.hidden).map((subject) => {
        const st = statsOfSubject(subject.id);
        return (
          <section className="stack stack--sm" key={subject.id}>
            <SectionTitle
              sub={`共 ${st.entries} 条内容 · ${st.questions} 道题`}
              extra={
                <Link className="btn btn--sm" to={`/s/${subject.id}`}>
                  全部 →
                </Link>
              }
            >
              {subject.icon} {subject.name} · {subject.modules.length} 个模块
            </SectionTitle>
            <div className="grid grid--auto">
              {subject.modules.map((m) => {
                const ms = statsOfModule(m.id as ModuleId);
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
                        {ms.entries} 条内容 · {ms.questions} 题
                        {ms.mindMaps ? ` · ${ms.mindMaps} 张导图` : ''}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

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
          <Link className="btn btn--sm" to="/extras">
            🧩 思维导图与拓展
          </Link>
          <Link className="btn btn--sm" to="/stats">
            📊 学习报告
          </Link>
          <Link className="btn btn--sm" to="/wrong">
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
