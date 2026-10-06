/**
 * 云端同步：状态规范化、双向合并与上传。
 *
 * 合并原则（全部幂等：同一对状态无论合并多少次结果一致，可放心双向同步）：
 * - progress：逐条按 lastAt 取较新；收藏取并集（布尔标记无时间戳）
 * - recite / cards：**字段级**合并（计数取 max、明细取并集、达成时间取最早、排期跟最近一次背诵），
 *   不能整条按 lastAt 新者胜——两台设备各背几天后同步，整条覆盖会把另一台的次数与明细抹掉
 * - wrong：逐条按 lastAt 取较新，并结合墓碑（wrongRemoved）让「答对消错」也能跨设备同步
 * - checkins：日期并集
 * - daily：每个计数取较大值（避免双向同步把同一天重复累加）
 * - totalSeconds：取较大值
 * - grade：本地**主动选过**学段则保留本地，否则跟随云端（用 `gradePicked` 判断，
 *   不能拿 `'7a'` 当哨兵——「七上」既是默认值，也是学生会主动选的正常学段）
 */

import type { CardAttempt, GradeId, StudyState } from '../types';
import { supabase, LAST_SYNC_KEY } from './supabase';
import { RECITE_ATTEMPT_KEEP } from './recite';

/** 把任意来源（本地存储 / 云端 JSONB）的数据补全成完整 StudyState */
export function normalizeStudyState(parsed: unknown): StudyState {
  const p = (parsed ?? {}) as Partial<StudyState>;
  return {
    progress: p.progress ?? {},
    passed: p.passed ?? {},
    wrong: p.wrong ?? {},
    wrongRemoved: p.wrongRemoved ?? {},
    checkins: Array.isArray(p.checkins) ? p.checkins : [],
    daily: p.daily ?? {},
    grade: (p.grade as GradeId | undefined) ?? '7a',
    gradePicked: p.gradePicked === true,
    totalSeconds: typeof p.totalSeconds === 'number' && p.totalSeconds > 0 ? p.totalSeconds : 0,
    recite: p.recite ?? {},
    cards: p.cards ?? {},
    // 刻意**不给** recite/cards 里的 `effDays` 补默认值：旧记录靠「没有 effDays」这一事实
    // 走 `isRecited` 的存量兼容分支（有 masteredAt 即视为已背诵），补了 0 反而会把老进度判没。
  };
}

/** 取两者中已定义且较大的一个（都没定义就返回 undefined） */
function maxDefined(a?: number, b?: number): number | undefined {
  if (a == null) return b;
  if (b == null) return a;
  return Math.max(a, b);
}

/** 取两者中已定义且较小的一个（都没定义就返回 undefined） */
function minDefined(a?: number, b?: number): number | undefined {
  if (a == null) return b;
  if (b == null) return a;
  return Math.min(a, b);
}

/**
 * 背诵明细的并集：按时间排序、同一时刻只留一条，再截到最近的若干条。
 *
 * 明细是「第几次、什么时候、背了没记住」的回放记录，两端都要保留；
 * 用 `at` 作去重口径，是因为同一时刻不可能点两次不同结果。
 */
function mergeAttempts(a?: CardAttempt[], b?: CardAttempt[]): CardAttempt[] {
  const all = [...(a ?? []), ...(b ?? [])].sort((x, y) => x.at - y.at);
  const out: CardAttempt[] = [];
  for (const it of all) if (out[out.length - 1]?.at !== it.at) out.push(it);
  return out.slice(-RECITE_ATTEMPT_KEEP);
}

/** 卡片与整篇共有的背诵字段（可选字段只在有值时写出，避免把 undefined 落盘） */
type ReciteFields = {
  times: number;
  streak: number;
  effDays?: number;
  lastCountedAt?: number;
  recitedAt?: number;
  attempts?: CardAttempt[];
};

/**
 * 背诵记录的**字段级**合并：计数取 max（单调不复活）、明细取并集、达成时间取最早。
 * 排期（`lastAt` / `dueAt` / `level`）不在返回值里——由调用方取「最近一次背诵」那条。
 */
function mergeReciteFields(l: ReciteFields, r: ReciteFields): ReciteFields {
  const effDays = maxDefined(l.effDays, r.effDays);
  const lastCountedAt = maxDefined(l.lastCountedAt, r.lastCountedAt);
  const recitedAt = minDefined(l.recitedAt, r.recitedAt);
  const attempts = mergeAttempts(l.attempts, r.attempts);
  return {
    times: Math.max(l.times, r.times),
    streak: Math.max(l.streak, r.streak),
    ...(effDays != null ? { effDays } : {}),
    ...(lastCountedAt != null ? { lastCountedAt } : {}),
    ...(recitedAt != null ? { recitedAt } : {}),
    ...(attempts.length ? { attempts } : {}),
  };
}

/** 双向合并本地与云端状态，生成合并结果（不改动两侧原对象） */
export function mergeStates(local: StudyState, remote: StudyState): StudyState {
  // 内容进度：lastAt 新者胜；收藏取并集
  const progress: StudyState['progress'] = { ...local.progress };
  for (const [id, r] of Object.entries(remote.progress)) {
    const l = progress[id];
    if (!l) {
      progress[id] = r;
      continue;
    }
    const newer = r.lastAt > l.lastAt ? r : l;
    progress[id] = { ...newer, starred: Boolean(l.starred || r.starred) };
  }

  // 错题：墓碑（删除标记）晚于记录时视为「已消错」
  const wrong: StudyState['wrong'] = { ...local.wrong };
  const wrongRemoved: NonNullable<StudyState['wrongRemoved']> = { ...local.wrongRemoved };
  const ids = new Set([...Object.keys(local.wrong), ...Object.keys(remote.wrong)]);
  for (const id of ids) {
    const l = local.wrong[id];
    const r = remote.wrong[id];
    const tomb = Math.max(local.wrongRemoved?.[id] ?? 0, remote.wrongRemoved?.[id] ?? 0);
    const lAlive = l && l.lastAt > tomb ? l : undefined;
    const rAlive = r && r.lastAt > tomb ? r : undefined;
    const winner =
      lAlive && rAlive ? (rAlive.lastAt > lAlive.lastAt ? rAlive : lAlive) : (lAlive ?? rAlive);
    if (winner) wrong[id] = winner;
    else delete wrong[id];
    if (tomb) wrongRemoved[id] = tomb;
  }

  // 背诵记录（整篇）：字段级合并，排期跟最近一次背诵，其余字段取并集/最大值
  const recite: NonNullable<StudyState['recite']> = { ...(local.recite ?? {}) };
  for (const [id, r] of Object.entries(remote.recite ?? {})) {
    const l = recite[id];
    if (!l) {
      recite[id] = r;
      continue;
    }
    const newer = r.lastAt > l.lastAt ? r : l;
    recite[id] = { ...newer, ...mergeReciteFields(l, r) };
  }

  // 知识点卡片记录：同样字段级合并（明细并集、计数取 max）；
  // `masteredAt` 是旧口径的达成时间，取最早的那个，作存量兼容
  const cards: NonNullable<StudyState['cards']> = { ...(local.cards ?? {}) };
  for (const [id, r] of Object.entries(remote.cards ?? {})) {
    const l = cards[id];
    if (!l) {
      cards[id] = r;
      continue;
    }
    const newer = r.lastAt > l.lastAt ? r : l;
    const masteredAt = minDefined(l.masteredAt, r.masteredAt);
    cards[id] = {
      ...newer,
      ...mergeReciteFields(l, r),
      ...(masteredAt != null ? { masteredAt } : {}),
    };
  }

  // 打卡日期并集
  const checkins = Array.from(new Set([...local.checkins, ...remote.checkins])).sort();

  // 每日统计：各计数取较大值
  const daily: StudyState['daily'] = { ...local.daily };
  for (const [day, r] of Object.entries(remote.daily)) {
    const l = daily[day];
    daily[day] = l
      ? {
          answered: Math.max(l.answered, r.answered),
          correct: Math.max(l.correct, r.correct),
          minutes: Math.max(l.minutes, r.minutes),
        }
      : r;
  }

  /**
   * 过关记录：取并集，同一题两边都答对过就取**较早**的时间戳。
   * 这组数据是单调的（答对过就不会变回没答对），所以合并永不丢信息、也不需要墓碑——
   * 与错题那套「删除要留墓碑」的麻烦完全不同。
   */
  const passed: NonNullable<StudyState['passed']> = { ...(local.passed ?? {}) };
  for (const [qid, at] of Object.entries(remote.passed ?? {})) {
    const cur = passed[qid];
    passed[qid] = cur ? Math.min(cur, at) : at;
  }

  return {
    progress,
    passed,
    wrong,
    wrongRemoved,
    checkins,
    daily,
    // 本地主动选过学段就保留本地的选择；两边都没选过（都是默认值）时跟随云端。
    // 标记取并集：只要任一侧表示「学生选过」，合并结果就不再是「从没选过」的默认态。
    grade: local.gradePicked ? local.grade : remote.grade,
    gradePicked: Boolean(local.gradePicked) || Boolean(remote.gradePicked),
    totalSeconds: Math.max(local.totalSeconds, remote.totalSeconds),
    recite,
    cards,
  };
}

/** 上传整份学习状态到云端（登录后调用），成功返回 true */
export async function uploadState(userId: string, state: StudyState): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('user_progress').upsert({
    id: userId,
    data: state,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.warn('[sync] 上传失败：', error.message);
    return false;
  }
  try {
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  } catch {
    /* 隐私模式下静默失败 */
  }
  return true;
}
