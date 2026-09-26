/**
 * 数学学科数据索引。
 *
 * 与 `data/chinese/index.ts` 同构：把原始数据装配成统一的 `Entry[]`，
 * 供列表页、练习引擎、错题本与统计统一消费。
 */

import type {
  Entry,
  Extension,
  GradeOrAll,
  GradeId,
  MathEntry,
  MathModuleId,
  MathTopic,
  MindMap,
} from '../../types';
import { matchesKeyword } from '../../lib/searchText';

/** 数学模块 id 列表 */
export const MATH_MODULE_IDS: MathModuleId[] = [
  'math-number',
  'math-geometry',
  'math-stats',
  'math-formula',
  'math-model',
  'math-exam',
];

/* ----------------------------- 原始数据（按模块装配） ----------------------------- */

import { mathNumber } from './number';
import { mathGeometry } from './geometry';
import { mathStats } from './stats';
import { mathFormula } from './formula';
import { mathModel } from './model';
import { mathExam } from './exam';

/** 各模块的知识点 */
const TOPICS_BY_MODULE: Partial<Record<MathModuleId, MathTopic[]>> = {
  'math-number': mathNumber,
  'math-geometry': mathGeometry,
  'math-stats': mathStats,
  'math-formula': mathFormula,
  'math-model': mathModel,
  'math-exam': mathExam,
};

/* ------------------------------ 装配 Entry ------------------------------ */

function joinSearch(...parts: (string | string[] | undefined)[]): string {
  const buf: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (Array.isArray(p)) buf.push(p.join(''));
    else buf.push(p);
  }
  return buf.join(' ').toLowerCase();
}

/* ----------------------------- 原始数据（按需加载） ----------------------------- */

/**
 * 知识点数据在 `./topics.ts` 里，由 `load()` **动态 import**：
 * 数学在界面上是隐藏的（只有直接访问 `/s/math` 用得到），
 * 语文学生不必为它下载那几百 KB 文本。
 */
let loaded = false;
let pending: Promise<void> | null = null;

/** 数学数据是否已就绪 */
export function isLoaded(): boolean {
  return loaded;
}

/** 加载数学数据（重复调用安全） */
export function load(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (pending) return pending;
  pending = import('./topics').then((m) => {
    for (const mid of MATH_MODULE_IDS) {
      for (const t of m.TOPICS_BY_MODULE[mid] ?? []) {
        allEntries.push({
          id: t.id,
          moduleId: mid,
          title: t.title,
          // 副标题里的 summary 可能含 $...$ 公式，列表页按纯文本渲染，
          // 因此在这里就把 $ 去掉，只留可读的纯文本。
          subtitle: [t.chapter, stripMath(t.summary)].filter(Boolean).join(' · ').slice(0, 60),
          grade: t.grade as GradeOrAll,
          // 标签只放章节，不放 methods——整句解题方法当标签既冗长又可能含公式标记
          tags: [chapterTag(t)],
          questions: t.questions ?? [],
          data: t,
        });
      }
    }
    loaded = true;
    pending = null;
  });
  return pending;
}

/* ------------------------------ 装配 Entry ------------------------------ */

/** 用章节号作为主标签，便于按章节筛选 */
function chapterTag(t: MathTopic): string {
  if (!t.chapter) return '综合';
  const m = t.chapter.match(/第[一二三四五六七八九十百]+章/);
  return m ? m[0] : t.chapter.slice(0, 12);
}

/**
 * 去掉文本中的 `$...$` 数学标记，只保留里面的内容。
 * 用于那些按纯文本渲染的字段（如列表页的 subtitle）。
 */
function stripMath(s: string): string {
  return s.replace(/\$([^$]*)\$/g, '$1');
}

/** 全部数学条目（原地填充） */
export const allEntries: Entry[] = [];

/** 数学的思维导图（内容补上后由 mindmaps.ts 提供） */
export const mindMaps: MindMap[] = [];

/** 数学的拓展阅读 */
export const extensions: Extension[] = [];

/* ------------------------------- 查询 API ------------------------------- */

export function entriesOfModule(moduleId: MathModuleId): Entry[] {
  return allEntries.filter((e) => e.moduleId === moduleId);
}

export function filterEntries(
  moduleId: MathModuleId,
  opts: { grade?: GradeId | 'all'; keyword?: string; tag?: string } = {},
): Entry[] {
  const kw = opts.keyword?.trim().toLowerCase() ?? '';
  return entriesOfModule(moduleId).filter((e) => {
    if (opts.grade && opts.grade !== 'all' && e.grade !== opts.grade && e.grade !== 'all') return false;
    if (opts.tag && !e.tags.includes(opts.tag)) return false;
    if (kw && !matchesKeyword(e, kw)) return false;
    return true;
  });
}

/** 模块页「筛选行」专用标签：主标签全保留，其余只留出现 ≥2 次的 */
export function filterTagsOfModule(moduleId: MathModuleId, grade?: GradeId | 'all'): string[] {
  const primary: string[] = [];
  const theme = new Map<string, number>();
  for (const e of filterEntries(moduleId, { grade })) {
    const [first, ...rest] = e.tags;
    if (first && !primary.includes(first)) primary.push(first);
    for (const t of rest) theme.set(t, (theme.get(t) ?? 0) + 1);
  }
  const extras = [...theme.entries()]
    .filter(([t, n]) => n >= 2 && !primary.includes(t))
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
  return [...primary, ...extras];
}

/** 内容量统计 */
export const contentStats = {
  get total() {
    return allEntries.length;
  },
  get questions() {
    return allEntries.reduce((n, e) => n + e.questions.length, 0);
  },
};
