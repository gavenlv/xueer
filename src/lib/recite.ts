/**
 * 背诵的间隔重复安排。
 *
 * 采用简化的 Leitner 盒子模型：背对一次升一档，背错降档并短期重来。
 * 档位 → 间隔天数：1 / 2 / 4 / 7 / 15 / 30 天。
 *
 * 抽成纯函数，一是便于在 `scripts/validate-entry.ts` 里做回归测试，
 * 二是让「下次什么时候该复习」这件事只有一个实现。
 */

import type { ReciteRecord, CardRecord } from '../types';

/** 各熟练档位对应的复习间隔（天） */
export const RECITE_INTERVALS = [1, 2, 4, 7, 15, 30] as const;

/**
 * 连续背对多少次算「标熟」（= 完全掌握）。
 *
 * 取 3 而不是 1：一次背对可能只是刚看完的短暂记忆。按下面的间隔安排，
 * 第 3 次背对发生在第 1 次之后的第 3 天（1 天 → 2 天两轮复习之后），
 * 也就是**隔了夜还记得**，这才配叫掌握。学习不是看了就等于学了。
 */
export const RECITE_MASTER_STREAK = 3;

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

/**
 * 距离下次复习还有多少天（已到期返回 0）。
 *
 * 只依赖 `dueAt`，所以整篇背诵记录与知识点卡片记录共用同一份实现。
 */
export function daysUntilDue(rec: { dueAt: number } | undefined, now: number = Date.now()): number {
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

/* ------------------------------------------------------------------ */
/* 知识点卡片                                                          */
/* ------------------------------------------------------------------ */

/** 两个时间戳是否落在同一天（本地时区） */
function sameDay(a: number, b: number): boolean {
  if (!a || !b) return false;
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate()
  );
}

export function emptyCardRecord(now: number = Date.now()): CardRecord {
  return { times: 0, streak: 0, lastAt: 0, dueAt: now };
}

/**
 * 记录一次知识点卡片背诵。
 *
 * 与整篇 `applyRecite` 的差别只有一处，但很关键：**同一天重复「背了」不叠加熟练度**。
 * 否则学生坐在同一分钟里连点三次就能把一张卡刷成「标熟」，这个标记立刻失去意义。
 * 打卡次数（`times`）照加，学生看到的就是「背了 1 次、2 次…」。
 *
 * 间隔按 `streak` 走 1→2→4→7→15→30 天；背错清零熟练度并从明天重来。
 */
export function applyCardRecite(
  prev: CardRecord | undefined,
  ok: boolean,
  now: number = Date.now(),
): CardRecord {
  const base = prev ?? emptyCardRecord(now);

  if (!ok) {
    return {
      times: base.times + 1,
      streak: 0,
      lastAt: now,
      dueAt: now + RECITE_INTERVALS[0] * DAY,
    };
  }

  // 今天已经升过档了：再点一次只算打卡，不动熟练度与排期
  const leveledToday = base.streak > 0 && sameDay(base.lastAt, now);
  const streak = leveledToday ? base.streak : base.streak + 1;
  const level = Math.min(RECITE_INTERVALS.length - 1, Math.max(0, streak - 1));
  const mastered = streak >= RECITE_MASTER_STREAK;

  return {
    times: base.times + 1,
    streak,
    lastAt: now,
    dueAt: leveledToday ? base.dueAt : now + RECITE_INTERVALS[level] * DAY,
    masteredAt: mastered ? (base.masteredAt ?? now) : undefined,
  };
}

/** 是否已「标熟」（= 连续背对达标，代表完全掌握） */
export function isMastered(rec: CardRecord | undefined): boolean {
  return (rec?.streak ?? 0) >= RECITE_MASTER_STREAK;
}

/** 距离标熟还差几次（已标熟返回 0） */
export function toMastery(rec: CardRecord | undefined): number {
  return Math.max(0, RECITE_MASTER_STREAK - (rec?.streak ?? 0));
}

/** 卡片熟练度的可读描述（正面提示学生「还差几次」） */
export function cardLevelLabel(rec: CardRecord | undefined): string {
  if (!rec || rec.times === 0) return '还没背过';
  if (isMastered(rec)) return '已标熟';
  if (rec.streak === 0) return '需要重背';
  return `熟练度 ${rec.streak} / ${RECITE_MASTER_STREAK}`;
}
