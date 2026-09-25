/** 练习组卷与判分逻辑 */

import type { Entry, ModuleId, QuizItem, QuizQuestion } from '../types';
import { OPTION_KEYS, shuffle } from './utils';

/**
 * 打乱选择题选项，并同步改写正确答案字母。
 * 用于同一题多次练习时避免「记住选项位置」。
 */
export function permuteOptions(q: QuizQuestion): QuizQuestion {
  if (q.type !== 'choice' || !q.options || q.options.length < 2) return q;
  const correctIndex = OPTION_KEYS.indexOf(q.answer as (typeof OPTION_KEYS)[number]);
  if (correctIndex < 0 || correctIndex >= q.options.length) return q;
  const correctText = q.options[correctIndex];
  const next = shuffle(q.options);
  const nextIndex = next.indexOf(correctText);
  if (nextIndex < 0) return q;
  return { ...q, options: next, answer: OPTION_KEYS[nextIndex] };
}

export interface BuildQuizOptions {
  /** 抽题数量，默认全部 */
  count?: number;
  /** 是否打乱选项，默认 true */
  shuffleOptions?: boolean;
  /** 是否打乱题目顺序，默认 true */
  shuffleQuestions?: boolean;
  /** 只出这些题目 id（如错题重做） */
  onlyIds?: string[];
  /** 只出某个题型（如广州中考「整本书阅读」专项只出简答题） */
  onlyType?: QuizQuestion['type'];
  /** 只出带某个知识点标签的题（中考考点专项训练） */
  onlyTag?: string;
}

/** 从条目集合中组一套练习 */
export function buildQuiz(entries: Entry[], opts: BuildQuizOptions = {}): QuizItem[] {
  const {
    count,
    shuffleOptions = true,
    shuffleQuestions = true,
    onlyIds,
    onlyType,
    onlyTag,
  } = opts;

  let pool: QuizItem[] = [];
  for (const e of entries) {
    for (const q of e.questions) {
      if (onlyIds && !onlyIds.includes(q.id)) continue;
      if (onlyType && q.type !== onlyType) continue;
      if (onlyTag && !(q.tags ?? []).includes(onlyTag)) continue;
      pool.push({ ...q, sourceId: e.id, sourceTitle: e.title, moduleId: e.moduleId });
    }
  }

  if (shuffleQuestions) pool = shuffle(pool);
  if (typeof count === 'number') pool = pool.slice(0, Math.max(0, count));
  if (shuffleOptions) pool = pool.map((q) => ({ ...q, ...permuteOptions(q) }));
  return pool;
}

/** 从模块的全部题目组卷 */
export function buildModuleQuiz(
  all: { q: QuizQuestion; source: Entry }[],
  opts: BuildQuizOptions = {},
): QuizItem[] {
  const { count, shuffleOptions = true, shuffleQuestions = true, onlyType, onlyTag } = opts;
  let pool: QuizItem[] = all
    .filter(({ q }) => (!onlyType || q.type === onlyType) && (!onlyTag || (q.tags ?? []).includes(onlyTag)))
    .map(({ q, source }) => ({
      ...q,
      sourceId: source.id,
      sourceTitle: source.title,
      moduleId: source.moduleId as ModuleId,
    }));
  if (shuffleQuestions) pool = shuffle(pool);
  if (typeof count === 'number') pool = pool.slice(0, Math.max(0, count));
  if (shuffleOptions) pool = pool.map((q) => ({ ...q, ...permuteOptions(q) }));
  return pool;
}

/** 统计汉字个数（默写只看汉字） */
function hanziCount(s: string): number {
  return s.replace(/[^\u4e00-\u9fa5]/g, '').length;
}

/**
 * 把一行按中文标点切成「句」，标点跟随前一句。
 *
 * 各篇目的 `lines` 粒度并不统一：近体诗按「联」拆、文言文常按长句或段落拆，
 * 直接整行挖空会出现「一次默写 99 个字」这种不合理的题。
 * 因此默写题一律下沉到「句」这一级，与展示用的 lines 解耦。
 */
function splitClauses(line: string): string[] {
  const out: string[] = [];
  let buf = '';
  for (const ch of line) {
    buf += ch;
    if (/[，。；：！？、]/.test(ch)) {
      const t = buf.trim();
      if (t) out.push(t);
      buf = '';
    }
  }
  const tail = buf.trim();
  if (tail) out.push(tail);
  return out;
}

/**
 * 古诗词/文言文默写题：以「句」为单位挖空，用相邻句作提示。
 * 长句会自动再切分，保证单题作答量适合初中生。
 */
export function makeReciteQuestions(
  lines: string[],
  entryId: string,
  title: string,
): QuizItem[] {
  // 展开成句级单元
  const units: string[] = [];
  for (const line of lines) {
    for (const c of splitClauses(line)) {
      if (hanziCount(c) > 0) units.push(c);
    }
  }

  const out: QuizItem[] = [];
  for (let i = 0; i < units.length; i += 1) {
    const target = units[i];
    const n = hanziCount(target);
    // 太短的句子区分度低，不出题
    if (n < 4) continue;

    const prev = units[i - 1];
    const next = units[i + 1];

    let stem: string;
    if (prev && next) {
      stem = `默写补全：\n上句：${prev}\n下句：${next}\n请补出中间的一句。`;
    } else if (prev) {
      stem = `默写补全：\n上句：${prev}\n请写出下句。`;
    } else if (next) {
      stem = `默写补全：\n下句：${next}\n请写出上句。`;
    } else {
      stem = '默写补全：请写出这一句。';
    }

    out.push({
      id: `${entryId}-recite-${i}`,
      type: 'fill',
      stem,
      answer: target,
      explanation: `原句：${target}`,
      difficulty: n <= 5 ? 1 : n <= 9 ? 2 : 3,
      tags: ['默写', title],
      sourceId: entryId,
      sourceTitle: title,
      moduleId: 'poems',
    });
  }
  return out;
}
