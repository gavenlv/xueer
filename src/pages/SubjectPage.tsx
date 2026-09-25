/** 学科页：模块总览 + 学段切换（学科无关，新增学科自动适配） */

import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SUBJECTS, getSubject } from '../data/subjects';
import { entriesOfModule, moduleIdsOfSubject, statsOfModule } from '../data';
import { useStudy } from '../store/StudyContext';
import type { GradeId, ModuleId } from '../types';
import { GRADES, cn, pct } from '../lib/utils';
import { EmptyState, PageHeader, ProgressBar, SectionTitle, Stat } from '../components/common';

export default function SubjectPage() {
  const { subjectId = 'chinese' } = useParams();
  const subject = getSubject(subjectId);
  const { state, grade, setGrade } = useStudy();
  const [gradeFilter, setGradeFilter] = useState<GradeId | 'all'>(grade);

  const moduleIds = useMemo(() => moduleIdsOfSubject(subjectId), [subjectId]);

  const moduleStats = useMemo(() => {
    const out: Record<
      string,
      { total: number; studied: number; questions: number; gradeCount: number }
    > = {};
    for (const id of moduleIds) {
      const entries = entriesOfModule(id);
      const inGrade = entries.filter(
        (e) => gradeFilter === 'all' || e.grade === gradeFilter || e.grade === 'all',
      );
      const studied = inGrade.filter((e) => (state.progress[e.id]?.studied ?? 0) > 0).length;
      out[id] = {
        total: entries.length,
        studied,
        questions: inGrade.reduce((n, e) => n + e.questions.length, 0),
        gradeCount: inGrade.length,
      };
    }
    return out;
  }, [state.progress, gradeFilter, moduleIds]);

  if (!subject) {
    return <EmptyState icon="🧭" title="没有这个学科" desc="请从首页重新选择。" />;
  }

  if (!subject.available) {
    return (
      <EmptyState
        icon={subject.icon}
        title={`${subject.name} 正在建设中`}
        desc="这个学科的内容还在准备中，先看看已上线的学科吧。"
        action={
          <Link className="btn btn--primary" to="/">
            返回首页
          </Link>
        }
      />
    );
  }

  const totals = moduleIds.reduce(
    (acc, id) => {
      acc.total += moduleStats[id]?.gradeCount ?? 0;
      acc.studied += moduleStats[id]?.studied ?? 0;
      acc.questions += moduleStats[id]?.questions ?? 0;
      return acc;
    },
    { total: 0, studied: 0, questions: 0 },
  );

  /** 随机练习的默认模块：取本学科第一个模块 */
  const firstModule = moduleIds[0] ?? 'poems';

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[{ label: '首页', to: '/' }, { label: subject.name }]}
        title={
          <span>
            {subject.icon} {subject.name}
          </span>
        }
        desc={`${subject.desc} · ${subject.modules.length} 个模块 · ${totals.questions} 道练习题`}
        extra={
          <>
            <Link
              className="btn btn--primary btn--sm"
              to={`/practice/${firstModule}?grade=${gradeFilter}`}
            >
              🎲 随机练习
            </Link>
            <Link className="btn btn--sm" to="/extras">
              🧩 思维导图与拓展
            </Link>
            <Link className="btn btn--sm" to="/wrong">
              🗂️ 错题本
            </Link>
          </>
        }
      />

      {/* 学段切换 */}
      <section className="stack stack--sm">
        <SectionTitle sub="选择教材册次，模块内容与练习范围会同步切换">学段</SectionTitle>
        <div className="scroll-x">
          <button
            className={cn('chip', gradeFilter === 'all' && 'is-active')}
            onClick={() => setGradeFilter('all')}
          >
            全部
          </button>
          {GRADES.map((g) => (
            <button
              key={g.id}
              className={cn('chip', gradeFilter === g.id && 'is-active')}
              onClick={() => {
                setGradeFilter(g.id);
                setGrade(g.id);
              }}
            >
              {g.short}
            </button>
          ))}
        </div>
      </section>

      {/* 进度概览 */}
      <section className="card card--pad stack stack--sm">
        <div className="row row--between">
          <span className="bold">
            {gradeFilter === 'all' ? '全部学段' : GRADES.find((g) => g.id === gradeFilter)?.name}{' '}
            学习进度
          </span>
          <span className="small muted">
            {totals.studied} / {totals.total} 条已学
          </span>
        </div>
        <ProgressBar value={totals.studied} max={Math.max(1, totals.total)} />
        <div className="grid grid--3" style={{ marginTop: 4 }}>
          <Stat value={totals.total} label="内容条目" />
          <Stat value={totals.studied} label="已学习" tone="#1a9a6c" />
          <Stat value={totals.questions} label="练习题" tone="#bd8a25" />
        </div>
      </section>

      {/* 模块 */}
      <section className="stack stack--sm">
        <SectionTitle sub="点进去按篇目/词条学习，随时可以开始练习">模块</SectionTitle>
        <div className="grid grid--auto">
          {subject.modules.map((m) => {
            const st = moduleStats[m.id] ?? { total: 0, studied: 0, questions: 0, gradeCount: 0 };
            const ms = statsOfModule(m.id as ModuleId);
            const allCount = ms.entries;
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
                  <span style={{ display: 'block', marginTop: 10 }}>
                    <ProgressBar
                      value={st.studied}
                      max={Math.max(1, st.gradeCount)}
                      tone={st.studied === st.gradeCount && st.gradeCount > 0 ? 'jade' : 'blue'}
                      thin
                    />
                  </span>
                  <span className="module-card__foot">
                    <span>
                      本学段 {st.gradeCount} 条 / 共 {allCount} 条
                    </span>
                    <span>·</span>
                    <span>{st.questions} 题</span>
                    {st.gradeCount > 0 ? (
                      <>
                        <span>·</span>
                        <span>{pct(st.studied, st.gradeCount)}%</span>
                      </>
                    ) : null}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="card card--pad">
        <SectionTitle sub="后续追加学科时无需改代码，只需接入对应模块内容">其他学科</SectionTitle>
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          {SUBJECTS.filter((s) => !s.available).map((s) => (
            <span key={s.id} className="chip" style={{ opacity: 0.6, cursor: 'default' }}>
              {s.icon} {s.name}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
