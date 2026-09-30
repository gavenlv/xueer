/**
 * 数学学科数据索引。
 *
 * 与 `data/chinese/index.ts` 同构：把原始数据装配成统一的 `Entry[]`，
 * 供列表页、练习引擎、错题本与统计统一消费。
 *
 * ## 两套加载方式
 *
 *   - 前六块（数与代数 / 图形与几何 / 统计与概率 / 公式定理 / 应用题模型 / 中考专题）
 *     的知识点合起来一个 chunk，由 `load()` 动态 import：数学在界面上是隐藏的，
 *     语文学生不必为它下载那几百 KB 文本；
 *   - `math-topics`（**中考题型专题**）不同：5 个专题的正文是几百 KB，必须
 *     「轻量清单骨架 + 一专题一块」。它通过 `data/lazyEntries.ts` 的通用注册表接进来，
 *     与语文的中考专题走**同一套**机制（清单 / 一条 / 全部 / 就绪判定），
 *     所以错题本、学习报告、考点页、练习页都用同一份逻辑，不必为数学再写一遍。
 */

import type {
  Entry,
  ExamTopic,
  Extension,
  GradeOrAll,
  GradeId,
  MathEntry,
  MathExamTopicEntry,
  MathModuleId,
  MathTopic,
  MindMap,
} from '../../types';
import { matchesKeyword, forgetSearchText } from '../../lib/searchText';
import { forgetRel } from '../../lib/relNode';
import { examTopicSubtitle } from '../../lib/examTopic';
import { ENTRY_META } from '../summary';
import { registerLazyEntryModule, type ManifestItem } from '../lazyEntries';
import {
  MATH_TOPIC_CONTENT_DIR,
  MATH_TOPIC_IDS,
  isMathTopicDataReady,
  loadAllMathTopicData,
  loadMathTopicData,
  mathExamTopics,
  mathTopicIdOfQuestion,
  mathTopicSpecOf,
} from './modules/math-topics';

/**
 * 数学模块 id 列表。
 *
 * `math-topics`（中考题型专题）排在最末：它按**卷面题型**组织，是唯一为备考而设的
 * 题型模块（`math-exam` 是策略型专题：试卷结构与时间分配，两者互补），落在最后
 * 符合「先学后考」的次序。
 */
export const MATH_MODULE_IDS: MathModuleId[] = [
  'math-number',
  'math-geometry',
  'math-stats',
  'math-formula',
  'math-model',
  'math-exam',
  'math-topics',
];

/**
 * 正文随模块一起下载的数学模块（除 `math-topics` 之外的全部）。
 * `math-topics` 走「按条目懒加载」，正文不在 `./topics` 这个 chunk 里。
 */
const EAGER_MODULE_IDS = MATH_MODULE_IDS.filter((id) => id !== 'math-topics');

/**
 * ⚠️ 这里**不能**写 `import { mathNumber } from './number'` 这类静态导入。
 *
 * 各模块的知识点数据只能经 `./topics` **动态** import（就在下面的 `load()` 里）。
 * 一旦在文件顶部静态导入它们，Rollup 会把 `number/geometry/stats/…` 放进**调用方那个
 * chunk**（校验脚本里就是 `validate.mjs` 本身），而 `./topics` 这个懒加载 chunk 又要
 * 反过来从它 import——于是形成「入口 chunk ⟷ topics chunk」的循环。入口脚本第一行就是
 * `await ensureAll()`，而 ESM 的循环会被**顶层 await 卡死**：topics 等入口求值完，
 * 入口等 topics 加载完，两边都不动。现象是 `pnpm validate` / `pnpm smoke` 永久挂起、
 * 退出码 13（`Warning: Detected unsettled top-level await … await ensureAll()`），
 * 而且**一个字符的错误都不报**，看起来像内容有问题。
 *
 * （原先此处确实有一份静态导入 + 一份没人用的 `TOPICS_BY_MODULE` 副本，`load()` 里读的是
 * 动态模块的 `m.TOPICS_BY_MODULE`，那份副本是死代码，删掉即解环。）
 */

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
 *
 * `load()` 同时负责把 `math-topics` 的**清单骨架**装进容器：模块范围
 * （`useDataScope(['math-topics'])`）只装骨架，正文由 `loadMathTopic(id)` 单独下载。
 */
let loaded = false;
let pending: Promise<void> | null = null;

/** 数学数据是否已就绪（对 `math-topics` 而言 = **轻量清单已在位**，不等于正文到了） */
export function isLoaded(): boolean {
  return loaded;
}

/** 加载数学数据（重复调用安全） */
export function load(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (pending) return pending;
  pending = import('./topics').then((m) => {
    for (const mid of EAGER_MODULE_IDS) {
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
    // 中考题型专题：只装骨架（详见文件末尾的注册表声明）
    allEntries.push(...buildMathTopicStubs());
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

/* ------------------- 中考题型专题：骨架 + 按条目懒加载 ------------------- */

/**
 * 轻量清单里已出现的数学专题（`pnpm gen` 从真实数据生成）。
 *
 * 有它就用它：清单里的副标题（「几节逐类讲透 · 多少题」）与正文装配算出来的
 * **必须是同一个字符串**，否则模块列表页与详情页会各说一套数字
 * （`scripts/validate-entry.ts` 的「清单 vs 骨架」逐条比对）。
 * 内容还没写好时清单为空，退回 `TOPICS-SPEC.md` 里的骨架（标题 + 章节数）。
 */
const MATH_TOPIC_META = new Map(
  ENTRY_META.filter((m) => m.moduleId === 'math-topics').map((m) => [m.id, m]),
);

/** 骨架阶段的副标题：清单没有它时（= 还没跑 `pnpm gen`）只说得出「几节」，不编题量 */
function mathTopicStubSubtitle(id: string): string {
  const spec = mathTopicSpecOf(id);
  return spec
    ? `${spec.paper} · ${spec.sections.length} 节逐类讲透`
    : '专题内容正在补充';
}

/**
 * 模块清单（注册表里的 `manifest`）：模块列表页、检索与面包屑只读它，
 * **一个专题的正文都不下载**。
 */
export function mathTopicManifest(): ManifestItem[] {
  return MATH_TOPIC_IDS.map((id) => {
    const meta = MATH_TOPIC_META.get(id);
    const spec = mathTopicSpecOf(id);
    const title = meta?.title ?? spec?.title ?? id;
    return {
      id,
      moduleId: 'math-topics',
      title,
      subtitle: meta?.subtitle ?? mathTopicStubSubtitle(id),
      grade: meta?.grade ?? 'all',
      questions: meta?.questions ?? 0,
      // 与语文专题同一约定：第一个标签是专题名（面包屑与检索），第二个标明它是什么
      tags: meta?.tags ?? [title, '中考题型专题'],
    };
  });
}

/**
 * 造一条专题骨架：字段形状与真条目一致，`data` 先给空壳，正文加载后原地替换。
 *
 * 关键在「原地」：`allEntries`（数学与全局两份）、`entryIndex` 都持有**同一个对象**，
 * 只要改它的字段，所有同步查询立即看到内容；若改成 push 一条同 id 的新条目，
 * `findEntryById` 会先命中旧骨架，页面渲染出空白——这正是最容易踩的坑
 * （与语文 `data/chinese/index.ts` 的 `installZhTopic` 同一套做法）。
 */
function buildMathTopicStub(m: ManifestItem): MathExamTopicEntry {
  const spec = mathTopicSpecOf(m.id);
  /**
   * 专题数据是 `ExamTopic` 形态（trends / angles / steps / drills…），
   * 与知识点形态的 `MathTopic` 不同，因此条目类型是 `MathExamTopicEntry`
   * （见 `types.ts` 的说明）——不再需要 `as unknown as MathTopic` 这种硬转。
   * 骨架阶段只填清单里已知的字段，正文由 `loadMathTopic` 原地补进来。
   */
  const data: ExamTopic = {
    id: m.id,
    grade: 'all',
    title: m.title,
    paper: spec?.paper ?? '',
    summary: spec?.summary ?? '',
    trends: [],
    trendSummary: '',
    angles: [],
    steps: [],
    drills: [],
    questions: [],
  };

  return {
    id: m.id,
    moduleId: 'math-topics',
    title: m.title,
    subtitle: m.subtitle,
    grade: m.grade,
    tags: m.tags,
    // 题目在正文里：骨架阶段如实留空，`isMathTopicReady(id)` 才是权威的就绪判据
    questions: [],
    data,
  };
}

/** 全部专题骨架（模块列表页、检索、面包屑都用它；正文另加载） */
function buildMathTopicStubs(): MathExamTopicEntry[] {
  return mathTopicManifest().map(buildMathTopicStub);
}

/** 把加载回来的正文装配成一条完整条目（只在骨架缺席时才用得到） */
function buildMathTopicEntry(t: ExamTopic): MathExamTopicEntry {
  const questions = t.questions ?? [];
  return {
    id: t.id,
    moduleId: 'math-topics',
    title: t.title,
    subtitle: examTopicSubtitle(t, questions.length),
    grade: t.grade,
    tags: [t.title, '中考题型专题'],
    questions,
    data: t,
  };
}

/**
 * 把加载回来的正文**原地补进已有骨架条目**。
 *
 * 两个派生缓存（检索文本、关联节点）是按对象记忆的，正文补齐后必须**失效**，
 * 否则按「二次函数」搜不到这个专题、专题页的「同一考点」也会少一块。
 */
function installMathTopic(id: string, t: ExamTopic): void {
  const questions = t.questions ?? [];
  const found = allEntries.find((e) => e.id === id && e.moduleId === 'math-topics');
  // 这一块的条目类型是 `MathExamTopicEntry`（`data` 就是 `ExamTopic`），
  // 所以这里**不需要**任何硬转：装配与读取都按真实形状走。
  const entry = found as MathExamTopicEntry | undefined;
  if (!entry) {
    // 骨架缺席（例如这个 id 不在清单里）：宁可多一条真条目，也不能把内容丢掉
    allEntries.push(buildMathTopicEntry({ ...t, id }));
    return;
  }
  entry.title = t.title;
  entry.subtitle = examTopicSubtitle(t, questions.length);
  entry.grade = t.grade;
  entry.tags = [t.title, '中考题型专题'];
  entry.questions = questions;
  entry.data = t;

  forgetSearchText(entry);
  forgetRel(entry);
}

/**
 * 加载**一个**专题的正文（详情页、单条内容组卷、模块页悬停预取走这里）。
 *
 * 先 `await load()` 保证骨架在位：悬停预取可能早于 `useDataScope` 的加载，
 * 骨架不在位就会 push 出一条与骨架重复的条目（模块页会出现两条同名专题）。
 */
export async function loadMathTopic(id: string): Promise<void> {
  await load();
  installMathTopic(id, await loadMathTopicData(id));
}

/** 加载全部**已写好**的专题正文（聚合页与校验脚本用） */
export async function loadAllMathTopics(): Promise<void> {
  await load();
  for (const t of await loadAllMathTopicData()) installMathTopic(t.id, t);
}


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

/* ------------------------------------------------------------------ */
/* 注册到「按条目懒加载」注册表                                          */
/* ------------------------------------------------------------------ */

/**
 * 把「数学·中考题型专题」登记进通用注册表（`data/lazyEntries.ts`）。
 *
 * 注册之后，页面侧（详情页 / 练习页 / 模块页 / 错题本 / 学习报告 / 考点页）与校验脚本
 * 全都通过注册表认识这一块，**不需要任何按学科的 `if (moduleId === '…')`**：
 *
 *   - `useLazyEntries(lazyEntrySpecFor('math-topics', id))` → 打开某个专题才下载它；
 *   - `useLazyEntries(lazyEntryIdsOfModules(moduleIds))` → 聚合页把本科全部专题拉齐；
 *   - `ensureAll()` → `loadAllLazyEntries()`，校验与冒烟测试拿到的是完整数据。
 *
 * 放在文件末尾：注册对象要引用上面的常量与函数（`MATH_TOPIC_IDS`、`mathTopicManifest`、
 * `loadMathTopic`…），写在中间会有 TDZ 风险；注册本身是幂等的 Map 写入。
 */
registerLazyEntryModule({
  moduleId: 'math-topics',
  label: '数学中考题型专题',
  sourceFile: 'src/data/math/modules/math-topics.ts',
  contentDir: MATH_TOPIC_CONTENT_DIR,
  ids: () => MATH_TOPIC_IDS,
  has: (id) => MATH_TOPIC_IDS.includes(id),
  isReady: isMathTopicDataReady,
  loadedIds: () => mathExamTopics.map((t) => t.id),
  entryIdOfQuestion: mathTopicIdOfQuestion,
  manifest: async () => mathTopicManifest(),
  loadEntry: (id) => loadMathTopic(id),
  loadAll: () => loadAllMathTopics(),
});

