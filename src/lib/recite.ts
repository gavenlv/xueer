/**
 * 背诵的间隔重复安排。
 *
 * 采用简化的 Leitner 盒子模型：背对一次升一档，背错短期重来。
 * 档位 → 间隔天数：1 / 2 / 4 / 7 / 15 / 30 天。
 *
 * ## 达标口径：跨天有效次数
 *
 * 「背满 5 次」这件事必须**按天**数，不能按点击次数：否则学生坐在同一分钟里
 * 连点五次就能把一张卡刷成「已背诵」，这个标记立刻失去意义。所以
 * `effDays`（跨天有效次数）一天最多加 1，累计到 `RECITE_TARGET_TIMES` 即已背诵。
 *
 * 同时刻意做成**累计**而非连续：某天背砸了不该把前面积累的 4 天一笔勾销，
 * 只把复习时间推回明天。原来的「连续背对 3 次标熟」被这条口径取代。
 *
 * 抽成纯函数，一是便于在 `scripts/validate-entry.ts` 里做回归测试，
 * 二是让「下次什么时候该复习」这件事只有一个实现。
 */

import type { CardAttempt, CardRecord, ReciteRecord } from '../types';

/** 各熟练档位对应的复习间隔（天） */
export const RECITE_INTERVALS = [1, 2, 4, 7, 15, 30] as const;

/**
 * 累计多少个**有效背诵日**算「已背诵」（= 完全掌握）。
 *
 * 一天最多算 1 次，所以最快也要跨 5 天：刚看完的短暂记忆不算数，
 * 隔了几天还记得才配叫掌握。学习不是看了就等于学了。
 */
export const RECITE_TARGET_TIMES = 5;

/** 每张卡最多保留多少条背诵明细（云端同步体积的闸门） */
export const RECITE_ATTEMPT_KEEP = 20;

const DAY = 24 * 60 * 60 * 1000;

/**
 * 读数一律走这几个访问器，不要把 `effDays` / `streak` 直接写在调用点：
 * 存量记录里没有 `effDays`（那时以 `streak` 为熟练度），访问器负责兼容，
 * 调用点就不必到处写 `?? streak`。
 */
type ReciteLike = {
  times?: number;
  streak?: number;
  effDays?: number;
  recitedAt?: number;
  masteredAt?: number;
};

/** 跨天有效次数（旧记录没有 `effDays` 时退回按 `streak` 读） */
export function effectiveCount(r?: ReciteLike): number {
  return r?.effDays ?? r?.streak ?? 0;
}

/**
 * 是否已「背诵」（= 累计跨天有效次数达标，代表完全掌握）。
 *
 * 末一项是存量兼容：旧口径下已达「标熟」的卡（有 `masteredAt`、没有 `effDays`）
 * 应当继续算已背诵——门槛从 3 抬到 5，不能让学生的既有进度凭空回退。
 */
export function isRecited(r?: ReciteLike): boolean {
  if (!r) return false;
  if (r.recitedAt != null) return true;
  if (effectiveCount(r) >= RECITE_TARGET_TIMES) return true;
  return r.effDays == null && r.masteredAt != null;
}

/** 距离「已背诵」还差几个有效背诵日（已达成返回 0） */
export function toTarget(r?: ReciteLike): number {
  return Math.max(0, RECITE_TARGET_TIMES - effectiveCount(r));
}

export function emptyRecite(now: number = Date.now()): ReciteRecord {
  return { times: 0, lastAt: 0, dueAt: now, level: 0, streak: 0, effDays: 0 };
}

export function emptyCardRecord(now: number = Date.now()): CardRecord {
  return { times: 0, streak: 0, lastAt: 0, dueAt: now, effDays: 0 };
}

/** 两个时间戳是否落在同一天（本地时区） */
function sameDay(a: number | undefined, b: number): boolean {
  if (!a || !b) return false;
  const x = new Date(a);
  const y = new Date(b);
  return (
    x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate()
  );
}

/** 记录的核心状态（卡片与整篇共用；`masteredAt` 只有卡片有，`level` 只有整篇落库） */
type ReciteCore = {
  times: number;
  lastAt: number;
  dueAt: number;
  /** 熟练档位：由有效次数推导，卡片不落库（见 `applyCardRecite`） */
  level?: number;
  streak: number;
  effDays?: number;
  lastCountedAt?: number;
  attempts?: CardAttempt[];
  recitedAt?: number;
  masteredAt?: number;
};

/**
 * 记一次背诵结果（卡片与整篇共用的一份实现）。
 *
 * @param ok 学生自评是否背下来
 */
function stepRecite(prev: ReciteCore, ok: boolean, now: number): ReciteCore {
  /**
   * 存量迁移：旧口径的「标熟」（连续背对 3 次、跨三天）在旧规则下已算出师，
   * 直接记成 5 天有效，避免学生打开新版发现自己「掉出」了已背诵。
   * 同时把旧的 `masteredAt` 当作达成时间带过来，明细里显示的日期才是真的。
   */
  const legacyRecited = prev.masteredAt != null;
  const baseEff = Math.max(
    prev.effDays ?? prev.streak ?? 0,
    legacyRecited ? RECITE_TARGET_TIMES : 0,
  );
  const baseRecitedAt = prev.recitedAt ?? (legacyRecited ? prev.masteredAt : undefined);

  // 今天已经计过一次就不再计——同一天重复点只算打卡，不推进达标进度
  const counted = ok && !sameDay(prev.lastCountedAt, now);
  const effDays = counted ? baseEff + 1 : baseEff;
  const level = Math.min(RECITE_INTERVALS.length - 1, Math.max(0, effDays - 1));

  /**
   * 复习时间：
   *   · 计入有效：按新的档位往后推（1→2→4→7→15→30 天）；
   *   · 同一天重复点：不动排期，别把刚排好的复习又推远；
   *   · 没记住：回到最短间隔，明天再来（有效次数不清零，只推迟复习）。
   */
  const dueAt = !ok
    ? now + RECITE_INTERVALS[0] * DAY
    : counted
      ? now + RECITE_INTERVALS[level] * DAY
      : prev.dueAt;

  const attempts = [...(prev.attempts ?? []), { at: now, ok, counted }];
  const recitedAt = baseRecitedAt ?? (effDays >= RECITE_TARGET_TIMES ? now : undefined);

  return {
    times: prev.times + 1,
    lastAt: now,
    dueAt,
    level,
    streak: ok ? prev.streak + (counted ? 1 : 0) : 0,
    effDays,
    lastCountedAt: counted ? now : prev.lastCountedAt,
    attempts: attempts.slice(-RECITE_ATTEMPT_KEEP),
    recitedAt,
    ...(prev.masteredAt != null ? { masteredAt: prev.masteredAt } : {}),
  };
}

/** 记录一次整篇（古诗词／文言文遮罩训练）背诵结果 */
export function applyRecite(
  prev: ReciteRecord | undefined,
  ok: boolean,
  now: number = Date.now(),
): ReciteRecord {
  const rec = stepRecite(prev ?? emptyRecite(now), ok, now);
  return { ...rec, level: rec.level ?? 0 };
}

/** 记录一次知识点卡片背诵 */
export function applyCardRecite(
  prev: CardRecord | undefined,
  ok: boolean,
  now: number = Date.now(),
): CardRecord {
  // `level` 能从 `effDays` 推导，卡片不落库（见 types.ts 的说明）——这里丢掉它
  const { level: _level, ...record } = stepRecite(prev ?? emptyCardRecord(now), ok, now);
  return record;
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

/** 卡片熟练度的可读描述（正面提示学生「还差几次」） */
export function cardLevelLabel(rec?: ReciteLike): string {
  if (!rec || (rec.times ?? 0) === 0) return '还没背过';
  if (isRecited(rec)) return '已背诵';
  return `已背 ${effectiveCount(rec)} / ${RECITE_TARGET_TIMES} 次`;
}