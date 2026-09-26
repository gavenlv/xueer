/** 通用工具函数 */

import type { GradeId, GradeMeta } from '../types';

/* ------------------------------ 学段元数据 ------------------------------ */

export const GRADES: GradeMeta[] = [
  { id: '7a', name: '七年级上册', short: '七上', year: 7, term: '上' },
  { id: '7b', name: '七年级下册', short: '七下', year: 7, term: '下' },
  { id: '8a', name: '八年级上册', short: '八上', year: 8, term: '上' },
  { id: '8b', name: '八年级下册', short: '八下', year: 8, term: '下' },
  { id: '9a', name: '九年级上册', short: '九上', year: 9, term: '上' },
  { id: '9b', name: '九年级下册', short: '九下', year: 9, term: '下' },
];

export const GRADE_IDS: GradeId[] = GRADES.map((g) => g.id);

const GRADE_MAP: Record<string, GradeMeta> = Object.fromEntries(
  GRADES.map((g) => [g.id, g]),
);

/** 'all' 表示跨学段通用内容 */
export function gradeShort(id: GradeId | 'all'): string {
  if (id === 'all') return '通用';
  return GRADE_MAP[id]?.short ?? id;
}

export function gradeName(id: GradeId | 'all'): string {
  if (id === 'all') return '通用';
  return GRADE_MAP[id]?.name ?? id;
}

/* -------------------------------- 数组 ---------------------------------- */

/** Fisher–Yates 洗牌，返回新数组 */
export function shuffle<T>(input: readonly T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 随机取 n 个（不重复） */
export function sample<T>(input: readonly T[], n: number): T[] {
  return shuffle(input).slice(0, Math.max(0, n));
}

export function uniqBy<T>(arr: readonly T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

/* ------------------------------- 字符串 --------------------------------- */

/**
 * 判分模式 —— 决定「标点是否算作答内容」。
 *
 * - `loose`：忽略标点与空白，只比对文字。
 *   适用于默写、简答等场景 —— 学生标点写法各异，不应因此判错。
 * - `strict`：**保留** `-` `.` `(` `)` `,` `/` 等符号。
 *   适用于数学（`3` 与 `-3`、`25` 与 `2.5` 是不同答案），
 *   以及文言文断句题（`/` 的位置就是作答内容本身）。
 *
 * 注意：**不能按学科一刀切** —— 同一个学科内部两者都有：
 * 语文默写要 loose，语文断句题要 strict。
 */
export type AnswerMode = 'loose' | 'strict';

/**
 * 按题目自动选择判分模式。
 * 断句题的答案里一定含 `/`，这是它唯一的判据，语文填空题里也没有别的题型会用 `/`；
 * 数学全部用 strict。
 */
export function answerModeFor(moduleId: string, answer: string): AnswerMode {
  if (moduleId.startsWith('math-')) return 'strict';
  if (/[/／]/.test(answer)) return 'strict';
  return 'loose';
}

/** 全角字符转半角（含全角逗号、括号、斜杠、小数点等） */
function toHalfWidth(s: string): string {
  return s
    .replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ');
}

/**
 * 归一化填空答案。
 * `loose` 去掉空白与中英文标点（默写只看字对不对），并**统一小写**；
 * `strict` 只统一符号写法，保留有语义的标点。
 *
 * 为什么要统一小写：英语的填空题（完成句子、语篇填空）答案大多是普通单词，
 * 学生把句首的 `enough` 打成 `Enough` 不该算错。中文没有大小写，这条对语文判分毫无影响。
 * 在加上这一条之前，英语内容的作者只能把答案写成 `enough|Enough` 这种列举，
 * 既容易漏，也让数据膨胀。
 */
export function normalizeAnswer(s: string, mode: AnswerMode = 'loose'): string {
  if (mode === 'strict') {
    return (
      toHalfWidth(s)
        // 各种减号/连字符统一为半角 -
        .replace(/[\u2212\u2010-\u2015\uFE63\uFF0D]/g, '-')
        // 各种斜杠统一为半角 /（断句题学生常敲全角）
        .replace(/[\uFF0F\u2571\u2044]/g, '/')
        // 分/秒符号统一（学生常敲 ASCII 撇号）
        .replace(/['\u2019\u02B9]/g, '\u2032')
        .replace(/["\u201D\u02BA]/g, '\u2033')
        .replace(/\s/g, '')
        // 只去中文标点；保留 - . ( ) , / ° ′ ″ + = 等有语义的符号
        .replace(/[。、；：？！“”‘’《》〈〉【】〔〕…·]/g, '')
        .toLowerCase()
    );
  }

  return s
    .replace(/[\s\u3000]/g, '')
    .replace(/[，。、；：？！“”‘’"'（）〈〉《》【】…—·,.;:?!()<>[\]{}~`\-_/\\|]/g, '')
    .toLowerCase()
    .trim();
}

/** 判断填空作答是否正确；answer 中多个可接受写法用 `|` 分隔 */
export function checkFill(
  userInput: string,
  answer: string,
  mode: AnswerMode = 'loose',
): boolean {
  const u = normalizeAnswer(userInput, mode);
  if (!u) return false;
  return answer
    .split('|')
    .map((a) => normalizeAnswer(a, mode))
    .some((a) => a.length > 0 && a === u);
}

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** 高亮搜索关键词，返回片段数组 */
export function highlight(text: string, keyword: string): { text: string; hit: boolean }[] {
  const kw = keyword.trim();
  if (!kw) return [{ text, hit: false }];
  const out: { text: string; hit: boolean }[] = [];
  const lower = text.toLowerCase();
  const target = kw.toLowerCase();
  let i = 0;
  while (i < text.length) {
    const found = lower.indexOf(target, i);
    if (found === -1) {
      out.push({ text: text.slice(i), hit: false });
      break;
    }
    if (found > i) out.push({ text: text.slice(i, found), hit: false });
    out.push({ text: text.slice(found, found + kw.length), hit: true });
    i = found + kw.length;
  }
  return out;
}

/* -------------------------------- 日期 ---------------------------------- */

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function shiftDate(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + days);
  return dateKey(dt);
}

/** 距今相对时间描述 */
export function timeAgo(ts: number): string {
  if (!ts) return '尚未学习';
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} 小时前`;
  const day = Math.floor(hour / 24);
  if (day < 30) return `${day} 天前`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo} 个月前`;
  return `${Math.floor(mo / 12)} 年前`;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < 60) return `${s} 秒`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} 分钟`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h} 小时 ${rm} 分` : `${h} 小时`;
}

/* -------------------------------- 数值 ---------------------------------- */

export function pct(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function accuracy(correct: number, total: number): string {
  if (!total) return '—';
  return `${Math.round((correct / total) * 100)}%`;
}

/** 根据正确率给出评价 */
export function scoreComment(rate: number): { emoji: string; title: string; desc: string } {
  if (rate >= 95) return { emoji: '🏆', title: '炉火纯青', desc: '几乎全对，这部分内容你已经拿下，可以挑战下一组了。' };
  if (rate >= 85) return { emoji: '🎉', title: '相当扎实', desc: '掌握得不错，把错题再过一遍就更稳了。' };
  if (rate >= 70) return { emoji: '💪', title: '稳步前进', desc: '基础已经建立，重点攻克错题里的知识点。' };
  if (rate >= 50) return { emoji: '📖', title: '还需巩固', desc: '建议回到原文再读一遍，然后重做这组练习。' };
  return { emoji: '🌱', title: '从头再来', desc: '别急，先仔细看解析，错题本就是最好的复习资料。' };
}

export const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;
