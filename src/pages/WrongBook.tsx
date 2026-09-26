/** 错题本：按模块归类，支持重做、逐条移除与清空 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { findQuestion, moduleIdsOfSubject } from '../data';
import { getModuleMeta } from '../data/subjects';
import { useStudy } from '../store/StudyContext';
import type { ModuleId } from '../types';
import { OPTION_KEYS, cn, timeAgo } from '../lib/utils';
import { searchTextOf } from '../lib/searchText';
import { useDataScope, DataLoading } from '../lib/useData';
import { EmptyState, PageHeader, SearchBox, Tag } from '../components/common';
import { RichText } from '../components/RichText';

export default function WrongBook() {
  const { state, removeWrong, clearWrong } = useStudy();
  const [keyword, setKeyword] = useState('');
  const [moduleFilter, setModuleFilter] = useState<ModuleId | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  /** 错题可能来自任何模块，要按题目 id 在全库反查，因此这里加载全部数据 */
  const ready = useDataScope(moduleIdsOfSubject('chinese').concat(moduleIdsOfSubject('math')));

  /** 把错题记录与题库中的题目对上（数据更新后可能失配，直接丢弃） */
  const rows = useMemo(() => {
    const list = Object.values(state.wrong)
      .map((w) => {
        const found = findQuestion(w.questionId);
        if (!found) return null;
        return { wrong: w, entry: found.entry, question: found.question };
      })
      .filter(Boolean) as {
      wrong: (typeof state.wrong)[string];
      entry: NonNullable<ReturnType<typeof findQuestion>>['entry'];
      question: NonNullable<ReturnType<typeof findQuestion>>['question'];
    }[];
    return list.sort((a, b) => b.wrong.lastAt - a.wrong.lastAt);
  }, [state.wrong]);

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    return rows.filter((r) => {
      if (moduleFilter !== 'all' && r.wrong.moduleId !== moduleFilter) return false;
      if (
        kw &&
        !r.question.stem.includes(kw) &&
        !r.wrong.sourceTitle.includes(kw) &&
        !searchTextOf(r.entry).includes(kw.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [rows, keyword, moduleFilter]);

  const byModule = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const r of filtered) {
      const list = map.get(r.wrong.moduleId) ?? [];
      list.push(r);
      map.set(r.wrong.moduleId, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const moduleOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.wrong.moduleId));
    return [...set];
  }, [rows]);

  if (!ready) return <DataLoading label="正在整理错题…" />;

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[{ label: '首页', to: '/' }, { label: '错题本' }]}
        title="🗂️ 错题本"
        desc={
          rows.length
            ? `共 ${rows.length} 道错题。答对后会自动移出，答错则会累积提醒。`
            : '这里会记录你做错的每一道题。'
        }
        extra={
          rows.length ? (
            <button
              className="btn btn--sm"
              onClick={() => {
                if (window.confirm('确定要清空错题本吗？此操作不可撤销。')) clearWrong();
              }}
            >
              🧹 清空错题本
            </button>
          ) : null
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="错题本是空的"
          desc="说明你到现在为止没有留下错题，非常棒。去做几组练习检验一下自己吧。"
          action={
            <Link className="btn btn--primary" to="/s/chinese">
              开始练习
            </Link>
          }
        />
      ) : (
        <>
          <section className="card card--pad stack stack--sm">
            <SearchBox value={keyword} onChange={setKeyword} placeholder="搜索题干或篇目…" />
            <div className="scroll-x">
              <button
                className={cn('chip chip--sm', moduleFilter === 'all' && 'is-active')}
                onClick={() => setModuleFilter('all')}
              >
                全部模块（{rows.length}）
              </button>
              {moduleOptions.map((mid) => {
                const meta = getModuleMeta(mid);
                const count = rows.filter((r) => r.wrong.moduleId === mid).length;
                return (
                  <button
                    key={mid}
                    className={cn('chip chip--sm', moduleFilter === mid && 'is-active')}
                    onClick={() => setModuleFilter(mid as ModuleId)}
                  >
                    {meta?.module.icon} {meta?.module.name ?? mid}（{count}）
                  </button>
                );
              })}
            </div>
          </section>

          {byModule.length === 0 ? (
            <EmptyState icon="🔍" title="没有匹配的错题" desc="换个关键词试试。" />
          ) : (
            byModule.map(([mid, list]) => {
              const meta = getModuleMeta(mid);
              return (
                <section className="stack stack--sm" key={mid}>
                  <div className="row row--between row--wrap">
                    <h2 className="section-title">
                      <span className="section-title__bar" style={{ background: meta?.module.color }} />
                      {meta?.module.icon} {meta?.module.name ?? mid}
                      <span className="small muted" style={{ fontWeight: 500 }}>
                        （{list.length} 题）
                      </span>
                    </h2>
                    <Link
                      className="btn btn--sm btn--primary"
                      to={`/practice/${mid}?ids=${list.map((r) => r.wrong.questionId).join(',')}`}
                    >
                      🎯 重做这组
                    </Link>
                  </div>

                  <div className="card card--pad stack stack--sm">
                    {list.map(({ wrong, question, entry }) => {
                      const isOpen = expanded === wrong.questionId;
                      const correctText =
                        question.type === 'choice'
                          ? `${question.answer}. ${
                              question.options?.[OPTION_KEYS.indexOf(question.answer as 'A')] ?? ''
                            }`
                          : question.type === 'short'
                            ? question.answer
                            : question.answer.split('|')[0];
                      const userText =
                        question.type === 'choice'
                          ? `${wrong.lastAnswer}. ${
                              question.options?.[OPTION_KEYS.indexOf(wrong.lastAnswer as 'A')] ?? ''
                            }`
                          : wrong.lastAnswer || '（空）';
                      return (
                        <div className="review-item" key={wrong.questionId}>
                          <div className="review-item__head">
                            <Tag tone="blue">{wrong.sourceTitle}</Tag>
                            <span>
                              {question.type === 'choice'
                                ? '选择题'
                                : question.type === 'short'
                                  ? '简答题'
                                  : '填空题'}
                            </span>
                            {wrong.wrongCount > 1 ? (
                              <Tag tone="red">错过 {wrong.wrongCount} 次</Tag>
                            ) : null}
                            <span className="spacer" />
                            <span>{timeAgo(wrong.lastAt)}</span>
                          </div>

                          <div style={{ fontWeight: 650, lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                            <RichText text={question.stem} />
                          </div>

                          <div className="small" style={{ marginTop: 8 }}>
                            你的作答：
                            <span
                              style={{ color: 'var(--c-red)', fontWeight: 700, whiteSpace: 'pre-line' }}
                            >
                              <RichText text={userText} />
                            </span>
                          </div>
                          <div className="small" style={{ marginTop: 4 }}>
                            正确答案：
                            <span className="explain__answer">
                              <RichText text={correctText} />
                            </span>
                          </div>

                          {isOpen ? (
                            <div className="explain fade-in" style={{ marginTop: 10 }}>
                              <div className="explain__title">📖 解析</div>
                              <div style={{ lineHeight: 1.85 }}>
                                <RichText text={question.explanation} />
                              </div>
                            </div>
                          ) : null}

                          <div className="row row--wrap" style={{ marginTop: 12 }}>
                            <button
                              className="btn btn--sm"
                              onClick={() => setExpanded(isOpen ? null : wrong.questionId)}
                            >
                              {isOpen ? '收起解析' : '查看解析'}
                            </button>
                            <Link className="btn btn--sm" to={`/s/chinese/${mid}/${entry.id}`}>
                              回到原文
                            </Link>
                            <button
                              className="btn btn--sm btn--ghost"
                              onClick={() => removeWrong(wrong.questionId)}
                            >
                              移出错题本
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </>
      )}
    </div>
  );
}
