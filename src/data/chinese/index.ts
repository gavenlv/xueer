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
 * ## 中考专题为什么要再拆一层
 *
 * `zh-topics` 一个模块里装着**七个专题**（积累与运用、默写、文言文、古诗词鉴赏、
 * 现代文、名著、写作），正文合计 1.3 MB 源码。以前它们被拼成一个数组、打成
 * **一个 495 kB 的大块**（gzip 455 kB，比首屏 index 还大）：学生只想看「古诗文默写」，
 * 也得先把写作与名著全部下载完。于是这一块**再拆一层**：
 *
 *   - `LOADERS['zh-topics']` 只装**骨架**（stub）——id / 标题 / 副标题 / 学段 / 题量，
 *     全部来自生成好的轻量清单 `summary.ts` 的 `ENTRY_META`，因此模块列表页、
 *     检索、面包屑**一个专题正文都不用下载**；
 *   - 正文由 `loadZhTopic(id)` 单独下载，回来后**原地补进已有 stub 条目**
 *     （`entry.data` / `entry.questions` / `entry.subtitle`），不 push 同 id 的新条目
 *     ——否则 `findEntryById` 会命中旧 stub，页面渲染不出内容；
 *   - `isScopeReady(['zh-topics'])` 的语义仍是「**轻量清单已就绪**」（SSR 冒烟要能首帧
 *     渲染），专题正文的就绪状态另问 `isZhTopicReady(id)`；
 *   - 需要跨专题聚题的页面（错题本 / 学习报告 / 考点页）与校验脚本走
 *     `loadAllZhTopics()`，保证「题目不静默少掉」。
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
  ChineseExamTopic,
  ChineseExamTopicEntry,
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
import { matchesKeyword, forgetSearchText } from '../../lib/searchText';
import { forgetRel } from '../../lib/relNode';
import { examTopicSubtitle } from '../../lib/examTopic';
import { ENTRY_META, type EntryMeta } from '../summary';
import {
  registerLazyEntryModule,
  isLazyEntriesReady,
  loadLazyEntries,
  type ManifestItem,
} from '../lazyEntries';
import {
  ZH_TOPIC_IDS,
  isZhTopicDataReady,
  loadZhTopicData,
  zhExamTopics,
  zhTopicIdOfQuestion,
} from './modules/zh-topics';

export { zhTopicIdOfQuestion };

export const MODULE_IDS: ModuleId[] = [
  'poems',
  'vocab',
  'classical',
  'reading',
  'writing',
  'literature',
  'zh-topics',
];

/**
 * 语文的模块 id。前六块按教材内容组织；`zh-topics`（中考专题）按**卷面题型**组织，
 * 是唯一为备考而设的模块——它排在最末，模块页里也就落在最后，符合「先学后考」的次序。
 */
export type ChineseModuleId =
  | 'poems'
  | 'vocab'
  | 'classical'
  | 'reading'
  | 'writing'
  | 'literature'
  | 'zh-topics';

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
/**
 * 七个中考专题的**正文**（考情 + 讲解 + 专项训练题）。
 *
 * 数组随加载进度增长（按卷面顺序），所以它只包含**已经下载完**的专题；
 * 「一共有哪七个」请问 `entryIndex` / `entriesOfModule('zh-topics')`（骨架始终在位）。
 */
export { zhExamTopics as zhExamTopicItems } from './modules/zh-topics';

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
    /**
     * 标签第一位是类别（模块页的筛选主标签），**中考主题作为第二个标签**：
     * 范文类条目有了主题标签，学生才能在模块页筛出「亲情（3 篇）」这样的一组同题范文。
     */
    tags: [w.category, ...(w.theme ? [w.theme] : [])],
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

/**
 * 中考专题装配。
 *
 * 与其它模块不同，专题的 `tags` 不是给「模块页筛选」用的类别，而是供检索与
 * 面包屑显示的固定两项：`[专题名, '中考专题']`；真正需要按组筛选的是**题目上的标签**
 * （= `drills[].name`），组卷走 `/practice/zh-topics/<id>?tag=<组名>`。
 */
const buildZhExamEntries = (items: ChineseExamTopic[]): ChineseExamTopicEntry[] =>
  items.map((t) => {
    const qs = dedupeQuestions(t.questions);
    return {
      id: t.id,
      moduleId: 'zh-topics',
      title: t.title,
      subtitle: zhTopicSubtitle(t, qs.length),
      grade: t.grade,
      tags: [t.title, '中考专题'],
      questions: qs,
      data: t,
    };
  });

/**
 * 专题副标题 = 卷面定位 + 这一专题的规模：模块页一眼能看到「多少分、几节章节、多少题」，
 * 「每个类目都拆开讲透、都有配套练习」这件事不该只写在说明里。
 *
 * 抽成函数是因为它有**两个调用点**：正文装配（`buildZhExamEntries`）与骨架补齐
 * （`installZhTopic`）。两处必须算出同一个字符串——模块列表页显示的是轻量清单里
 * 生成好的那份，若算法不一致，列表页的规模会与详情页对不上。
 *
 * 实现已挪到 `lib/examTopic.ts` 的 `examTopicSubtitle`：数学的同名模块要用**同一个**
 * 算法（否则数学列表页与详情页会各说一套），所以这里只留一个薄封装。
 */
function zhTopicSubtitle(t: ChineseExamTopic, questionCount: number): string {
  return examTopicSubtitle(t, questionCount);
}

/* ------------------------------------------------------------------ */
/* 中考专题的骨架（stub）：只加载轻量清单，正文按需补                    */
/* ------------------------------------------------------------------ */

/**
 * 轻量清单里的七个专题骨架。
 *
 * `ENTRY_META` 是 `pnpm gen` 从**真实条目**生成的（标题、副标题、学段、题量都在里面），
 * 而且它本来就在首屏包里（首页/学习报告要用），所以模块列表页拿到它**不需要任何下载**。
 * 清单过期由 `pnpm validate` 逐条比对（见 `scripts/validate-entry.ts` 的 `[轻量清单]`）。
 */
const ZH_TOPIC_META: EntryMeta[] = ENTRY_META.filter((m) => m.moduleId === 'zh-topics');

/** 造一条专题骨架：字段形状与真条目一致，`data` 先给空壳，正文加载后原地替换 */
function buildZhTopicStub(m: EntryMeta): ChineseExamTopicEntry {
  return {
    id: m.id,
    moduleId: 'zh-topics',
    title: m.title,
    subtitle: m.subtitle,
    grade: m.grade,
    tags: [m.title, '中考专题'],
    // 题目、正文都还没下载：这里如实留空，`isZhTopicReady(id)` 才是权威的就绪判据
    questions: [],
    data: {
      id: m.id,
      grade: m.grade,
      title: m.title,
      paper: '',
      summary: '',
      trends: [],
      trendSummary: '',
      angles: [],
      steps: [],
      drills: [],
      questions: [],
    },
  };
}

/** 七个专题骨架（模块页、检索、面包屑都用它；正文另加载） */
function buildZhTopicStubs(): ChineseExamTopicEntry[] {
  return ZH_TOPIC_META.map(buildZhTopicStub);
}

/**
 * 轻量清单（注册表里的 `manifest`）：只有骨架字段，一个专题的正文都不下载。
 *
 * 与 `buildZhTopicStubs()` 是**同一份数据**的两种形态（一个是 `Entry`、一个是清单项），
 * `pnpm validate` 会逐条比对两者（见 `scripts/validate-entry.ts` 的「清单 vs 骨架」），
 * 因此不存在「清单说 116 题、骨架说 0 题」这种漂移。
 */
function zhTopicManifest(): ManifestItem[] {
  return ZH_TOPIC_META.map((m) => ({
    id: m.id,
    moduleId: m.moduleId,
    title: m.title,
    subtitle: m.subtitle,
    grade: m.grade,
    questions: m.questions,
    tags: m.tags,
  }));
}

/**
 * 把加载回来的正文**原地补进已有骨架条目**。
 *
 * 关键在「原地」：`allEntries`（语文与全局两份）、`entryIndex` 都持有**同一个对象**，
 * 只要改它的字段，所有同步查询立即看到内容；若改成 `push` 一条同 id 的新条目，
 * `findEntryById` 会先命中旧骨架，页面渲染出空白——这正是这次改造最容易踩的坑。
 *
 * 另外两个派生缓存（检索文本、关联节点）是按对象记忆的，正文补齐后必须**失效**，
 * 否则按「病句」搜不到积累与运用、专题页的「同一考点」也不出现。
 */
function installZhTopic(t: ChineseExamTopic): void {
  const entry = entryIndex.get(t.id) as ChineseExamTopicEntry | undefined;
  if (!entry || entry.moduleId !== 'zh-topics') return;
  const qs = dedupeQuestions(t.questions);

  entry.title = t.title;
  entry.subtitle = zhTopicSubtitle(t, qs.length);
  entry.grade = t.grade;
  entry.tags = [t.title, '中考专题'];
  entry.questions = qs;
  entry.data = t;

  forgetSearchText(entry);
  forgetRel(entry);
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
  'zh-topics': async () => {
    /**
     * **只装骨架**，不 import 任何专题正文：模块列表页、检索、面包屑看到的
     * 标题与「几节 · 多少题」全部来自 `summary.ts`，因此打开模块页是零下载。
     * 正文由 `loadZhTopic(id)` / `loadAllZhTopics()` 单独下载后原地补齐。
     */
    return { entries: buildZhTopicStubs() };
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
export async function loadModules(
  scope: ChineseScope[],
  report?: (total: number, done: number) => void,
): Promise<void> {
  const need = [...new Set<string>(scope as string[])].filter((s) => !loaded.has(s));
  if (!need.length) return;
  // 逐个模块回报：分母是「本次真的要下载几块」，分子是已完成数（见 data/index.ts 的 loadProgress）
  report?.(need.length, 0);

  let done = 0;
  await Promise.all(
    need.map((s) => {
      const running = pending.get(s);
      const p =
        running ??
        LOADERS[s as ChineseScope]()
          .then((r) => {
            if (r.entries.length) allEntries.push(...r.entries);
            loaded.add(s);
            rebuildEntryIndex();
          })
          .finally(() => pending.delete(s));
      if (!running) pending.set(s, p);
      return p.then(() => report?.(need.length, ++done));
    }),
  );
}

/** 加载语文全部模块（校验脚本与需要跨模块聚合的页面用） */
export async function loadAll(): Promise<void> {
  await loadModules([...(MODULE_IDS as ChineseModuleId[]), 'extras']);
  /**
   * `loadModules` 只给 `zh-topics` 装骨架，这里必须把七个专题的**正文**补齐：
   * 校验脚本（validate / smoke）与需要跨专题聚题的页面读的是 `entry.data` 与
   * `entry.questions`，只装骨架会看到七个空专题（题目静默少掉 562 道）。
   */
  await loadAllZhTopics();
}

/* ---------------------- 中考专题：一专题一块 ---------------------- */

/**
 * 这一专题的正文是否已在内存里。
 *
 * 与 `isScopeReady(['zh-topics'])` 的分工：后者只代表**轻量清单已就绪**
 * （SSR 冒烟要能首帧渲染模块页）；「能不能进详情页看讲解、能不能组卷」
 * 要看这个函数。两者都真才是「专题可用」。
 */
export function isZhTopicReady(id: string): boolean {
  return isZhTopicDataReady(id);
}

/** 这一组专题（或全部）的正文是否都已就绪 */
export function isZhTopicsReady(ids: readonly string[] | 'all'): boolean {
  // 薄封装：真正的判定在通用注册表里（`data/lazyEntries.ts`），这样数学的同名模块
  // 与聚合页面的写法完全一致，也不会出现「两套就绪语义各写一遍、慢慢走样」。
  return isLazyEntriesReady(ids === 'all' ? [...ZH_TOPIC_IDS] : ids);
}

/**
 * 这个 id 是不是七个中考专题之一。
 *
 * 页面在「按地址栏的 id 去下载正文」之前必须先问一句：手打的 / 过期的链接不该触发下载，
 * 而应该照旧渲染「没有找到这条内容」。
 *
 * 注册表里 zh 模块的 `has` 用的就是下面这份静态列表，所以这里直接判列表：
 * 纯查询不依赖注册时机，任何调用点（含在模块初始化期间跑的）都能拿到正确答案。
 */
export function isZhTopicId(id: string): boolean {
  return (ZH_TOPIC_IDS as readonly string[]).includes(id);
}

/**
 * 加载**一个**专题的正文（详情页、单条内容组卷、模块页悬停预取走这里）。
 *
 * 只会下载这一块的 chunk，因此「打开古诗文默写」不再需要写作与现代文那几块。
 * 正文回来后原地补进已有骨架条目，页面上的 `entry.data` / `entry.questions` 立即可用。
 */
export async function loadZhTopic(id: string): Promise<void> {
  // 骨架可能还没装（例如模块页的悬停预取早于 useDataScope 的加载）：先保证条目在位
  await loadModules(['zh-topics']);
  installZhTopic(await loadZhTopicData(id));
}

/**
 * 加载这几个专题（重复 id 会被去重；传 `'all'` 即全部七个）。
 *
 * 薄封装：走通用注册表（`loadLazyEntries`）——它按模块归拢、复用正在进行的 Promise，
 * 与数学的同名模块行为一致。
 */
export async function loadZhTopics(ids: readonly string[] | 'all'): Promise<void> {
  await loadModules(['zh-topics']);
  await loadLazyEntries(ids === 'all' ? [...ZH_TOPIC_IDS] : ids);
}

/**
 * 加载全部七个专题（错题本 / 学习报告 / 考点页 / 校验脚本用）。
 *
 * 这些页面按**题目**聚合（错题反查题干、考点按标签统计），只要有一个专题没加载，
 * 它的 562 道题就会**静默缺席**——页面照常渲染，只是数字变小、错题看不见。
 * 所以宁可多下载一块，也不能少题。
 */
export async function loadAllZhTopics(): Promise<void> {
  await loadZhTopics('all');
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

/* ------------------------------------------------------------------ */
/* 注册到「按条目懒加载」注册表                                          */
/* ------------------------------------------------------------------ */

/**
 * 把语文「中考专题」登记进通用注册表（`data/lazyEntries.ts`）。
 *
 * **放在文件末尾**是有意的：注册对象的字段要引用上面的常量与函数（`ZH_TOPIC_META`、
 * `loadZhTopic`、`isZhTopicDataReady`…），写在中间会出现 TDZ 风险；注册本身是幂等的
 * Map 写入，任何时刻只用到「取值时」的闭包，所以放最后最安全。
 *
 * 页面侧从此只认识注册表的四个动作（清单 / 一条 / 全部 / 就绪判定）：
 * `DetailPage`、`PracticePage`、`ModulePage`、错题本、学习报告、考点页都通过
 * `useLazyEntries` 与 `lazyEntrySpecFor` / `lazyEntryIdsOfModules` 声明范围，
 * 数学的同名模块接上时这些页面一行都不用改。
 */
registerLazyEntryModule({
  moduleId: 'zh-topics',
  label: '语文中考专题',
  sourceFile: 'src/data/chinese/modules/zh-topics.ts',
  contentDir: 'src/data/chinese/zh-topics',
  ids: () => ZH_TOPIC_IDS,
  has: (id) => (ZH_TOPIC_IDS as readonly string[]).includes(id),
  isReady: isZhTopicDataReady,
  loadedIds: () => zhExamTopics.map((t) => t.id),
  entryIdOfQuestion: zhTopicIdOfQuestion,
  manifest: async () => zhTopicManifest(),
  loadEntry: (id) => loadZhTopic(id),
  loadAll: () => loadAllZhTopics(),
});

