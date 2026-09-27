/**
 * 化学学科的数据装配层（模块 `chem-*`）。
 *
 * 与物理同一套路：`modules/*.ts` 各导出 `topics` / `papers`，这里按模块**按需动态 import**
 * 并装配成统一的 `Entry[]`。化学与物理共用：
 *   - 图解 DSL（`SciFigure`：装置图、微观粒子、坐标图像、通用图元）；
 *   - **数值判分**（`answerModeFor` 对 `chem-` 前缀返回 `numeric`，避免 2.5 与 25 互判为对）；
 *   - **掌握判定**（`chem-` 与 `phy-` 一样是「全部题目过关才算掌握」，每个知识点 ≥8 题）。
 */

import type {
  ChemEntry,
  ChemPaper,
  ChemPaperEntry,
  ChemTopic,
  ChemTopicEntry,
  ChemistryModuleId,
  Entry,
  QuizQuestion,
} from '../../types';

export const MODULE_IDS: ChemistryModuleId[] = [
  'chem-matter',
  'chem-substance',
  'chem-acid',
  'chem-equation',
  'chem-experiment',
  'chem-exam',
];

/** 教材知识模块（不含中考专题），校验器要求这几块都不能是空模块 */
export const TEXTBOOK_MODULE_IDS: ChemistryModuleId[] = [
  'chem-matter',
  'chem-substance',
  'chem-acid',
  'chem-equation',
  'chem-experiment',
];

export const allEntries: ChemEntry[] = [];
export const allTopics: ChemTopic[] = [];
export const allPapers: ChemPaper[] = [];

/**
 * 材料题与材料内设问也算练习（中考非选择题就是这种形态）。
 * 设问本身常常不写 `tags`（作者把标签写在知识点上），这里统一补上，避免出现
 * 进不了「考点专项」与统计的孤儿题。
 */
function materialQuestions(t: ChemTopic | ChemPaper): QuizQuestion[] {
  const isPaper = 'sections' in t;
  const fallbackTags = isPaper
    ? ['模拟卷', ...((t as ChemPaper & { tags?: string[] }).tags ?? [])]
    : [(t as ChemTopic).unit, (t as ChemTopic).title];
  const out: QuizQuestion[] = [];
  for (const g of t.materials ?? []) {
    for (const q of g.questions) {
      out.push({
        id: q.id,
        type: 'short',
        stem: q.stem,
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

function buildTopicEntries(moduleId: ChemistryModuleId, topics: ChemTopic[]): ChemTopicEntry[] {
  return topics.map((t) => ({
    id: t.id,
    moduleId,
    title: t.title,
    subtitle: t.unit,
    grade: t.grade,
    // 标签第一位是单元/章节（模块页筛选主标签），其余是知识点标签
    tags: [t.unit, ...((t as ChemTopic & { tags?: string[] }).tags ?? [])],
    questions: dedupeQuestions([...t.questions, ...materialQuestions(t)]),
    data: t,
  }));
}

function buildPaperEntries(papers: ChemPaper[]): ChemPaperEntry[] {
  return papers.map((p) => ({
    id: p.id,
    moduleId: 'chem-exam',
    title: p.title,
    subtitle: `${p.totalScore} 分 · ${p.duration} 分钟 · ${p.sections.reduce((n, s) => n + s.count, 0)} 小题`,
    grade: p.grade,
    tags: ['模拟卷', ...((p as ChemPaper & { tags?: string[] }).tags ?? [])],
    questions: dedupeQuestions([...p.questions, ...materialQuestions(p)]),
    data: p,
  }));
}

type LoaderResult = { entries: Entry[] };

const LOADERS: Record<ChemistryModuleId, () => Promise<LoaderResult>> = {
  'chem-matter': async () => {
    const m = await import('./modules/matter');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('chem-matter', m.topics) };
  },
  'chem-substance': async () => {
    const m = await import('./modules/substance');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('chem-substance', m.topics) };
  },
  'chem-acid': async () => {
    const m = await import('./modules/acid');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('chem-acid', m.topics) };
  },
  'chem-equation': async () => {
    const m = await import('./modules/equation');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('chem-equation', m.topics) };
  },
  'chem-experiment': async () => {
    const m = await import('./modules/experiment');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('chem-experiment', m.topics) };
  },
  'chem-exam': async () => {
    const m = await import('./modules/papers');
    allPapers.push(...m.papers);
    // 与物理/道法同构：本模块除整卷外还有「题型专题」知识条目，按数据形状区分渲染
    allTopics.push(...m.topics);
    return {
      entries: [...buildTopicEntries('chem-exam', m.topics), ...buildPaperEntries(m.papers)],
    };
  },
};

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

export function isLoaded(moduleId: ChemistryModuleId): boolean {
  return loaded.has(moduleId);
}

export function loadModules(ids: ChemistryModuleId[]): Promise<void> {
  const tasks = ids.map((id) => {
    if (loaded.has(id)) return Promise.resolve();
    const running = pending.get(id);
    if (running) return running;
    const p = LOADERS[id]()
      .then((r) => {
        if (r.entries.length) allEntries.push(...(r.entries as ChemEntry[]));
        loaded.add(id);
      })
      .finally(() => {
        pending.delete(id);
      });
    pending.set(id, p);
    return p;
  });
  return Promise.all(tasks).then(() => undefined);
}

export function loadAll(): Promise<void> {
  return loadModules(MODULE_IDS);
}

export function isScopeReady(ids: string[]): boolean {
  return ids.every((id) => loaded.has(id));
}

export function entriesOfModule(moduleId: ChemistryModuleId): ChemEntry[] {
  return allEntries.filter((e) => e.moduleId === moduleId);
}

export function findPaper(id: string): ChemPaper | undefined {
  return allPapers.find((p) => p.id === id);
}

/* ------------------------------------------------------------------ */
/* 考情聚合（模块页与考点页用，数字全部由内容算出来）                    */
/* ------------------------------------------------------------------ */

/** 化学用语（化学式、方程式、现象、操作）在题目里出现的频次 → 找出高频考点 */
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

export function examAngleList(): { topicId: string; topicTitle: string; angle: string; detail: string }[] {
  const out: { topicId: string; topicTitle: string; angle: string; detail: string }[] = [];
  for (const t of allTopics) {
    for (const a of t.examAngles ?? []) {
      out.push({ topicId: t.id, topicTitle: t.title, angle: a.angle, detail: a.detail });
    }
  }
  return out;
}

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

/** 化学方程式索引：按反应类型/知识点列出全部方程式，便于集中默写 */
export function equationIndex(): { topicId: string; topicTitle: string; equations: number }[] {
  return allTopics
    .filter((t) => (t.equations?.length ?? 0) > 0)
    .map((t) => ({ topicId: t.id, topicTitle: t.title, equations: t.equations?.length ?? 0 }));
}

/** 内容规模统计（校验器与 README 用同一份数字，避免手抄） */
export function contentStats() {
  const questions = allTopics.reduce((n, t) => n + t.questions.length, 0);
  const figures = allTopics.reduce((n, t) => {
    const inSteps = t.steps.reduce((k, s) => k + (s.figure ? 1 : 0), 0);
    const inApps = t.apps.reduce((k, a) => k + (a.figure ? 1 : 0), 0);
    const inExp = (t.experiments ?? []).reduce((k, e) => k + (e.figure ? 1 : 0), 0);
    const inQs = t.questions.reduce((k, q) => k + (q.figure ? 1 : 0) + (q.answerFigure ? 1 : 0), 0);
    return n + inSteps + inApps + inExp + inQs;
  }, 0);
  return {
    topics: allTopics.length,
    papers: allPapers.length,
    questions,
    figures,
    equations: allTopics.reduce((n, t) => n + (t.equations?.length ?? 0), 0),
    experiments: allTopics.reduce((n, t) => n + (t.experiments?.length ?? 0), 0),
    materials: allTopics.reduce((n, t) => n + (t.materials?.length ?? 0), 0),
    asks: allTopics.reduce((n, t) => n + (t.materials ?? []).reduce((k, g) => k + g.questions.length, 0), 0),
  };
}
