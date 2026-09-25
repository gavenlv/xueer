/**
 * 学习进度的更新规则。
 *
 * 抽成纯函数，一是便于在 `scripts/validate-entry.ts` 里做回归测试，
 * 二是让「已掌握」的判定标准集中在一处、可被审视。
 */

import type { ItemProgress } from '../types';

/** 「已掌握」要求至少答过这么多题 */
export const MASTERY_MIN_ANSWERS = 3;
/** 「已掌握」要求的正确率下限 */
export const MASTERY_RATE = 0.8;

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
