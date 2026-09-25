/**
 * 数据校验入口：检查全部学科内容数据的结构完整性与一致性。
 * 通过 `pnpm run validate` 运行（先由 vite 打包成 Node 可执行的 ESM）。
 *
 * 覆盖范围：所有学科的所有模块、全部题目、思维导图、拓展阅读，以及判分逻辑自测。
 */

declare const process: { exitCode: number };

import katex from 'katex';
import { allEntries, contentStats, entryIndex, mindMaps, extensions } from '../src/data';
import { allPoems } from '../src/data/chinese';
import { SUBJECTS } from '../src/data/subjects';
import { makeReciteQuestions } from '../src/lib/quiz';
import { relatedEntries, supplementsOf } from '../src/lib/relations';
import { answerModeFor, checkFill } from '../src/lib/utils';
import { applyAnswerToProgress } from '../src/lib/progress';
import {
  RECITE_INTERVALS,
  applyRecite,
  daysUntilDue,
  isDue,
} from '../src/lib/recite';
import type { Entry, MindNode, ModuleId, QuizQuestion } from '../src/types';

/** 全部学科的模块 id（校验器必须覆盖所有学科，不能只看语文） */
const ALL_MODULE_IDS = SUBJECTS.flatMap((s) => s.modules.map((m) => m.id)) as ModuleId[];

const errors: string[] = [];
const warnings: string[] = [];

const VALID_GRADES = new Set(['7a', '7b', '8a', '8b', '9a', '9b', 'all']);
const VALID_DIFF = new Set([1, 2, 3]);

function err(msg: string) {
  errors.push(msg);
}

function warn(msg: string) {
  warnings.push(msg);
}

/* ------------------------ 题目结构校验 ------------------------ */

function checkQuestions(questions: QuizQuestion[], where: string, seenIds: Set<string>) {
  if (!Array.isArray(questions)) {
    err(`${where}: questions 不是数组`);
    return;
  }
  for (const q of questions) {
    const at = `${where} → 题目 ${q?.id ?? '(缺少 id)'}`;
    if (!q || typeof q !== 'object') {
      err(`${where}: 存在空题目`);
      continue;
    }
    if (!q.id) err(`${at}: 缺少 id`);
    else if (seenIds.has(q.id)) err(`${at}: 题目 id 重复`);
    else seenIds.add(q.id);

    if (q.type !== 'choice' && q.type !== 'fill' && q.type !== 'short') {
      err(`${at}: type 非法（${String(q.type)}）`);
      continue;
    }
    if (!q.stem || !q.stem.trim()) err(`${at}: 题干为空`);
    if (!q.explanation || !q.explanation.trim()) err(`${at}: 缺少解析`);
    if (!q.answer || !String(q.answer).trim()) err(`${at}: 缺少答案`);
    if (q.difficulty !== undefined && !VALID_DIFF.has(q.difficulty)) {
      err(`${at}: difficulty 非法（${String(q.difficulty)}）`);
    }

    if (q.type === 'choice') {
      if (!Array.isArray(q.options)) {
        err(`${at}: 选择题缺少 options`);
      } else {
        if (q.options.length !== 4) err(`${at}: 选择题选项数为 ${q.options.length}，应为 4`);
        if (q.options.some((o) => !o || !String(o).trim())) err(`${at}: 存在空选项`);
        const uniq = new Set(q.options.map((o) => String(o).trim()));
        if (uniq.size !== q.options.length) warn(`${at}: 选项内容有重复`);
        if (!['A', 'B', 'C', 'D'].includes(String(q.answer))) {
          err(`${at}: 选择题答案必须是 A/B/C/D，实际为 ${String(q.answer)}`);
        }
      }
    } else if (q.type === 'fill') {
      if (q.options !== undefined) err(`${at}: 填空题不应有 options`);
      if (String(q.answer).split('|').some((a) => !a.trim())) {
        err(`${at}: 填空答案存在空的备选写法`);
      }
    } else {
      // 简答题：主观题，必须给出参考答案与踩分点，供学生自评
      if (q.options !== undefined) err(`${at}: 简答题不应有 options`);
      if (!q.rubric || q.rubric.length === 0) {
        warn(`${at}: 简答题缺少踩分点 rubric`);
      } else if (q.rubric.some((r) => !String(r).trim())) {
        err(`${at}: 简答题踩分点存在空条目`);
      }
    }

    if (!q.tags || q.tags.length === 0) warn(`${at}: 缺少 tags`);
  }
}

/* ------------------------ 逐条目校验 ------------------------ */

const seenEntryIds = new Set<string>();
const seenQuestionIds = new Set<string>();

for (const entry of allEntries as Entry[]) {
  const where = `[${entry.moduleId}] ${entry.id}`;

  if (!entry.id) err(`${where}: 缺少 id`);
  else if (seenEntryIds.has(entry.id)) err(`${where}: 条目 id 重复`);
  else seenEntryIds.add(entry.id);

  if (!entry.title || !entry.title.trim()) err(`${where}: 缺少 title`);
  if (!VALID_GRADES.has(entry.grade)) err(`${where}: grade 非法（${String(entry.grade)}）`);
  if (!Array.isArray(entry.tags)) err(`${where}: tags 不是数组`);
  if (typeof entry.searchText !== 'string' || !entry.searchText) err(`${where}: searchText 为空`);

  checkQuestions(entry.questions, where, seenQuestionIds);

  switch (entry.moduleId) {
    case 'poems': {
      const p = entry.data;
      if (!p.lines?.length) err(`${where}: lines 为空`);
      if (!p.author || !p.dynasty) err(`${where}: 缺少作者或朝代`);
      if (!p.translation?.trim()) err(`${where}: 缺少译文`);
      if (!p.appreciation?.trim()) err(`${where}: 缺少赏析`);
      if (p.lineNotes && p.lineNotes.length !== p.lines.length) {
        err(`${where}: lineNotes 数量(${p.lineNotes.length}) 与 lines(${p.lines.length}) 不一致`);
      }
      if (p.lines?.some((l) => !l.trim())) err(`${where}: lines 存在空行`);
      break;
    }
    case 'vocab': {
      const v = entry.data;
      if (!v.term?.trim()) err(`${where}: 缺少 term`);
      if (!v.meaning?.trim()) err(`${where}: 缺少 meaning`);
      if (!v.category) err(`${where}: 缺少 category`);
      break;
    }
    case 'classical': {
      const c = entry.data;
      if (!c.paragraphs?.length) err(`${where}: 原文为空`);
      if (!c.annotations?.length) err(`${where}: 缺少注释`);
      else if (c.annotations.length < 5) warn(`${where}: 注释只有 ${c.annotations.length} 条，偏少`);
      if (!Array.isArray(c.grammar)) err(`${where}: grammar 不是数组`);
      if (!c.translation?.trim()) err(`${where}: 缺少翻译`);
      if (!c.theme?.trim()) err(`${where}: 缺少主旨`);
      if (!c.questions?.length) err(`${where}: 没有练习题`);
      for (const a of c.annotations ?? []) {
        if (!a.word || !a.explain) err(`${where}: 注释条目不完整`);
      }
      for (const g of c.grammar ?? []) {
        if (!g.type || !Array.isArray(g.items) || g.items.length === 0) {
          err(`${where}: 语法分类「${g.type ?? '?'}」为空`);
        }
      }
      break;
    }
    case 'reading': {
      const r = entry.data;
      if (!r.paragraphs?.length) err(`${where}: 原文为空`);
      else if (r.paragraphs.length < 3) warn(`${where}: 原文只有 ${r.paragraphs.length} 段`);
      if (!r.questions?.length) err(`${where}: 没有练习题`);
      else if (r.questions.length < 3) warn(`${where}: 只有 ${r.questions.length} 道题`);
      if (!r.tips?.length) warn(`${where}: 缺少答题技巧 tips`);
      const chars = r.paragraphs?.join('').length ?? 0;
      if (chars < 500) warn(`${where}: 原文仅 ${chars} 字，偏短`);
      break;
    }
    case 'writing': {
      const w = entry.data;
      if (!w.content?.length) err(`${where}: 正文为空`);
      if (!w.summary?.trim()) err(`${where}: 缺少 summary`);
      break;
    }
    case 'literature': {
      const l = entry.data;
      if (!l.content?.length) err(`${where}: 正文为空`);
      if (!l.keyPoints?.length) err(`${where}: 缺少 keyPoints`);
      if (!l.questions?.length) warn(`${where}: 没有练习题`);
      if (l.category === '名著导读' && !l.book) err(`${where}: 名著导读缺少 book 字段`);
      if (l.book) {
        if (!l.book.name || !l.book.author) err(`${where}: book 缺少书名或作者`);
        // 诗歌选本 / 文集类没有统一的人物与情节，不要求这两个字段
        const isAnthology = /三百首|诗选|文选|散文集|文集/.test(l.book.name);
        if (!isAnthology) {
          if (!l.book.characters?.length) warn(`${where}: book 缺少人物`);
          if (!l.book.plots?.length) warn(`${where}: book 缺少情节`);
        }
      }
      break;
    }
    default: {
      // 数学学科（moduleId 以 math- 开头）
      if (String(entry.moduleId).startsWith('math-')) {
        const t = entry.data as import('../src/types').MathTopic;
        if (!t.summary?.trim()) err(`${where}: 缺少 summary`);
        if (!t.concepts?.length) err(`${where}: 缺少核心概念 concepts`);
        else {
          for (const c of t.concepts) {
            if (!c.term?.trim() || !c.explain?.trim()) err(`${where}: 概念条目不完整`);
          }
        }
        if (!t.questions?.length) err(`${where}: 没有练习题`);
        if (t.formulas) {
          for (const f of t.formulas) {
            if (!f.name?.trim()) err(`${where}: 公式缺少 name`);
            if (!f.tex?.trim() && !f.text?.trim()) err(`${where}: 公式「${f.name}」既无 tex 也无 text`);
            // tex 必须是裸 KaTeX 源码，不能带 $ 包裹（渲染器直接传给 katex）
            if (f.tex && f.tex.includes('$')) err(`${where}: 公式「${f.name}」的 tex 不应包含 $ 符号`);
          }
        }
        if (t.examples) {
          for (const ex of t.examples) {
            if (!ex.stem?.trim()) err(`${where}: 例题缺少题干`);
            if (!ex.steps?.length) err(`${where}: 例题缺少解题步骤`);
            if (!ex.answer?.trim()) err(`${where}: 例题缺少答案`);
          }
        }
        if (!t.pitfalls?.length) warn(`${where}: 数学知识点缺少易错点 pitfalls`);
        if (!t.methods?.length) warn(`${where}: 数学知识点缺少解题方法 methods`);
        if (!t.chapter?.trim()) warn(`${where}: 数学知识点缺少章节归属 chapter`);
      }
      break;
    }
  }
}

/* ------------------- 思维导图 / 拓展阅读校验 ------------------- */

const VALID_EXT_KINDS = new Set([
  '背景拓展',
  '对比阅读',
  '文化常识',
  '考点延伸',
  '趣味知识',
  '学法指导',
]);

const seenMapIds = new Set<string>();
let mapNodeCount = 0;
let mapNoteCount = 0;

for (const m of mindMaps) {
  const at = `[导图] ${m.id}`;
  if (!m.id) err(`${at}: 缺少 id`);
  else if (seenMapIds.has(m.id)) err(`${at}: id 重复`);
  else seenMapIds.add(m.id);

  if (!ALL_MODULE_IDS.includes(m.moduleId)) err(`${at}: moduleId 非法（${String(m.moduleId)}）`);
  if (!VALID_GRADES.has(m.grade)) err(`${at}: grade 非法（${String(m.grade)}）`);
  if (!m.title?.trim()) err(`${at}: 缺少 title`);
  if (!m.summary?.trim()) err(`${at}: 缺少 summary`);
  if (m.entryId && !entryIndex.has(m.entryId)) {
    err(`${at}: entryId「${m.entryId}」在内容库中找不到，导图将无法展示`);
  }

  const walk = (n: MindNode, depth: number, path: string) => {
    mapNodeCount += 1;
    if (!n.label?.trim()) {
      err(`${at} ${path}: 节点缺少 label`);
    } else if (n.label.length > 26) {
      warn(`${at} ${path}: 节点文字过长（${n.label.length} 字），会让导图过宽`);
    }
    if (n.note?.trim()) mapNoteCount += 1;
    if (depth > 5) err(`${at} ${path}: 层级过深（${depth} 层）`);
    const kids = n.children ?? [];
    for (let i = 0; i < kids.length; i += 1) walk(kids[i], depth + 1, `${path}>${i}`);
  };
  if (!m.root) err(`${at}: 缺少 root`);
  else walk(m.root, 0, 'root');
}

const seenExtIds = new Set<string>();
let extChars = 0;

for (const e of extensions) {
  const at = `[拓展] ${e.id}`;
  if (!e.id) err(`${at}: 缺少 id`);
  else if (seenExtIds.has(e.id)) err(`${at}: id 重复`);
  else seenExtIds.add(e.id);

  if (!ALL_MODULE_IDS.includes(e.moduleId)) err(`${at}: moduleId 非法（${String(e.moduleId)}）`);
  if (!VALID_GRADES.has(e.grade)) err(`${at}: grade 非法（${String(e.grade)}）`);
  if (!VALID_EXT_KINDS.has(e.kind)) err(`${at}: kind 非法（${String(e.kind)}）`);
  if (!e.title?.trim()) err(`${at}: 缺少 title`);
  if (!e.summary?.trim()) err(`${at}: 缺少 summary`);
  if (!e.content?.length) err(`${at}: content 为空`);
  else if (e.content.every((p) => !p.trim())) err(`${at}: content 全为空段`);
  if (e.entryId && !entryIndex.has(e.entryId)) {
    err(`${at}: entryId「${e.entryId}」在内容库中找不到，拓展将无法展示`);
  }
  extChars += e.content?.join('').length ?? 0;
  if (!e.think?.length) warn(`${at}: 缺少延伸思考题 think`);
}

/* ------------------- 学一补多（知识联动）规则校验 ------------------- */

/**
 * 「学一补多」是把一条内容与**跨模块**的其它初中知识点连起来。
 * 关联规则全靠数据推导，因此必须回归测试其三条底线：
 *   1. 结构完整：每个分组都有 kind / hint / 至少一条 items；
 *   2. 不自我指涉、不重复推荐（同一分组内与分组之间都不能出现同一条）；
 *   3. 关系对称：A 把 B 认作「同一作品的另一模块版本」，B 也必须认 A。
 * 另外统计覆盖率，避免某次改动让整块内容静默失效。
 */
const suppGroups = new Map<string, number>();
let suppTotal = 0;
let suppSelfRef = 0;
let suppDup = 0;
let suppEmpty = 0;
let suppBadGroup = 0;
let suppAsym = 0;
const suppLink = new Map<string, Set<string>>();

for (const e of allEntries) {
  const at = `[学一补多] ${e.id}`;
  const groups = supplementsOf(e, allEntries);
  const seen = new Set<string>([e.id]);
  const sameWork = new Set<string>();

  if (!groups.length) suppEmpty += 1;

  for (const g of groups) {
    if (!g.kind?.trim()) {
      suppBadGroup += 1;
      err(`${at}: 分组缺少 kind`);
    }
    if (!g.hint?.trim()) {
      suppBadGroup += 1;
      err(`${at}: 分组「${g.kind}」缺少 hint`);
    }
    if (!g.items.length) {
      suppBadGroup += 1;
      err(`${at}: 分组「${g.kind}」没有条目`);
    }
    suppGroups.set(g.kind, (suppGroups.get(g.kind) ?? 0) + g.items.length);
    suppTotal += g.items.length;

    for (const it of g.items) {
      if (!it.entry) {
        err(`${at}: 分组「${g.kind}」存在空条目`);
        continue;
      }
      if (!it.reason?.trim()) err(`${at}: 「${it.entry.title}」缺少关联理由`);
      if (it.entry.id === e.id) {
        suppSelfRef += 1;
        err(`${at}: 关联到了自己`);
      }
      if (seen.has(it.entry.id)) {
        suppDup += 1;
        err(`${at}: 「${it.entry.title}」被重复推荐`);
      }
      seen.add(it.entry.id);
      if (!entryIndex.has(it.entry.id)) err(`${at}: 关联到不存在的条目 ${it.entry.id}`);
      if (g.kind === '同一作品·其他模块') {
        if (it.entry.moduleId === e.moduleId) {
          err(`${at}: 「同一作品·其他模块」指向了同一模块（${e.moduleId}）`);
        }
        sameWork.add(it.entry.id);
      }
    }

    // 专项训练入口必须指向真实存在的路由形状，且标签非空
    if (g.action) {
      if (!g.action.label?.trim() || !g.action.to?.startsWith('/practice/')) {
        err(`${at}: 分组「${g.kind}」的 action 非法（${JSON.stringify(g.action)}）`);
      }
    }
  }
  suppLink.set(e.id, sameWork);
}

for (const [a, bs] of suppLink) {
  for (const b of bs) {
    if (!suppLink.get(b)?.has(a)) {
      suppAsym += 1;
      err(`[学一补多] 「同一作品」关系不对称：${a} → ${b} 而 ${b} 未回指`);
    }
  }
}

/* 「关联学习」（🔗 同类作品横向比较）同样不能自我指涉，且必须给出理由 */
let relSelfRef = 0;
let relNoReason = 0;
let relTotal = 0;
for (const e of allEntries) {
  for (const r of relatedEntries(e, allEntries, 6)) {
    relTotal += 1;
    if (r.entry.id === e.id) {
      relSelfRef += 1;
      err(`[关联学习] ${e.id}: 关联到了自己`);
    }
    if (!r.reason?.trim()) {
      relNoReason += 1;
      err(`[关联学习] ${e.id} → ${r.entry.id}: 缺少关联理由`);
    }
    if (r.entry.moduleId.startsWith('math-') !== e.moduleId.startsWith('math-')) {
      err(`[关联学习] ${e.id} → ${r.entry.id}: 跨学科关联（数学与语文不应混在一起）`);
    }
  }
}

/* ------------------- 数学公式 KaTeX 合法性校验 ------------------- */

/**
 * 渲染组件用 `throwOnError: false`，公式写错时不会抛异常，而是渲染成红色错误文本——
 * 因此「页面上有 katex 标记」并不等于公式正确。这里改用 `throwOnError: true` 逐条渲染，
 * 任何一条不合法都会被抓出来。
 *
 * 最典型的坑：在 TS 单引号字符串里写了**单**反斜杠，`\f` 会被解析成换页符、
 * `\t` 成制表符、`\s` 直接丢掉反斜杠，LaTeX 于是在运行时被破坏。
 */

function inlineTexOf(s: string | undefined): string[] {
  if (!s) return [];
  return [...s.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
}

let texTotal = 0;
const texFailures: string[] = [];

function checkTex(tex: string, where: string) {
  texTotal += 1;
  try {
    katex.renderToString(tex, { throwOnError: true, displayMode: false, strict: false });
  } catch (e) {
    texFailures.push(`${where}  【${tex.slice(0, 60)}】 → ${(e as Error).message.split('\n')[0].slice(0, 70)}`);
  }
}

for (const entry of allEntries) {
  if (!String(entry.moduleId).startsWith('math-')) continue;
  const t = entry.data as import('../src/types').MathTopic;
  const where = `[${entry.moduleId}] ${t.id}`;

  const fields: [string, string | undefined][] = [['summary', t.summary]];
  (t.concepts ?? []).forEach((c, i) => fields.push([`concepts[${i}]`, c.explain]));
  (t.formulas ?? []).forEach((f, i) => {
    if (f.tex) checkTex(f.tex, `${where}.formulas[${i}].tex`);
    fields.push([`formulas[${i}].text`, f.text], [`formulas[${i}].note`, f.note]);
  });
  (t.examples ?? []).forEach((x, i) => {
    fields.push([`examples[${i}].stem`, x.stem], [`examples[${i}].answer`, x.answer], [`examples[${i}].tip`, x.tip]);
    (x.steps ?? []).forEach((s, j) => fields.push([`examples[${i}].steps[${j}]`, s]));
  });
  (t.pitfalls ?? []).forEach((p, i) => fields.push([`pitfalls[${i}]`, p]));
  (t.methods ?? []).forEach((m, i) => fields.push([`methods[${i}]`, m]));
  (t.questions ?? []).forEach((q, i) => {
    fields.push([`questions[${i}].stem`, q.stem], [`questions[${i}].explanation`, q.explanation]);
    if (q.type !== 'choice') fields.push([`questions[${i}].answer`, String(q.answer)]);
    (q.options ?? []).forEach((o) => fields.push([`questions[${i}].option`, o]));
    (q.rubric ?? []).forEach((r, j) => fields.push([`questions[${i}].rubric[${j}]`, r]));
  });

  for (const [name, value] of fields) {
    if (!value) continue;
    // 未配对的 $ 会吞掉后续内容，也是常见错误
    const dollars = (value.match(/\$/g) ?? []).length;
    if (dollars % 2 !== 0) err(`${where}.${name}: $ 符号个数为奇数（${dollars}），行内公式未闭合`);
    for (const sub of inlineTexOf(value)) checkTex(sub, `${where}.${name}`);
  }
}

/* ------------------------ 进度更新规则自测 ------------------------ */

// 模块列表的「正确率」与「已掌握」标签都依赖这个纯函数；
// 曾经因为 recordAnswer 忘了调用它，两处 UI 永远是空的。
const P0 = { studied: 0, correct: 0, total: 0, lastAt: 0, mastered: false };
const pAfter3Right = [true, true, true].reduce((p, c) => applyAnswerToProgress(p, c), P0);
const pAfter2Right = [true, true].reduce((p, c) => applyAnswerToProgress(p, c), P0);
const pMixed = [true, false, true, true].reduce((p, c) => applyAnswerToProgress(p, c), P0);
const pPoor = [true, false, false, false].reduce((p, c) => applyAnswerToProgress(p, c), P0);

const progressCases: [string, boolean, string][] = [
  ['答 3 题全对 → 正确率 100%，已掌握', pAfter3Right.total === 3 && pAfter3Right.correct === 3 && pAfter3Right.mastered, JSON.stringify(pAfter3Right)],
  ['只答 2 题全对 → 尚未掌握（题量不足）', pAfter2Right.total === 2 && pAfter2Right.mastered === false, JSON.stringify(pAfter2Right)],
  ['答 4 题对 3 → 75%，未掌握', pMixed.total === 4 && pMixed.correct === 3 && pMixed.mastered === false, JSON.stringify(pMixed)],
  ['答 4 题对 1 → 25%，未掌握', pPoor.total === 4 && pPoor.correct === 1 && pPoor.mastered === false, JSON.stringify(pPoor)],
];

const progressFailures = progressCases.filter(([, ok]) => !ok);

/* ------------------------ 背诵排期规则自测 ------------------------ */

const DAY_MS = 24 * 60 * 60 * 1000;
const T0 = 1_700_000_000_000;

let rc = applyRecite(undefined, true, T0);
const rc1 = { ...rc };
rc = applyRecite(rc, true, T0);
const rc2 = { ...rc };
rc = applyRecite(rc, false, T0);
const rcBack = { ...rc };

const reciteCases: [string, boolean, string][] = [
  [
    '首次背对 → 熟练度 1，2 天后复习',
    rc1.level === 1 && rc1.times === 1 && rc1.dueAt === T0 + RECITE_INTERVALS[1] * DAY_MS,
    JSON.stringify(rc1),
  ],
  [
    '连续背对 → 熟练度升到 2，4 天后复习',
    rc2.level === 2 && rc2.times === 2 && rc2.dueAt === T0 + RECITE_INTERVALS[2] * DAY_MS,
    JSON.stringify(rc2),
  ],
  [
    '一次背错 → 降回 1，1 天后复习，连续次数清零',
    rcBack.level === 1 && rcBack.streak === 0 && rcBack.dueAt === T0 + RECITE_INTERVALS[0] * DAY_MS,
    JSON.stringify(rcBack),
  ],
  ['未背过的内容视为「今天该复习」', isDue(undefined, T0) === true, ''],
  ['刚排期 4 天的内容今天不到期', isDue(rc2, T0 + DAY_MS) === false, ''],
  ['到期后 isDue 为真', isDue(rc2, T0 + 5 * DAY_MS) === true, ''],
  ['daysUntilDue 到期返回 0', daysUntilDue(rc2, T0 + 5 * DAY_MS) === 0, ''],
  ['daysUntilDue 未到期返回正数', daysUntilDue(rc2, T0) === 4, String(daysUntilDue(rc2, T0))],
];

const reciteFailures = reciteCases.filter(([, ok]) => !ok);

/* ------------------------ 判分逻辑自测 ------------------------ */

// 判分是应用的核心路径：这里用真实数据里出现过的答案写法做回归测试，
// 避免「容错标点」「`|` 备选答案」这些特性被后续改动悄悄破坏。
const fillCases: [input: string, answer: string, expect: boolean, note: string][] = [
  // —— 文字学科（语文）：宽松，忽略标点 ——
  ['六十', '60|六十', true, '命中第二个备选写法'],
  ['60', '60|六十', true, '命中第一个备选写法'],
  ['《呐喊》', '呐喊|《呐喊》', true, '标点容错 + 备选写法'],
  ['呐喊', '呐喊|《呐喊》', true, '无书名号也判对'],
  ['  呐喊  ', '呐喊', true, '首尾空白容错'],
  ['海内存知己，天涯若比邻。', '海内存知己天涯若比邻', true, '全角标点容错'],
  ['海内存知己 天涯若比邻', '海内存知己天涯若比邻', true, '空格容错'],
  ['彷徨', '呐喊|《呐喊》', false, '答错必须判错'],
  ['', '呐喊', false, '空作答必须判错'],
  ['   ', '呐喊', false, '纯空白必须判错'],
];

/**
 * 数学判分用例：数学里 `-` `.` `(` `)` `,` `/` 是有语义的，**不能**像语文那样剥掉。
 * 否则会出现「答 3 而答案为 -3 却被判对」这类错误答案被判正确的严重问题。
 */
const mathCases: [input: string, answer: string, expect: boolean, note: string][] = [
  ['3', '-3', false, '漏负号必须判错'],
  ['-3', '-3', true, '写对负号判对'],
  ['−3', '-3', true, 'Unicode 减号容错'],
  ['－3', '-3', true, '全角减号容错'],
  ['25', '2.5', false, '漏小数点必须判错'],
  ['2.5', '2.5', true, '带小数判对'],
  ['-2.5', '-2.5', true, '负小数'],
  ['23', '(2,3)', false, '漏括号与逗号必须判错'],
  ['(2,3)', '(2,3)', true, '坐标写法正确'],
  ['(2，3)', '(2,3)', true, '全角逗号容错'],
  ['12', '1/2', false, '漏分数线必须判错'],
  ['1/2', '1/2', true, '分数'],
  ['14935', '149°35′', false, '漏度分符号必须判错'],
  ['149°35′', '149°35′', true, '度分写法'],
  ["149°35'", '149°35′', true, 'ASCII 撇号容错'],
  ['  3  ', '3', true, '首尾空白仍容错'],
];

const fillFailures = fillCases.filter(
  ([input, answer, expect]) => checkFill(input, answer, 'loose') !== expect,
);
const mathFailures = mathCases.filter(
  ([input, answer, expect]) => checkFill(input, answer, 'strict') !== expect,
);

/**
 * 断句题用例：答案里的 `/` 就是作答内容本身，必须保留。
 * 修复前这些题用 loose 模式判分，`/` 被剥掉，导致「完全不断句也算对」。
 */
const duanjuCases: [input: string, answer: string, expect: boolean, note: string][] = [
  [
    '三人行/必有我师焉/择其善者而从之/其不善者而改之',
    '三人行/必有我师焉/择其善者而从之/其不善者而改之',
    true,
    '断句正确判对',
  ],
  [
    '三人行必有我师焉择其善者而从之其不善者而改之',
    '三人行/必有我师焉/择其善者而从之/其不善者而改之',
    false,
    '完全不断句必须判错',
  ],
  [
    '三人/行必有我师焉/择其善者而从之/其不善者而改之',
    '三人行/必有我师焉/择其善者而从之/其不善者而改之',
    false,
    '断错位置必须判错',
  ],
  [
    '三人行／必有我师焉／择其善者而从之／其不善者而改之',
    '三人行/必有我师焉/择其善者而从之/其不善者而改之',
    true,
    '全角斜杠容错',
  ],
  [
    '但少闲人/如吾两人者耳',
    '但少/闲人如吾两人者耳|但少闲人/如吾两人者耳',
    true,
    '命中第二种可接受断法',
  ],
];

const duanjuFailures = duanjuCases.filter(
  ([input, answer, expect]) => checkFill(input, answer, answerModeFor('classical', answer)) !== expect,
);

/* ------------------------ 汇总报告 ------------------------ */

const perModule = ALL_MODULE_IDS.map((id) => {
  const list = allEntries.filter((e) => e.moduleId === id);
  const qs = list.reduce((n, e) => n + e.questions.length, 0);
  return { id, entries: list.length, questions: qs };
});

const totalQuestions = perModule.reduce((n, m) => n + m.questions, 0);

/* 古诗词的默写题由逐句自动生成，这里统计一下规模 */
const reciteTotal = allPoems.reduce(
  (n, p) => n + makeReciteQuestions(p.lines, p.id, p.title).length,
  0,
);

console.log('\n================ 内容数据报告 ================');
for (const s of SUBJECTS.filter((x) => x.available)) {
  console.log(`  【${s.name}】`);
  for (const m of s.modules) {
    const row = perModule.find((x) => x.id === m.id);
    if (!row) continue;
    console.log(
      `    ${m.id.padEnd(14)} 条目 ${String(row.entries).padStart(4)}   配套题 ${String(row.questions).padStart(4)}`,
    );
  }
}
console.log('  ' + '-'.repeat(46));
console.log(`  条目合计          ${String(allEntries.length).padStart(4)}`);
console.log(`  预置题目          ${String(totalQuestions).padStart(4)}`);
console.log(`  默写题（自动生成）${String(reciteTotal).padStart(4)}`);
console.log(`  可练习题总计      ${String(totalQuestions + reciteTotal).padStart(4)}`);
console.log(`  索引条目          ${String(entryIndex.size).padStart(4)}`);
console.log(`  思维导图          ${String(mindMaps.length).padStart(4)} 张 / ${mapNodeCount} 节点（带 note ${mapNoteCount}）`);
console.log(`  拓展阅读          ${String(extensions.length).padStart(4)} 篇 / 约 ${Math.round(extChars / 1000)} 千字`);

const perGrade = new Map<string, number>();
for (const e of allEntries) perGrade.set(e.grade, (perGrade.get(e.grade) ?? 0) + 1);
console.log(
  '  按学段            ' + [...perGrade.entries()].sort().map(([g, n]) => `${g}:${n}`).join('  '),
);

console.log('\n================ 校验结果 ================');
const gradeTotal = fillCases.length + mathCases.length + duanjuCases.length;
const gradeBad = fillFailures.length + mathFailures.length + duanjuFailures.length;
console.log(`  判分逻辑自测      ${gradeTotal - gradeBad} / ${gradeTotal} 通过`);
for (const [input, answer, expect, note] of fillFailures) {
  console.log(`    ❌ [文字] 输入「${input}」对答案「${answer}」应为 ${expect}（${note}）`);
}
for (const [input, answer, expect, note] of mathFailures) {
  console.log(`    ❌ [数学] 输入「${input}」对答案「${answer}」应为 ${expect}（${note}）`);
}
for (const [input, answer, expect, note] of duanjuFailures) {
  console.log(`    ❌ [断句] 输入「${input}」对答案「${answer}」应为 ${expect}（${note}）`);
}

for (const f of texFailures.slice(0, 20)) err(`KaTeX 渲染失败 ${f}`);
console.log(`  数学公式校验      ${texTotal - texFailures.length} / ${texTotal} 条合法`);
console.log(
  `  进度更新规则      ${progressCases.length - progressFailures.length} / ${progressCases.length} 通过`,
);
for (const [note, , detail] of progressFailures) {
  console.log(`    ❌ ${note}  实际 ${detail}`);
}

console.log(
  `  背诵排期规则      ${reciteCases.length - reciteFailures.length} / ${reciteCases.length} 通过`,
);
for (const [note, , detail] of reciteFailures) {
  console.log(`    ❌ ${note}  实际 ${detail}`);
}

console.log(
  `  知识联动         学一补多 ${suppTotal} 条 / 关联学习 ${relTotal} 条`,
);
console.log(
  `      ${'自指'.padEnd(22)} ${String(suppSelfRef + relSelfRef).padStart(4)}` +
    `   重复 ${suppDup}   空分组条目 ${suppEmpty}   不对称 ${suppAsym}   缺理由 ${relNoReason}`,
);
for (const [k, n] of [...suppGroups].sort((a, b) => b[1] - a[1])) {
  console.log(`      ${k.padEnd(22)} ${String(n).padStart(4)} 条`);
}

if (warnings.length) {
  console.log(`⚠️  警告 ${warnings.length} 条：`);
  for (const w of warnings.slice(0, 30)) console.log('   - ' + w);
  if (warnings.length > 30) console.log(`   … 其余 ${warnings.length - 30} 条已省略`);
}

if (
  errors.length ||
  gradeBad > 0 ||
  progressFailures.length > 0 ||
  reciteFailures.length > 0
) {
  if (errors.length) {
    console.log(`\n❌ 数据错误 ${errors.length} 条：`);
    for (const e of errors.slice(0, 60)) console.log('   - ' + e);
    if (errors.length > 60) console.log(`   … 其余 ${errors.length - 60} 条已省略`);
  }
  if (gradeBad > 0) {
    console.log(`\n❌ 判分逻辑自测失败 ${gradeBad} 条`);
  }
  if (progressFailures.length > 0) {
    console.log(`\n❌ 进度更新规则自测失败 ${progressFailures.length} 条`);
  }
  if (reciteFailures.length > 0) {
    console.log(`\n❌ 背诵排期规则自测失败 ${reciteFailures.length} 条`);
  }
  process.exitCode = 1;
} else {
  console.log('✅ 全部检查通过：数据结构无误，判分逻辑自测全通过。');
}
console.log('');
