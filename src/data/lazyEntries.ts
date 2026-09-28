/**
 * 「按条目的懒加载」注册表 —— 把语文那一套**学科无关**化。
 *
 * ## 为什么需要这一层
 *
 * 语文的「中考专题」（`zh-topics`）里装着七个专题，正文合计 1.3 MB 源码。以前它们
 * 被拼成一个数组、打成**一个 495 kB 的大块**（gzip 455 kB，比首屏还大）：学生只想看
 * 「古诗文默写」，也得先把写作、名著全部下载完。改造后的做法是：
 *
 *   1. 模块范围（`useDataScope(['zh-topics'])`）**只装轻量清单骨架**——id / 标题 /
 *      副标题 / 学段 / 题量，模块列表页、检索、面包屑因此**零下载**；
 *   2. 正文按**条目**单独 `import()`，打开哪一条才下载哪一条；
 *   3. 正文回来后**原地补进已有骨架条目**（改字段，不 push 同 id 的新条目）；
 *   4. 需要跨条目聚题的页面（错题本 / 学习报告 / 考点页）与校验脚本走 `loadAll()`。
 *
 * 这套能力原本写死在语文里（`data/chinese/index.ts` 的 `loadZhTopic` 等）。数学的
 * 「中考题型专题」（`math-topics`）要用**同一套**，而且以后任何学科都可能再要一份，
 * 所以把「哪几块走懒加载、怎么装骨架、怎么按条目下载」抽成这张注册表：
 *
 *   - 学科侧只提供四件事：`manifest`（清单）/ `loadEntry`（一条）/ `loadAll`（全部），
 *     外加 `ids` / `has` / `isReady` 这几个同步判据（页面在「按地址栏的 id 去下载」
 *     之前必须先同步问一句：这个 id 是不是本模块的、正文到了没有）；
 *   - 页面侧只认识 `useLazyEntries(spec)`（见 `lib/useData.tsx`）与
 *     `lazyEntrySpecFor` / `lazyEntryIdsOfModules` 这两个范围计算函数，
 *     因此**新增一块懒加载模块，页面一行都不用改**。
 *
 * ## 语义上的一个坑（沿用语文的定义，别改）
 *
 * `isScopeReady(['math-topics'])` 代表的是「**轻量清单已就绪**」，不是「正文到了」。
 * 前者要能撑住 SSR 冒烟的首帧（模块列表页必须渲染出标题），后者由 `isReady(id)`
 * 回答。页面要渲染正文时两者都要真——见 `DetailPage` / `PracticePage` 的写法。
 */

import type { Entry, ExamTopic, GradeOrAll, ModuleId } from '../types';

/**
 * 轻量清单里的一条：只有列表页/检索/面包屑要用的骨架字段，**不含任何正文**。
 * 与 `data/summary.ts` 生成的 `EntryMeta` 结构兼容（后者是它的超集）。
 */
export interface ManifestItem {
  id: string;
  moduleId: string;
  title: string;
  subtitle: string;
  grade: GradeOrAll;
  /** 该条目的题量（不含古诗词现场生成的默写题） */
  questions: number;
  tags: string[];
}

/** 一块「按条目懒加载」的模块 */
export interface LazyEntryModule {
  /** 模块 id，如 `'zh-topics'` / `'math-topics'` */
  moduleId: string;
  /** 报告与报错里用的中文名，如「语文中考专题」 */
  label: string;
  /**
   * 轻量清单（stub 数据）：id / 标题 / 副标题 / 学段 / 题量等。
   * **不允许**在这里 import 任何正文——那正是 495 kB 大块的成因。
   */
  manifest: () => Promise<ManifestItem[]>;
  /** 单个条目的完整数据（下载 + 原地补进已有骨架条目） */
  loadEntry: (id: string) => Promise<void>;
  /** 该条目的全部数据（聚合页与校验脚本用：宁可多下一块，也不能少题） */
  loadAll: () => Promise<void>;
  /** 该模块的全部条目 id（同步、静态，顺序即展示顺序） */
  ids: () => readonly string[];
  /** 这个 id 是不是本模块的条目（同步；手打/过期链接不该触发下载） */
  has: (id: string) => boolean;
  /** 这一条的正文是否已在内存里（同步） */
  isReady: (id: string) => boolean;
  /** 已在内存里的条目 id，按展示顺序（校验脚本比顺序用） */
  loadedIds: () => readonly string[];
  /** 题目 id → 所属条目 id：错题重做据此做到「只下载错题所属的那一两条」 */
  entryIdOfQuestion?: (questionId: string) => string | undefined;
  /** 加载器源文件路径（校验脚本静态检查「不许静态 import 正文」用） */
  sourceFile: string;
  /** 正文数据文件所在目录（校验脚本提示用） */
  contentDir: string;
}

const REGISTRY = new Map<string, LazyEntryModule>();

/** 注册一块懒加载模块。学科索引文件在模块初始化时调用（重复注册覆盖，幂等） */
export function registerLazyEntryModule(mod: LazyEntryModule): void {
  REGISTRY.set(mod.moduleId, mod);
}

/** 这个模块 id 是不是走的「按条目懒加载」 */
export function lazyEntryModuleOf(moduleId: string): LazyEntryModule | undefined {
  return REGISTRY.get(moduleId);
}

/** 已注册的全部懒加载模块（校验脚本遍历它，因此新模块自动被校验覆盖） */
export function lazyEntryModules(): LazyEntryModule[] {
  return [...REGISTRY.values()];
}

/** 条目 id → 它所属的懒加载模块（条目 id 全局唯一） */
export function lazyEntryModuleOfEntry(entryId: string): LazyEntryModule | undefined {
  for (const mod of REGISTRY.values()) if (mod.has(entryId)) return mod;
  return undefined;
}

/** 这个模块是不是懒加载模块（详情页据此决定要不要顺带加载 `extras`） */
export function isLazyEntryModule(moduleId: string): boolean {
  return REGISTRY.has(moduleId);
}

/** 这个条目 id 属于某个懒加载模块吗 */
export function isLazyEntryId(id: string): boolean {
  return lazyEntryModuleOfEntry(id) !== undefined;
}

/** 这一条的正文是否已在内存里（不属于任何懒加载模块时为 false） */
export function isLazyEntryReady(id: string): boolean {
  return lazyEntryModuleOfEntry(id)?.isReady(id) ?? false;
}

/** 全部懒加载条目的 id（按模块注册顺序、模块内按展示顺序） */
export function allLazyEntryIds(): string[] {
  return [...REGISTRY.values()].flatMap((m) => [...m.ids()]);
}

/** 加载**一个**条目的正文 */
export async function loadLazyEntry(id: string): Promise<void> {
  const mod = lazyEntryModuleOfEntry(id);
  if (!mod) return; // 不属于任何懒加载模块：没有正文可下载，静默跳过
  await mod.loadEntry(id);
}

/**
 * 这一组条目（或全部）的正文是否都已就绪。
 *
 * `'all'` 指**注册表里的全部条目**（错题本 / 学习报告 / 考点页这类按题目聚合的页面）。
 */
export function isLazyEntriesReady(spec: readonly string[] | 'all'): boolean {
  const ids = spec === 'all' ? allLazyEntryIds() : spec;
  return ids.every(isLazyEntryReady);
}

/**
 * 加载这些条目的正文（重复 id 去重；传 `'all'` 即注册表里的全部条目）。
 *
 * 失败**不吞**：调用方（页面）拿到 rejection 后走 `DataLoading` 的重试出口，
 * 而不是渲染出一份「少了几个专题」的静默残缺数据。
 */
export async function loadLazyEntries(spec: readonly string[] | 'all'): Promise<void> {
  const ids = spec === 'all' ? allLazyEntryIds() : [...new Set(spec)];
  // 按模块归拢：同一模块内部由学科加载器自己复用 Promise（重复调用安全）
  await Promise.all(ids.map((id) => loadLazyEntry(id)));
}

/** 加载注册表里全部懒加载条目的正文（`ensureAll()` 用） */
export async function loadAllLazyEntries(): Promise<void> {
  await Promise.all([...REGISTRY.values()].map((m) => m.loadAll()));
}

/* ------------------------------------------------------------------ */
/* 页面侧的范围计算（页面不自己判断「哪些模块走懒加载」）                 */
/* ------------------------------------------------------------------ */

/**
 * 这些模块 id 里凡走懒加载的，返回它们的**全部条目 id**；一个都没有时返回 `undefined`
 * （`useLazyEntries(undefined)` 表示本页不需要任何懒加载正文）。
 *
 * 聚合页（错题本 / 学习报告 / 考点页）用这个：它们按题目聚合，少加载一块就**静默少
 * 掉一整块数据**——页面照常渲染，只是数字变小、错题看不见。
 */
export function lazyEntryIdsOfModules(moduleIds: readonly string[]): string[] | undefined {
  const ids = moduleIds.flatMap((mid) => {
    const mod = REGISTRY.get(mid);
    return mod ? [...mod.ids()] : [];
  });
  return ids.length ? ids : undefined;
}

/**
 * 详情页/单条练习用：这一条属于懒加载模块时返回只含它的范围，否则 `undefined`。
 *
 * 先同步问 `has(id)`：手打的或过期的链接不该触发下载，而应该照旧渲染「没有找到这条内容」。
 */
export function lazyEntrySpecFor(moduleId: string, entryId: string): string[] | undefined {
  const mod = REGISTRY.get(moduleId);
  if (!mod || !mod.has(entryId)) return undefined;
  return [entryId];
}

/** 题目 id → 所属条目 id（错题重做据此只下载那几条） */
export function lazyEntryIdOfQuestion(questionId: string): string | undefined {
  for (const mod of REGISTRY.values()) {
    const id = mod.entryIdOfQuestion?.(questionId);
    if (id) return id;
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/* 专题（ExamTopic）条目的通用形状                                      */
/* ------------------------------------------------------------------ */

/**
 * 「题型专题」条目的形状：`data` 是 `ExamTopic`。
 *
 * `types.ts` 里的 `Entry` 联合按 moduleId 区分 data 形状，新加的 `math-topics` 由
 * 数学分支（`MathEntry`）覆盖，因此渲染器/校验器读 `entry.data.trends` 时需要这个
 * 交叉类型来还原真实形状（转换点用 `asExamTopicEntry`，集中在一处）。
 */
export type ExamTopicEntryLike = Entry & { data: ExamTopic };

/** 把一条专题条目还原成 `ExamTopicEntryLike`（唯一的转换点，见上面的说明） */
export function asExamTopicEntry(entry: Entry): ExamTopicEntryLike {
  return entry as ExamTopicEntryLike;
}

/** 模块 id 的宽松形式（注册表不关心具体学科 id 的联合类型） */
export type LazyModuleId = ModuleId | string;
