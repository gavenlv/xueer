/**
 * 云端同步：状态规范化、双向合并与上传。
 *
 * 合并原则（全部幂等：同一对状态无论合并多少次结果一致，可放心双向同步）：
 * - progress / recite：逐条按 lastAt 取较新；收藏取并集（布尔标记无时间戳）
 * - wrong：逐条按 lastAt 取较新，并结合墓碑（wrongRemoved）让「答对消错」也能跨设备同步
 * - checkins：日期并集
 * - daily：每个计数取较大值（避免双向同步把同一天重复累加）
 * - totalSeconds：取较大值
 * - grade：本地选过非默认学段则保留本地，否则跟随云端
 */

import type { GradeId, StudyState } from '../types';
import { supabase, LAST_SYNC_KEY } from './supabase';

/** 把任意来源（本地存储 / 云端 JSONB）的数据补全成完整 StudyState */
export function normalizeStudyState(parsed: unknown): StudyState {
  const p = (parsed ?? {}) as Partial<StudyState>;
  return {
    progress: p.progress ?? {},
    wrong: p.wrong ?? {},
    wrongRemoved: p.wrongRemoved ?? {},
    checkins: Array.isArray(p.checkins) ? p.checkins : [],
    daily: p.daily ?? {},
    grade: (p.grade as GradeId | undefined) ?? '7a',
    totalSeconds: typeof p.totalSeconds === 'number' && p.totalSeconds > 0 ? p.totalSeconds : 0,
    recite: p.recite ?? {},
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

  // 背诵记录：lastAt 新者胜
  const recite: NonNullable<StudyState['recite']> = { ...(local.recite ?? {}) };
  for (const [id, r] of Object.entries(remote.recite ?? {})) {
    const l = recite[id];
    if (!l || r.lastAt > l.lastAt) recite[id] = r;
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

  return {
    progress,
    wrong,
    wrongRemoved,
    checkins,
    daily,
    grade: local.grade !== '7a' ? local.grade : remote.grade,
    totalSeconds: Math.max(local.totalSeconds, remote.totalSeconds),
    recite,
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
