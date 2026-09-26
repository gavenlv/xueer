/**
 * 全局数据索引：聚合所有学科的内容，并向页面提供**与学科无关**的查询 API。
 *
 * 页面只依赖这个模块，因此新增学科时 UI 一行都不用改 ——
 * 只要新学科的数据装配成 `Entry[]` 并在这里登记即可。
 *
 * ## 数据是**按需加载**的
 *
 * 内容文本占了整个应用体积的九成以上，全量首屏下载会让学生为了看首页等好几秒。
 * 因此这里的三组容器（entries / mindMaps / extensions）都是**原地填充**的空数组：
 * 页面先用 `useDataScope([...])` 声明自己需要哪些模块，加载完成后同步查询照旧可用。
 * 校验脚本则先 `await ensureAll()`，所以既有断言不受影响。
 */

import type { Entry, Extension, GradeId, MindMap, ModuleId, Poem, QuizQuestion } from '../types';
import { SUBJECTS } from './subjects';
import { imageryOf, examThemesOf } from '../lib/relations';
import { relOfEntry } from '../lib/relNode';
import { matchesKeyword } from '../lib/searchText';
import * as chinese from './chinese';
import * as math from './math';

/* ------------------------------ 聚合 ------------------------------ */

/** 全部内容条目（所有学科）——原地填充 */
export const allEntries: Entry[] = [];

/** 全部思维导图——原地填充 */
export const mindMaps: MindMap[] = [];

/** 全部拓展阅读——原地填充 */
export const extensions: Extension[] = [];

/** id -> Entry 快速索引（原地重建，引用恒定） */
export const entryIndex: Map<string, Entry> = new Map<string, Entry>();

/** 模块 id -> 学科 id（由学科注册表推导，无需手工维护） */
export const MODULE_SUBJECT: Map<string, string> = new Map(
  SUBJECTS.flatMap((s) => s.modules.map((m) => [m.id, s.id] as [string, string])),
);

/* ------------------------------ 按需加载 ------------------------------ */

/** 把某一学科的容器内容同步进全局容器（去重，按 id） */
function syncSubjectContainers(): void {
  for (const e of [...chinese.allEntries, ...math.allEntries]) {
    if (!entryIndex.has(e.id)) {
      entryIndex.set(e.id, e);
      allEntries.push(e);
    }
  }
  for (const m of [...chinese.mindMaps, ...math.mindMaps]) {
    if (!mindMaps.some((x) => x.id === m.id)) mindMaps.push(m);
  }
  for (const x of [...chinese.extensions, ...math.extensions]) {
    if (!extensions.some((e) => e.id === x.id)) extensions.push(x);
  }
}

/** 数学模块 id 前缀 → 学科加载器 */
const MATH_MODULE_IDS = new Set<string>(math.MATH_MODULE_IDS);

/**
 * 页面要声明的数据范围：某个学科的模块 id，或语文的 `'extras'`
 * （思维导图 + 拓展阅读，只有详情页与知识拓展页用得到）。
 */
export type DataScope = ModuleId | 'extras';

/** 该范围是否已经就绪 */
export function isScopeReady(scope: DataScope[]): boolean {
  const needChinese = scope.filter((m) => m !== 'extras' && !MATH_MODULE_IDS.has(m));
  const needExtras = scope.some((m) => m === 'extras');
  const needMath = scope.some((m) => m !== 'extras' && MATH_MODULE_IDS.has(m));
  return (
    chinese.isScopeReady([
      ...(needChinese as chinese.ChineseModuleId[]),
      ...(needExtras ? (['extras'] as const) : []),
    ]) && (needMath ? math.isLoaded() : true)
  );
}

/** 加载这些范围的数据 */
export async function ensureModules(scope: DataScope[]): Promise<void> {
  const needChinese = scope.filter((m) => m !== 'extras' && !MATH_MODULE_IDS.has(m));
  const needExtras = scope.some((m) => m === 'extras');
  await chinese.loadModules([
    ...(needChinese as chinese.ChineseModuleId[]),
    ...(needExtras ? (['extras'] as const) : []),
  ]);
  if (scope.some((m) => m !== 'extras' && MATH_MODULE_IDS.has(m))) await math.load();
  syncSubjectContainers();
}

/** 加载全部学科的全部模块（校验脚本与跨模块聚合页面用） */
export async function ensureAll(): Promise<void> {
  await chinese.loadAll();
  await math.load();
  syncSubjectContainers();
}

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
    if (kw && !matchesKeyword(e, kw)) return false;
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
  return allEntries.filter((e) => matchesKeyword(e, kw));
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

/* -------------------- 古诗词的考点（另立一套，理由见注释） -------------------- */

/**
 * 古诗词模块**不预置题目**（默写题由逐句现场生成），因此它没有任何题目标签，
 * 在「按题目标签聚合」的考点体系里会整体缺席——而古诗文恰恰是中考默写与鉴赏的重头。
 *
 * 所以这里改用内容本身的信号来建考点，三种来源：
 *   1. **主题**（思乡、爱国、言志…，取自篇目标签，已排除宽泛词）
 *   2. **意象**（月、杨柳、鸿雁…，由诗句文本识别）
 *   3. **作者**（同一位诗人有 2 篇以上作品时成组，如「《诗经》4 篇」）
 *
 * 每个考点都能一键组卷默写：`/practice/poems?poems=<id,id,…>`。
 * 只保留 2 篇以上的分组——只有一篇的「考点」没有串联价值。
 */
export interface PoemExamPoint {
  /** 考点名，如「意象·月」「主题·思乡」「作者·李白」 */
  tag: string;
  kind: '主题' | '意象' | '作者';
  entryIds: string[];
  titles: string[];
}

/** 把古诗词按某个取键函数聚类，只保留 ≥2 篇的分组 */
function clusterPoems(
  kind: PoemExamPoint['kind'],
  keyOf: (p: Poem) => string[],
  min: number,
): PoemExamPoint[] {
  const map = new Map<string, { ids: string[]; titles: string[] }>();
  for (const p of chinese.allPoems) {
    for (const key of keyOf(p)) {
      if (!key) continue;
      const cur = map.get(key) ?? { ids: [], titles: [] };
      cur.ids.push(p.id);
      cur.titles.push(p.title);
      map.set(key, cur);
    }
  }
  return [...map]
    .filter(([, v]) => v.ids.length >= min)
    .map(([key, v]) => ({ tag: `${kind}·${key}`, kind, entryIds: v.ids, titles: v.titles }))
    .sort((a, b) => b.entryIds.length - a.entryIds.length);
}

/** 占位作者（不能作为「同一作者」考点） */
const POEM_PLACEHOLDER_AUTHORS = new Set(['佚名', '无名氏', '不详']);

export function poemExamPoints(): PoemExamPoint[] {
  const entryOf = (id: string) => allEntries.find((e) => e.id === id);

  const themes = clusterPoems('主题', (p) => {
    const e = entryOf(p.id);
    return e ? examThemesOf(relOfEntry(e)) : [];
  }, 2);

  const imageries = clusterPoems('意象', (p) => {
    const e = entryOf(p.id);
    return e ? imageryOf(relOfEntry(e)) : [];
  }, 2);

  const authors = clusterPoems('作者', (p) =>
    p.author && p.author.length >= 2 && !POEM_PLACEHOLDER_AUTHORS.has(p.author) ? [p.author] : [],
  2);

  return [...themes, ...imageries, ...authors];
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
