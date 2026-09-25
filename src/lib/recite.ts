/**
 * 背诵的间隔重复安排。
 *
 * 采用简化的 Leitner 盒子模型：背对一次升一档，背错降档并短期重来。
 * 档位 → 间隔天数：1 / 2 / 4 / 7 / 15 / 30 天。
 *
 * 抽成纯函数，一是便于在 `scripts/validate-entry.ts` 里做回归测试，
 * 二是让「下次什么时候该复习」这件事只有一个实现。
 */

import type { ReciteRecord } from '../types';

/** 各熟练档位对应的复习间隔（天） */
export const RECITE_INTERVALS = [1, 2, 4, 7, 15, 30] as const;

const DAY = 24 * 60 * 60 * 1000;

export function emptyRecite(now: number = Date.now()): ReciteRecord {
  return { times: 0, lastAt: 0, dueAt: now, level: 0, streak: 0 };
}

/**
 * 记录一次背诵结果。
 * @param ok 学生自评是否背下来
 */
export function applyRecite(
  prev: ReciteRecord | undefined,
  ok: boolean,
  now: number = Date.now(),
): ReciteRecord {
  const base = prev ?? emptyRecite(now);

  if (!ok) {
    // 没背下来：降一档，明天再来
    const level = Math.max(0, base.level - 1);
    return {
      times: base.times + 1,
      lastAt: now,
      dueAt: now + RECITE_INTERVALS[0] * DAY,
      level,
      streak: 0,
    };
  }

  // 背下来了：升一档
  const level = Math.min(RECITE_INTERVALS.length - 1, base.level + 1);
  return {
    times: base.times + 1,
    lastAt: now,
    dueAt: now + RECITE_INTERVALS[level] * DAY,
    level,
    streak: base.streak + 1,
  };
}

/** 该内容今天是否需要复习（未背过也算需要，用于首次进入队列） */
export function isDue(rec: ReciteRecord | undefined, now: number = Date.now()): boolean {
  if (!rec) return true;
  return rec.dueAt <= now;
}

/** 距离下次复习还有多少天（已到期返回 0） */
export function daysUntilDue(rec: ReciteRecord | undefined, now: number = Date.now()): number {
  if (!rec) return 0;
  const diff = rec.dueAt - now;
  return diff <= 0 ? 0 : Math.ceil(diff / DAY);
}

/** 熟练度档位的可读描述 */
export function levelLabel(level: number): string {
  if (level <= 0) return '刚起步';
  if (level === 1) return '初步记住';
  if (level === 2) return '较为熟练';
  if (level === 3) return '熟练';
  if (level === 4) return '很牢固';
  return '烂熟于心';
}
