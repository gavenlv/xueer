/**
 * 历史内容索引：把六册教材与两块备考内容的原始数据装配成 `Entry[]`，
 * 供列表页、练习引擎、错题本与统计统一消费。
 *
 * 结构与语文那一套完全一致（`src/data/chinese/index.ts`），因为上层的列表页、
 * 练习引擎、错题本、学一补多都只认 `Entry`：
 *   - 数据放在 `modules/*.ts`，由本文件**动态 import**（按册按需加载，历史六册全是长文本）；
 *   - 对外**仍是同步 API**：容器原地填充（`push` 不重新赋值），页面先 `useDataScope([...])`；
 *   - 校验脚本先 `await loadAll()`，因此既有断言写法不变。
 *
 * 历史比语文多了两块**备考专用**模块：`hist-topics`（中考专题：跨册串联与中外对比）
 * 与 `hist-exam`（整卷模拟考试）。它们不是教材单元，却是初三总复习最常用的入口，
 * 因此与教材模块同级，同样按需加载（不打开考试页就不下载卷子）。
 */

import type {
  Entry,
  GradeOrAll,
  HistoryEntry,
  HistoryModuleId,
  HistoryPaper,
  HistoryPaperEntry,
  HistoryTopic,
  HistoryTopicEntry,
  QuizQuestion,
} from '../../types';
import { matchesKeyword } from '../../lib/searchText';

/** 六册教材 + 两块备考内容的模块 id */
export const MODULE_IDS: HistoryModuleId[] = [
  'hist-7a',
  'hist-7b',
  'hist-8a',
  'hist-8b',
  'hist-9a',
  'hist-9b',
  'hist-topics',
  'hist-exam',
];

/** 教材模块（不含专题与模拟考试）——按册统计、按册跳转时用 */
export const TEXTBOOK_MODULE_IDS: HistoryModuleId[] = [
  'hist-7a',
  'hist-7b',
  'hist-8a',
  'hist-8b',
  'hist-9a',
  'hist-9b',
];

/* ------------------------------------------------------------------ */
/* 原地填充的容器（引用恒定，加载完成后同步可用）                        */
/* ------------------------------------------------------------------ */

export const allEntries: Entry[] = [];

/** 原始数据（按模块填充；供考情分析页与校验脚本使用） */
export const allTopics: HistoryTopic[] = [];
export const allPapers: HistoryPaper[] = [];

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
 * 材料题的设问也是题目：把每个设问转成一道 `short` 简答题入库。
 *
 * 这样「材料大题」不必另建一套练习机制——练习引擎、错题本、掌握度统计全都照旧，
 * 而设问自带的参考答案与踩分点正好对应 `short` 题型需要的 `rubric`。
 */
function materialQuestions(topic: HistoryTopic | HistoryPaper, moduleId: HistoryModuleId): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  for (const g of topic.materials ?? []) {
    for (const q of g.questions) {
      out.push({
        id: q.id,
        type: 'short',
        stem: q.stem,
        answer: q.answer,
        rubric: q.rubric,
        explanation: `【材料题】先读材料圈关键词，再按分值分点作答。本题考点：${(q.tags ?? []).join('、') || topic.title}`,
        tags: q.tags ?? [],
      });
    }
  }
  return out;
}

/** 教材 / 专题条目：标签第一位是单元（作为模块页的筛选主标签），其余是主题标签 */
function buildTopicEntries(moduleId: HistoryModuleId, topics: HistoryTopic[]): HistoryTopicEntry[] {
  return topics.map((t) => {
    const primary = t.unit ? [t.unit] : [];
    const rest = (t as HistoryTopic & { tags?: string[] }).tags ?? [];
    return {
      id: t.id,
      moduleId: moduleId as Exclude<HistoryModuleId, 'hist-exam'>,
      title: t.title,
      subtitle: [t.period, t.unit].filter(Boolean).join(' · '),
      grade: t.grade,
      tags: [...primary, ...rest],
      questions: dedupeQuestions([...t.questions, ...materialQuestions(t, moduleId)]),
      data: t,
    };
  });
}

/**
 * 模拟卷条目：标题带年份/套号，副标题写明结构与时长。
 *
 * 题目 = 卷内选择题 + 材料题设问：材料设问同样是「题目」，
 * 进题库后才能在错题本、掌握度统计与「回知识点」里被跟踪
 * （整卷考试页会自己按卷面顺序重排，不受这个顺序影响）。
 */
function buildPaperEntries(papers: HistoryPaper[]): HistoryPaperEntry[] {
  return papers.map((p) => ({
    id: p.id,
    moduleId: 'hist-exam',
    title: p.title,
    subtitle: `${p.totalScore} 分 · ${p.duration} 分钟 · ${p.questions.length} 题`,
    grade: p.grade,
    tags: ['模拟卷', ...(p as HistoryPaper & { tags?: string[] }).tags ?? []],
    questions: dedupeQuestions([...p.questions, ...materialQuestions(p, 'hist-exam')]),
    data: p,
  }));
}

/* ------------------------------------------------------------------ */
/* 按需加载                                                            */
/* ------------------------------------------------------------------ */

type LoaderResult = { entries: Entry[] };

const LOADERS: Record<HistoryModuleId, () => Promise<LoaderResult>> = {
  'hist-7a': async () => {
    const m = await import('./modules/m7a');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('hist-7a', m.topics) };
  },
  'hist-7b': async () => {
    const m = await import('./modules/m7b');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('hist-7b', m.topics) };
  },
  'hist-8a': async () => {
    const m = await import('./modules/m8a');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('hist-8a', m.topics) };
  },
  'hist-8b': async () => {
    const m = await import('./modules/m8b');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('hist-8b', m.topics) };
  },
  'hist-9a': async () => {
    const m = await import('./modules/m9a');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('hist-9a', m.topics) };
  },
  'hist-9b': async () => {
    const m = await import('./modules/m9b');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('hist-9b', m.topics) };
  },
  'hist-topics': async () => {
    const m = await import('./modules/topics');
    allTopics.push(...m.topics);
    return { entries: buildTopicEntries('hist-topics', m.topics) };
  },
  'hist-exam': async () => {
    const m = await import('./modules/papers');
    allPapers.push(...m.papers);
    return { entries: buildPaperEntries(m.papers) };
  },
};

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

export function isLoaded(moduleId: HistoryModuleId): boolean {
  return loaded.has(moduleId);
}

export function isScopeReady(scope: HistoryModuleId[]): boolean {
  return scope.every((s) => loaded.has(s));
}

export async function loadModules(scope: HistoryModuleId[]): Promise<void> {
  const need = [...new Set<string>(scope)].filter((s) => !loaded.has(s));
  if (!need.length) return;

  await Promise.all(
    need.map((s) => {
      const running = pending.get(s);
      if (running) return running;
      const p = LOADERS[s as HistoryModuleId]()
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

export function entriesOfModule(moduleId: HistoryModuleId): Entry[] {
  return allEntries.filter((e) => e.moduleId === moduleId);
}

export function findEntryById(id: string): Entry | undefined {
  return allEntries.find((e) => e.id === id);
}

export function filterEntries(
  moduleId: HistoryModuleId,
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

/** 模拟卷（考试页与「开始考试」用） */
export function papersOfModule(moduleId: HistoryModuleId = 'hist-exam'): HistoryPaper[] {
  return allPapers.filter((p) => p.id.startsWith(`${moduleId === 'hist-exam' ? 'paper' : moduleId}`));
}

export function findPaper(id: string): HistoryPaper | undefined {
  return allPapers.find((p) => p.id === id);
}

/**
 * 考情统计：把六册 + 专题的分层考点汇总起来，供「考点与考情分析」页使用。
 * 这是**由内容聚合出来的**，不是另维护的一份表，因此不会与条目里的考点脱节。
 */
export interface HistoryPointStat {
  level: '重点' | '次重点' | '了解';
  count: number;
  items: { id: string; title: string; moduleId: string; text: string }[];
}

/** 条目 id → 所属模块（考情页要按册展示） */
function moduleIdMap(): Map<string, string> {
  const m = new Map<string, string>();
  for (const e of allEntries) m.set(e.id, e.moduleId);
  return m;
}

export function pointStats(): HistoryPointStat[] {
  const levels: HistoryPointStat['level'][] = ['重点', '次重点', '了解'];
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

/** 命题角度清单（考情研判）：按册汇总，供考点分析页展示 */
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

/** 材料大题索引：哪一条内容里有几组、几问 */
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

/* ------------------------------- 统计 ---------------------------------- */

export const CONTENT_STATS = {
  get topics() {
    return allTopics.length;
  },
  get papers() {
    return allPapers.length;
  },
  get materials() {
    return allTopics.reduce((n, t) => n + (t.materials?.length ?? 0), 0);
  },
  get points() {
    return allTopics.reduce((n, t) => n + t.points.length, 0);
  },
};

/** 按册的条目数（模块页与首页统计用） */
export function countByModule(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of allEntries) out[e.moduleId] = (out[e.moduleId] ?? 0) + 1;
  return out;
}
