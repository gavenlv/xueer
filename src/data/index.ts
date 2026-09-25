/**
 * 全局数据索引：聚合所有学科的内容，并向页面提供**与学科无关**的查询 API。
 *
 * 页面只依赖这个模块，因此新增学科时 UI 一行都不用改 ——
 * 只要新学科的数据装配成 `Entry[]` 并在这里登记即可。
 */

import type { Entry, Extension, GradeId, MindMap, ModuleId, QuizQuestion } from '../types';
import { SUBJECTS } from './subjects';
import * as chinese from './chinese';
import * as math from './math';

/* ------------------------------ 聚合 ------------------------------ */

/** 全部内容条目（所有学科） */
export const allEntries: Entry[] = [...chinese.allEntries, ...math.allEntries];

/** 全部思维导图 */
export const mindMaps: MindMap[] = [...chinese.mindMaps, ...math.mindMaps];

/** 全部拓展阅读 */
export const extensions: Extension[] = [...chinese.extensions, ...math.extensions];

/** id -> Entry 快速索引 */
export const entryIndex: Map<string, Entry> = new Map(allEntries.map((e) => [e.id, e]));

/** 模块 id -> 学科 id（由学科注册表推导，无需手工维护） */
export const MODULE_SUBJECT: Map<string, string> = new Map(
  SUBJECTS.flatMap((s) => s.modules.map((m) => [m.id, s.id] as [string, string])),
);

/* ------------------------------ 学科相关 ------------------------------ */

export function subjectOfModule(moduleId: string): string | undefined {
  return MODULE_SUBJECT.get(moduleId);
}

export function moduleIdsOfSubject(subjectId: string): ModuleId[] {
  const s = SUBJECTS.find((x) => x.id === subjectId);
  return (s?.modules ?? []).map((m) => m.id as ModuleId);
}

/* ------------------------------ 逐模块查询 ------------------------------ */

export function entriesOfModule(moduleId: ModuleId): Entry[] {
  return allEntries.filter((e) => e.moduleId === moduleId);
}

export function getEntry(moduleId: string, id: string): Entry | undefined {
  return allEntries.find((e) => e.moduleId === moduleId && e.id === id);
}

export function findEntryById(id: string): Entry | undefined {
  return entryIndex.get(id);
}

/** 按题目 id 反查所属条目与题目 */
export function findQuestion(
  questionId: string,
): { entry: Entry; question: QuizQuestion } | undefined {
  for (const e of allEntries) {
    const q = e.questions.find((x) => x.id === questionId);
    if (q) return { entry: e, question: q };
  }
  return undefined;
}

export function filterEntries(
  moduleId: ModuleId,
  opts: { grade?: GradeId | 'all'; keyword?: string; tag?: string } = {},
): Entry[] {
  const kw = opts.keyword?.trim().toLowerCase() ?? '';
  return entriesOfModule(moduleId).filter((e) => {
    if (opts.grade && opts.grade !== 'all' && e.grade !== opts.grade && e.grade !== 'all') {
      return false;
    }
    if (opts.tag && !e.tags.includes(opts.tag)) return false;
    if (kw && !e.searchText.includes(kw)) return false;
    return true;
  });
}

/**
 * 模块页「筛选行」专用标签。
 * 只取条目主标签（tags[0]，即类别/章节），其余主题标签要求出现 ≥2 次，
 * 否则题目级标签会把真正的类别挤出显示上限。
 */
export function filterTagsOfModule(moduleId: ModuleId, grade?: GradeId | 'all'): string[] {
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

/** 某模块的全部题目（带来源条目） */
export function questionsOfModule(moduleId: ModuleId): { q: QuizQuestion; source: Entry }[] {
  const out: { q: QuizQuestion; source: Entry }[] = [];
  for (const e of entriesOfModule(moduleId)) {
    for (const q of e.questions) out.push({ q, source: e });
  }
  return out;
}

/** 全库检索 */
export function searchAll(keyword: string): Entry[] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];
  return allEntries.filter((e) => e.searchText.includes(kw) || e.title.toLowerCase().includes(kw));
}

/* --------------------------- 思维导图 / 拓展阅读 --------------------------- */

export function mindMapsOfEntry(entryId: string): MindMap[] {
  return mindMaps.filter((m) => m.entryId === entryId);
}

export function extensionsOfEntry(entryId: string): Extension[] {
  return extensions.filter((e) => e.entryId === entryId);
}

export function mindMapsOfModule(moduleId: ModuleId): MindMap[] {
  return mindMaps.filter((m) => m.moduleId === moduleId);
}

export function extensionsOfModule(moduleId: ModuleId): Extension[] {
  return extensions.filter((e) => e.moduleId === moduleId);
}

/* ------------------------------ 中考考点体系 ------------------------------ */

/**
 * 一个「考点」= 题目的知识点标签。
 * 直接由题库聚合而来，因此考点与题目天然一一对应，不会出现「考点没有题」的情况。
 */
export interface ExamPoint {
  /** 考点名（即题目上的 tag） */
  tag: string;
  /** 归属模块 */
  moduleId: ModuleId;
  /** 该考点的题目总数 */
  questions: number;
  /** 涉及的内容条目（去重） */
  entryIds: string[];
  /** 题型分布 */
  types: Record<string, number>;
}

/** 聚合某学科（默认语文）的全部考点，按题量降序 */
export function examPointsOfSubject(subjectId = 'chinese'): ExamPoint[] {
  const mids = new Set(moduleIdsOfSubject(subjectId));
  const map = new Map<string, ExamPoint>();

  for (const e of allEntries) {
    if (!mids.has(e.moduleId)) continue;
    for (const q of e.questions) {
      for (const tag of q.tags ?? []) {
        if (!tag) continue;
        const key = `${e.moduleId}::${tag}`;
        let p = map.get(key);
        if (!p) {
          p = { tag, moduleId: e.moduleId, questions: 0, entryIds: [], types: {} };
          map.set(key, p);
        }
        p.questions += 1;
        p.types[q.type] = (p.types[q.type] ?? 0) + 1;
        if (!p.entryIds.includes(e.id)) p.entryIds.push(e.id);
      }
    }
  }

  return [...map.values()].sort((a, b) => b.questions - a.questions);
}

/** 按模块分组的考点 */
export function examPointsByModule(subjectId = 'chinese'): { moduleId: ModuleId; points: ExamPoint[] }[] {
  const all = examPointsOfSubject(subjectId);
  const byModule = new Map<ModuleId, ExamPoint[]>();
  for (const p of all) {
    byModule.set(p.moduleId, [...(byModule.get(p.moduleId) ?? []), p]);
  }
  // 按学科注册表里的模块顺序输出
  return moduleIdsOfSubject(subjectId)
    .map((mid) => ({ moduleId: mid, points: byModule.get(mid) ?? [] }))
    .filter((g) => g.points.length > 0);
}

/* ------------------------------ 统计 ------------------------------ */

/** 全局内容量 */
export const contentStats = {
  get entries() {
    return allEntries.length;
  },
  get questions() {
    return allEntries.reduce((n, e) => n + e.questions.length, 0);
  },
  get mindMaps() {
    return mindMaps.length;
  },
  get extensions() {
    return extensions.length;
  },
};

export interface SubjectStats {
  entries: number;
  questions: number;
  mindMaps: number;
  extensions: number;
}

/** 单学科内容量 */
export function statsOfSubject(subjectId: string): SubjectStats {
  const mids = moduleIdsOfSubject(subjectId);
  const inSubject = (m: ModuleId) => mids.includes(m);
  const entries = allEntries.filter((e) => inSubject(e.moduleId));
  return {
    entries: entries.length,
    questions: entries.reduce((n, e) => n + e.questions.length, 0),
    mindMaps: mindMaps.filter((m) => inSubject(m.moduleId)).length,
    extensions: extensions.filter((x) => inSubject(x.moduleId)).length,
  };
}

/** 单模块内容量 */
export function statsOfModule(moduleId: ModuleId): SubjectStats {
  const entries = entriesOfModule(moduleId);
  return {
    entries: entries.length,
    questions: entries.reduce((n, e) => n + e.questions.length, 0),
    mindMaps: mindMapsOfModule(moduleId).length,
    extensions: extensionsOfModule(moduleId).length,
  };
}
