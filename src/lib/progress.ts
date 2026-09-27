/**
 * 学习进度的更新规则与**掌握判定**。
 *
 * 抽成纯函数，一是便于在 `scripts/validate-entry.ts` 里做回归测试，
 * 二是让「已掌握」的判定标准集中在一处、可被审视。
 *
 * 这里有两套判定，按学科选用（`masteryPolicyOf`）：
 *
 * 1. `rate`（答对率型，语文/英语/历史/道法/数学沿用）：
 *    答够题量、正确率达到门槛即算掌握。适合**题量大、同类题多**的学科——
 *    语文一首诗有十几道默写题，要求学生把每一道都答对过并不现实。
 * 2. `all-questions`（全题过关型，理科用）：
 *    该知识点的**每一道题都答对过**才算掌握。理科的知识点题量少而精（8 道左右），
 *    每道题考的角度不同（理解、应用、作图、计算），漏掉一道往往就是漏掉一个角度；
 *    而且「全过关」给了学生一个明确的终点：卡片上的「过关 5/8」比一句「正确率 62%」
 *    更能说明下一步该做什么。
 */

import type { ItemProgress } from '../types';

/** 「已掌握」要求至少答过这么多题（仅 `rate` 策略使用） */
export const MASTERY_MIN_ANSWERS = 3;
/** 「已掌握」要求的正确率下限（仅 `rate` 策略使用） */
export const MASTERY_RATE = 0.8;
/** 「全题过关」策略的学科前缀：理科。化学加进来时在这里补 `chem-` 即可 */
export const ALL_QUESTIONS_PREFIXES = ['phy-'];

/** 掌握判定策略 */
export type MasteryPolicy = 'rate' | 'all-questions';

/**
 * 该模块用哪套掌握判定。
 *
 * 只按模块前缀判断，不引入数据层依赖（进度模块要能在任何页面被调用）。
 * 已有学科一律落在 `rate` 上，行为与从前完全一致。
 */
export function masteryPolicyOf(moduleId: string | undefined): MasteryPolicy {
  if (!moduleId) return 'rate';
  return ALL_QUESTIONS_PREFIXES.some((p) => moduleId.startsWith(p)) ? 'all-questions' : 'rate';
}

/** 把一次作答结果累加到该内容的进度上 */
export function applyAnswerToProgress(
  prev: ItemProgress,
  correct: boolean,
  now: number = Date.now(),
): ItemProgress {
  const total = prev.total + 1;
  const right = prev.correct + (correct ? 1 : 0);
  return {
    ...prev,
    total,
    correct: right,
    lastAt: now,
    mastered: total >= MASTERY_MIN_ANSWERS && right / total >= MASTERY_RATE,
  };
}

/**
 * 记录一道题的「过关」（首次答对）。
 *
 * 只在第一次答对时写入：时间戳要单调，云端按「取较小时间戳」合并才不会互相覆盖。
 */
export function applyPassed(
  passed: Record<string, number> | undefined,
  questionId: string,
  correct: boolean,
  now: number = Date.now(),
): Record<string, number> | undefined {
  if (!correct) return passed;
  const cur = passed ?? {};
  if (cur[questionId]) return passed;
  return { ...cur, [questionId]: now };
}

/** 一个知识点里已过关的题数 */
export function passedCount(questionIds: string[], passed: Record<string, number> | undefined): number {
  if (!passed) return 0;
  return questionIds.reduce((n, id) => (passed[id] ? n + 1 : n), 0);
}

/** 还没过关的题目 id（「还差哪几题」要用它，是这一套判定的核心价值） */
export function unpassedIds(questionIds: string[], passed: Record<string, number> | undefined): string[] {
  return questionIds.filter((id) => !passed?.[id]);
}

/**
 * 是否已掌握。
 *
 * `all-questions` 策略下不看正确率：只要每题都**曾经**答对过就算过关——
 * 答错过再答对同样是过关，学生不会被历史错误永久拖住。
 */
export function isMastered(input: {
  moduleId: string | undefined;
  progress?: ItemProgress;
  passed?: Record<string, number>;
  questionIds: string[];
}): boolean {
  const { moduleId, progress, passed, questionIds } = input;
  if (masteryPolicyOf(moduleId) === 'all-questions') {
    if (!questionIds.length) return false;
    return questionIds.every((id) => Boolean(passed?.[id]));
  }
  return Boolean(progress?.mastered);
}

/** 供界面直接显示的一句话进度：`rate` 给正确率，`all-questions` 给过关题数 */
export function progressLabel(input: {
  moduleId: string | undefined;
  progress?: ItemProgress;
  passed?: Record<string, number>;
  questionIds: string[];
}): string {
  const { moduleId, progress, passed, questionIds } = input;
  if (masteryPolicyOf(moduleId) === 'all-questions') {
    return `过关 ${passedCount(questionIds, passed)}/${questionIds.length}`;
  }
  if (!progress?.total) return '还没练过';
  return `正确率 ${Math.round((progress.correct / progress.total) * 100)}%`;
}
