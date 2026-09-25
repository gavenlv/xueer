/**
 * 中考考点：把题库按知识点标签聚合成考点清单，支持「按考点专项刷题」。
 *
 * 与「按课文学习」互补——这里回答的是「中考要考哪些点、我哪个点最弱」。
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { examPointsByModule, findQuestion } from '../data';
import { getModuleMeta } from '../data/subjects';
import { useStudy } from '../store/StudyContext';
import type { ModuleId } from '../types';
import { cn } from '../lib/utils';
import {
  EmptyState,
  PageHeader,
  ProgressBar,
  SearchBox,
  SectionTitle,
  Stat,
  Tag,
} from '../components/common';

export default function ExamPage() {
  const { state } = useStudy();
  const [keyword, setKeyword] = useState('');
  const [moduleFilter, setModuleFilter] = useState<ModuleId | 'all'>('all');

  const groups = useMemo(() => examPointsByModule('chinese'), []);

  /** 我的错题按考点聚合，用来标出薄弱考点 */
  const wrongByTag = useMemo(() => {
    const counts = new Map<string, number>();
    for (const w of Object.values(state.wrong)) {
      const found = findQuestion(w.questionId);
      if (!found) continue;
      for (const t of found.question.tags ?? []) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return counts;
  }, [state.wrong]);

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    return groups
      .filter((g) => moduleFilter === 'all' || g.moduleId === moduleFilter)
      .map((g) => ({
        ...g,
        points: kw ? g.points.filter((p) => p.tag.includes(kw)) : g.points,
      }))
      .filter((g) => g.points.length > 0);
  }, [groups, moduleFilter, keyword]);

  const total = groups.reduce((n, g) => n + g.points.length, 0);
  const totalQuestions = groups.reduce(
    (n, g) => n + g.points.reduce((m, p) => m + p.questions, 0),
    0,
  );
  const weakCount = groups.reduce(
    (n, g) => n + g.points.filter((p) => (wrongByTag.get(p.tag) ?? 0) > 0).length,
    0,
  );

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[
          { label: '首页', to: '/' },
          { label: '语文', to: '/s/chinese' },
          { label: '中考考点' },
        ]}
        title="🎯 中考考点"
        desc="把题库按知识点聚合成考点，哪个点有错题一眼看得出来；点「专项训练」就只刷这个考点。"
        extra={
          <Link className="btn btn--sm" to="/wrong">
            🗂️ 错题本
          </Link>
        }
      />

      <section className="card card--pad stack stack--sm">
        <div className="grid grid--3">
          <Stat value={total} label="考点总数" />
          <Stat value={totalQuestions} label="覆盖题目" tone="#2f66d6" />
          <Stat value={weakCount} label="我有错题的考点" tone="#d24f3d" />
        </div>
        <div className="row row--wrap">
          <SearchBox value={keyword} onChange={setKeyword} placeholder="搜索考点，如「思乡」「成语」「一词多义」…" />
        </div>
        <div className="scroll-x">
          <button
            className={cn('chip chip--sm', moduleFilter === 'all' && 'is-active')}
            onClick={() => setModuleFilter('all')}
          >
            全部模块（{total}）
          </button>
          {groups.map((g) => {
            const meta = getModuleMeta(g.moduleId);
            return (
              <button
                key={g.moduleId}
                className={cn('chip chip--sm', moduleFilter === g.moduleId && 'is-active')}
                onClick={() => setModuleFilter(g.moduleId)}
              >
                {meta?.module.icon} {meta?.module.name}（{g.points.length}）
              </button>
            );
          })}
        </div>
      </section>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="没有匹配的考点" desc="换个关键词试试。" />
      ) : (
        filtered.map((g) => {
          const meta = getModuleMeta(g.moduleId);
          return (
            <section className="stack stack--sm" key={g.moduleId}>
              <SectionTitle
                sub={`${g.points.length} 个考点 · ${g.points.reduce((n, p) => n + p.questions, 0)} 道题`}
                extra={
                  <Link
                    className="btn btn--sm"
                    to={`/practice/${g.moduleId}?grade=all`}
                  >
                    🎲 全模块练习
                  </Link>
                }
              >
                {meta?.module.icon} {meta?.module.name}
              </SectionTitle>

              <div className="grid grid--auto">
                {g.points.map((p) => {
                  const wrongN = wrongByTag.get(p.tag) ?? 0;
                  return (
                    <div className="card card--pad stack stack--sm" key={`${p.moduleId}-${p.tag}`}>
                      <div className="row row--between" style={{ alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0 }}>
                          <div className="bold" style={{ fontSize: 15 }}>
                            {p.tag}
                          </div>
                          <div className="small muted" style={{ marginTop: 2 }}>
                            {p.questions} 题 · {p.entryIds.length} 条内容
                          </div>
                        </div>
                        {wrongN > 0 ? <Tag tone="red">错 {wrongN}</Tag> : <Tag tone="jade">无错题</Tag>}
                      </div>

                      <div className="row row--wrap" style={{ gap: 6 }}>
                        {Object.entries(p.types).map(([t, n]) => (
                          <Tag key={t}>
                            {t === 'choice' ? '选择' : t === 'fill' ? '填空' : '简答'} {n}
                          </Tag>
                        ))}
                      </div>

                      <Link
                        className="btn btn--primary btn--sm"
                        to={`/practice/${p.moduleId}?tag=${encodeURIComponent(p.tag)}&grade=all`}
                      >
                        ✍️ 专项训练
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
