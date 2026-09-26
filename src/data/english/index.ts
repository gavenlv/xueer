/**
 * 英语内容索引：按**广州中考知识模块**装配（词汇 / 语法 / 阅读 / 听说 / 写作 /
 * 中考专题 / 整卷模拟），与语文、历史同一套按需加载模式。
 *
 * 为什么不按教材组织：广州初中英语用沪教牛津版（上海版）教材，但英语复习最需要的
 * 不是「跟着课本第几单元走」，而是**按中考考什么来组织**——学生要的是
 * 「我的时态还不行」「近义词辨析总错」，而不是「我今天该看 Unit 5」。
 * 因此每个模块对应一个中考知识板块，条目内部再按知识点分组（`unit` 字段）。
 */

import type {
  EnglishEntry,
  EnglishKnowledge,
  EnglishModuleId,
  EnglishPaper,
  EnglishPaperEntry,
  EnglishKnowledgeEntry,
  Entry,
  GradeOrAll,
  QuizQuestion,
} from '../../types';
import { matchesKeyword } from '../../lib/searchText';

export const MODULE_IDS: EnglishModuleId[] = [
  'eng-vocab',
  'eng-grammar',
  'eng-reading',
  'eng-listening',
  'eng-writing',
  'eng-topics',
  'eng-exam',
];

/** 知识模块（不含整卷模拟） */
export const KNOWLEDGE_MODULE_IDS: EnglishModuleId[] = MODULE_IDS.filter((m) => m !== 'eng-exam');

/* ------------------------------------------------------------------ */
/* 原地填充的容器（引用恒定）                                            */
/* ------------------------------------------------------------------ */

export const allEntries: Entry[] = [];
export const allKnowledge: EnglishKnowledge[] = [];
export const allPapers: EnglishPaper[] = [];

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
 * 知识条目的题目 = 自己的题 + 各语篇/听说材料里挂的题。
 *
 * 把语篇题目一并入库，学生才能在练习、错题本与统计里跟踪它们——
 * 否则阅读题的错题永远进不了错题本（语文阅读模块当初就是这么踩过来的）。
 */
function knowledgeQuestions(d: EnglishKnowledge): QuizQuestion[] {
  const fromPassages = (d.passages ?? []).flatMap((p) => p.questions ?? []);
  const fromScripts = (d.scripts ?? []).flatMap((s) => s.tasks ?? []);
  return dedupeQuestions([...(d.questions ?? []), ...fromPassages, ...fromScripts]);
}

function buildKnowledgeEntries(
  moduleId: EnglishModuleId,
  items: EnglishKnowledge[],
): EnglishKnowledgeEntry[] {
  return items.map((d) => ({
    id: d.id,
    moduleId: moduleId as Exclude<EnglishModuleId, 'eng-exam'>,
    title: d.title,
    subtitle: [d.unit, d.enTitle].filter(Boolean).join(' · '),
    grade: d.grade,
    // 标签第一位是知识分组（模块页筛选主标签），英文知识点名作为第二标签便于搜索
    tags: [d.unit, ...(d.enTitle ? [d.enTitle] : [])],
    questions: knowledgeQuestions(d),
    data: d,
  }));
}

function buildPaperEntries(papers: EnglishPaper[]): EnglishPaperEntry[] {
  return papers.map((p) => ({
    id: p.id,
    moduleId: 'eng-exam',
    title: p.title,
    subtitle: `${p.totalScore} 分${p.speakingScore ? ` + 听说 ${p.speakingScore} 分` : ''} · ${p.duration} 分钟 · ${p.questions.length} 题`,
    grade: p.grade,
    tags: ['模拟卷', ...((p as EnglishPaper & { tags?: string[] }).tags ?? [])],
    questions: dedupeQuestions(p.questions),
    data: p,
  }));
}

/* ------------------------------------------------------------------ */
/* 按需加载                                                            */
/* ------------------------------------------------------------------ */

type LoaderResult = { entries: Entry[] };

const LOADERS: Record<EnglishModuleId, () => Promise<LoaderResult>> = {
  'eng-vocab': async () => {
    const m = await import('./modules/vocab');
    allKnowledge.push(...m.topics);
    return { entries: buildKnowledgeEntries('eng-vocab', m.topics) };
  },
  'eng-grammar': async () => {
    const m = await import('./modules/grammar');
    allKnowledge.push(...m.topics);
    return { entries: buildKnowledgeEntries('eng-grammar', m.topics) };
  },
  'eng-reading': async () => {
    const m = await import('./modules/reading');
    allKnowledge.push(...m.topics);
    return { entries: buildKnowledgeEntries('eng-reading', m.topics) };
  },
  'eng-listening': async () => {
    const m = await import('./modules/listening');
    allKnowledge.push(...m.topics);
    return { entries: buildKnowledgeEntries('eng-listening', m.topics) };
  },
  'eng-writing': async () => {
    const m = await import('./modules/writing');
    allKnowledge.push(...m.topics);
    return { entries: buildKnowledgeEntries('eng-writing', m.topics) };
  },
  'eng-topics': async () => {
    const m = await import('./modules/topics');
    allKnowledge.push(...m.topics);
    return { entries: buildKnowledgeEntries('eng-topics', m.topics) };
  },
  'eng-exam': async () => {
    const m = await import('./modules/papers');
    allPapers.push(...m.papers);
    return { entries: buildPaperEntries(m.papers) };
  },
};

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();

export function isLoaded(moduleId: EnglishModuleId): boolean {
  return loaded.has(moduleId);
}

export function isScopeReady(scope: EnglishModuleId[]): boolean {
  return scope.every((s) => loaded.has(s));
}

export async function loadModules(scope: EnglishModuleId[]): Promise<void> {
  const need = [...new Set<string>(scope)].filter((s) => !loaded.has(s));
  if (!need.length) return;

  await Promise.all(
    need.map((s) => {
      const running = pending.get(s);
      if (running) return running;
      const p = LOADERS[s as EnglishModuleId]()
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

export function entriesOfModule(moduleId: EnglishModuleId): Entry[] {
  return allEntries.filter((e) => e.moduleId === moduleId);
}

export function findEntryById(id: string): Entry | undefined {
  return allEntries.find((e) => e.id === id);
}

export function filterEntries(
  moduleId: EnglishModuleId,
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
export function findPaper(id: string): EnglishPaper | undefined {
  return allPapers.find((p) => p.id === id);
}

export function papersOfModule(): EnglishPaper[] {
  return allPapers;
}

/* ------------------------------- 统计 ---------------------------------- */

export const CONTENT_STATS = {
  get topics() {
    return allKnowledge.length;
  },
  get papers() {
    return allPapers.length;
  },
  get words() {
    return allKnowledge.reduce((n, t) => n + (t.affixes ?? []).reduce((m, a) => m + a.examples.length, 0), 0);
  },
  get confusables() {
    return allKnowledge.reduce((n, t) => n + (t.confusables ?? []).length, 0);
  },
  get passages() {
    return allKnowledge.reduce((n, t) => n + (t.passages ?? []).length, 0);
  },
  get scripts() {
    return allKnowledge.reduce((n, t) => n + (t.scripts ?? []).length, 0);
  },
};
