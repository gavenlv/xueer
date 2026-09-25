/**
 * 知识联动：把一条内容与其它内容连起来，并说明**为什么相关**。
 *
 * 对外提供两套规则，分工不同：
 *
 * `relatedEntries` —— 「🔗 关联学习」：同类作品之间的**横向比较**。
 *   信号按强度排序：① 同作者 ② 同主题 ③ 同意象。
 *   例：《观沧海》→《龟虽寿》（同为曹操）；《天净沙·秋思》→《使至塞上》（同用「夕阳」）。
 *
 * `supplementsOf` —— 「🧩 学一补多」：学一篇时**顺带补上的其它初中知识点**，允许跨模块。
 *   分为六组：同一作品·其他模块 / 同作者 / 同一考点 / 本篇涉及的字词 / 相关文学常识 / 同类作品。
 *   例：学文言文版《陋室铭》时补上古诗词版的同一篇、刘禹锡的其它作品、
 *   以及《爱莲说》《岳阳楼记》等考同一批知识点的篇目，并给出考点专项入口。
 *
 * 全部由既有数据推导，不额外维护关联表。降噪规则见各自的函数注释——
 * 两套规则的共同底线是：**没有区分度的标签不能作为关联依据**。
 */

import type { Entry } from '../types';

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

/** 从作品里识别出的意象 */
export function imageryOf(entry: Entry): string[] {
  if (entry.moduleId !== 'poems') return [];
  const text = (entry.data.lines ?? []).join('');
  const hit: string[] = [];
  for (const { name, words } of IMAGERY) {
    if (words.some((w) => text.includes(w))) hit.push(name);
  }
  return hit;
}

export interface RelatedItem {
  entry: Entry;
  /** 关联理由，直接显示给学生 */
  reason: string;
  /** 关联强度，用于排序 */
  score: number;
}

/** 主题标签：排除体裁、语法归类等非主题标签 */
const NON_THEME = new Set([
  '诗', '词', '曲', '文', '现代诗',
  '文言文',
  '通假字', '古今异义', '词类活用', '一词多义', '特殊句式',
]);

function themeTagsOf(entry: Entry): string[] {
  return entry.tags.filter((t) => !NON_THEME.has(t));
}

/**
 * 「抒情」「写景」这类标签在大量篇目上都有，靠它们建立关联等于随机推荐。
 * 两步过滤：
 *   1. 出现比例超过阈值的标签视为无区分度，直接不用；
 *   2. 下列宽泛标签即使不超阈值也不单独作为关联依据，必须有其他信号支撑。
 */
const MAX_TAG_RATIO = 0.2;

const VAGUE_THEMES = new Set([
  '抒情', '写景', '言志', '叙事', '议论', '说明', '咏物', '哲理', '感情', '生活', '写人',
]);

function themeFrequency(pool: Entry[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const e of pool) {
    for (const t of themeTagsOf(e)) freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return freq;
}

/**
 * 找出与给定条目相关的内容。
 *
 * 只有**强信号**才成立关联：同作者、具体主题（非宽泛标签），或两个以上同意象。
 * 否则会出现「唐诗因为都『抒情』而关联到现代诗」这种没有教学价值的推荐。
 */
export function relatedEntries(
  entry: Entry,
  pool: Entry[],
  limit = 6,
): RelatedItem[] {
  const out: RelatedItem[] = [];
  const myThemes = new Set(themeTagsOf(entry));
  const myImagery = new Set(imageryOf(entry));
  const myAuthor = realAuthor(entry);

  const freq = themeFrequency(pool);
  const discriminative = (t: string) =>
    (freq.get(t) ?? 0) <= pool.length * MAX_TAG_RATIO;

  for (const other of pool) {
    if (other.id === entry.id) continue;
    // 只在同一学科内做关联（数学与语文的知识点混在一起没有意义）
    if (subjectOf(other.moduleId) !== subjectOf(entry.moduleId)) continue;

    const reasons: string[] = [];
    let score = 0;

    // 1) 同作者（最强信号）
    const authorMatch = Boolean(myAuthor) && myAuthor === realAuthor(other);
    if (authorMatch) {
      score += 3;
      reasons.push(`同为${myAuthor}作品`);
    }

    // 2) 同主题 —— 只认有区分度、且不宽泛的标签
    const sharedThemes = themeTagsOf(other).filter(
      (t) => myThemes.has(t) && discriminative(t) && !VAGUE_THEMES.has(t),
    );
    if (sharedThemes.length) {
      score += 2 * sharedThemes.length;
      reasons.push(`同主题：${sharedThemes.slice(0, 2).join('、')}`);
    }

    // 3) 同意象
    const sharedImagery = imageryOf(other).filter((i) => myImagery.has(i));
    if (sharedImagery.length) {
      score += 1.5 * sharedImagery.length;
      reasons.push(`同意象：${sharedImagery.slice(0, 2).join('、')}`);
    }

    // 强信号要求：同作者 / 具体主题 / 两个以上同意象，三者有其一
    const strong = authorMatch || sharedThemes.length > 0 || sharedImagery.length >= 2;
    if (!strong) continue;

    out.push({ entry: other, reason: reasons.join(' · '), score });
  }

  return out
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'zh'))
    .slice(0, limit);
}

function authorOf(entry: Entry): string {
  if (entry.moduleId === 'poems') return entry.data.author ?? '';
  if (entry.moduleId === 'classical') return entry.data.author ?? '';
  return '';
}

/**
 * 「作者」字段里的占位值：古籍多标「佚名」，有些篇目直接把书名当作者。
 * 拿它们去建「同作者」分组只会得到「同作者·佚名」这种无意义的标题。
 */
const PLACEHOLDER_AUTHORS = new Set(['佚名', '无名氏', '不详']);

function realAuthor(entry: Entry): string {
  const a = authorOf(entry);
  if (a.length < 2) return '';
  if (PLACEHOLDER_AUTHORS.has(a)) return '';
  if (a.startsWith('《')) return '';
  return a;
}

/** 模块 id → 学科 id（避免依赖 data 层造成循环引用） */
const MATH_MODULE_PREFIX = 'math-';
function subjectOf(moduleId: string): string {
  return moduleId.startsWith(MATH_MODULE_PREFIX) ? 'math' : 'chinese';
}

/* ------------------------------------------------------------------ */
/* 学一补多：学一篇，顺带补上多个初中知识点                              */
/* ------------------------------------------------------------------ */

export interface SupplementGroup {
  /** 分组名，如「同一作品·其他模块」 */
  kind: string;
  /** 这个分组「补什么」，一句话 */
  hint: string;
  items: { entry: Entry; reason: string }[];
  /** 可选的下一步动作（如「把这一批考点连起来做专项训练」） */
  action?: { label: string; to: string };
}

/** 规范化作品名，用于识别「同一篇作品出现在不同模块」 */
function workKey(entry: Entry): string {
  return entry.title
    .replace(/[（(].*?[)）]/g, '')
    .replace(/节选|选段|十二章|二章|三则|一则|其[一二三四五]|·.+$/g, '')
    .replace(/[《》\s]/g, '')
    .trim();
}

/** 该条目的全部题目知识点标签（去重） */
function entryTags(entry: Entry): string[] {
  const set = new Set<string>();
  for (const q of entry.questions) for (const t of q.tags ?? []) set.add(t);
  return [...set];
}

/**
 * 标签频次：某个知识点被多少个条目考过。
 * 用来算「区分度」——「实词」「主旨」这类几乎每个条目都有的标签
 * 不配作为关联依据，否则任何两篇文言文都能互相关联。
 */
function tagFrequency(pool: Entry[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const e of pool) {
    for (const t of entryTags(e)) freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return freq;
}

/** 同一考点的最低门槛：共享标签的「稀有度」之和 */
const MIN_POINT_SCORE = 0.28;

/**
 * 取条目里可用于匹配的正文文本（小写）。
 * `searchText` 含标题、作者、正文与标签，用于「正文里出现的字词」这类匹配。
 */
function bodyText(entry: Entry): string {
  return entry.searchText ?? '';
}

/**
 * 只含标题与必记要点的窄文本，用于「相关文学常识」匹配。
 * 若拿整篇 content 去匹配作者名，任何一处顺带提及都会造成假关联。
 */
function narrowText(entry: Entry): string {
  if (entry.moduleId !== 'literature') return bodyText(entry);
  const l = entry.data;
  return [
    l.title,
    l.category,
    l.book?.name,
    l.book?.author,
    l.book?.theme,
    ...(l.keyPoints ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * 学一补多：围绕一条内容，收集**跨模块**的相关知识点。
 *
 * 与 `relatedEntries`（同类作品横向比较）不同，这里回答的是
 * 「学这一篇，还能顺带补上哪些别的知识点」——同一作品的其他模块版本、
 * 同作者作品、同一考点的题、文中出现的字词成语、相关文学常识。
 */
export function supplementsOf(entry: Entry, pool: Entry[]): SupplementGroup[] {
  const sameSubject = pool.filter((e) => e.id !== entry.id && subjectOf(e.moduleId) === subjectOf(entry.moduleId));
  const text = bodyText(entry);
  const myWork = workKey(entry);
  const myAuthor = realAuthor(entry);
  const myTags = entryTags(entry);
  const freq = tagFrequency(pool);

  const groups: SupplementGroup[] = [];
  const taken = new Set<string>([entry.id]);

  /* 1) 同一作品在其它模块（如《陋室铭》在古诗词与文言文各有一份） */
  const sameWork = sameSubject.filter(
    (e) => e.moduleId !== entry.moduleId && myWork.length >= 2 && workKey(e) === myWork,
  );
  if (sameWork.length) {
    sameWork.forEach((e) => taken.add(e.id));
    groups.push({
      kind: '同一作品·其他模块',
      hint: '同一篇文章在别的模块还有一份，角度不同，可以对着看',
      items: sameWork.map((e) => ({ entry: e, reason: '同一篇的另一种学法' })),
    });
  }

  /* 2) 同作者的其他作品（跨模块：文与诗一起看） */
  const sameAuthor = sameSubject
    .filter((e) => !taken.has(e.id) && myAuthor && realAuthor(e) === myAuthor)
    .slice(0, 4);
  if (sameAuthor.length) {
    sameAuthor.forEach((e) => taken.add(e.id));
    groups.push({
      kind: `同作者·${myAuthor}`,
      hint: '同一作者的其它作品，放在一起能看出风格与思想的脉络',
      items: sameAuthor.map((e) => ({ entry: e, reason: e.subtitle || '同一作者' })),
    });
  }

  /* 3) 同一考点：只认「有区分度」的共享知识点。
        像「实词」「主旨」这种几乎人人都有的标签权重极低，
        必须靠稀有标签（如「托物言志」「宾语前置」）才够门槛。 */
  const samePoint = sameSubject
    .filter((e) => !taken.has(e.id))
    .map((e) => {
      const shared = entryTags(e).filter((t) => myTags.includes(t));
      const score = shared.reduce((a, t) => a + 1 / (freq.get(t) ?? 1), 0);
      const rare = shared.filter((t) => (freq.get(t) ?? 1) <= 8);
      return { entry: e, shared, rare, score };
    })
    .filter((x) => x.shared.length >= 2 && x.rare.length >= 1 && x.score >= MIN_POINT_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  if (samePoint.length) {
    samePoint.forEach((x) => taken.add(x.entry.id));
    // 取这批条目共同命中的**最稀有**标签，作为「专项训练」的入口
    const allShared = new Set<string>();
    for (const x of samePoint) for (const t of x.rare) allShared.add(t);
    const topTag = [...allShared].sort((a, b) => (freq.get(a) ?? 99) - (freq.get(b) ?? 99))[0];
    groups.push({
      kind: '同一考点',
      hint: '考同一批知识点，适合连起来做专项训练',
      items: samePoint.map((x) => ({
        entry: x.entry,
        reason: `同考：${(x.rare.length ? x.rare : x.shared).slice(0, 2).join('、')}`,
      })),
      // 古诗词模块的题目由逐句默写现场生成，没有考点标签，因此不提供考点专项入口
      action:
        entry.moduleId !== 'poems' && topTag
          ? { label: `🎯 就「${topTag}」做考点专项`, to: `/practice/${entry.moduleId}?tag=${encodeURIComponent(topTag)}` }
          : undefined,
    });
  }

  /* 4) 文中出现的字词 / 成语（本篇正文里能找到的字词条目） */
  const vocabHits = pool
    .filter((e) => e.moduleId === 'vocab' && !taken.has(e.id))
    .map((e) => {
      const term = (e.data as { term?: string }).term ?? '';
      return { entry: e, term };
    })
    .filter((x) => x.term.length >= 2 && text.includes(x.term.toLowerCase()))
    .slice(0, 5);
  if (vocabHits.length) {
    vocabHits.forEach((x) => taken.add(x.entry.id));
    groups.push({
      kind: '本篇涉及的字词',
      hint: '这一篇正文里出现的字词/成语，顺手把释义补上',
      items: vocabHits.map((x) => ({ entry: x.entry, reason: `本篇有「${x.term}」` })),
    });
  }

  /* 5) 相关文学常识（作家作品、名著等）：只在标题与必记要点里匹配，
        避免正文顺带提一句就牵连进来 */
  const litHits = pool
    .filter((e) => e.moduleId === 'literature' && !taken.has(e.id))
    .filter((e) => {
      const t = narrowText(e);
      if (myAuthor.length >= 2 && t.includes(myAuthor.toLowerCase())) return true;
      if (myWork.length >= 2 && t.includes(myWork.toLowerCase())) return true;
      return false;
    })
    .slice(0, 3);
  if (litHits.length) {
    litHits.forEach((e) => taken.add(e.id));
    groups.push({
      kind: '相关文学常识',
      hint: '和这篇有关的作家作品、体裁或文化常识',
      items: litHits.map((e) => ({ entry: e, reason: e.subtitle || '相关常识' })),
    });
  }

  /* 6) 同类作品（主题 / 意象 / 作者），沿用原有横向比较逻辑 */
  const similar = relatedEntries(entry, pool, 4).filter((r) => !taken.has(r.entry.id));
  if (similar.length) {
    groups.push({
      kind: '同类作品·横向比较',
      hint: '主题或意象相近，放在一起比较是中考常见考法',
      items: similar.map((r) => ({ entry: r.entry, reason: r.reason })),
    });
  }

  return groups;
}
