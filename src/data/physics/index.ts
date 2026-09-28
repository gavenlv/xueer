/**
 * 物理学科的数据装配层（模块 `phy-*`）。
 *
 * 与历史、道法同一套路：`modules/*.ts` 各导出一组 `topics` / `papers`，
 * 这里按模块**按需动态 import** 并装配成统一的 `Entry[]`——
 * 打开「电学」不会把「力学」那几 MB 一起下载下来。
 *
 * 与其它学科不同的是物理的**掌握判定**：`phy-` 前缀的模块用「全部习题过关才算掌握」
 * （见 `src/lib/progress.ts` 的 `masteryPolicyOf`），所以每个知识点的 `questions`
 * 是一份「验收清单」，校验器会强制每个知识点不少于 8 道题。
 */

import type {
  Entry,
  PhysicsEntry,
  PhysicsModuleId,
  PhysicsPaper,
  PhysicsPaperEntry,
  PhysicsTopic,
  PhysicsTopicEntry,
  QuizQuestion,
} from '../../types';

export const MODULE_IDS: PhysicsModuleId[] = [
  'phy-light',
  'phy-heat',
  'phy-mech',
  'phy-work',
  'phy-electric',
  'phy-magnet',
  'phy-experiment',
  'phy-exam',
];

/** 教材知识模块（不含实验操作与中考专题），校验器要求这几块都不能是空模块 */
export const TEXTBOOK_MODULE_IDS: PhysicsModuleId[] = [
  'phy-light',
  'phy-heat',
  'phy-mech',
  'phy-work',
  'phy-electric',
  'phy-magnet',
];

/* ------------------------------------------------------------------ */
/* 容器：原地填充，引用恒定（页面可以一直持有同一个数组引用）             */
/* ------------------------------------------------------------------ */

export const allEntries: PhysicsEntry[] = [];
export const allTopics: PhysicsTopic[] = [];
export const allPapers: PhysicsPaper[] = [];

/** 材料题与材料内设问也算练习：中考非选择题就是这种形态，必须能单独练、单独判**
 *
 * 设问本身常常不写 `tags`（作者把标签写在知识点上），这里统一补上知识点/模拟卷的标签：
 * 缺 tags 的题目进不了「考点专项」与统计，会变成一批看不见的孤儿题。
 */
function materialQuestions(t: PhysicsTopic | PhysicsPaper): QuizQuestion[] {
  const isPaper = 'sections' in t;
  const fallbackTags = isPaper
    ? ['模拟卷', ...((t as PhysicsPaper & { tags?: string[] }).tags ?? [])]
    : [(t as PhysicsTopic).unit, (t as PhysicsTopic).title];
  const out: QuizQuestion[] = [];
  for (const g of t.materials ?? []) {
    for (const q of g.questions) {
      out.push({
        id: q.id,
        type: 'short',
        stem: q.stem,
        // 材料题的题干就在材料里，练习时把材料带上，学生不用回详情页翻
        answer: q.answer,
        explanation: q.rubric?.length ? `踩分点：${q.rubric.join('；')}` : '对照参考答案自评。',
        rubric: q.rubric,
        tags: q.tags?.length ? q.tags : fallbackTags,
      });
    }
  }
  return out;
}

function dedupeQuestions(list: QuizQuestion[]): QuizQuestion[] {
  const seen = new Set<string>();
  const out: QuizQuestion[] = [];
  for (const q of list) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    out.push(q);
  }
  return out;
}

function buildTopicEntries(moduleId: PhysicsModuleId, topics: PhysicsTopic[]): PhysicsTopicEntry[] {
  return topics.map((t) => ({
    id: t.id,
    moduleId,
    title: t.title,
    subtitle: t.unit,
    grade: t.grade,
    // 标签第一位是单元/章节（模块页筛选主标签），其余是知识点标签
    tags: [t.unit, ...((t as PhysicsTopic & { tags?: string[] }).tags ?? [])],
    questions: dedupeQuestions([...t.questions, ...materialQuestions(t)]),
    data: t,
  }));
}

function buildPaperEntries(papers: PhysicsPaper[]): PhysicsPaperEntry[] {
  return papers.map((p) => ({
    id: p.id,
    moduleId: 'phy-exam',
    title: p.title,
    subtitle: `${p.totalScore} 分 · ${p.duration} 分钟 · ${p.sections.reduce((n, s) => n + s.count, 0)} 小题`,
    grade: p.grade,
    tags: ['模拟卷', ...((p as PhysicsPaper & { tags?: string[] }).tags ?? [])],
    questions: dedupeQuestions([...p.questions, ...materialQuestions(p)]),
    data: p,
  }));
}

/* ------------------------------------------------------------------ */
/* 按需加载                                                            */
/* ------------------------------------------------------------------ */

type LoaderResult = { entries: Entry[] };

const LOADERS: Record<PhysicsModuleId, () => Promise<LoaderResult>> = {
  'phy-light': async () => {
    const m = await import('./modules/light');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('phy-light', m.topics) };
  },
  'phy-heat': async () => {
    const m = await import('./modules/heat');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('phy-heat', m.topics) };
  },
  'phy-mech': async () => {
    const m = await import('./modules/mech');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('phy-mech', m.topics) };
  },
  'phy-work': async () => {
    const m = await import('./modules/work');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('phy-work', m.topics) };
  },
  'phy-electric': async () => {
    const m = await import('./modules/electric');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('phy-electric', m.topics) };
  },
  'phy-magnet': async () => {
    const m = await import('./modules/magnet');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('phy-magnet', m.topics) };
  },
  'phy-experiment': async () => {
    const m = await import('./modules/experiment');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('phy-experiment', m.topics) };
  },
  'phy-exam': async () => {
    const m = await import('./modules/papers');
    allPapers.push(...m.papers);
    // 与道法同构：本模块除整卷外还有「题型专题」知识条目，按数据形状区分渲染
    allTopics.push(...m.topics);
    return {
      entries: [...buildTopicEntries('phy-exam', m.topics), ...buildPaperEntries(m.papers)],
    };
  },
};

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

export function isLoaded(moduleId: PhysicsModuleId): boolean {
  return loaded.has(moduleId);
}

/** 加载指定模块；同一模块的并发请求会合并成一次 import
 *
 * `report` 逐个模块回报进度（分母=本次真要下载的块数，分子=已完成数），
 * 供「正在加载内容…」占位显示真实进度，见 `src/data/index.ts` 的 loadProgress。
 */
export function loadModules(
  ids: PhysicsModuleId[],
  report?: (total: number, done: number) => void,
): Promise<void> {
  // 已经在内存里的模块不计入分母，否则进度条一上来就「虚高」
  const need = ids.filter((id) => !loaded.has(id));
  if (need.length) report?.(need.length, 0);
  let done = 0;
  const tasks = need.map((id) => {
    const running = pending.get(id);
    const p =
      running ??
      LOADERS[id]()
        .then((r) => {
          if (r.entries.length) allEntries.push(...(r.entries as PhysicsEntry[]));
          loaded.add(id);
        })
        .finally(() => {
          pending.delete(id);
        });
    if (!running) pending.set(id, p);
    /**
     * 每完成一块就回报一次进度（分母 `need.length` 固定，分子自增）。
     *
     * 这里**必须用 `p.then(...)` 而不是写在 `LOADERS[id]().then(...)` 里面**：
     * `running` 分支复用的是一个已在飞的 Promise，只有挂在最外层，
     * 「本页要加载的每一块」才会各自回报一次，进度条不会停在 1/N 不动。
     */
    return p.then(() => report?.(need.length, ++done));
  });
  return Promise.all(tasks).then(() => undefined);
}

export function loadAll(): Promise<void> {
  return loadModules(MODULE_IDS);
}

export function isScopeReady(ids: string[]): boolean {
  return ids.every((id) => loaded.has(id));
}

/* ------------------------------------------------------------------ */
/* 查询                                                                */
/* ------------------------------------------------------------------ */

export function entriesOfModule(moduleId: PhysicsModuleId): PhysicsEntry[] {
  return allEntries.filter((e) => e.moduleId === moduleId);
}

export function filterEntries(opts: { grade?: string; tag?: string; q?: string }): PhysicsEntry[] {
  const q = opts.q?.trim().toLowerCase();
  return allEntries.filter((e) => {
    if (opts.grade && opts.grade !== 'all' && e.grade !== opts.grade && e.grade !== 'all') return false;
    if (opts.tag && !e.tags.includes(opts.tag)) return false;
    if (q && !`${e.title}${e.subtitle}${e.tags.join('')}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function findPaper(id: string): PhysicsPaper | undefined {
  return allPapers.find((p) => p.id === id);
}

/* ------------------------------------------------------------------ */
/* 考情聚合（模块页与「考点与考情」页用，数据全部由内容算出来）           */
/* ------------------------------------------------------------------ */

/** 知识点统计：多少条内容讲它、考过多少道题——用于找出「高频考点」与「薄弱考点」 */
export function pointStats(): { tag: string; entries: number; questions: number }[] {
  const map = new Map<string, { entries: Set<string>; questions: number }>();
  for (const t of allTopics) {
    for (const q of t.questions) {
      for (const tag of q.tags ?? []) {
        const cur = map.get(tag) ?? { entries: new Set<string>(), questions: 0 };
        cur.entries.add(t.id);
        cur.questions += 1;
        map.set(tag, cur);
      }
    }
  }
  return [...map.entries()]
    .map(([tag, v]) => ({ tag, entries: v.entries.size, questions: v.questions }))
    .sort((a, b) => b.questions - a.questions || a.tag.localeCompare(b.tag));
}

/** 全部命题角度（去重，供「考点与考情」页索引） */
export function examAngleList(): { topicId: string; topicTitle: string; angle: string; detail: string }[] {
  const out: { topicId: string; topicTitle: string; angle: string; detail: string }[] = [];
  for (const t of allTopics) {
    for (const a of t.examAngles ?? []) {
      out.push({ topicId: t.id, topicTitle: t.title, angle: a.angle, detail: a.detail });
    }
  }
  return out;
}

/** 材料大题索引 */
export function materialIndex(): { topicId: string; topicTitle: string; groups: number; asks: number }[] {
  return allTopics
    .filter((t) => (t.materials?.length ?? 0) > 0)
    .map((t) => ({
      topicId: t.id,
      topicTitle: t.title,
      groups: t.materials?.length ?? 0,
      asks: (t.materials ?? []).reduce((n, g) => n + g.questions.length, 0),
    }));
}

/** 内容规模统计（校验器与 README 用同一份数字，避免手抄） */
export function contentStats() {
  const questions = allTopics.reduce((n, t) => n + t.questions.length, 0);
  const figures = allTopics.reduce((n, t) => {
    const inSteps = t.steps.reduce((k, s) => k + (s.figure ? 1 : 0), 0);
    const inApps = t.apps.reduce((k, a) => k + (a.figure ? 1 : 0), 0);
    const inQs = t.questions.reduce((k, q) => k + (q.figure ? 1 : 0) + (q.answerFigure ? 1 : 0), 0);
    return n + inSteps + inApps + inQs;
  }, 0);
  return {
    topics: allTopics.length,
    papers: allPapers.length,
    questions,
    figures,
    materials: allTopics.reduce((n, t) => n + (t.materials?.length ?? 0), 0),
    asks: allTopics.reduce((n, t) => n + (t.materials ?? []).reduce((k, g) => k + g.questions.length, 0), 0),
  };
}
