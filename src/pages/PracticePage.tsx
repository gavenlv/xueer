/** 练习页：按模块 / 单条内容 / 错题组卷 */

import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getModuleMeta } from '../data/subjects';
import { allPoems } from '../data/chinese';
import {
  filterEntries,
  getEntry,
  lazyEntryIdOfQuestion,
  lazyEntryModuleOf,
  lazyEntrySpecFor,
  questionsOfModule,
} from '../data';
import { useStudy } from '../store/StudyContext';
import type { GradeId, ModuleId, QuizItem, QuizQuestion } from '../types';
import { buildModuleQuiz, buildQuiz, makeReciteQuestions } from '../lib/quiz';
import { shuffle } from '../lib/utils';
import { useDataScope, useLazyEntries, DataLoading, type LazyEntrySpec } from '../lib/useData';
import { QuizRunner } from '../components/QuizRunner';
import { EmptyState, PageHeader } from '../components/common';

const DEFAULT_COUNT: Record<string, number> = {
  poems: 12,
  vocab: 15,
  classical: 12,
  reading: 10,
  writing: 10,
  literature: 15,
};

export default function PracticePage() {
  const { moduleId = 'poems', itemId } = useParams();
  const [search] = useSearchParams();
  const { grade: studyGrade } = useStudy();
  // 只加载本模块数据（组卷只需要这一块）
  const moduleReady = useDataScope([moduleId as ModuleId]);

  const gradeParam = (search.get('grade') as GradeId | 'all' | null) ?? undefined;
  const grade: GradeId | 'all' = gradeParam ?? studyGrade;
  const countParam = Number(search.get('count') ?? '');
  const idsParam = search.get('ids');
  /** 古诗词考点专项：只默写这几首（由「中考考点」页传入篇目 id） */
  const poemsParam = search.get('poems');
  const typeParam = (search.get('type') as QuizQuestion['type'] | null) ?? undefined;
  /** 中考考点专项：只出带该知识点标签的题 */
  const tagParam = search.get('tag') ?? undefined;

  /**
   * 「按条目懒加载」的模块（语文中考专题 / 数学中考题型专题）：模块范围只装骨架，
   * **题目在正文里**，因此组卷之前必须先把它要的那几条下载完，
   * 否则卷子会是空的（页面不报错，只是没题）。
   *
   * 只下该下的那几条（范围由通用注册表算出来，这里一个模块 id 都不用出现）：
   *   - 单条内容练习（含该条的 `?tag=` 定向组卷）→ 只这一条；
   *   - 错题重做 `?ids=` → 只错题所属的那几条（题目 id 反推不出来时退回「全部」，
   *     宁可慢也不能少题）；
   *   - 跨条目组卷（模块级 `?tag=`、整模块随机练习）→ 本模块全部条目。
   */
  const lazySpec = useMemo<LazyEntrySpec | undefined>(() => {
    const mod = lazyEntryModuleOf(moduleId);
    if (!mod) return undefined;
    if (itemId) return lazyEntrySpecFor(moduleId, itemId);
    if (idsParam) {
      const entries = new Set<string>();
      for (const qid of idsParam.split(',').filter(Boolean)) {
        const entryId = lazyEntryIdOfQuestion(qid);
        // 反推不出来（题目 id 不按约定命名）→ 本模块全部加载，绝不静默少题
        if (!entryId || !mod.has(entryId)) return [...mod.ids()];
        entries.add(entryId);
      }
      return entries.size ? [...entries] : [...mod.ids()];
    }
    return [...mod.ids()];
  }, [moduleId, itemId, idsParam]);
  const topic = useLazyEntries(lazySpec);
  const ready = moduleReady && topic.ready;

  const meta = getModuleMeta(moduleId);
  const moduleName = meta?.module.name ?? '练习';
  /** 面包屑与返回链接的科目：从模块注册表推导，语文与数学共用同一份代码 */
  const subjectId = meta?.subject.id ?? 'chinese';

  /* 组卷：依赖项都是稳定值，避免重复渲染时重新洗牌 */
  const items = useMemo<QuizItem[]>(() => {
    const mid = moduleId as ModuleId;
    const count = Number.isFinite(countParam) && countParam > 0 ? countParam : undefined;

    // 1) 错题重做
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean);
      if (!ids.length) return [];
      const pool = questionsOfModule(mid);
      // 错题重做不再传 shuffleOptions/shuffleQuestions: false——QuizRunner 拿到题目后
      // 会无条件重洗（shuffle + permuteOptions），在这里关掉洗牌到不了学生眼前，
      // 只会让人以为「错题是按原顺序出的」。要改这个行为得动 QuizRunner。
      return buildModuleQuiz(pool, { onlyIds: ids });
    }

    // 2) 古诗文：用逐句默写组卷（古诗词本身没有预置题目）
    if (mid === 'poems') {
      const chosen = poemsParam
        ? new Set(poemsParam.split(',').filter(Boolean))
        : undefined;
      const poems = itemId
        ? allPoems.filter((p) => p.id === itemId)
        : chosen
          ? allPoems.filter((p) => chosen.has(p.id))
          : allPoems.filter((p) => grade === 'all' || p.grade === grade);
      const recite: QuizItem[] = [];
      for (const p of poems) recite.push(...makeReciteQuestions(p.lines, p.id, p.title));
      // 考点专项按「篇」出题，每首至少留够题量；随机练习仍按 count 截断
      return chosen ? recite : shuffle(recite).slice(0, count ?? DEFAULT_COUNT.poems);
    }

    // 3) 单条内容练习
    if (itemId) {
      const entry = getEntry(mid, itemId);
      return entry ? buildQuiz([entry], { count, onlyType: typeParam, onlyTag: tagParam }) : [];
    }

    // 4) 整个模块随机练习（可按考点筛选）
    const entries = filterEntries(mid, { grade });
    return buildQuiz(entries, {
      count: count ?? DEFAULT_COUNT[mid] ?? 15,
      onlyType: typeParam,
      onlyTag: tagParam,
    });
  }, [moduleId, itemId, grade, countParam, idsParam, typeParam, tagParam, poemsParam, ready]);

  if (!moduleReady) return <DataLoading label="正在准备题目…" />;
  if (!topic.ready) {
    return <DataLoading label="正在准备题目…" failed={topic.failed} onRetry={topic.retry} />;
  }

  const backTo = itemId ? `/s/${subjectId}/${moduleId}/${itemId}` : `/s/${subjectId}/${moduleId}`;
  const title = tagParam
    ? `考点专项：${tagParam}`
    : poemsParam
      ? '默写专项'
      : typeParam === 'short'
      ? '广州中考 · 整本书阅读专项'
      : itemId
        ? '专项练习'
        : idsParam
          ? '错题重做'
          : '随机练习';

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[
          { label: '首页', to: '/' },
          { label: meta?.subject.name ?? '语文', to: `/s/${subjectId}` },
          { label: moduleName, to: `/s/${subjectId}/${moduleId}` },
          { label: title },
        ]}
        title={
          <span>
            {meta?.module.icon} {title}
          </span>
        }
        desc={`${moduleName} · ${items.length} 道题${grade !== 'all' && !itemId ? ` · ${gradeLabel(grade)}` : ''}`}
        extra={
          <Link className="btn btn--sm" to={backTo}>
            ← 返回
          </Link>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon="🗂️"
          title="这一组没有题目"
          desc="换个学段或模块试试，或者先去学习内容再回来练习。"
          action={
            <Link className="btn btn--primary" to={`/s/${subjectId}/${moduleId}`}>
              去看看内容
            </Link>
          }
        />
      ) : (
        <QuizRunner items={items} title={moduleName} moduleId={moduleId as ModuleId} backTo={backTo} />
      )}
    </div>
  );
}

function gradeLabel(g: GradeId | 'all'): string {
  const map: Record<string, string> = {
    '7a': '七年级上册',
    '7b': '七年级下册',
    '8a': '八年级上册',
    '8b': '八年级下册',
    '9a': '九年级上册',
    '9b': '九年级下册',
    all: '全部学段',
  };
  return map[g] ?? '';
}
