/**
 * 「按学期 · 单元章节」的**取数**部分（与 `termTree.ts` 的**排序**部分分开）。
 *
 * 分开的理由：`termTree.ts` 里全是纯函数（解析章号、排序、补占位），可以脱离
 * 数据层单独跑、单独验；而这一层必须读 `src/data`（骨架清单、模块注册表、
 * 按需加载的条目），只有页面用得上。
 *
 * 这一层**只读轻量骨架**（`ENTRY_META`，由 `pnpm gen` 生成）来算册次与模块清单，
 * 正文要等 `useDataScope` 按需加载——所以学科页可以在一条正文都没下载时
 * 就渲染出「本学科有哪几册、每册多少条」。
 */
import { entriesOfModule, moduleIdsOfSubject } from '../data';
import { ENTRY_META } from '../data/summary';
import type { Entry, GradeId, ModuleId } from '../types';
import { GRADE_IDS } from './utils';

/** 本学科**真正有内容**的册次，按七上 → 九下排列；跨册内容排在最后 */
export function gradesWithContent(subjectId: string): (GradeId | 'all')[] {
  const ids = new Set(moduleIdsOfSubject(subjectId));
  const counts = new Map<string, number>();
  for (const m of ENTRY_META) {
    if (!ids.has(m.moduleId)) continue;
    counts.set(m.grade, (counts.get(m.grade) ?? 0) + 1);
  }
  const out: (GradeId | 'all')[] = [];
  for (const g of GRADE_IDS) if ((counts.get(g) ?? 0) > 0) out.push(g);
  if ((counts.get('all') ?? 0) > 0) out.push('all');
  return out;
}

/** 某一册要加载哪些模块（模块常跨册，所以要按册算，而不是整科全下载） */
export function modulesOfGrade(subjectId: string, grade: GradeId | 'all'): ModuleId[] {
  const ids = new Set(moduleIdsOfSubject(subjectId));
  const out = new Set<ModuleId>();
  for (const m of ENTRY_META) {
    if (ids.has(m.moduleId) && m.grade === grade) out.add(m.moduleId as ModuleId);
  }
  return [...out];
}

/** 某一册有多少条内容（同样只看骨架） */
export function countOfGrade(subjectId: string, grade: GradeId | 'all'): number {
  const ids = new Set(moduleIdsOfSubject(subjectId));
  let n = 0;
  for (const m of ENTRY_META) if (ids.has(m.moduleId) && m.grade === grade) n += 1;
  return n;
}

/**
 * 取某一册的全部条目：跨册内容（`grade === 'all'`）不混进具体册次里。
 *
 * 单独抽一个函数是为了把类型钉在 `Entry[]` 上——页面里 `flatMap` 出来的元素
 * 若跟着数据层的推断走，一旦上游类型松动就会退化成 `any`，列表渲染的字段
 * （title / subtitle / grade）也就不再被检查。
 */
export function entriesOfGrade(moduleIds: ModuleId[], grade: GradeId | 'all'): Entry[] {
  const all: Entry[] = moduleIds.flatMap((m) => entriesOfModule(m) as Entry[]);
  return all.filter((e) => e.grade === grade);
}
