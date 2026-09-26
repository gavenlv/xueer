/**
 * 道德与法治内容索引：按**教材六块 + 时政专题 + 整卷模拟**装配，
 * 与语文、历史、英语同一套按需加载模式（数据在 `modules/*.ts`，页面用 `useDataScope` 声明）。
 *
 * 模块划分沿用学科注册表里已排好的六个：
 *   pol-growth  七年级·成长与自我
 *   pol-moral   八年级·道德与交往
 *   pol-law     八年级·法治与规则
 *   pol-nation  九年级·国情与发展
 *   pol-current 时政热点专题
 *   pol-exam    中考专题与整卷模拟（按广州官方结构命题）
 */

import type {
  Entry,
  GradeOrAll,
  PoliticsModuleId,
  PoliticsPaper,
  PoliticsPaperEntry,
  PoliticsTopic,
  PoliticsTopicEntry,
  QuizQuestion,
} from '../../types';
import { matchesKeyword } from '../../lib/searchText';

export const MODULE_IDS: PoliticsModuleId[] = [
  'pol-growth',
  'pol-moral',
  'pol-law',
  'pol-nation',
  'pol-current',
  'pol-exam',
];

/** 教材知识模块（不含时政专题与整卷模拟） */
export const TEXTBOOK_MODULE_IDS: PoliticsModuleId[] = [
  'pol-growth',
  'pol-moral',
  'pol-law',
  'pol-nation',
];

/* ------------------------------------------------------------------ */
/* 原地填充的容器（引用恒定）                                            */
/* ------------------------------------------------------------------ */

export const allEntries: Entry[] = [];
export const allTopics: PoliticsTopic[] = [];
export const allPapers: PoliticsPaper[] = [];

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

/**
 * 材料题的设问也是题目：转成 `short` 简答题入库。
 *
 * 这样「阅读材料，回答问题」不必另建一套练习机制——练习引擎、错题本、掌握度统计照旧，
 * 而设问自带的参考答案与踩分点正好对应 `short` 题型需要的 `rubric`。
 */
function materialQuestions(topic: PoliticsTopic | PoliticsPaper): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  for (const g of topic.materials ?? []) {
    for (const q of g.questions) {
      out.push({
        id: q.id,
        type: 'short',
        stem: q.stem,
        answer: q.answer,
        rubric: q.rubric,
        explanation: `【材料题】先读材料圈关键词，再按分值分点作答。本题考点：${(q.tags ?? []).join('、') || '见参考答案'}`,
        tags: q.tags ?? [],
      });
    }
  }
  return out;
}

function buildTopicEntries(
  moduleId: PoliticsModuleId,
  topics: PoliticsTopic[],
): PoliticsTopicEntry[] {
  return topics.map((t) => ({
    id: t.id,
    moduleId,
    title: t.title,
    subtitle: t.unit,
    grade: t.grade,
    // 标签第一位是单元/专题分组（模块页筛选主标签），其余是主题标签
    tags: [t.unit, ...((t as PoliticsTopic & { tags?: string[] }).tags ?? [])],
    questions: dedupeQuestions([...t.questions, ...materialQuestions(t)]),
    data: t,
  }));
}

function buildPaperEntries(papers: PoliticsPaper[]): PoliticsPaperEntry[] {
  return papers.map((p) => ({
    id: p.id,
    moduleId: 'pol-exam',
    title: p.title,
    subtitle: `${p.totalScore} 分 · ${p.duration} 分钟 · ${p.sections.reduce((n, s) => n + s.count, 0)} 小题`,
    grade: p.grade,
    tags: ['模拟卷', ...((p as PoliticsPaper & { tags?: string[] }).tags ?? [])],
    questions: dedupeQuestions([...p.questions, ...materialQuestions(p)]),
    data: p,
  }));
}

/* ------------------------------------------------------------------ */
/* 按需加载                                                            */
/* ------------------------------------------------------------------ */

type LoaderResult = { entries: Entry[] };

const LOADERS: Record<PoliticsModuleId, () => Promise<LoaderResult>> = {
  'pol-growth': async () => {
    const m = await import('./modules/growth');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('pol-growth', m.topics) };
  },
  'pol-moral': async () => {
    const m = await import('./modules/moral');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('pol-moral', m.topics) };
  },
  'pol-law': async () => {
    const m = await import('./modules/law');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('pol-law', m.topics) };
  },
  'pol-nation': async () => {
    const m = await import('./modules/nation');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('pol-nation', m.topics) };
  },
  'pol-current': async () => {
    const m = await import('./modules/current');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('pol-current', m.topics) };
  },
  'pol-exam': async () => {
    const m = await import('./modules/papers');
    allPapers.push(...m.papers);
    // 本模块除了整卷模拟，还有「题型专题」知识条目（卷面时间分配、非选择题答题模板、
    // 材料读题与取材）。它们与卷子共用 pol-exam 这个 moduleId，渲染时按数据形状区分。
    allTopics.push(...m.topics);
    return {
      entries: [
        ...buildTopicEntries('pol-exam', m.topics),
        ...buildPaperEntries(m.papers),
      ],
    };
  },
};

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

export function isLoaded(moduleId: PoliticsModuleId): boolean {
  return loaded.has(moduleId);
}

export function isScopeReady(scope: PoliticsModuleId[]): boolean {
  return scope.every((s) => loaded.has(s));
}

export async function loadModules(scope: PoliticsModuleId[]): Promise<void> {
  const need = [...new Set<string>(scope)].filter((s) => !loaded.has(s));
  if (!need.length) return;

  await Promise.all(
    need.map((s) => {
      const running = pending.get(s);
      if (running) return running;
      const p = LOADERS[s as PoliticsModuleId]()
        .then((r) => {
          if (r.entries.length) allEntries.push(...r.entries);
          loaded.add(s);
        })
        .finally(() => pending.delete(s));
      pending.set(s, p);
      return p;
    }),
  );
}

export async function loadAll(): Promise<void> {
  await loadModules(MODULE_IDS);
}

/* ------------------------------- 查询 API ------------------------------- */

export function entriesOfModule(moduleId: PoliticsModuleId): Entry[] {
  return allEntries.filter((e) => e.moduleId === moduleId);
}

export function findEntryById(id: string): Entry | undefined {
  return allEntries.find((e) => e.id === id);
}

export function filterEntries(
  moduleId: PoliticsModuleId,
  opts: { grade?: GradeOrAll; keyword?: string; tag?: string } = {},
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

export function papersOfModule(): PoliticsPaper[] {
  return allPapers;
}

/** 按 id 取卷子（考试页跨学科查找用） */
export function findPaper(id: string): PoliticsPaper | undefined {
  return allPapers.find((p) => p.id === id);
}

/* --------------------------- 考点与考情聚合 --------------------------- */

/** 条目 id → 所属模块 */
function moduleIdMap(): Map<string, string> {
  const m = new Map<string, string>();
  for (const e of allEntries) m.set(e.id, e.moduleId);
  return m;
}

/** 分层考点统计（考点与考情页用，由内容聚合而来，不会与课文脱节） */
export function pointStats(): {
  level: '重点' | '次重点' | '了解';
  count: number;
  items: { id: string; title: string; moduleId: string; text: string }[];
}[] {
  const levels: ('重点' | '次重点' | '了解')[] = ['重点', '次重点', '了解'];
  const owner = moduleIdMap();
  return levels.map((level) => {
    const items = allTopics.flatMap((t) =>
      t.points
        .filter((p) => p.level === level)
        .map((p) => ({
          id: t.id,
          title: t.title,
          moduleId: owner.get(t.id) ?? '',
          text: p.text,
        })),
    );
    return { level, count: items.length, items };
  });
}

/** 命题角度汇总 */
export function examAngleList(): {
  moduleId: string;
  topicId: string;
  topicTitle: string;
  angle: string;
  years?: string;
  detail: string;
}[] {
  const owner = moduleIdMap();
  return allTopics.flatMap((t) =>
    (t.examAngles ?? []).map((a) => ({
      moduleId: owner.get(t.id) ?? '',
      topicId: t.id,
      topicTitle: t.title,
      angle: a.angle,
      years: a.years,
      detail: a.detail,
    })),
  );
}

/** 材料大题索引 */
export function materialIndex(): { id: string; title: string; moduleId: string; groups: number; asks: number }[] {
  const owner = moduleIdMap();
  return allTopics
    .filter((t) => (t.materials?.length ?? 0) > 0)
    .map((t) => ({
      id: t.id,
      title: t.title,
      moduleId: owner.get(t.id) ?? '',
      groups: t.materials?.length ?? 0,
      asks: (t.materials ?? []).reduce((n, m) => n + m.questions.length, 0),
    }));
}

/** 必背金句汇总（道法特有：材料题得分靠规范表述） */
export function keySentenceStats(): { count: number; byModule: Record<string, number> } {
  const owner = moduleIdMap();
  const byModule: Record<string, number> = {};
  let count = 0;
  for (const t of allTopics) {
    const n = t.keySentences?.length ?? 0;
    count += n;
    const mid = owner.get(t.id) ?? '';
    byModule[mid] = (byModule[mid] ?? 0) + n;
  }
  return { count, byModule };
}

/* ------------------------------- 统计 ---------------------------------- */

export const CONTENT_STATS = {
  get topics() {
    return allTopics.length;
  },
  get papers() {
    return allPapers.length;
  },
  get hotspots() {
    return allTopics.reduce((n, t) => n + (t.hotspots?.length ?? 0), 0);
  },
  get keySentences() {
    return keySentenceStats().count;
  },
};
