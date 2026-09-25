/** 练习页：按模块 / 单条内容 / 错题组卷 */

import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getModuleMeta } from '../data/subjects';
import { allPoems } from '../data/chinese';
import { filterEntries, getEntry, questionsOfModule } from '../data';
import { useStudy } from '../store/StudyContext';
import type { GradeId, ModuleId, QuizItem, QuizQuestion } from '../types';
import { buildModuleQuiz, buildQuiz, makeReciteQuestions } from '../lib/quiz';
import { shuffle } from '../lib/utils';
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

  const gradeParam = (search.get('grade') as GradeId | 'all' | null) ?? undefined;
  const grade: GradeId | 'all' = gradeParam ?? studyGrade;
  const countParam = Number(search.get('count') ?? '');
  const idsParam = search.get('ids');
  const typeParam = (search.get('type') as QuizQuestion['type'] | null) ?? undefined;
  /** 中考考点专项：只出带该知识点标签的题 */
  const tagParam = search.get('tag') ?? undefined;

  const meta = getModuleMeta(moduleId);
  const moduleName = meta?.module.name ?? '练习';

  /* 组卷：依赖项都是稳定值，避免重复渲染时重新洗牌 */
  const items = useMemo<QuizItem[]>(() => {
    const mid = moduleId as ModuleId;
    const count = Number.isFinite(countParam) && countParam > 0 ? countParam : undefined;

    // 1) 错题重做
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean);
      if (!ids.length) return [];
      const pool = questionsOfModule(mid);
      return buildModuleQuiz(pool, { onlyIds: ids, shuffleQuestions: false, shuffleOptions: false });
    }

    // 2) 古诗文：用逐句默写组卷（古诗词本身没有预置题目）
    if (mid === 'poems') {
      const poems = itemId
        ? allPoems.filter((p) => p.id === itemId)
        : allPoems.filter((p) => grade === 'all' || p.grade === grade);
      const recite: QuizItem[] = [];
      for (const p of poems) recite.push(...makeReciteQuestions(p.lines, p.id, p.title));
      return shuffle(recite).slice(0, count ?? DEFAULT_COUNT.poems);
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
  }, [moduleId, itemId, grade, countParam, idsParam, typeParam, tagParam]);

  const backTo = itemId ? `/s/chinese/${moduleId}/${itemId}` : `/s/chinese/${moduleId}`;
  const title = tagParam
    ? `考点专项：${tagParam}`
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
          { label: '语文', to: '/s/chinese' },
          { label: moduleName, to: `/s/chinese/${moduleId}` },
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
            <Link className="btn btn--primary" to={`/s/chinese/${moduleId}`}>
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
