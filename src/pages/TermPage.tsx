/**
 * 学期 · 单元章节页（`#/s/:subjectId/units`）。
 *
 * ## 这一页解决什么
 *
 * 学科页的模块网格是按**中考复习**排的（数与代数、中考专题……）；跟着学校进度学的学生
 * （尤其初一初二）更习惯问「这学期第几单元」而不是「哪个知识模块」。这一页把本科内容
 * 按 **教材册次 → 单元／章节** 两级重排，同一批数据换一种看法：
 * 选一册，看到的就是这一册的单元顺序，点进任意一条仍是原来的详情页。
 *
 * ## 三条刻意的取舍
 *
 *   1. **只加载选中册次涉及的模块**：模块常常跨册（数学「数与代数」同时含七上与九上），
 *      所以按册算出模块清单再 `useDataScope`，而不是一进页面把整科六个模块全下载下来。
 *   2. **单元顺序沿用数据先后**：各模块都是按教材章节顺序写的，第一次出现的次序就是教材
 *      次序；刻意不做拼音／笔画排序，否则第一单元会被排到最后一页。
 *   3. **「跨册」单列**：`grade === 'all'` 的是中考专题、速查卡这类本就跨册的内容，
 *      硬塞进某一册会让人误以为是同步课。
 */
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getSubject } from '../data/subjects';
import { useDataScope, DataLoading } from '../lib/useData';
import { GRADES, cn, gradeName, gradeShort } from '../lib/utils';
import { countOfGrade, entriesOfGrade, gradesWithContent, modulesOfGrade } from '../lib/termData';
import { groupByUnit } from '../lib/termTree';
import { useStudy } from '../store/StudyContext';
import type { Entry, GradeId, GradeMeta } from '../types';
import type { UnitGroup } from '../lib/termTree';
import { EmptyState, PageHeader, SectionTitle, Tag } from '../components/common';

export default function TermPage() {
  const { subjectId = 'chinese' } = useParams();
  const subject = getSubject(subjectId);
  const [search] = useSearchParams();
  const { state, grade: globalGrade } = useStudy();

  /** 本学科真正有内容的册次（含「跨册」） */
  const available = useMemo(() => gradesWithContent(subjectId), [subjectId]);

  /**
   * 默认册次：地址栏 `?grade=` → 学生在别处选过且本科确有内容的册次 → 本科第一册。
   * 最后才回落到 `all`，这样初一学生进来看到的是七上而不是「跨册」的中考专题。
   */
  const [picked, setPicked] = useState<GradeId | 'all'>(() => {
    const q = search.get('grade') as GradeId | 'all' | null;
    if (q && available.includes(q)) return q;
    if (available.includes(globalGrade)) return globalGrade;
    return available[0] ?? 'all';
  });
  const grade = available.includes(picked) ? picked : (available[0] ?? 'all');

  const moduleIds = useMemo(() => modulesOfGrade(subjectId, grade), [subjectId, grade]);
  const ready = useDataScope(moduleIds);

  /**
   * 本册的条目：`grade` 严格相等——`all`（跨册）单独成册，不混进某一册里。
   * `ready` 必须进依赖：数据异步 push 进全库，否则刷新本页会缓存住加载前的空数组。
   */
  const entries = useMemo(
    () => (ready ? entriesOfGrade(moduleIds, grade) : []),
    [ready, moduleIds, grade],
  );

  const groups = useMemo(() => groupByUnit(entries, subjectId, grade), [entries, subjectId, grade]);
  const studied = useMemo(
    () => entries.filter((e: Entry) => (state.progress[e.id]?.studied ?? 0) > 0).length,
    [entries, state.progress],
  );
  /** 教材有、本站还没录内容的单元数（作者一眼看到本册的待补清单） */
  const pending = useMemo(() => groups.filter((g: UnitGroup) => g.empty).length, [groups]);

  if (!subject) return <EmptyState icon="🧭" title="没有这个学科" desc="请从首页重新选择。" />;

  const title =
    grade === 'all' ? '跨册内容' : `${gradeName(grade)}的内容`;

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[
          { label: '首页', to: '/' },
          { label: subject.name, to: `/s/${subject.id}` },
          { label: '按学期浏览' },
        ]}
        title={
          <span>
            📚 {subject.name} · 按学期浏览
          </span>
        }
        desc={
          grade === 'all'
            ? `本学科的跨册内容：速查卡、中考专题等，不对应某一册教材，共 ${entries.length} 条。`
            : `按教材顺序排布：${title}共 ${groups.length} 个单元（${groups.length - pending} 个已录内容${pending ? `，${pending} 个暂无内容` : ''}）· ${entries.length} 条内容${studied ? ` · 已学 ${studied} 条` : ''}。`
        }
      />

      {/* 册次切换：只列本科确有内容的册次，空的册次不给按钮 */}
      <section className="stack stack--sm">
        <SectionTitle sub="选择教材册次，下面按该册的单元顺序展开">册次</SectionTitle>
        <div className="scroll-x">
          {available.map((g: GradeId | 'all') => (
            <button
              key={g}
              className={cn('chip', grade === g && 'is-active')}
              onClick={() => setPicked(g)}
            >
              {g === 'all' ? '跨册' : gradeShort(g)}
              <span style={{ marginLeft: 4, opacity: 0.6 }}>{countOfGrade(subjectId, g)}</span>
            </button>
          ))}
        </div>
      </section>

      {!ready ? (
        <DataLoading />
      ) : groups.length ? (
        groups.map((g: UnitGroup) => (
          <section className="stack stack--sm" key={`${g.kind}${g.no ?? ''}-${g.label}`}>
            <SectionTitle sub={g.empty ? '本站暂无内容' : `${g.entries.length} 条内容`}>
              {g.label}
            </SectionTitle>
            {/*
              教材有、本站还没录内容的单元**照常列出**（不跳过）：
              学生不会以为这一章不存在，作者也一眼看到待补清单。
            */}
            {g.empty ? (
              <div className="card" style={{ padding: '12px 14px', color: 'var(--c-ink-3)' }}>
                这一{g.kind || '章'}还没有录内容。可以先学相邻单元，或从学科页的模块视图进入。
              </div>
            ) : (
            <div className="card" style={{ overflow: 'hidden' }}>
              {g.entries.map((e: Entry, i: number) => {
                const p = state.progress[e.id];
                const done = (p?.studied ?? 0) > 0;
                return (
                  <div className="list-item" key={e.id}>
                    <span
                      className="list-item__index"
                      style={{ background: `${subject.color}16`, color: subject.color }}
                    >
                      {i + 1}
                    </span>
                    <Link className="list-item__main" to={`/s/${subject.id}/${e.moduleId}/${e.id}`}>
                      <span className="list-item__title">
                        {e.title}
                        {p?.starred ? <span title="已收藏">⭐</span> : null}
                        {done ? <Tag tone="jade">已学</Tag> : null}
                      </span>
                      <span className="list-item__meta">
                        <span>{e.subtitle}</span>
                        {e.grade !== 'all' ? (
                          <>
                            <span>·</span>
                            <span>{gradeShort(e.grade as GradeId)}</span>
                          </>
                        ) : null}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
            )}
          </section>
        ))
      ) : (
        <EmptyState
          icon="📚"
          title="这一册还没有内容"
          desc="换一个册次看看，或从学科页的模块进入（部分科目按知识模块组织，不按教材册次）。"
        />
      )}

      {/* 与模块视图互相可达：两种看法共用同一批数据，来回切换不丢进度 */}
      <section className="stack stack--sm">
        <div className="quick-row">
          <Link className="chip" to={`/s/${subject.id}`}>
            ← 回到{subject.name}模块视图
          </Link>
          {GRADES.filter((g: GradeMeta) => available.includes(g.id)).length > 1 ? (
            <span className="small" style={{ color: 'var(--c-ink-3)' }}>
              共 {available.filter((g: GradeId | 'all') => g !== 'all').length} 册可选
            </span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
