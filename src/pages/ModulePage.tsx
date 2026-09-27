/** 模块列表页：按学段 / 标签 / 关键词筛选内容条目 */

import { useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getModuleMeta, getSubject } from '../data/subjects';
import { filterTagsOfModule, entriesOfModule } from '../data';
import { useStudy } from '../store/StudyContext';
import type { GradeId, ModuleId } from '../types';
import { GRADES, cn, pct, timeAgo } from '../lib/utils';
import { useDataScope, DataLoading } from '../lib/useData';
import { matchesKeyword } from '../lib/searchText';
import { isMastered, masteryPolicyOf, passedCount } from '../lib/progress';
import {
  EmptyState,
  PageHeader,
  ProgressBar,
  SearchBox,
  SectionTitle,
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
   * 学段有两个来源，因此分成两个状态：
   *   - `picked`：学生在**本页手动点选**的学段（或地址栏 `?grade=` 带来的）；
   *   - `adaptedGrade`：按全局学段**自动适配**的结果（见下方）。
   *
   * 为什么不能只用一个状态：自动适配曾写成「用一个受控值、不匹配就把用户的选择改回去」，
   * 于是在单册模块（历史 hist-9a / 道法各册 / 化学各册）里点「九下」会被**立刻弹回
   * 「九上」**——学生看到的现象是「点九下没反应」「怎么老是九上」。手动选择必须永远优先。
   */
  const [picked, setPicked] = useState<GradeId | 'all' | null>(
    (search.get('grade') as GradeId | 'all' | null) ?? null,
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
   * 换模块时清掉手动选择：全局学段已经是学生最近的选择，让新模块重新自适应。
   * （在渲染期直接改状态是 React 认可的「随 props 调整状态」写法，SSR 下同样生效。）
   */
  const prevModule = useRef(moduleId);
  if (prevModule.current !== moduleId) {
    prevModule.current = moduleId;
    if (picked !== null) setPicked(null);
  }

  /**
   * 自动适配：有些模块（如历史六册）按「一册 = 一个学段」组织，
   * 学生点进 hist-9b 时全局学段可能还是七上——若照搬会把整页过滤成空。
   * 因此数据就绪后，当前学段在本模块里**一条都没有**时，落到该模块自己的学段。
   */
  const adaptedGrade = useMemo<GradeId | 'all'>(() => {
    if (!ready) return grade;
    if (allEntries.some((e) => e.grade === grade || e.grade === 'all')) return grade;
    const first = allEntries.find((e) => e.grade !== 'all');
    return (first?.grade as GradeId | undefined) ?? grade;
  }, [allEntries, ready, grade]);

  /** 学生的选择优先于自动适配 */
  const effectiveGrade = picked ?? adaptedGrade;

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

  const { module: m } = meta;

  /**
   * 待开发模块：内容还没写，但**不能让学生撞到空白页**。
   * 这里把该模块的规划说明、同学科其余模块的轮廓一并列出，
   * 学生能看清这门课的整体结构，也知道内容还在准备中。
   */
  if (!m.available) {
    const siblings = subject.modules;
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
            <Link className="btn btn--sm" to={`/s/${subject.id}`}>
              ← 返回{subject.name}模块总览
            </Link>
          }
        />

        <section className="card card--pad stack stack--sm">
          <div className="row row--between">
            <span className="bold">🚧 内容正在准备中</span>
            <Tag tone="gold">待开发</Tag>
          </div>
          <div className="page-desc">
            「{m.name}」尚未上线。上线后会按广州中考要求覆盖：{m.desc}。
            先看看这门课的整体结构，其余的模块也可以提前了解。
          </div>
        </section>

        <section className="stack stack--sm">
          <SectionTitle sub="这门课将按下面的结构组织，点进去可以先看规划">模块轮廓</SectionTitle>
          <div className="grid grid--auto">
            {siblings.map((x) => (
              <Link
                key={x.id}
                className="module-card"
                to={`/s/${subject.id}/${x.id}`}
                style={x.id === m.id ? { outline: `2px solid ${x.color}` } : undefined}
              >
                <span className="module-card__accent" style={{ background: x.color }} />
                <span
                  className="module-card__icon"
                  style={{ background: `${x.color}16`, color: x.color }}
                >
                  {x.icon}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="module-card__name" style={{ display: 'block' }}>
                    {x.name}
                  </span>
                  <span className="module-card__desc" style={{ display: 'block' }}>
                    {x.desc}
                  </span>
                  <span className="module-card__foot">
                    {x.available ? '已上线' : '待开发'}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (!ready) return <DataLoading />;

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
            onClick={() => setPicked('all')}
          >
            全部学段
          </button>
          {GRADES.map((g) => (
            <button
              key={g.id}
              className={cn('chip', effectiveGrade === g.id && 'is-active')}
              onClick={() => {
                setPicked(g.id);
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
          title={
            effectiveGrade === 'all'
              ? '没有找到相关内容'
              : `「${GRADES.find((g) => g.id === effectiveGrade)?.name ?? effectiveGrade}」暂无内容`
          }
          desc={
            effectiveGrade === 'all'
              ? '试试切换学段，或者换个关键词。'
              : `本学段在「${m.name}」里还没有条目，切到别的学段或「全部学段」看看。`
          }
          action={
            <button
              className="btn"
              onClick={() => {
                setKeyword('');
                setTagFilter('all');
                setPicked('all');
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
            /**
             * 掌握判定按学科分两套（见 lib/progress.ts）：
             * 理科（物理）是「这个知识点的每一道题都过关」，所以列表上要显示**过关 x/y**，
             * 而不是一个百分数——学生一眼就知道还差几题。
             */
            const qIds = e.questions.map((q) => q.id);
            const mastered = isMastered({
              moduleId: e.moduleId,
              progress: p,
              passed: state.passed,
              questionIds: qIds,
            });
            const passLabel =
              masteryPolicyOf(e.moduleId) === 'all-questions' && qIds.length
                ? `过关 ${passedCount(qIds, state.passed)}/${qIds.length}`
                : null;
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
                    {mastered ? <Tag tone="jade">已掌握</Tag> : null}
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
                    {passLabel ? (
                      <>
                        <span>·</span>
                        <span>{passLabel}</span>
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
