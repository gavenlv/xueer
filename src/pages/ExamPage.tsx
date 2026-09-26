/**
 * 中考考点：把题库按知识点标签聚合成考点清单，支持「按考点专项刷题」。
 *
 * 与「按课文学习」互补——这里回答的是「中考要考哪些点、我哪个点最弱」。
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { examPointsByModule, findQuestion, moduleIdsOfSubject, poemExamPoints } from '../data';
import { allPoems } from '../data/chinese';
import { getModuleMeta } from '../data/subjects';
import { useStudy } from '../store/StudyContext';
import type { ModuleId } from '../types';
import { makeReciteQuestions } from '../lib/quiz';
import { cn } from '../lib/utils';
import { useDataScope, DataLoading } from '../lib/useData';
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
  /** 考点要从**全部**题目的知识点标签聚合出来，因此这一页需要加载全部数据 */
  const ready = useDataScope(
    moduleIdsOfSubject('chinese').concat(moduleIdsOfSubject('math')),
  );
  /**
   * 考点总数已经 600+，一次全铺出来会把页面撑到近 400 KB HTML、手机上必卡。
   * 因此每个模块先只显示前若干个，点「展开全部」再看剩下的；
   * 一旦输入了搜索词就全部展开——搜索本身就是「我要找某个点」的意图。
   */
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const PREVIEW_PER_MODULE = 12;
  const PREVIEW_PER_KIND = 8;

  const groups = useMemo(() => examPointsByModule('chinese'), []);

  /**
   * 古诗词单独一套考点：它不预置题目，所以按题目标签聚合的那套里会整体缺席。
   * 这里用「主题 / 意象 / 作者」聚类，每个考点指向这几十首的逐句默写。
   */
  const poemPoints = useMemo(() => poemExamPoints(), []);
  const poemReciteCount = useMemo(
    () => allPoems.reduce((n, p) => n + makeReciteQuestions(p.lines, p.id, p.title).length, 0),
    [],
  );
  /** 搜索词对古诗词考点同样生效 */
  const keywordTrimmed = keyword.trim();
  const poemPointsShown = useMemo(
    () => (keywordTrimmed ? poemPoints.filter((p) => p.tag.includes(keywordTrimmed)) : poemPoints),
    [poemPoints, keywordTrimmed],
  );
  const showPoems = moduleFilter === 'all' || moduleFilter === 'poems';

  /** 古诗词考点按「主题/意象/作者」三类各显示前若干个，保证三类都能露头 */
  const poemsVisible = useMemo(() => {
    if (keywordTrimmed || expanded.has('poems')) return poemPointsShown;
    return (['主题', '意象', '作者'] as const).flatMap((k) =>
      poemPointsShown.filter((p) => p.kind === k).slice(0, PREVIEW_PER_KIND),
    );
  }, [poemPointsShown, keywordTrimmed, expanded]);

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

  const total = groups.reduce((n, g) => n + g.points.length, 0) + poemPoints.length;
  const totalQuestions =
    groups.reduce((n, g) => n + g.points.reduce((m, p) => m + p.questions, 0), 0) + poemReciteCount;
  const weakCount = groups.reduce(
    (n, g) => n + g.points.filter((p) => (wrongByTag.get(p.tag) ?? 0) > 0).length,
    0,
  );

  if (!ready) return <DataLoading label="正在汇总考点…" />;

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
          <button
            className={cn('chip chip--sm', moduleFilter === 'poems' && 'is-active')}
            onClick={() => setModuleFilter('poems')}
          >
            {getModuleMeta('poems')?.module.icon} {getModuleMeta('poems')?.module.name}（
            {poemPoints.length}）
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

      {showPoems && poemPointsShown.length ? (
        <section className="stack stack--sm">
          <SectionTitle
            sub={`${poemPointsShown.length} 个考点 · ${allPoems.length} 首必背篇目 · ${poemReciteCount} 道逐句默写题`}
            extra={
              <Link className="btn btn--sm" to="/practice/poems?grade=all">
                🎲 全册默写
              </Link>
            }
          >
            {getModuleMeta('poems')?.module.icon} 古诗词背诵与默写
          </SectionTitle>

          <div className="small muted">
            古诗词不预置题目，默写题由逐句现场生成，所以它没有题目标签，需要单独按
            <b>主题 / 意象 / 作者</b>聚类成考点。点「默写这 N 首」就只默这一簇。
          </div>

          <div className="grid grid--auto">
            {poemsVisible.map((p) => (
              <div className="card card--pad stack stack--sm" key={p.tag}>
                <div className="row row--between" style={{ alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="bold" style={{ fontSize: 15 }}>
                      {p.tag}
                    </div>
                    <div className="small muted" style={{ marginTop: 2 }}>
                      {p.entryIds.length} 首
                    </div>
                  </div>
                  <Tag tone="purple">{p.kind}</Tag>
                </div>

                <div className="small muted" style={{ lineHeight: 1.9 }}>
                  {p.titles.slice(0, 6).map((t, i) => (
                    <span key={t}>
                      {i > 0 ? ' · ' : ''}
                      <Link to={`/s/chinese/poems/${p.entryIds[i]}`}>{t}</Link>
                    </span>
                  ))}
                  {p.titles.length > 6 ? ` …等 ${p.titles.length} 首` : ''}
                </div>

                {/* 先学再练：点篇目进详情页看译文、串讲与本课思维导图 */}
                <Link className="btn btn--sm" to={`/s/chinese/poems/${p.entryIds[0]}`}>
                  📖 先学《{p.titles[0]}》
                </Link>

                <Link
                  className="btn btn--primary btn--sm"
                  to={`/practice/poems?poems=${p.entryIds.join(',')}`}
                >
                  ✍️ 默写这 {p.entryIds.length} 首
                </Link>
              </div>
            ))}
          </div>

          {poemPointsShown.length > poemsVisible.length || expanded.has('poems') ? (
            <div className="row">
              <button
                className="btn btn--sm"
                onClick={() =>
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has('poems')) next.delete('poems');
                    else next.add('poems');
                    return next;
                  })
                }
              >
                {expanded.has('poems')
                  ? `收起，只看前 ${PREVIEW_PER_KIND * 3} 个`
                  : `展开全部 ${poemPointsShown.length} 个古诗词考点`}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {filtered.length === 0 && !(showPoems && poemPointsShown.length) ? (
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
                {(keywordTrimmed || expanded.has(g.moduleId)
                  ? g.points
                  : g.points.slice(0, PREVIEW_PER_MODULE)
                ).map((p) => {
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

                      {/* 先学再练：考点不是只拿来刷题的——先给两条「学」的路 */}
                      <div className="row row--wrap" style={{ gap: 6 }}>
                        {p.entryIds[0] ? (
                          <Link
                            className="btn btn--sm"
                            to={`/s/chinese/${p.moduleId}/${p.entryIds[0]}`}
                          >
                            📖 先学一遍
                          </Link>
                        ) : null}
                        <Link
                          className="btn btn--sm"
                          to={`/s/chinese/${p.moduleId}?tag=${encodeURIComponent(p.tag)}`}
                        >
                          📚 看相关 {p.entryIds.length} 条
                        </Link>
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

              {g.points.length > PREVIEW_PER_MODULE ? (
                <div className="row">
                  <button
                    className="btn btn--sm"
                    onClick={() =>
                      setExpanded((prev) => {
                        const next = new Set(prev);
                        if (next.has(g.moduleId)) next.delete(g.moduleId);
                        else next.add(g.moduleId);
                        return next;
                      })
                    }
                  >
                    {expanded.has(g.moduleId)
                      ? `收起，只看前 ${PREVIEW_PER_MODULE} 个`
                      : `展开全部 ${g.points.length} 个考点`}
                  </button>
                </div>
              ) : null}
            </section>
          );
        })
      )}
    </div>
  );
}
