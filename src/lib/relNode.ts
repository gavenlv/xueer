/**
 * 关联规则用的「轻量节点」——把「一条内容」抽象成规则真正需要的字段。
 *
 * ## 为什么需要它
 *
 * 内容数据是按模块按需加载的（见 `src/data/chinese/index.ts`），但「🧩 学一补多」的
 * 价值恰恰在**跨模块**：学《陋室铭》要能补上古诗词版的同一篇、刘禹锡的其它诗、
 * 文中出现的字词、相关的文学常识。如果关联规则只能看见「当前已加载的模块」，
 * 详情页上的分组会悄悄变少（校验脚本因为预加载了全量数据，反而查不出来）。
 *
 * 解决办法是：规则不再直接读 `Entry`，而是读这个 `Rel`。
 *
 *   - **已加载**的条目 → `relOfEntry()` 从完整数据里取字段（还可拿到全文检索文本）；
 *   - **未加载**的条目 → `relOfMeta()` 从生成的轻量清单 `ENTRY_META` 里取同样的字段。
 *
 * 两者的字段语义必须**逐一对齐**（作者、题目考点标签、意象、文学常识匹配文本、
 * 词条名），这样「只加载一个模块」与「全部加载」得到的关联结果完全一致。
 * `pnpm validate` 会逐条比对这两条路径的分组结果，防止以后有人只改一边。
 *
 * 注意 `match`（文学常识匹配文本）**一律以清单为准**：它由生成阶段从要点全文里
 * 抽出「篇名 + 作者名」，浏览器端无法重算（需要全库的作者与篇名表），
 * 因此 `relOfEntry` 也从清单取；`relOfEntryFull()` 保留从原文现算的版本，供校验对比。
 */

import type { Entry } from '../types';
import { ENTRY_META, type EntryMeta } from '../data/summary';
import { searchTextOf } from './searchText';

/** 文学常识的命中记录：哪个条目命中了它，命中多强（生成阶段算好，见 `matchFrom`） */
export interface LitEdge {
  id: string;
  score: number;
}

/** 关联规则读取的字段集合（`Entry` 与 `EntryMeta` 都能映射到它） */
export interface Rel {
  id: string;
  moduleId: string;
  title: string;
  subtitle: string;
  /** 条目标签：类别/体裁 + 主题 */
  tags: string[];
  /** 该条目题目上的知识点标签（去重） */
  qTags: string[];
  /** 作者原文；古诗文才有。以书名作作者时含书名号（如《诗经》） */
  author: string;
  /** 识别出的意象名（古诗词才有） */
  imagery: string[];
  /** 文学常识的「窄匹配文本」：**只有全量基线**（`relOfEntryFull`）才有值 */
  match: string;
  /** 文学常识的类别（只有文学常识条目非空，用于「文体」精确匹配） */
  category: string;
  /**
   * 文学常识的**命中表**：哪些条目命中了这条文学常识、命中多强。
   *
   * 为什么不存「窄匹配文本」再现场匹配：匹配要用到**全库的作者名与篇名表**
   * （「咏雪」这样的篇名不会带书名号，「李煜」这样的作者名也可能只出现一次），
   * 浏览器端只加载了一个模块，抽不全这份表。所以改由生成阶段（`pnpm gen`）拿全量数据
   * 把命中关系直接算好存进清单，运行期查表即可。规则本身仍写在 `litScoreFor` 里，
   * 生成与校验都调用它，不存在两套逻辑。
   */
  matchFrom: LitEdge[];
  /** 词条名（词语模块才有） */
  term: string;
  /** 条目全文检索文本；只有**已加载**的条目才有值 */
  searchText: string;
}

/* ------------------------------ 意象识别 ------------------------------ */

/** 初中古诗文常见意象词表（用于从诗句中识别意象） */
const IMAGERY: { name: string; words: string[] }[] = [
  { name: '月', words: ['明月', '月明', '月光', '月如钩', '月色', '一轮月', '月下', '秋月', '霜月'] },
  { name: '杨柳', words: ['杨柳', '柳絮', '折柳', '柳色', '垂柳'] },
  { name: '鸿雁', words: ['鸿雁', '雁', '归雁', '孤鸿'] },
  { name: '酒', words: ['酒', '樽', '杯', '觞'] },
  { name: '菊', words: ['菊', '黄花'] },
  { name: '梅', words: ['梅'] },
  { name: '莲', words: ['莲', '荷', '芙蓉', '芙蕖'] },
  { name: '流水', words: ['流水', '江水', '长江', '东流', '水流'] },
  { name: '夕阳', words: ['夕阳', '落日', '斜阳', '日暮', '残阳', '黄昏'] },
  { name: '羌笛琵琶', words: ['羌笛', '琵琶', '胡琴', '芦管', '管弦'] },
  { name: '孤舟', words: ['孤舟', '扁舟', '孤帆', '行舟'] },
  { name: '秋风', words: ['秋风', '西风', '悲风'] },
  { name: '雨雪', words: ['雪', '雨', '霏霏', '纷纷'] },
  { name: '杜鹃', words: ['子规', '杜鹃', '鹧鸪', '猿啼', '猿鸣'] },
  { name: '云', words: ['白云', '浮云', '孤云', '云海'] },
  { name: '草木', words: ['草木', '芳草', '青草', '绿树', '树木'] },
];

/** 从诗句里识别意象（诗句原文连成一串后做子串匹配） */
export function imageryOfLines(lines: string[]): string[] {
  const text = lines.join('');
  const hit: string[] = [];
  for (const { name, words } of IMAGERY) {
    if (words.some((w) => text.includes(w))) hit.push(name);
  }
  return hit;
}

/* ------------------------------ 两个适配器 ------------------------------ */

const META_BY_ID: Map<string, EntryMeta> = new Map(ENTRY_META.map((m) => [m.id, m]));

/** 按 id 取清单骨架（条目未加载时用，如练习页按题目反查知识点） */
export function metaById(id: string): EntryMeta | undefined {
  return META_BY_ID.get(id);
}

/** `Entry` 里按模块取字段（`data` 是联合类型，需要窄化） */
function rawOf(entry: Entry): {
  author: string;
  lines: string[];
  term: string;
  category: string;
  keyPoints: string[];
  bookTheme: string;
  bookName: string;
  bookAuthor: string;
} {
  const d = entry.data as unknown as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const book = (d.book ?? {}) as Record<string, unknown>;
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]).filter((x) => typeof x === 'string') : []);
  return {
    author: str(d.author),
    lines: arr(d.lines),
    term: str(d.term),
    category: str(d.category),
    keyPoints: arr(d.keyPoints),
    bookTheme: str(book.theme),
    bookName: str(book.name),
    bookAuthor: str(book.author),
  };
}

/** 文学常识「窄匹配文本」的完整版（只用标题与必记要点，不含正文） */
function fullNarrowText(entry: Entry): string {
  const r = rawOf(entry);
  return [entry.title, r.category, r.bookName, r.bookAuthor, r.bookTheme, ...r.keyPoints]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function buildRel(entry: Entry, mode: 'meta' | 'full'): Rel {
  const r = rawOf(entry);
  const isPoem = entry.moduleId === 'poems';
  const isClassical = entry.moduleId === 'classical';
  const isVocab = entry.moduleId === 'vocab';
  const isLit = entry.moduleId === 'literature';
  const meta = META_BY_ID.get(entry.id);
  return {
    id: entry.id,
    moduleId: entry.moduleId,
    title: entry.title,
    subtitle: entry.subtitle ?? '',
    tags: entry.tags ?? [],
    qTags: [...new Set(entry.questions.flatMap((q) => q.tags ?? []))],
    author: isPoem || isClassical ? r.author : '',
    imagery: isPoem ? imageryOfLines(r.lines) : [],
    // 窄匹配文本只有「全量基线」用得到（生成阶段算命中表时读它）；页面上走查表
    match: mode === 'full' && isLit ? fullNarrowText(entry) : '',
    category: isLit ? r.category : '',
    // 命中表以清单为准：它需要全库的作者/篇名表，浏览器端重算不出来
    matchFrom: mode === 'meta' ? meta?.matchFrom ?? [] : [],
    term: isVocab ? r.term : '',
    searchText: searchTextOf(entry),
  };
}

/** 从完整数据构造轻量节点（清单里已有的字段以清单为准，见 `matchFrom`） */
const entryCache = new WeakMap<Entry, Rel>();

export function relOfEntry(entry: Entry): Rel {
  const hit = entryCache.get(entry);
  if (hit) return hit;
  const rel = buildRel(entry, 'meta');
  entryCache.set(entry, rel);
  return rel;
}

/** 从清单构造轻量节点（条目未加载时用） */
export function relOfMeta(m: EntryMeta): Rel {
  return {
    id: m.id,
    moduleId: m.moduleId,
    title: m.title,
    subtitle: m.subtitle,
    tags: m.tags,
    qTags: m.qTags,
    author: m.authors[0] ?? '',
    imagery: m.imagery,
    match: '',
    category: '',
    matchFrom: m.matchFrom,
    term: m.term,
    searchText: '',
  };
}

/**
 * 关联用的内容池：**全部条目**（不只是已加载的那些）。
 *
 * 池子必须是全量，因为规则里有「标签频次」这种依赖池子大小的判据
 * （区分度 = 某标签被多少条目考过）。只用已加载的模块会让「有区分度」的门槛
 * 随打开哪个页面而变，同一篇内容在不同页面上关联出不同结果。
 *
 * 已加载的条目用完整数据（多了全文检索文本），未加载的用清单骨架。
 */
export function relPool(loaded: Entry[]): Rel[] {
  if (!loaded.length) return ENTRY_META.map(relOfMeta);
  const byId = new Map(loaded.map((e) => [e.id, e]));
  return ENTRY_META.map((m) => {
    const e = byId.get(m.id);
    return e ? relOfEntry(e) : relOfMeta(m);
  });
}

/** 校验与生成专用：全部字段从原文现算（文学常识的命中表要另外用 `litMatchIndex` 补） */
export function relOfEntryFull(entry: Entry): Rel {
  return buildRel(entry, 'full');
}
