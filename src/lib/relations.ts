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
 *
 * ## 输入是「轻量节点」而不是 `Entry`
 *
 * 规则只依赖 `Rel`（见 `lib/relNode.ts`）里的少数几个字段：标签、作者、意象、
 * 题目考点、词条名、文学常识匹配文本。这样**未加载的模块也能参与关联**——
 * 学《陋室铭》时补上古诗词版的同一篇、词语模块的词条、文学常识条目都不必先把
 * 那三个模块下载下来。详见 `lib/relNode.ts` 的文件头说明。
 */

import type { Rel } from './relNode';

/** 从内容里识别出的意象（`Rel.imagery` 由 `relNode` 统一算出，两条加载路径一致） */
export function imageryOf(rel: Rel): string[] {
  return rel.imagery;
}

export interface RelatedItem {
  entry: Rel;
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

function themeTagsOf(entry: Rel): string[] {
  return entry.tags.filter((t) => !NON_THEME.has(t));
}

/**
 * 一篇古诗词可用于**考点聚类**的主题词。
 *
 * 与 `themeTagsOf` 的区别是额外排掉「抒情」「写景」这类几乎人人都有的宽泛词——
 * 用它们聚类会得到一个「包含 80 首诗」的伪考点。考点页按主题聚类时用这个。
 */
export function examThemesOf(entry: Rel): string[] {
  if (entry.moduleId !== 'poems') return [];
  return entry.tags.filter((t) => !NON_THEME.has(t) && !VAGUE_THEMES.has(t));
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

function themeFrequency(pool: Rel[]): Map<string, number> {
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
  entry: Rel,
  pool: Rel[],
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

function authorOf(entry: Rel): string {
  return entry.author;
}

/**
 * 「作者」字段里的占位值。古籍多标「佚名」，拿它建「同作者」分组只会得到
 * 「同作者·佚名」这种无意义标题，因此直接排除。
 *
 * 注意：以书名作作者（如《诗经》《礼记》《吕氏春秋》《古诗十九首》）**不算占位值**——
 * 「同为《诗经》作品」本身就是一条有用的文学常识，只是分组名改称「同一出处」。
 */
const PLACEHOLDER_AUTHORS = new Set(['佚名', '无名氏', '不详']);

function realAuthor(entry: Rel): string {
  const a = authorOf(entry);
  if (a.length < 2) return '';
  if (PLACEHOLDER_AUTHORS.has(a)) return '';
  return a;
}

/** 分组名：以书名作作者的，说「同一出处」比「同作者」准确 */
function authorGroupKind(author: string): string {
  return author.startsWith('《') ? `同一出处·${author}` : `同作者·${author}`;
}

/**
 * 文学常识匹配用的关键词：以书名作作者的条目（如《诗经》）要去掉书名号再匹配，
 * 因为文学常识条目里通常写作「《诗经》是我国第一部诗歌总集」。
 */
function authorKeys(entry: Rel): string[] {
  const a = realAuthor(entry);
  if (!a) return [];
  const inner = a.replace(/^《|》$/g, '').trim();
  return inner && inner !== a ? [a.toLowerCase(), inner.toLowerCase()] : [a.toLowerCase()];
}

/**
 * 模块 id → 学科 id（用前缀判断，避免依赖 data 层造成循环引用）。
 * 只同学科内做关联：语文与历史、数学混在一起推荐没有教学价值。
 */
const MATH_MODULE_PREFIX = 'math-';
const HISTORY_MODULE_PREFIX = 'hist-';
const ENGLISH_MODULE_PREFIX = 'eng-';
function subjectOf(moduleId: string): string {
  if (moduleId.startsWith(MATH_MODULE_PREFIX)) return 'math';
  if (moduleId.startsWith(HISTORY_MODULE_PREFIX)) return 'history';
  if (moduleId.startsWith(ENGLISH_MODULE_PREFIX)) return 'english';
  return 'chinese';
}

/* ------------------------------------------------------------------ */
/* 相关文学常识：命中关系在生成阶段算好，运行期查表                      */
/* ------------------------------------------------------------------ */

/**
 * 文体键：只有明确列出的文体名才算，**且只与「文学体裁」类条目的标题比对**。
 *
 * 不做成「标签里长度 ≥2 就用」的通用规则，是因为古诗文的主题标签里也有「叙事」「写人」
 * 这类词，会误勾到《散文：叙事、抒情与哲理》；也不拿单字的「诗」「词」「曲」「文」做
 * 子串匹配，否则「唐诗三百首」「骈文与赋」都会被勾进来。
 * 有了这一条，现代文阅读的每一篇才能补上对应文体常识（如小说的三条要素）。
 */
const GENRE_WORDS = new Set([
  '记叙文', '说明文', '议论文', '散文', '小说', '戏剧', '诗歌', '现代诗',
  '文言文', '非连续性文本', '新闻', '寓言', '童话', '传记',
]);

/**
 * 一条内容「命中」一条文学常识的强度：0 表示无关。
 *
 * 三个信号，优先级从高到低（分数与前缀优先级保持一致，不要调换三元表达式顺序）：
 *   3  名字（作者 / 篇名）命中**标题**——如《陋室铭》→《刘禹锡》；
 *   2  名字命中**必记要点**——如《咏雪》→《岑参》（岑参条目要点里举了咏雪名篇）；
 *   2.5 文体命中标题——且必须是「文学体裁」类条目，否则《西游记——神话小说》
 *       也会被「小说」勾中。
 *
 * `narrowText` 是文学常识条目的窄文本（只含篇名/作者名/体裁名，不含正文），
 * 若拿整篇正文去匹配，任何一处顺带提及都会造成假关联。
 */
export function litScoreFor(source: Rel, lit: Rel, narrowText: string): number {
  const keys = [
    ...authorKeys(source),
    ...(workKey(source).length >= 2 ? [workKey(source).toLowerCase()] : []),
  ];
  const title = lit.title.toLowerCase();
  const nameInTitle = keys.some((k) => title.includes(k));
  const nameInPoints = keys.some((k) => narrowText.includes(k));
  const genreInTitle =
    lit.category === '文学体裁' &&
    source.tags.some((t) => GENRE_WORDS.has(t) && title.includes(t.toLowerCase()));
  return nameInTitle ? 3 : nameInPoints ? 2 : genreInTitle ? 2.5 : 0;
}

/**
 * 文学常识的命中表：哪些条目命中了它、命中多强。
 *
 * 由 `pnpm gen` 拿**全量数据**算一次存进清单（`EntryMeta.matchFrom`），页面只查表；
 * 校验脚本用同样这两个函数在全量池上重算一遍并逐条比对，所以清单不会悄悄过期。
 * `lit.match`（窄匹配文本）只在**全量基线**（`relOfEntryFull`）里有值。
 */
export function litMatchIndex(lit: Rel, pool: Rel[]): { id: string; score: number }[] {
  const out: { id: string; score: number }[] = [];
  for (const source of pool) {
    if (source.id === lit.id) continue;
    const score = litScoreFor(source, lit, lit.match);
    if (score > 0) out.push({ id: source.id, score });
  }
  return out;
}

/** 查表：某条目命中这条文学常识的强度 */
function litScoreFrom(lit: Rel, sourceId: string): number {
  return lit.matchFrom.find((x) => x.id === sourceId)?.score ?? 0;
}

/* ------------------------------------------------------------------ */
/* 学一补多：学一篇，顺带补上多个初中知识点                              */
/* ------------------------------------------------------------------ */

export interface SupplementGroup {
  /** 分组名，如「同一作品·其他模块」 */
  kind: string;
  /** 这个分组「补什么」，一句话 */
  hint: string;
  items: { entry: Rel; reason: string }[];
  /** 可选的下一步动作（如「把这一批考点连起来做专项训练」） */
  action?: { label: string; to: string };
}

/** 规范化作品名，用于识别「同一篇作品出现在不同模块」 */
function workKey(entry: Rel): string {
  return entry.title
    .replace(/[（(].*?[)）]/g, '')
    .replace(/节选|选段|十二章|二章|三则|一则|其[一二三四五]|·.+$/g, '')
    .replace(/[《》\s]/g, '')
    .trim();
}

/**
 * 同一页去重用的键：只抹掉「（节选）」这类版本标注与书名号，**保留词牌后的题目**。
 * 不能用 `workKey`——它会把「山坡羊·潼关怀古」和「山坡羊·骊山怀古」都压成「山坡羊」，
 * 那是两篇不同的作品。
 */
function pageKey(entry: Rel): string {
  return entry.title
    .replace(/[（(](节选|选段|节录)[)）]/g, '')
    .replace(/[《》\s]/g, '')
    .trim();
}

/** 该条目的全部题目知识点标签（去重，由 `relNode` 统一算好） */
function entryTags(entry: Rel): string[] {
  return entry.qTags;
}

/**
 * 标签频次：某个知识点被多少个条目考过。
 * 用来算「区分度」——「实词」「主旨」这类几乎每个条目都有的标签
 * 不配作为关联依据，否则任何两篇文言文都能互相关联。
 */
function tagFrequency(pool: Rel[]): Map<string, number> {
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
 * `searchTextOf` 含标题、作者、正文与标签，用于「正文里出现的字词」这类匹配。
 */
function bodyText(entry: Rel): string {
  return entry.searchText;
}

/**
 * 学一补多：围绕一条内容，收集**跨模块**的相关知识点。
 *
 * 与 `relatedEntries`（同类作品横向比较）不同，这里回答的是
 * 「学这一篇，还能顺带补上哪些别的知识点」——同一作品的其他模块版本、
 * 同作者作品、同一考点的题、文中出现的字词成语、相关文学常识。
 */
export function supplementsOf(entry: Rel, pool: Rel[]): SupplementGroup[] {
  const sameSubject = pool.filter((e) => e.id !== entry.id && subjectOf(e.moduleId) === subjectOf(entry.moduleId));
  const text = bodyText(entry);
  const myWork = workKey(entry);
  const myAuthor = realAuthor(entry);
  const myTags = entryTags(entry);
  const freq = tagFrequency(pool);

  const groups: SupplementGroup[] = [];

  /**
   * 一页之内同一篇作品只出现一次。
   *
   * 库里同一篇作品常常有两份：古诗词模块一份（供逐句默写）、文言文模块一份（供阅读讲解），
   * 例如《陋室铭》《诫子书》《出师表》。只看 id 去重是不够的——那会出现
   * 「同作者」组里一条《诫子书》、《同类作品》组里又一条《诫子书》，看起来像 bug。
   * 因此这里按「标题」而非 id 去重，先出现的分组先占位。
   */
  const usedIds = new Set<string>([entry.id]);
  const usedTitles = new Set<string>([pageKey(entry)]);
  const claim = (e: Rel) => {
    usedIds.add(e.id);
    usedTitles.add(pageKey(e));
  };
  const free = (e: Rel) => !usedIds.has(e.id) && !usedTitles.has(pageKey(e));

  /**
   * 按给定顺序取出前 `limit` 条**尚未占用**的候选，取一条就占一条。
   *
   * 不能只用 `filter(free)`：谓词是对「当前」状态求值的，
   * 同一分组里的两条同名作品（如古诗词版与文言文版的《诫子书》）会同时通过过滤。
   */
  function pick<T>(list: T[], get: (t: T) => Rel, limit: number): T[] {
    const out: T[] = [];
    for (const item of list) {
      const e = get(item);
      if (!free(e)) continue;
      claim(e);
      out.push(item);
      if (out.length >= limit) break;
    }
    return out;
  }

  /**
   * 「同一作品·其他模块」专用：这一组要展示的那一份**天然与当前条目同名**
   * （文言文版《陋室铭》→ 古诗词版《陋室铭》），因此不能套用 `free` 的同名判断，
   * 只按 id 与组内同名去重。
   */
  function pickTwins(list: Rel[], limit: number): Rel[] {
    const out: Rel[] = [];
    const titles = new Set<string>();
    for (const e of list) {
      if (usedIds.has(e.id)) continue;
      const k = pageKey(e);
      if (titles.has(k)) continue;
      titles.add(k);
      claim(e);
      out.push(e);
      if (out.length >= limit) break;
    }
    return out;
  }

  /* 1) 同一作品在其它模块（如《陋室铭》在古诗词与文言文各有一份） */
  const sameWork = pickTwins(
    sameSubject.filter(
      (e) => e.moduleId !== entry.moduleId && myWork.length >= 2 && workKey(e) === myWork,
    ),
    3,
  );
  if (sameWork.length) {
    groups.push({
      kind: '同一作品·其他模块',
      hint: '同一篇文章在别的模块还有一份，角度不同，可以对着看',
      items: sameWork.map((e) => ({ entry: e, reason: '同一篇的另一种学法' })),
    });
  }

  /* 2) 同作者的其他作品（跨模块：文与诗一起看）。以书名作作者的条目走「同一出处」，措辞更准确。 */
  const sameAuthor = pick(
    sameSubject.filter((e) => myAuthor && realAuthor(e) === myAuthor),
    (e) => e,
    4,
  );
  if (sameAuthor.length) {
    const fromBook = myAuthor.startsWith('《');
    groups.push({
      kind: authorGroupKind(myAuthor),
      hint: fromBook
        ? '出自同一部作品的其它篇目，放在一起能看出这部书的整体面貌'
        : '同一作者的其它作品，放在一起能看出风格与思想的脉络',
      items: sameAuthor.map((e) => ({ entry: e, reason: e.subtitle || '同一作者' })),
    });
  }

  /* 3) 同一考点：只认「有区分度」的共享知识点。
        像「实词」「主旨」这种几乎人人都有的标签权重极低，
        必须靠稀有标签（如「托物言志」「宾语前置」）才够门槛。 */
  const samePoint = pick(
    sameSubject
      .map((e) => {
        const shared = entryTags(e).filter((t) => myTags.includes(t));
        const score = shared.reduce((a, t) => a + 1 / (freq.get(t) ?? 1), 0);
        const rare = shared.filter((t) => (freq.get(t) ?? 1) <= 8);
        return { entry: e, shared, rare, score };
      })
      .filter((x) => x.shared.length >= 2 && x.rare.length >= 1 && x.score >= MIN_POINT_SCORE)
      .sort((a, b) => b.score - a.score),
    (x) => x.entry,
    4,
  );
  if (samePoint.length) {
    samePoint.forEach((x) => claim(x.entry));
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
  const vocabHits = pick(
    pool
      .filter((e) => e.moduleId === 'vocab')
      .map((e) => ({ entry: e, term: e.term }))
      .filter((x) => x.term.length >= 2 && text.includes(x.term.toLowerCase())),
    (x) => x.entry,
    5,
  );
  if (vocabHits.length) {
    groups.push({
      kind: '本篇涉及的字词',
      hint: '这一篇正文里出现的字词/成语，顺手把释义补上',
      items: vocabHits.map((x) => ({ entry: x.entry, reason: `本篇有「${x.term}」` })),
    });
  }

  /* 5) 相关文学常识（作家作品、名著、文体常识）：命中关系由 `litMatchIndex` 在生成阶段
        算好（运行期只查表），这里只按分数取前三条。
        优先级：名字命中标题 > 文体命中标题 > 名字命中要点。 */
  const litHits = pick(
    pool
      .filter((e) => e.moduleId === 'literature')
      .map((e) => ({ entry: e, score: litScoreFrom(e, entry.id) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score),
    (x) => x.entry,
    3,
  );
  if (litHits.length) {
    groups.push({
      kind: '相关文学常识',
      hint: '和这篇有关的作家作品、体裁或文化常识',
      items: litHits.map((x) => ({ entry: x.entry, reason: x.entry.subtitle || '相关常识' })),
    });
  }

  /* 6) 同类作品（主题 / 意象 / 作者），沿用原有横向比较逻辑 */
  const similar = pick(relatedEntries(entry, pool, 6), (r) => r.entry, 4);
  if (similar.length) {
    groups.push({
      kind: '同类作品·横向比较',
      hint: '主题或意象相近，放在一起比较是中考常见考法',
      items: similar.map((r) => ({ entry: r.entry, reason: r.reason })),
    });
  }

  return groups;
}
