/**
 * 语文内容索引：把六大模块的原始数据统一装配成 `Entry[]`，
 * 供列表页、练习引擎、错题本与统计统一消费。
 */

import type {
  ClassicalEntry,
  ClassicalText,
  Entry,
  Extension,
  GradeOrAll,
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

import { poems7a } from './poems/j7a';
import { poems7b } from './poems/j7b';
import { poems8a } from './poems/j8a';
import { poems8b } from './poems/j8b';
import { poems8bExtra } from './poems/j8b-extra';
import { poems9a } from './poems/j9a';
import { poems9b } from './poems/j9b';
import { poemsExtra } from './poems/j-extra';
import { poemsMore1 } from './poems/j-more-1';
import { vocabItems as vocabBase } from './vocab';
import { vocabRhetoric } from './vocab-rhetoric';
import { classicalTexts as classicalBase } from './classical';
import { classicalExtra } from './classical-extra';
import { readingPassages as readingBase } from './reading';
import { readingGrade7 } from './reading-7';
import { readingGrade8 } from './reading-8';
import { readingGrade9 } from './reading-9';
import { readingMore78 } from './reading-more-78';
import { readingMore9 } from './reading-more-9';
import { writingLessons as writingBase } from './writing';
import { writingExtra } from './writing-extra';
import { writingTopics } from './writing-topics';
import { writingUpgrade } from './writing-upgrade';
import { writingSamples } from './writing-samples';
import { literatureItems as literatureBase } from './literature';
import { literatureExtra } from './literature-extra';
// 课内古诗文作者的「作家作品」常识：直接服务「学一补多」的按作者关联
import { literatureAuthorsTang } from './literature-authors-tang';
import { literatureAuthorsSong } from './literature-authors-song';
import { literatureAuthorsClassical1 } from './literature-authors-classical1';
import { literatureAuthorsClassical2 } from './literature-authors-classical2';
// 诗歌源头的体裁常识：《诗经》、楚辞、乐府与汉魏古诗
import { literatureExtraGenres } from './literature-extra-genres';
import { bookShortQuestions } from './guangzhou-questions';
import { mindMapsBooks } from './mindmaps-books';
import { mindMapsClassical } from './mindmaps-classical';
import { mindMapsSkills } from './mindmaps-skills';
import { extensionsBooks } from './extensions-books';
import { extensionsOthers } from './extensions-others';

export const MODULE_IDS: ModuleId[] = [
  'poems',
  'vocab',
  'classical',
  'reading',
  'writing',
  'literature',
];

/* ----------------------------- 原始数据汇总 ----------------------------- */

export const allPoems: Poem[] = [
  ...poems7a,
  ...poems7b,
  ...poems8a,
  ...poems8b,
  // 八下「课外古诗词诵读」第一组补齐（《式微》《子衿》《望洞庭湖赠张丞相》）
  ...poems8bExtra,
  ...poems9a,
  ...poems9b,
  // 各册「课外古诗词诵读」的补齐篇目（跨册次，故统一放在册次分组之后）
  ...poemsMore1,
  // 2022 课标必背但原题库遗漏的 7 首
  ...poemsExtra,
];

/** 文言文 = 原题库 + 新教材（2024 修订版）补充篇目 */
export const classicalTexts: ClassicalText[] = [...classicalBase, ...classicalExtra];

/** 文学常识与名著 = 原题库 + 新教材新增名著 + 课内作者的作家作品常识 + 诗歌源头体裁常识 */
export const literatureItems: LiteratureItem[] = [
  ...literatureBase,
  ...literatureExtra,
  ...literatureAuthorsTang,
  ...literatureAuthorsSong,
  ...literatureAuthorsClassical1,
  ...literatureAuthorsClassical2,
  ...literatureExtraGenres,
];

/** 字词基础 = 原题库 + 修辞手法（新教材 8 种修辞全部进入补白） */
export const vocabItems: VocabItem[] = [...vocabBase, ...vocabRhetoric];

/** 作文训练 = 原题库 + 新教材新增/调整的写作专题 */
export const writingLessons: WritingLesson[] = [
  ...writingBase,
  ...writingExtra,
  // 中考导向的三个大块：题库、升格训练、范文库
  ...writingTopics,
  ...writingUpgrade,
  ...writingSamples,
];

/** 现代文阅读 = 原题库 + 七/八/九年级补充选文 */
export const readingPassages: ReadingPassage[] = [
  ...readingBase,
  ...readingGrade7,
  ...readingGrade8,
  ...readingGrade9,
  ...readingMore78,
  ...readingMore9,
];

/* -------------------------------- 工具 ---------------------------------- */

function joinSearch(...parts: (string | string[] | undefined)[]): string {
  const buf: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (Array.isArray(p)) buf.push(p.join(''));
    else buf.push(p);
  }
  return buf.join(' ').toLowerCase();
}

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

/* ------------------------------ 装配 Entry ------------------------------ */

const poemEntries: PoemEntry[] = allPoems.map((p) => ({
  id: p.id,
  moduleId: 'poems',
  title: p.title,
  subtitle: [p.dynasty, p.author].filter(Boolean).join('·'),
  grade: p.grade,
  tags: [p.genre, ...(p.tags ?? [])],
  searchText: joinSearch(p.title, p.author, p.dynasty, p.lines, p.tags),
  // 古诗词本身不预置题目：默写与赏析练习由 PoemDetail 现场生成
  questions: [],
  data: p,
}));

const vocabEntries: VocabEntry[] = vocabItems.map((v) => ({
  id: v.id,
  moduleId: 'vocab',
  title: v.term,
  subtitle: [v.category, v.pinyin].filter(Boolean).join(' · '),
  grade: v.grade,
  tags: [v.category, ...(v.questions.flatMap((q) => q.tags ?? []) ?? [])].slice(0, 6),
  searchText: joinSearch(
    v.term,
    v.pinyin,
    v.meaning,
    v.pitfall,
    v.example,
    v.confusable?.map((c) => `${c.term}${c.meaning}`),
  ),
  questions: dedupeQuestions(v.questions ?? []),
  data: v,
}));

const classicalEntries: ClassicalEntry[] = classicalTexts.map((c) => ({
  id: c.id,
  moduleId: 'classical',
  title: c.title,
  subtitle: [c.dynasty, c.author].filter(Boolean).join('·'),
  grade: c.grade,
  tags: ['文言文', ...c.grammar.map((g) => g.type)].slice(0, 6),
  searchText: joinSearch(c.title, c.author, c.source, c.paragraphs, c.annotations.map((a) => a.word)),
  questions: dedupeQuestions(c.questions ?? []),
  data: c,
}));

const readingEntries: ReadingEntry[] = readingPassages.map((r) => ({
  id: r.id,
  moduleId: 'reading',
  title: r.title,
  subtitle: [r.genre, r.author].filter(Boolean).join(' · '),
  grade: r.grade,
  tags: [r.genre],
  searchText: joinSearch(r.title, r.genre, r.author, r.paragraphs),
  questions: dedupeQuestions(r.questions ?? []),
  data: r,
}));

const writingEntries: WritingEntry[] = writingLessons.map((w) => ({
  id: w.id,
  moduleId: 'writing',
  title: w.title,
  subtitle: w.category,
  grade: w.grade,
  tags: [w.category],
  searchText: joinSearch(w.title, w.summary, w.category, w.content),
  questions: dedupeQuestions(w.questions ?? []),
  data: w,
}));

const literatureEntries: LiteratureEntry[] = literatureItems.map((l) => ({
  id: l.id,
  moduleId: 'literature',
  title: l.title,
  subtitle: l.book ? `${l.book.author} · ${l.category}` : l.category,
  grade: l.grade,
  tags: [l.category],
  searchText: joinSearch(
    l.title,
    l.category,
    l.book?.name,
    l.book?.author,
    l.keyPoints,
    l.content,
  ),
  // 并入广州中考「整本书阅读」附加题风格的简答题
  questions: dedupeQuestions([...(l.questions ?? []), ...(bookShortQuestions[l.id] ?? [])]),
  data: l,
}));

/** 全部条目（语文） */
export const allEntries: Entry[] = [
  ...poemEntries,
  ...vocabEntries,
  ...classicalEntries,
  ...readingEntries,
  ...writingEntries,
  ...literatureEntries,
];

/* ------------------------- 思维导图 / 拓展阅读 ------------------------- */

/** 全部思维导图 */
export const mindMaps: MindMap[] = [
  ...mindMapsBooks,
  ...mindMapsClassical,
  ...mindMapsSkills,
];

/** 全部拓展阅读 */
export const extensions: Extension[] = [...extensionsBooks, ...extensionsOthers];

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

/** id -> Entry 映射，页面里做多次查找时用 */
export const entryIndex: Map<string, Entry> = new Map(allEntries.map((e) => [e.id, e]));

/** 按题目 id 反查所属条目与题目 */
export function findQuestion(
  questionId: string,
): { entry: Entry; question: import('../../types').QuizQuestion } | undefined {
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
    if (kw && !e.searchText.includes(kw)) return false;
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

  const extras = [...theme.entries()]
    .filter(([t, n]) => n >= 2 && !primary.includes(t))
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);

  return [...primary, ...extras];
}

/** 全库检索 */
export function searchAll(keyword: string): Entry[] {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return [];
  return allEntries.filter((e) => e.searchText.includes(kw) || e.title.toLowerCase().includes(kw));
}

export function countByGrade(moduleId: ModuleId): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of entriesOfModule(moduleId)) {
    const g: GradeOrAll = e.grade;
    out[g] = (out[g] ?? 0) + 1;
  }
  return out;
}

/** 模块全部题目 */
export function questionsOfModule(moduleId: ModuleId): { q: QuizQuestion; source: Entry }[] {
  const out: { q: QuizQuestion; source: Entry }[] = [];
  for (const e of entriesOfModule(moduleId)) {
    for (const q of e.questions) out.push({ q, source: e });
  }
  return out;
}

/** 内容量统计，用于首页展示 */
export const contentStats = {
  poems: allPoems.length,
  vocab: vocabItems.length,
  classical: classicalTexts.length,
  reading: readingPassages.length,
  writing: writingLessons.length,
  literature: literatureItems.length,
  questions:
    vocabEntries.reduce((n, e) => n + e.questions.length, 0) +
    classicalEntries.reduce((n, e) => n + e.questions.length, 0) +
    readingEntries.reduce((n, e) => n + e.questions.length, 0) +
    writingEntries.reduce((n, e) => n + e.questions.length, 0) +
    literatureEntries.reduce((n, e) => n + e.questions.length, 0),
};
