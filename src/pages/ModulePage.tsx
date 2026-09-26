/** 模块列表页：按学段 / 标签 / 关键词筛选内容条目 */

import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getModuleMeta, getSubject } from '../data/subjects';
import { filterTagsOfModule, entriesOfModule } from '../data';
import { useStudy } from '../store/StudyContext';
import type { GradeId, ModuleId } from '../types';
import { GRADES, cn, pct, timeAgo } from '../lib/utils';
import { useDataScope, DataLoading } from '../lib/useData';
import { matchesKeyword } from '../lib/searchText';
import {
  EmptyState,
  PageHeader,
  ProgressBar,
  SearchBox,
  Tag,
} from '../components/common';

export default function ModulePage() {
  const { subjectId = 'chinese', moduleId = 'poems' } = useParams();
  const [search] = useSearchParams();
  const subject = getSubject(subjectId);
  const meta = getModuleMeta(moduleId);
  const { state, grade, setGrade, toggleStar } = useStudy();
  // 只加载本模块的内容数据：打开古诗词就不必下载作文与名著那几块
  const ready = useDataScope([moduleId as ModuleId]);

  const [keyword, setKeyword] = useState('');
  /**
   * 学段与标签支持从地址栏读入：中考考点页的「先学一遍 / 看相关条目」要能直接
   * 跳到「筛好这一类考点」的列表，否则学生点进去还得自己再筛一次。
   */
  const [gradeFilter, setGradeFilter] = useState<GradeId | 'all'>(
    (search.get('grade') as GradeId | 'all' | null) ?? grade,
  );
  const [tagFilter, setTagFilter] = useState<string>(search.get('tag') ?? 'all');

  // ready 必须作为依赖：数据是异步加载后 push 进全库的，若只依赖 moduleId，
  // 直接访问/刷新本页时会把「加载前的空数组」缓存住，线上会一直显示空状态
  // （dev 下被 StrictMode 双渲染与 HMR 掩盖）。
  const allEntries = useMemo(
    () => (ready ? entriesOfModule(moduleId as ModuleId) : []),
    [moduleId, ready],
  );

  /**
   * 生效的学段筛选：有些模块（如历史六册）按「一册 = 一个学段」组织，
   * 学生点进 hist-7b 时全局学段可能还是 7 上——若照搬会把整页过滤成空。
   * 因此数据就绪后做一次校正：当前学段在模块里没有条目时，自动落到该模块自己的学段。
   */
  const effectiveGrade = useMemo<GradeId | 'all'>(() => {
    if (!ready || gradeFilter === 'all') return gradeFilter;
    if (allEntries.some((e) => e.grade === gradeFilter || e.grade === 'all')) return gradeFilter;
    const first = allEntries.find((e) => e.grade !== 'all');
    return (first?.grade as GradeId | undefined) ?? 'all';
  }, [allEntries, gradeFilter, ready]);

  const tags = useMemo(
    () => filterTagsOfModule(moduleId as ModuleId, effectiveGrade),
    [moduleId, effectiveGrade],
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return allEntries.filter((e) => {
      if (effectiveGrade !== 'all' && e.grade !== effectiveGrade && e.grade !== 'all') return false;
      if (tagFilter !== 'all' && !e.tags.includes(tagFilter)) return false;
      if (kw && !matchesKeyword(e, kw)) return false;
      return true;
    });
  }, [allEntries, effectiveGrade, tagFilter, keyword]);

  const studiedCount = filtered.filter((e) => (state.progress[e.id]?.studied ?? 0) > 0).length;
  const questionCount = filtered.reduce((n, e) => n + e.questions.length, 0);

  if (!subject || !meta) {
    return <EmptyState icon="🧭" title="没有这个模块" desc="请回到学科页重新选择。" />;
  }

  if (!ready) return <DataLoading />;

  const { module: m } = meta;

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[
          { label: '首页', to: '/' },
          { label: subject.name, to: `/s/${subject.id}` },
          { label: m.name },
        ]}
        title={
          <span>
            {m.icon} {m.name}
          </span>
        }
        desc={m.desc}
        extra={
          <>
            <Link
              className="btn btn--primary btn--sm"
              to={`/practice/${moduleId}?grade=${effectiveGrade}`}
            >
              🎲 随机练习
            </Link>
            {moduleId === 'literature' ? (
              <Link
                className="btn btn--sm"
                to="/practice/literature?type=short&grade=all"
                title="广州中考语文附加题「整本书阅读」8 分，六年来只考主观表达题，不考选择题"
              >
                🎯 广州附加题专项（简答）
              </Link>
            ) : null}
          </>
        }
      />

      {/* 筛选区 */}
      <section className="card card--pad stack stack--sm">
        <div className="row row--wrap">
          <SearchBox value={keyword} onChange={setKeyword} placeholder={`在「${m.name}」中搜索…`} />
        </div>

        <div className="scroll-x">
          <button
            className={cn('chip', effectiveGrade === 'all' && 'is-active')}
            onClick={() => setGradeFilter('all')}
          >
            全部学段
          </button>
          {GRADES.map((g) => (
            <button
              key={g.id}
              className={cn('chip', effectiveGrade === g.id && 'is-active')}
              onClick={() => {
                setGradeFilter(g.id);
                setGrade(g.id);
              }}
            >
              {g.short}
            </button>
          ))}
        </div>

        {tags.length > 1 ? (
          <div className="scroll-x">
            <button
              className={cn('chip chip--sm', tagFilter === 'all' && 'is-active')}
              onClick={() => setTagFilter('all')}
            >
              全部类型
            </button>
            {tags.map((t) => (
              <button
                key={t}
                className={cn('chip chip--sm', tagFilter === t && 'is-active')}
                onClick={() => setTagFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}

        <div className="row row--between small muted">
          <span>
            共 {filtered.length} 条 · 已学 {studiedCount} 条 · {questionCount} 道配套题
          </span>
          {studiedCount > 0 ? (
            <span>{pct(studiedCount, Math.max(1, filtered.length))}%</span>
          ) : null}
        </div>
        <ProgressBar value={studiedCount} max={Math.max(1, filtered.length)} thin />
      </section>

      {/* 列表 */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="没有找到相关内容"
          desc="试试切换学段，或者换个关键词。"
          action={
            <button
              className="btn"
              onClick={() => {
                setKeyword('');
                setTagFilter('all');
                setGradeFilter('all');
              }}
            >
              清空筛选条件
            </button>
          }
        />
      ) : (
        <section className="card" style={{ overflow: 'hidden' }}>
          {filtered.map((e, i) => {
            const p = state.progress[e.id];
            const starred = Boolean(p?.starred);
            const accuracy = p && p.total > 0 ? `${Math.round((p.correct / p.total) * 100)}%` : null;
            return (
              <div className="list-item" key={e.id}>
                <span
                  className="list-item__index"
                  style={{ background: `${m.color}16`, color: m.color }}
                >
                  {i + 1}
                </span>
                <Link className="list-item__main" to={`/s/${subject.id}/${moduleId}/${e.id}`}>
                  <span className="list-item__title">
                    {e.title}
                    {starred ? <span title="已收藏">⭐</span> : null}
                    {p?.mastered ? <Tag tone="jade">已掌握</Tag> : null}
                  </span>
                  <span className="list-item__meta">
                    <span>{e.subtitle}</span>
                    {e.grade !== 'all' ? (
                      <>
                        <span>·</span>
                        <span>{GRADES.find((g) => g.id === e.grade)?.short}</span>
                      </>
                    ) : null}
                    {p?.studied ? (
                      <>
                        <span>·</span>
                        <span>学习 {p.studied} 次</span>
                      </>
                    ) : null}
                    {accuracy ? (
                      <>
                        <span>·</span>
                        <span>正确率 {accuracy}</span>
                      </>
                    ) : null}
                    {e.questions.length > 0 ? (
                      <>
                        <span>·</span>
                        <span>{e.questions.length} 题</span>
                      </>
                    ) : null}
                  </span>
                </Link>
                <span className="list-item__right">
                  {p?.lastAt ? <span className="small nowrap">{timeAgo(p.lastAt)}</span> : null}
                  <button
                    className="btn btn--icon"
                    title={starred ? '取消收藏' : '收藏'}
                    onClick={() => toggleStar(e.id)}
                    style={{ color: starred ? 'var(--c-gold)' : undefined }}
                  >
                    {starred ? '★' : '☆'}
                  </button>
                </span>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}
