/** 模块列表页：按学段 / 标签 / 关键词筛选内容条目 */

import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getModuleMeta, getSubject } from '../data/subjects';
import { filterTagsOfModule, entriesOfModule } from '../data';
import { useStudy } from '../store/StudyContext';
import type { GradeId, ModuleId } from '../types';
import { GRADES, cn, pct, timeAgo } from '../lib/utils';
import {
  EmptyState,
  PageHeader,
  ProgressBar,
  SearchBox,
  Tag,
} from '../components/common';

export default function ModulePage() {
  const { subjectId = 'chinese', moduleId = 'poems' } = useParams();
  const subject = getSubject(subjectId);
  const meta = getModuleMeta(moduleId);
  const { state, grade, setGrade, toggleStar } = useStudy();

  const [keyword, setKeyword] = useState('');
  const [gradeFilter, setGradeFilter] = useState<GradeId | 'all'>(grade);
  const [tagFilter, setTagFilter] = useState<string>('all');

  const allEntries = useMemo(() => entriesOfModule(moduleId as ModuleId), [moduleId]);

  const tags = useMemo(
    () => filterTagsOfModule(moduleId as ModuleId, gradeFilter),
    [moduleId, gradeFilter],
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return allEntries.filter((e) => {
      if (gradeFilter !== 'all' && e.grade !== gradeFilter && e.grade !== 'all') return false;
      if (tagFilter !== 'all' && !e.tags.includes(tagFilter)) return false;
      if (kw && !e.searchText.includes(kw)) return false;
      return true;
    });
  }, [allEntries, gradeFilter, tagFilter, keyword]);

  const studiedCount = filtered.filter((e) => (state.progress[e.id]?.studied ?? 0) > 0).length;
  const questionCount = filtered.reduce((n, e) => n + e.questions.length, 0);

  if (!subject || !meta) {
    return <EmptyState icon="🧭" title="没有这个模块" desc="请回到学科页重新选择。" />;
  }

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
              to={`/practice/${moduleId}?grade=${gradeFilter}`}
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
            className={cn('chip', gradeFilter === 'all' && 'is-active')}
            onClick={() => setGradeFilter('all')}
          >
            全部学段
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
