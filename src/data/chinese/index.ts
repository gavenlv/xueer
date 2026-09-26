/**
 * 语文内容索引：把六大模块的原始数据统一装配成 `Entry[]`，供列表页、练习引擎、
 * 错题本与统计统一消费。
 *
 * ## 为什么要「按需加载」
 *
 * 语文内容的体量几乎全在**文本本身**上（诗词、文言文、阅读原文、作文范文、名著章节…），
 * 源码合计 4.5 MB 左右——打包后一个整块就是 1.4 MB gzip。首屏如果把它全下载下来，
 * 学生只为了看首页就要等好几秒。
 *
 * 因此每个模块的数据放在 `modules/*.ts` 里，由本文件**动态 import**：
 * 打开古诗词就只下载古诗词那一块，翻作文就只下载作文那一块。
 *
 * ## 为什么对外仍然是「同步 API」
 *
 * 页面的渲染代码全都依赖 `allEntries` / `entriesOfModule` 这类同步查询。
 * 为了不把整棵树改成 async，这里保留同名导出、**原地填充**（`push` 而不是重新赋值，
 * 数组与 Map 的引用始终不变）：先 `await loadModules([...])`，之后所有同步查询照旧可用。
 *
 * 页面侧统一用 `useDataScope()` 这个钩子声明「本页需要哪些模块」；
 * 校验脚本（validate / smoke）则先 `await loadAll()` 再断言，因此既有的
 * 「渲染出真实内容」这类检查完全不受影响。
 */

import type {
  BookPlot,
  ClassicalEntry,
  ClassicalText,
  Entry,
  Extension,
  GradeId,
  LiteratureEntry,
  LiteratureItem,
  MindMap,
  ModuleId,
  Poem,
  PoemEntry,
  QuizQuestion,
  ReadingEntry,
  ReadingPassage,
  VocabEntry,
  VocabItem,
  WritingEntry,
  WritingLesson,
} from '../../types';
import { matchesKeyword } from '../../lib/searchText';

export const MODULE_IDS: ModuleId[] = [
  'poems',
  'vocab',
  'classical',
  'reading',
  'writing',
  'literature',
];

/** 语文的六个模块 id */
export type ChineseModuleId = 'poems' | 'vocab' | 'classical' | 'reading' | 'writing' | 'literature';

/**
 * 「附加块」：思维导图与拓展阅读。它们不属于任何模块，但详情页与知识拓展页要用，
 * 因此也做成一个可点名的 scope（`'extras'`），由需要的页面自己声明。
 */
export type ChineseScope = ChineseModuleId | 'extras';

/* ------------------------------------------------------------------ */
/* 原地填充的容器（引用恒定，加载完成后同步可用）                        */
/* ------------------------------------------------------------------ */

/** 全部条目（语文） */
export const allEntries: Entry[] = [];

/** 全部思维导图 */
export const mindMaps: MindMap[] = [];

/** 全部拓展阅读 */
export const extensions: Extension[] = [];

/** 原始数据数组（按模块填充；供默写组卷、考点聚类与校验脚本使用） */
export const allPoems: Poem[] = [];
export const classicalTexts: ClassicalText[] = [];
export const literatureItems: LiteratureItem[] = [];
export const vocabItems: VocabItem[] = [];
export const writingLessons: WritingLesson[] = [];
export const readingPassages: ReadingPassage[] = [];

/* ------------------------------------------------------------------ */
/* 装配                                                                */
/* ------------------------------------------------------------------ */

function dedupeQuestions(qs: QuizQuestion[]): QuizQuestion[] {
  const seen = new Set<string>();
  const out: QuizQuestion[] = [];
  for (const q of qs) {
    if (!q || !q.id || seen.has(q.id)) continue;
    seen.add(q.id);
    out.push(q);
  }
  return out;
}

const buildPoemEntries = (poems: Poem[]): PoemEntry[] =>
  poems.map((p) => ({
    id: p.id,
    moduleId: 'poems',
    title: p.title,
    subtitle: [p.dynasty, p.author].filter(Boolean).join('·'),
    grade: p.grade,
    tags: [p.genre, ...(p.tags ?? [])],
    // 古诗词本身不预置题目：默写与赏析练习由 PoemDetail 现场生成。
    // 检索文本也不再随条目存储，改由 lib/searchText.ts 按需推导。
    questions: [],
    data: p,
  }));

const buildVocabEntries = (items: VocabItem[]): VocabEntry[] =>
  items.map((v) => ({
    id: v.id,
    moduleId: 'vocab',
    title: v.term,
    subtitle: [v.category, v.pinyin].filter(Boolean).join(' · '),
    grade: v.grade,
    tags: [v.category, ...(v.questions.flatMap((q) => q.tags ?? []) ?? [])].slice(0, 6),
    questions: dedupeQuestions(v.questions ?? []),
    data: v,
  }));

const buildClassicalEntries = (items: ClassicalText[]): ClassicalEntry[] =>
  items.map((c) => ({
    id: c.id,
    moduleId: 'classical',
    title: c.title,
    subtitle: [c.dynasty, c.author].filter(Boolean).join('·'),
    grade: c.grade,
    tags: ['文言文', ...c.grammar.map((g) => g.type)].slice(0, 6),
    questions: dedupeQuestions(c.questions ?? []),
    data: c,
  }));

const buildReadingEntries = (items: ReadingPassage[]): ReadingEntry[] =>
  items.map((r) => ({
    id: r.id,
    moduleId: 'reading',
    title: r.title,
    subtitle: [r.genre, r.author].filter(Boolean).join(' · '),
    grade: r.grade,
    tags: [r.genre],
    questions: dedupeQuestions(r.questions ?? []),
    data: r,
  }));

const buildWritingEntries = (items: WritingLesson[]): WritingEntry[] =>
  items.map((w) => ({
    id: w.id,
    moduleId: 'writing',
    title: w.title,
    subtitle: w.category,
    grade: w.grade,
    tags: [w.category],
    questions: dedupeQuestions(w.questions ?? []),
    data: w,
  }));

/**
 * 名著条目装配：把「章节脉络 + 情节链 + 记忆口诀 + 考点题」按条目 id 挂回去。
 *
 * 这些补充单独成文件（`books-plot-1/2/3.ts`）而不是直接写进 12 部名著的条目里：
 * 一部名著原来的正文已经很长，把「整本书的骨架」另存一处，便于分册撰写、逐部核对。
 */
function buildLiteratureEntries(
  items: LiteratureItem[],
  guangzhou: Record<string, QuizQuestion[]>,
  plots: BookPlot[],
): LiteratureEntry[] {
  const plotIndex = new Map<string, BookPlot>(plots.map((b) => [b.id, b]));

  return items.map((l) => {
    const bp = plotIndex.get(l.id);
    // 章节/情节链/口诀挂在 book 上，因此只对确实有 book 的名著条目生效
    const data: LiteratureItem =
      bp && l.book
        ? {
            ...l,
            book: {
              ...l.book,
              chapters: bp.chapters,
              plotChain: bp.plotChain,
              mnemonic: bp.mnemonic,
            },
          }
        : l;

    return {
      id: l.id,
      moduleId: 'literature',
      title: l.title,
      subtitle: l.book ? `${l.book.author} · ${l.category}` : l.category,
      grade: l.grade,
      tags: [l.category],
      // 并入广州中考「整本书阅读」附加题风格的简答题 + 本批新命的考点题
      questions: dedupeQuestions([
        ...(l.questions ?? []),
        ...(guangzhou[l.id] ?? []),
        ...(bp?.questions ?? []),
      ]),
      data,
    };
  });
}

/* ------------------------------------------------------------------ */
/* 按需加载                                                            */
/* ------------------------------------------------------------------ */

type LoaderResult = { entries: Entry[] };

/**
 * 每个模块一个加载器：动态 import 该模块的原始数据，填入上面的容器，
 * 再装配成 `Entry[]` 返回。`extras` 是思维导图与拓展阅读，与模块无关，
 * 随任意模块一起加载（详情页与知识拓展页都要用）。
 */
const LOADERS: Record<ChineseModuleId | 'extras', () => Promise<LoaderResult>> = {
  poems: async () => {
    const m = await import('./modules/poems');
    allPoems.push(...m.poems);
    return { entries: buildPoemEntries(m.poems) };
  },
  vocab: async () => {
    const m = await import('./modules/vocab');
    vocabItems.push(...m.vocab);
    return { entries: buildVocabEntries(m.vocab) };
  },
  classical: async () => {
    const m = await import('./modules/classical');
    classicalTexts.push(...m.classical);
    return { entries: buildClassicalEntries(m.classical) };
  },
  reading: async () => {
    const m = await import('./modules/reading');
    readingPassages.push(...m.reading);
    return { entries: buildReadingEntries(m.reading) };
  },
  writing: async () => {
    const m = await import('./modules/writing');
    writingLessons.push(...m.writing);
    return { entries: buildWritingEntries(m.writing) };
  },
  literature: async () => {
    const m = await import('./modules/literature');
    literatureItems.push(...m.literature);
    return { entries: buildLiteratureEntries(m.literature, m.guangzhouQuestions, m.bookPlots) };
  },
  extras: async () => {
    const m = await import('./modules/extras');
    mindMaps.push(...m.maps);
    extensions.push(...m.exts);
    return { entries: [] };
  },
};

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

/** 该模块（或 extras）是否已经加载完成 */
export function isLoaded(scope: ChineseScope): boolean {
  return loaded.has(scope);
}

/** 这一组范围是否都已就绪 */
export function isScopeReady(scope: ChineseScope[]): boolean {
  return scope.every((s) => loaded.has(s));
}

/**
 * 加载若干范围内的数据。重复调用安全：已加载的直接跳过，正在加载的复用同一个 Promise。
 *
 * 注意**只加载点名的部分**：`'extras'`（思维导图 + 拓展阅读，约 127 kB gzip）
 * 要由需要的页面自己声明（详情页、知识拓展页），模块列表页与练习页用不到它，
 * 就不该为它买单。
 */
export async function loadModules(scope: ChineseScope[]): Promise<void> {
  const need = [...new Set<string>(scope as string[])].filter((s) => !loaded.has(s));
  if (!need.length) return;

  await Promise.all(
    need.map((s) => {
      const running = pending.get(s);
      if (running) return running;
      const p = LOADERS[s as ChineseScope]()
        .then((r) => {
          if (r.entries.length) allEntries.push(...r.entries);
          loaded.add(s);
          rebuildEntryIndex();
        })
        .finally(() => pending.delete(s));
      pending.set(s, p);
      return p;
    }),
  );
}

/** 加载语文全部模块（校验脚本与需要跨模块聚合的页面用） */
export async function loadAll(): Promise<void> {
  await loadModules([...(MODULE_IDS as ChineseModuleId[]), 'extras']);
}

/* ------------------------- 思维导图 / 拓展阅读 ------------------------- */

/** 某条内容关联的思维导图（详情页用） */
export function mindMapsOfEntry(entryId: string): MindMap[] {
  return mindMaps.filter((m) => m.entryId === entryId);
}

/** 某条内容关联的拓展阅读（详情页用） */
export function extensionsOfEntry(entryId: string): Extension[] {
  return extensions.filter((e) => e.entryId === entryId);
}

/** 某模块的思维导图 */
export function mindMapsOfModule(moduleId: ModuleId): MindMap[] {
  return mindMaps.filter((m) => m.moduleId === moduleId);
}

/* ------------------------------- 查询 API ------------------------------- */

export function entriesOfModule(moduleId: ModuleId): Entry[] {
  return allEntries.filter((e) => e.moduleId === moduleId);
}

export function getEntry(moduleId: ModuleId, id: string): Entry | undefined {
  return allEntries.find((e) => e.moduleId === moduleId && e.id === id);
}

/** 在全库中按 id 查找条目（用于「继续学习」「收藏」等跨模块场景） */
export function findEntryById(id: string): Entry | undefined {
  return allEntries.find((e) => e.id === id);
}

/** id -> Entry 映射，页面里做多次查找时用（原地重建，引用恒定） */
export const entryIndex: Map<string, Entry> = new Map<string, Entry>();

function rebuildEntryIndex(): void {
  for (const [id, e] of entryIndex) {
    if (!allEntries.includes(e)) entryIndex.delete(id);
  }
  for (const e of allEntries) if (!entryIndex.has(e.id)) entryIndex.set(e.id, e);
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
 * 模块页「筛选行」专用的标签集合。
 *
 * 不能把所有标签都塞进筛选行：题目级标签（如「形声字」「搭配对象」）会让字词模块
 * 产生 39 个标签，把真正的类别（如「修辞手法」）挤出显示上限，用户就无法按类别筛选。
 * 这里改为：
 *   1. 每个条目的**主标签**（tags[0]，即类别/体裁）全部保留；
 *   2. 其余主题标签只保留出现 ≥2 次的，避免一次性标签刷屏。
 */
export function filterTagsOfModule(moduleId: ModuleId, grade?: GradeId | 'all'): string[] {
  const primary: string[] = [];
  const theme = new Map<string, number>();

  for (const e of filterEntries(moduleId, { grade })) {
    const [first, ...rest] = e.tags;
    if (first && !primary.includes(first)) primary.push(first);
    for (const t of rest) theme.set(t, (theme.get(t) ?? 0) + 1);
  }

  const repeated = [...theme]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);

  return [...primary, ...repeated.filter((t) => !primary.includes(t))];
}

/** 全库检索 */
export function searchAll(keyword: string): Entry[] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];
  return allEntries.filter((e) => matchesKeyword(e, kw));
}

export function countByGrade(moduleId: ModuleId): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of entriesOfModule(moduleId)) out[e.grade] = (out[e.grade] ?? 0) + 1;
  return out;
}

/* ------------------------------- 统计 ---------------------------------- */

export const CONTENT_STATS = {
  get poems() {
    return allPoems.length;
  },
  get classical() {
    return classicalTexts.length;
  },
  get vocab() {
    return vocabItems.length;
  },
  get reading() {
    return readingPassages.length;
  },
  get writing() {
    return writingLessons.length;
  },
  get literature() {
    return literatureItems.length;
  },
};
