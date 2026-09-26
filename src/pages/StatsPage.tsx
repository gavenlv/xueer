/** 学习报告：总量统计、近 14 天趋势、模块进度、薄弱知识点、收藏 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { subjectOfModule, findQuestion } from '../data';
import { SUBJECTS } from '../data/subjects';
import { getModuleMeta } from '../data/subjects';
import { ENTRY_META, MODULE_TOTALS } from '../data/summary';
import type { ModuleId } from '../types';
import { useStreak, useStudy } from '../store/StudyContext';
import { useAuth } from '../auth/AuthContext';
import { isCloudConfigured } from '../lib/supabase';
import { dateKey, formatDuration, pct, shiftDate } from '../lib/utils';
import { useDataScope, DataLoading } from '../lib/useData';
import { EmptyState, PageHeader, ProgressBar, SectionTitle, Stat, Tag } from '../components/common';

const DAYS = 14;

export default function StatsPage() {
  const { state, resetAll } = useStudy();
  const { user } = useAuth();
  const streak = useStreak();
  /**
   * 页面统计几乎全部来自轻量清单 summary（首屏已加载，约 20 kB gzip），
   * **不必加载任何正文数据**——之前为了算模块进度加载语文+数学全部内容，
   * 首次打开（清缓存/换设备登录后）要下载数 MB，报告页一等好几秒。
   * 唯一例外是薄弱知识点：需要错题所属模块的题库才能查到题目标签，
   * 因此只按需加载错题涉及的模块（通常一两个 chunk）。
   */
  const wrongModuleIds = useMemo(() => {
    const ids = new Set<string>();
    for (const w of Object.values(state.wrong)) if (w.moduleId) ids.add(w.moduleId);
    return [...ids] as ModuleId[];
  }, [state.wrong]);
  const ready = useDataScope(wrongModuleIds);

  /* summary 骨架索引 */
  const metaById = useMemo(() => new Map(ENTRY_META.map((e) => [e.id, e])), []);
  const grandTotals = useMemo(
    () => ({
      questions: MODULE_TOTALS.reduce((n, m) => n + m.questions, 0),
      mindMaps: MODULE_TOTALS.reduce((n, m) => n + m.mindMaps, 0),
      extensions: MODULE_TOTALS.reduce((n, m) => n + m.extensions, 0),
    }),
    [],
  );

  /* 累计统计 */
  const totals = useMemo(() => {
    let answered = 0;
    let correct = 0;
    for (const d of Object.values(state.daily)) {
      answered += d.answered;
      correct += d.correct;
    }
    const studied = Object.values(state.progress).filter((p) => p.studied > 0).length;
    const recited = Object.values(state.progress).reduce((n, p) => n + (p.recited ?? 0), 0);
    const starred = Object.values(state.progress).filter((p) => p.starred).length;
    return {
      answered,
      correct,
      accuracy: answered ? Math.round((correct / answered) * 100) : null,
      studied,
      recited,
      starred,
      wrong: Object.keys(state.wrong).length,
    };
  }, [state.daily, state.progress, state.wrong]);

  /* 近 14 天 */
  const chart = useMemo(() => {
    const today = dateKey();
    const days: { key: string; label: string; answered: number; correct: number }[] = [];
    for (let i = DAYS - 1; i >= 0; i -= 1) {
      const key = shiftDate(today, -i);
      const d = state.daily[key];
      days.push({
        key,
        label: key.slice(5).replace('-', '/'),
        answered: d?.answered ?? 0,
        correct: d?.correct ?? 0,
      });
    }
    return days;
  }, [state.daily]);

  const maxAnswered = Math.max(1, ...chart.map((d) => d.answered));

  /* 模块进度：条目总数取自轻量清单（含历史等所有学科），已学数按 progress 里的骨架 id 统计 */
  const moduleRows = useMemo(() => {
    const studiedByModule = new Map<string, number>();
    for (const e of ENTRY_META) {
      if ((state.progress[e.id]?.studied ?? 0) > 0) {
        studiedByModule.set(e.moduleId, (studiedByModule.get(e.moduleId) ?? 0) + 1);
      }
    }
    return SUBJECTS.filter((s) => s.available && !s.hidden).map((subject) => ({
      subject,
      rows: subject.modules.map((m) => {
        const t = MODULE_TOTALS.find((x) => x.id === m.id);
        return { id: m.id, meta: m, total: t?.entries ?? 0, studied: studiedByModule.get(m.id) ?? 0 };
      }),
    }));
  }, [state.progress]);

  /* 薄弱知识点：错题标签聚合（错题所属模块的数据已按需加载，findQuestion 可查到题目） */
  const weakTags = useMemo(() => {
    if (!ready) return [];
    const counts = new Map<string, number>();
    for (const w of Object.values(state.wrong)) {
      const found = findQuestion(w.questionId);
      if (!found) continue;
      for (const t of found.question.tags ?? []) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [state.wrong, ready]);

  /* 收藏：从轻量清单取骨架信息，不必加载任何正文 */
  const starred = useMemo(
    () =>
      Object.entries(state.progress)
        .filter(([, p]) => p.starred)
        .map(([id]) => metaById.get(id))
        .filter(Boolean),
    [state.progress, metaById],
  );

  const hasData = totals.answered > 0 || totals.studied > 0;

  if (!ready) return <DataLoading label="正在汇总学习数据…" />;

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[{ label: '首页', to: '/' }, { label: '学习报告' }]}
        title="📊 学习报告"
        desc={
          user
            ? '进度已登录云端，多设备自动同步。'
            : '所有数据保存在本机浏览器，不会上传到任何服务器。'
        }
        extra={
          <>
            {/* 云端已配置且未登录时，提示登录以开启多设备同步 */}
            {!user && isCloudConfigured ? (
              <Link className="btn btn--sm btn--outline" to="/account">
                ☁️ 登录同步进度
              </Link>
            ) : null}
            {hasData ? (
              <button
                className="btn btn--sm"
                onClick={() => {
                  if (window.confirm('确定要清空全部学习数据（进度、错题、打卡）吗？此操作不可撤销。')) {
                    resetAll();
                  }
                }}
              >
                🗑 清空学习数据
              </button>
            ) : null}
          </>
        }
      />

      {!hasData ? (
        <EmptyState
          icon="📈"
          title="还没有学习数据"
          desc="学一条内容或做一组练习，这里就会出现你的学习曲线。"
          action={
            <Link className="btn btn--primary" to="/s/chinese">
              开始学习
            </Link>
          }
        />
      ) : (
        <>
          <section className="stack stack--sm">
            <SectionTitle sub="从第一次使用开始累计">总览</SectionTitle>
            <div className="grid grid--3">
              <Stat value={streak} label="连续打卡（天）" tone="#bd8a25" />
              <Stat value={totals.answered} label="累计答题" tone="#2f66d6" />
              <Stat
                value={totals.accuracy === null ? '—' : `${totals.accuracy}%`}
                label="总正确率"
                tone="#1a9a6c"
              />
              <Stat value={totals.studied} label={`已学内容 / ${ENTRY_META.length}`} />
              <Stat value={totals.recited} label="背诵打卡" tone="#7355cf" />
              <Stat value={totals.wrong} label="当前错题" tone="#d24f3d" />
            </div>
            <div className="card card--pad">
              <div className="row row--between small">
                <span>总学习时长</span>
                <span className="bold">{formatDuration(state.totalSeconds)}</span>
              </div>
            </div>
          </section>

          {/* 趋势图 */}
          <section className="card card--pad stack stack--sm">
            <SectionTitle sub={`最近 ${DAYS} 天每日答题量`}>学习趋势</SectionTitle>
            <div
              className="row"
              style={{ alignItems: 'flex-end', gap: 6, height: 132, marginTop: 8 }}
            >
              {chart.map((d) => {
                const h = Math.max(3, (d.answered / maxAnswered) * 100);
                const rate = d.answered ? d.correct / d.answered : 0;
                return (
                  <div
                    key={d.key}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                    title={`${d.key}：${d.answered} 题，答对 ${d.correct} 题`}
                  >
                    <span className="small muted" style={{ fontSize: 10.5 }}>
                      {d.answered || ''}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: 22,
                        height: `${h}%`,
                        borderRadius: 6,
                        background:
                          d.answered === 0
                            ? 'var(--c-surface-3)'
                            : rate >= 0.8
                              ? 'linear-gradient(180deg,#4cc79a,#17a06e)'
                              : rate >= 0.5
                                ? 'linear-gradient(180deg,#6b93ee,#2f66d6)'
                                : 'linear-gradient(180deg,#ea8271,#d24f3d)',
                        transition: 'height .4s ease',
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="row small muted" style={{ gap: 6 }}>
              {chart.map((d) => (
                <span key={d.key} style={{ flex: 1, textAlign: 'center', fontSize: 9.5 }}>
                  {d.label}
                </span>
              ))}
            </div>
          </section>

          {/* 模块进度 */}
          <section className="card card--pad stack stack--sm">
            <SectionTitle sub="按内容条目统计已学习比例">各模块进度</SectionTitle>
            {moduleRows.map((group) => (
              <div className="stack stack--sm" key={group.subject.id} style={{ marginTop: 4 }}>
                <div className="row small" style={{ gap: 8 }}>
                  <span className="bold">
                    {group.subject.icon} {group.subject.name}
                  </span>
                  <span className="muted">
                    {group.rows.reduce((n, r) => n + r.studied, 0)} /{' '}
                    {group.rows.reduce((n, r) => n + r.total, 0)} 条
                  </span>
                </div>
                {group.rows.map((row) => {
                  const done = row.studied === row.total && row.total > 0;
                  return (
                    <Link
                      key={row.id}
                      to={`/s/${group.subject.id}/${row.id}`}
                      className="stack stack--sm"
                      style={{ gap: 6 }}
                    >
                      <div className="row row--between small">
                        <span>
                          {row.meta.icon} {row.meta.name}
                        </span>
                        <span className="muted">
                          {row.studied} / {row.total}（{pct(row.studied, Math.max(1, row.total))}%）
                        </span>
                      </div>
                      <ProgressBar
                        value={row.studied}
                        max={Math.max(1, row.total)}
                        tone={done ? 'jade' : 'blue'}
                        thin
                      />
                    </Link>
                  );
                })}
              </div>
            ))}
            <div className="small muted" style={{ marginTop: 6 }}>
              题库共 {grandTotals.questions} 道练习题 · {ENTRY_META.length} 条学习内容 ·{' '}
              {grandTotals.mindMaps} 张导图 · {grandTotals.extensions} 篇拓展
            </div>
          </section>

          {/* 薄弱点 */}
          <section className="card card--pad stack stack--sm">
            <SectionTitle sub="根据错题的知识点标签自动聚合，出现越多说明越需要复习">
              薄弱知识点
            </SectionTitle>
            {weakTags.length === 0 ? (
              <div className="small muted">暂时没有薄弱项，继续保持。</div>
            ) : (
              <div className="row row--wrap" style={{ marginTop: 4 }}>
                {weakTags.map(([tag, count]) => (
                  <Tag key={tag} tone={count >= 3 ? 'red' : count >= 2 ? 'gold' : 'default'}>
                    {tag} · {count}
                  </Tag>
                ))}
              </div>
            )}
          </section>

          {/* 收藏 */}
          {starred.length > 0 ? (
            <section className="card card--pad stack stack--sm">
              <SectionTitle sub={`共 ${starred.length} 条`}>我的收藏</SectionTitle>
              <div style={{ marginTop: 4 }}>
                {starred.map((e) =>
                  e ? (
                    <Link
                      className="list-item"
                      key={e.id}
                      to={`/s/${subjectOfModule(e.moduleId) ?? 'chinese'}/${e.moduleId}/${e.id}`}
                    >
                      <span className="list-item__index">
                        {getModuleMeta(e.moduleId)?.module.icon}
                      </span>
                      <span className="list-item__main">
                        <span className="list-item__title">{e.title}</span>
                        <span className="list-item__meta">{e.subtitle}</span>
                      </span>
                      <span className="list-item__right">→</span>
                    </Link>
                  ) : null,
                )}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
