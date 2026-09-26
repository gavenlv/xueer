/**
 * 数据校验入口：检查全部学科内容数据的结构完整性与一致性。
 * 通过 `pnpm run validate` 运行（先由 vite 打包成 Node 可执行的 ESM）。
 *
 * 覆盖范围：所有学科的所有模块、全部题目、思维导图、拓展阅读，以及判分逻辑自测。
 */

declare const process: { exitCode: number };

import { readFileSync, readdirSync } from 'node:fs';

import katex from 'katex';
import {
  allEntries,
  contentStats,
  entryIndex,
  mindMaps,
  extensions,
  poemExamPoints,
  ensureAll,
} from '../src/data';
import { allPoems } from '../src/data/chinese';
import { allTopics, allPapers } from '../src/data/history';
import { BOOK_EXAM_POINT_TAGS } from '../src/lib/bookExams';
import { DAILY_LINES, ENTRY_META, MODULE_TOTALS } from '../src/data/summary';
import { lessonMindMap } from '../src/lib/lessonMaps';
import { searchTextOf } from '../src/lib/searchText';
import { SUBJECTS } from '../src/data/subjects';
import { makeReciteQuestions } from '../src/lib/quiz';
import { relatedEntries, supplementsOf, litMatchIndex } from '../src/lib/relations';
import { relOfEntry, relOfEntryFull, relPool } from '../src/lib/relNode';
import { speechSegmentsOf } from '../src/lib/entrySpeech';
import { glossaryOf } from '../src/lib/glossary';
import { splitSegments } from '../src/components/ReciteTrainer';
import { answerModeFor, checkFill } from '../src/lib/utils';
import { applyAnswerToProgress } from '../src/lib/progress';
import {
  RECITE_INTERVALS,
  applyRecite,
  daysUntilDue,
  isDue,
} from '../src/lib/recite';
import type { Entry, MindNode, ModuleId, QuizQuestion } from '../src/types';

/**
 * 内容数据已改为**按需加载**（见 `src/data/chinese/index.ts`）：
 * 页面各自声明需要的模块，而这里在校验开始前一次性把全部模块加载进来，
 * 之后所有同步查询 API 照旧可用——因此下面几百条断言完全不用改写。
 */
await ensureAll();

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
  /**
   * 检索文本已改为**推导**（`lib/searchText.ts`）而不是随条目存储——它原本把正文
   * 原样再拼一遍，等于让同一段文字在包里出现两次。因此这里不能再查字段，
   * 改为查「推导结果非空且确实包含标题」：既保证每个模块都有对应的推导分支，
   * 也防止某天新加模块时忘了补分支、搜索与知识联动静默失效。
   */
  const st = searchTextOf(entry);
  if (!st) err(`${where}: 推导出的检索文本为空（searchTextOf 缺该模块的分支？）`);
  else if (!st.includes(entry.title.toLowerCase())) {
    err(`${where}: 检索文本里没有标题，按标题搜不到这条内容`);
  }
  if (entry.searchText !== undefined) {
    warn(`${where}: 装配时仍写入了 searchText 字段，会让发布包重复存储正文`);
  }

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
const suppEmptyIds: string[] = [];
let suppBadGroup = 0;
let suppAsym = 0;
const suppLink = new Map<string, Set<string>>();
/** 「相关文学常识」的入边：被哪些条目关联到（用于发现写了却关联不上的常识条目） */
const litInbound = new Map<string, string[]>();
/** 有「相关文学常识」入边的条目（用于反查「哪些课内作者还没有作家作品条目」） */
const hasLitLink = new Set<string>();

/**
 * 两条加载路径的一致性。
 *
 * 详情页只加载**当前模块**，跨模块的关联靠生成的轻量清单补位（见 `lib/relNode.ts`）。
 * 但校验脚本默认 `ensureAll()`，全量数据都在手上——如果直接拿全量池去算，
 * 「清单少存了一个字段」这类问题在这里永远看不见，学生那边却是分组悄悄变少。
 *
 * 所以这里同时跑两条路径并逐条比对：
 *   - `LIGHT_POOL`：清单骨架 + 已加载条目（**页面上真实走的那条**）
 *   - `FULL_POOL` ：全部字段从原文现算（文学常识的匹配文本用要点全文，不做抽取）
 * 结果必须一模一样。
 */
const LIGHT_POOL = relPool(allEntries);
const FULL_POOL = allEntries.map((e) => relOfEntryFull(e));
/** 全量基线的文学常识命中表：与生成阶段用的是同一对函数（`litScoreFor` / `litMatchIndex`） */
for (const lit of FULL_POOL) {
  if (lit.moduleId === 'literature') lit.matchFrom = litMatchIndex(lit, FULL_POOL);
}
let suppParity = 0;

/** 分组的可比签名：分组名 + 每条关联的 id 与理由 */
function groupSignature(groups: { kind: string; items: { entry: { id: string }; reason: string }[] }[]): string {
  return groups
    .map((g) => `${g.kind}(${g.items.map((i) => `${i.entry.id}:${i.reason}`).join(',')})`)
    .join('|');
}

for (const e of allEntries) {
  const at = `[学一补多] ${e.id}`;
  const self = LIGHT_POOL.find((x) => x.id === e.id);
  const baseSelf = FULL_POOL.find((x) => x.id === e.id);
  /**
   * 清单里没有这条内容，说明 `src/data/summary.ts` 过期（内容改了没跑 `pnpm gen`）。
   * 这里必须**报错而不是崩溃**：崩掉的校验脚本只会留下一行 TypeError，
   * 完全看不出该做什么。
   */
  if (!self || !baseSelf) {
    err(`${at}: 轻量清单（src/data/summary.ts）里没有这条内容，清单已过期——请运行 pnpm gen`);
    continue;
  }
  const groups = supplementsOf(self, LIGHT_POOL);
  const baseGroups = supplementsOf(baseSelf, FULL_POOL);
  if (groupSignature(groups) !== groupSignature(baseGroups)) {
    suppParity += 1;
    err(
      `${at}: 「只加载当前模块」与「全量数据」算出的关联不一致——` +
        `轻量清单（src/data/summary.ts）漏了字段，跑 pnpm gen 或补 gen-summary.ts\n` +
        `    轻量: ${groupSignature(groups)}\n    全量: ${groupSignature(baseGroups)}`,
    );
  }
  const seen = new Set<string>([e.id]);
  /**
   * 一页之内同一篇作品（按标题）只能出现一次，跨分组也算重复。
   * 注意**不要**把当前条目自己的标题预先放进来：同一作品·其他模块这一组
   * 本来就要指向另一模块里的同名篇目（如文言文版《陋室铭》→ 古诗词版《陋室铭》）。
   */
  const titleKey = (t: string) => t.replace(/[（(](节选|选段|节录)[)）]/g, '').replace(/[《》\s]/g, '').trim();
  const seenTitles = new Set<string>();
  const sameWork = new Set<string>();

  if (!groups.length) {
    suppEmpty += 1;
    suppEmptyIds.push(`${e.id}(${e.moduleId})`);
  }

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
      // 同一页出现两条同名条目（如古诗词版与文言文版的《诫子书》）看起来像 bug
      if (seenTitles.has(titleKey(it.entry.title))) {
        err(`${at}: 「${it.entry.title}」在本页被重复推荐（与其它分组同名）`);
      }
      seenTitles.add(titleKey(it.entry.title));
      if (!entryIndex.has(it.entry.id)) err(`${at}: 关联到不存在的条目 ${it.entry.id}`);
      if (g.kind === '同一作品·其他模块') {
        if (it.entry.moduleId === e.moduleId) {
          err(`${at}: 「同一作品·其他模块」指向了同一模块（${e.moduleId}）`);
        }
        sameWork.add(it.entry.id);
      }
      if (g.kind === '相关文学常识') {
        const from = litInbound.get(it.entry.id) ?? [];
        from.push(e.id);
        litInbound.set(it.entry.id, from);
      }
    }
    if (g.kind === '相关文学常识') hasLitLink.add(e.id);


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

/**
 * 课内作者的「作家作品」与文体常识（id 前缀 l-au- / l-tical-）是专门为「学一补多」写的：
 * 它们的价值全在于**被古诗文／现代文关联到**。若某条一条都关联不上，说明作者名对不上、
 * 或文体没写进标签，内容等于白写——这类退化必须在这里拦住。
 */
const unreachable = allEntries.filter(
  (e) =>
    e.moduleId === 'literature' &&
    (e.id.startsWith('l-au-') || e.id.startsWith('l-tical-')) &&
    !(litInbound.get(e.id)?.length ?? 0),
);
for (const e of unreachable) {
  err(`[学一补多] 文学常识「${e.title}」（${e.id}）没有任何条目关联到它，等于写了用不上`);
}

/** 诊断用：文学常识里还有多少条完全没被关联（名著导读、文化常识本来就很少被勾到，属正常） */
const litAll = allEntries.filter((e) => e.moduleId === 'literature');
const litNoInbound = litAll.filter((e) => !(litInbound.get(e.id)?.length ?? 0)).length;

/**
 * 反查：哪些**古诗文作者**还没有「作家作品」专条。
 *
 * 判据是「有没有一条文学常识的**标题**里就写着该作者」——
 * 不能只看「有没有被关联到」：文学体裁类条目（如《诗歌的体裁分类》）的必记要点里
 * 会顺带举很多诗人的例子，那样几乎人人都「有入边」，反而看不出谁缺专条。
 * 用标题判断还顺带解决「以书名作作者」的情况（《诗经》《礼记》《吕氏春秋》），
 * 它们的专条标题里本就带着书名。
 * 只报警告不报错：有些作者只选了一首、确实不必单独成条，交给人判断。
 */
const litTitles = allEntries.filter((e) => e.moduleId === 'literature').map((e) => e.title);
const authorsWithoutEntry = new Map<string, number>();
for (const e of allEntries) {
  if (e.moduleId !== 'poems' && e.moduleId !== 'classical') continue;
  const raw = (e.data as { author?: string }).author ?? '';
  const a = raw.replace(/[《》]/g, '').trim();
  if (!a || a.length < 2 || ['佚名', '无名氏', '不详'].includes(a)) continue;
  if (litTitles.some((t) => t.includes(a))) continue;
  authorsWithoutEntry.set(raw, (authorsWithoutEntry.get(raw) ?? 0) + 1);
}
if (authorsWithoutEntry.size) {
  warn(
    `以下 ${authorsWithoutEntry.size} 位古诗文作者尚无「作家作品」专条（篇目补不到作者常识）：` +
      [...authorsWithoutEntry]
        .sort((a, b) => b[1] - a[1])
        .map(([a, n]) => `${a}(${n}篇)`)
        .join('、'),
  );
}

/* --------------- 按需加载：轻量清单是否过期 / 页面是否声明了数据范围 --------------- */

/**
 * 首页与学科页不加载内容正文，只读 `src/data/summary.ts` 那份**生成**的轻量清单。
 * 清单一旦过期，页面上的数字就会悄悄错掉——所以这里逐项比对清单与真实数据。
 */
{
  const metaById = new Map(ENTRY_META.map((m) => [m.id, m]));
  if (ENTRY_META.length !== allEntries.length) {
    err(
      `[轻量清单] 清单里 ${ENTRY_META.length} 条，实际 ${allEntries.length} 条 → 请运行 pnpm gen 重新生成`,
    );
  }
  for (const e of allEntries) {
    const m = metaById.get(e.id);
    if (!m) {
      err(`[轻量清单] 缺少条目 ${e.id}（${e.title}）→ 请运行 pnpm gen 重新生成`);
      continue;
    }
    if (m.title !== e.title || m.moduleId !== e.moduleId || m.grade !== e.grade) {
      err(`[轻量清单] 条目 ${e.id} 的骨架信息与实际不符 → 请运行 pnpm gen 重新生成`);
    }
    if (m.questions !== e.questions.length) {
      err(
        `[轻量清单] 条目 ${e.id} 的题量 ${m.questions} 与实际 ${e.questions.length} 不符 → 请运行 pnpm gen`,
      );
    }
  }

  const totalsById = new Map(MODULE_TOTALS.map((m) => [m.id, m]));
  for (const s of SUBJECTS) {
    for (const mod of s.modules) {
      const t = totalsById.get(mod.id as ModuleId);
      if (!t) {
        err(`[轻量清单] 缺少模块 ${mod.id} 的汇总 → 请运行 pnpm gen 重新生成`);
        continue;
      }
      const list = allEntries.filter((e) => e.moduleId === mod.id);
      const qs = list.reduce((n, e) => n + e.questions.length, 0);
      if (t.entries !== list.length || t.questions !== qs) {
        err(
          `[轻量清单] 模块 ${mod.id} 汇总为 ${t.entries} 条 / ${t.questions} 题，` +
            `实际 ${list.length} 条 / ${qs} 题 → 请运行 pnpm gen 重新生成`,
        );
      }
    }
  }
  if (!DAILY_LINES.length) err('[轻量清单] 每日一句池为空 → 请运行 pnpm gen 重新生成');
}

/**
 * 内容数据按需加载：**页面必须声明自己需要哪些模块**（`useDataScope([...])`），
 * 否则它在浏览器里会渲染出空列表。这个错误在服务端渲染里看不见（校验脚本预加载了
 * 全部数据，页面首帧就是「已就绪」），所以只能静态检查页面源码。
 */
{
  const pages = readdirSync('src/pages').filter((f) => f.endsWith('.tsx'));
  /** 这几个是**轻量**数据模块（学科注册表、生成好的骨架清单、汇总），读取它们不需要加载正文 */
  const LIGHT = /from '\.\.\/data\/(summary|totals|subjects)'/g;
  for (const f of pages) {
    const src = readFileSync(`src/pages/${f}`, 'utf8');
    // 页面可以显式声明「只用轻量清单」，见 Home / SubjectPage 顶部注释
    if (src.includes('@data-summary-only')) continue;
    const heavy = src.replace(LIGHT, '');
    const usesData = /from '\.\.\/data'|from '\.\.\/data\//.test(heavy);
    if (usesData && !src.includes('useDataScope')) {
      err(`[按需加载] src/pages/${f} 读取了内容数据却没有调用 useDataScope(...)，浏览器里会渲染成空列表`);
    }
  }
}



/**
 * 「本课思维导图」是 `src/lib/lessonMaps.ts` 从条目自身数据推导出来的，不落库。
 * 因此它的质量完全取决于原始数据——某一课的数据缺了（比如古诗词没有赏析、
 * 文言文没有注释），图就会静默变空或只剩一个光杆中心。这里逐条生成并检查：
 * 语文六个模块的覆盖率、节点文字长度、层级深度、节点数量。
 */
let lessonMapTotal = 0;
const lessonMapByModule = new Map<string, { total: number; withMap: number }>();
for (const e of allEntries) {
  const s = lessonMapByModule.get(e.moduleId) ?? { total: 0, withMap: 0 };
  s.total += 1;

  const m = lessonMindMap(e);
  if (m) {
    s.withMap += 1;
    lessonMapTotal += 1;

    let nodes = 0;
    let maxDepth = 0;
    const walk = (n: MindNode, depth: number) => {
      nodes += 1;
      maxDepth = Math.max(maxDepth, depth);
      if (!n.label?.trim()) err(`[课时导图] ${e.id}: 有节点没有文字`);
      else if (n.label.length > 30) {
        warn(`[课时导图] ${e.id}: 节点文字 ${n.label.length} 字，会让导图过宽（${n.label.slice(0, 20)}…）`);
      }
      for (const k of n.children ?? []) walk(k, depth + 1);
    };
    walk(m.root, 0);

    if (maxDepth > 5) err(`[课时导图] ${e.id}: 层级 ${maxDepth} 层，过深`);
    if (nodes > 140) warn(`[课时导图] ${e.id}: 节点 ${nodes} 个，偏多`);
    if ((m.root.children ?? []).length < 2) {
      err(`[课时导图] ${e.id}: 只有 ${(m.root.children ?? []).length} 个一级分支，讲不出东西`);
    }
  }
  lessonMapByModule.set(e.moduleId, s);
}

// 语文六个模块应当**每一课都有**导图（数学是公式速查类，不适用）
const LESSON_MODULES = ['poems', 'vocab', 'classical', 'reading', 'writing', 'literature'];
for (const mid of LESSON_MODULES) {
  const s = lessonMapByModule.get(mid);
  if (!s) continue;
  if (s.withMap < s.total) {
    err(`[课时导图] ${mid} 模块只有 ${s.withMap} / ${s.total} 个条目能生成导图，应有全部`);
  }
}



/**
 * 顶栏导航（.topnav）与底部标签栏（.tabbar）是**互为替代**的两套导航：
 * 窄屏用底部栏、宽屏用顶栏。曾经写成「顶栏 ≤899px 隐藏、标签栏 ≥721px 隐藏」，
 * 于是 721–899px（平板竖屏、分屏窄窗口）两个导航同时消失，页面上没有任何入口。
 * 这类缺陷跑路由渲染、跑类型检查都发现不了，只能直接核对样式里的断点，
 * 因此在这里把「两个断点必须一致」固化成规则。
 */
const css = readFileSync('src/index.css', 'utf8');
const hideTopnav = /@media\s*\(max-width:\s*(\d+)px\)\s*\{[^@]*?\.topnav\s*\{[^}]*display:\s*none/s.exec(css);
const hideTabbar = /@media\s*\(min-width:\s*(\d+)px\)\s*\{[^@]*?\.tabbar\s*\{[^}]*display:\s*none/s.exec(css);
if (!hideTopnav) {
  err('[响应式] 找不到「隐藏 .topnav」的 max-width 媒体查询，断点可能被改坏了');
} else if (!hideTabbar) {
  err('[响应式] 找不到「隐藏 .tabbar」的 min-width 媒体查询，断点可能被改坏了');
} else {
  const topnavMax = Number(hideTopnav[1]);
  const tabbarMin = Number(hideTabbar[1]);
  if (tabbarMin !== topnavMax + 1) {
    err(
      `[响应式] 两套导航的断点对不上：顶栏在 ≤${topnavMax}px 隐藏，底部标签栏在 ≥${tabbarMin}px 隐藏。` +
        (tabbarMin > topnavMax + 1
          ? `于是 ${topnavMax + 1}–${tabbarMin - 1}px 区间两套导航都没有，页面上没有任何入口。`
          : `于是 ${tabbarMin}–${topnavMax}px 区间两套导航同时出现，底部栏会盖住内容。`) +
        `两处断点必须相差 1（当前正确值：顶栏 ≤899 / 标签栏 ≥900）。`,
    );
  }
}



/* --------------- 名著「整本书阅读」：章节脉络 / 情节链 / 口诀 / 考点 --------------- */

/**
 * 12 部必读名著的章节脉络、情节链、记忆口诀与考点题写在**单独的文件**里，
 * 靠 `BookPlot.id` 挂回名著条目。挂接一旦对不上（id 写错、条目没有 book 字段），
 * 数据会**静默失效**——页面照常渲染，只是那部名著什么都没有。
 * 所以这里逐部核对：能挂上、条数够、考点用的是受控词、题量与题型达标。
 */
/**
 * 注意：这里**不直接 import `books-plot-*.ts`**，而是校验加载后合并进条目的结果。
 *
 * 原因很实在：数据模块现在是**动态 import** 的，如果校验入口再静态 import 同一批文件，
 * 打包时就会形成「入口 → 动态块 → 入口」的循环依赖；而入口里有顶层 await（先把数据
 * 加载完再断言），循环会让它永远等不到结果——表现为 `Detected unsettled top-level await`。
 * 改为校验合并结果还更贴近事实：页面看到的正是这份合并后的数据。
 */
const bookPlotEntries = allEntries.filter(
  (e) => e.moduleId === 'literature' && e.data.book?.chapters?.length,
);
const bookPlotIds = new Set<string>();
let bookPlotBad = 0;
let bookPlotQuestions = 0;

for (const entry of bookPlotEntries) {
  const book = entry.data.book;
  if (!book) continue;
  const at = `[名著脉络] ${entry.id}`;
  if (bookPlotIds.has(entry.id)) err(`${at}: 同一部名著出现了两条脉络数据`);
  bookPlotIds.add(entry.id);

  if ((book.chapters?.length ?? 0) < 8) {
    bookPlotBad += 1;
    err(`${at}: 章节简介只有 ${book.chapters?.length ?? 0} 条，至少 8 条才撑得起整本书`);
  }
  if ((book.plotChain?.length ?? 0) < 6) {
    bookPlotBad += 1;
    err(`${at}: 情节主线只有 ${book.plotChain?.length ?? 0} 环，至少 6 环才能串成主线`);
  }
  if ((book.mnemonic?.length ?? 0) < 2) {
    bookPlotBad += 1;
    err(`${at}: 记忆口诀至少 2 条`);
  }
  for (const c of book.chapters ?? []) {
    if (!c.name?.trim() || !c.summary?.trim()) err(`${at}: 有章节缺 name 或 summary`);
    else if (c.summary.length < 30) {
      warn(`${at}: 章节「${c.name}」简介只有 ${c.summary.length} 字，可能过于简略`);
    }
  }
  for (const step of book.plotChain ?? []) {
    if (!step?.trim()) err(`${at}: 情节主线里有空的一环`);
  }

  // 本部考点题：数量、题型、考点词表
  const qs = entry.questions.filter((q) => q.id.includes('-gz-'));
  bookPlotQuestions += qs.length;
  if (qs.length < 6) {
    bookPlotBad += 1;
    err(`${at}: 考点题只有 ${qs.length} 道，至少 6 道`);
  }
  const shorts = qs.filter((q) => q.type === 'short').length;
  if (shorts < 2) {
    bookPlotBad += 1;
    err(`${at}: 广州附加题以简答为主，至少要有 2 道简答题，实际 ${shorts} 道`);
  }
  const covered = new Set<string>();
  for (const q of qs) {
    const tags = q.tags ?? [];
    const points = tags.filter((t) => BOOK_EXAM_POINT_TAGS.includes(t));
    if (!points.length) {
      err(`${at}: 题目 ${q.id} 没有使用受控考点词（${tags.join('/')}），考点页会漏掉它`);
    }
    for (const p of points) covered.add(p);
    if (q.type === 'short' && !(q.rubric ?? []).length) {
      err(`${at}: 简答题 ${q.id} 缺少 rubric 踩分点`);
    }
  }
  if (covered.size < 4) {
    bookPlotBad += 1;
    err(`${at}: 只覆盖了 ${covered.size} 个考点（${[...covered].join('、')}），一部名著应覆盖至少 4 类`);
  }
}

// 12 部必读名著（category 为「名著导读」）都应拿到章节脉络
const requiredBooks = allEntries.filter(
  (e) => e.moduleId === 'literature' && e.data.category === '名著导读',
);
const booksWithoutPlot = requiredBooks.filter((e) => !e.data.book?.chapters?.length);
for (const e of booksWithoutPlot) {
  err(`[名著脉络] 必读名著「${e.title}」还没有章节脉络数据（chapters 为空）`);
}


/**
 * 古诗词不预置题目，走的是另一套聚类考点。这里保证：
 * 每个考点至少 2 篇（只有一篇没有串联价值）、篇目 id 真实存在、
 * tag / titles 一一对应，并统计有多少首诗被考点覆盖到。
 */
const poemPoints = poemExamPoints();
let poemPointBad = 0;
const coveredPoems = new Set<string>();
for (const p of poemPoints) {
  if (p.entryIds.length < 2) {
    poemPointBad += 1;
    err(`[古诗词考点] 「${p.tag}」只有 ${p.entryIds.length} 篇，不足以成考点`);
  }
  if (p.entryIds.length !== p.titles.length) {
    poemPointBad += 1;
    err(`[古诗词考点] 「${p.tag}」的篇目 id 与标题数量不一致`);
  }
  if (!p.tag.startsWith(`${p.kind}·`) || p.tag.length <= p.kind.length + 1) {
    poemPointBad += 1;
    err(`[古诗词考点] 「${p.tag}」命名不符「${p.kind}·名称」`);
  }
  for (const id of p.entryIds) {
    const e = entryIndex.get(id);
    if (!e) {
      err(`[古诗词考点] 「${p.tag}」引用了不存在的篇目 ${id}`);
      continue;
    }
    if (e.moduleId !== 'poems') err(`[古诗词考点] 「${p.tag}」的 ${id} 不属于古诗词模块`);
    coveredPoems.add(id);
  }
}

/* 「关联学习」（🔗 同类作品横向比较）同样不能自我指涉，且必须给出理由 */
let relSelfRef = 0;
let relNoReason = 0;
let relTotal = 0;
for (const e of allEntries) {
  // 同样走「页面上真实用的那条路径」（清单 + 已加载条目），而不是全量数据
  for (const r of relatedEntries(relOfEntry(e), LIGHT_POOL, 6)) {
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

/* ------------------------ 历史：备考内容完整性 ------------------------ */

/**
 * 历史这一科的价值全在「内容是否真的能拿来复习」，因此逐条检查结构完整性：
 * 缺时间轴、缺分层考点、缺材料题，页面都不会报错，只是学生复习时发现少东西。
 *
 * 另外**照官方结构验卷**：2027—2029 年广州中考历史为
 * 单项选择 20 小题 40 分 + 非选择题（阅读材料，回答问题）3 小题 30 分 = 70 分、60 分钟闭卷
 * （广州市教育局《2027—2029年广州市初中学业水平考试录取计分科目考试实施方案》）。
 * 结构一改，这里的数字就要跟着改——这正是它存在的意义：防止卷子悄悄变成「不是广州的卷子」。
 */
const HISTORY_STRUCTURE = { choice: { count: 20, score: 40 }, material: { count: 3, score: 30 }, total: 70, duration: 60 };

const historyTopics = allTopics;
let histBad = 0;
const levelCount: Record<string, number> = { 重点: 0, 次重点: 0, 了解: 0 };
let histMaterialGroups = 0;
let histAsks = 0;

for (const t of historyTopics) {
  const at = `[历史] ${t.id}`;
  const isTopic = t.id.startsWith('ht-');
  const need = (cond: boolean, msg: string) => {
    if (!cond) {
      histBad += 1;
      err(`${at}: ${msg}`);
    }
  };

  need(Boolean(t.mainline?.trim()), '缺少主线（mainline）');
  need(Boolean(t.period?.trim()), '缺少时段（period）');
  need(Boolean(t.unit?.trim()), '缺少单元/专题分类（unit，会作为模块页筛选的主标签）');
  need(t.timeline.length >= (isTopic ? 8 : 4), `时间轴只有 ${t.timeline.length} 条（应 ≥${isTopic ? 8 : 4}）`);
  need(t.points.length >= 5, `分层考点只有 ${t.points.length} 条（应 ≥5）`);
  need(t.points.filter((p) => p.level === '重点').length >= 3, '「重点」不足 3 条（备考要先分出主次）');
  need((t.conclusions?.length ?? 0) >= 3, '必背结论不足 3 条');
  need((t.confusions?.length ?? 0) >= 2, '易错易混不足 2 条');
  need((t.compares?.length ?? 0) >= 1, '缺少关联与对比表');
  need((t.examAngles?.length ?? 0) >= 2, '命题角度不足 2 条');
  need((t.materials?.length ?? 0) >= 1, '缺少材料大题');
  need(t.questions.length >= 4, `选择题不足 4 道（只有 ${t.questions.length}）`);

  for (const p of t.points) {
    if (!['重点', '次重点', '了解'].includes(p.level)) {
      histBad += 1;
      err(`${at}: 考点层级非法「${p.level}」`);
    } else levelCount[p.level] += 1;
    if (!p.text?.trim()) err(`${at}: 有考点没有内容`);
  }

  for (const p of t.timeline) {
    if (!p.time?.trim() || !p.event?.trim()) err(`${at}: 时间轴存在缺时间或缺事件的行`);
    /*
     * 时间表述要能看出年代，否则学生无从定位。
     * 但历史上「时间」有三种合法写法，不能只认公历年：
     *   ① 公元纪年：「公元前 221 年」「1840 年」；② 世纪/年代：「公元前 5 世纪」；
     *   ③ 朝代与帝号：「隋唐、北宋」「唐太宗时」「元朝」。
     */
    if (p.time && !/年|世纪|年代|时期|初|末|[隋唐宋元明清秦汉晋周夏商]/.test(p.time)) {
      err(`${at}: 时间「${p.time}」看不出年代`);
    }
  }

  for (const c of t.compares ?? []) {
    if (!c.rows?.length) err(`${at}: 对比表「${c.title}」没有行`);
    if (!c.left?.trim() || !c.right?.trim()) err(`${at}: 对比表「${c.title}」缺少左右两栏名称`);
  }

  for (const g of t.materials ?? []) {
    histMaterialGroups += 1;
    histAsks += g.questions.length;
    if (g.questions.length < 2) err(`${at}: 材料组 ${g.id} 只有 ${g.questions.length} 个设问（应 ≥2）`);
    if (!g.material?.includes('【材料')) warn(`${at}: 材料组 ${g.id} 未用【材料一】标注材料`);
    for (const q of g.questions) {
      if (!q.answer?.trim()) err(`${at}: 材料设问 ${q.id} 没有参考答案`);
      if (!q.rubric?.length) err(`${at}: 材料设问 ${q.id} 没有踩分点`);
    }
  }
}

/* 模拟卷：严格照广州中考结构验卷 */
const papers = allPapers;
let paperBad = 0;
for (const p of papers) {
  const at = `[历史·模拟卷] ${p.id}`;
  const score = p.sections.reduce((n, s) => n + s.score, 0);
  const choice = p.sections.find((s) => s.kind === 'choice');
  const material = p.sections.find((s) => s.kind === 'material');
  const choiceQs = p.questions.filter((q) => q.type === 'choice').length;
  const check = (cond: boolean, msg: string) => {
    if (!cond) {
      paperBad += 1;
      err(`${at}: ${msg}`);
    }
  };
  check(score === p.totalScore, `各题型分值合计 ${score} ≠ 全卷 ${p.totalScore}`);
  check(p.totalScore === HISTORY_STRUCTURE.total, `全卷 ${p.totalScore} 分 ≠ 广州结构 ${HISTORY_STRUCTURE.total} 分`);
  check(p.duration === HISTORY_STRUCTURE.duration, `时长 ${p.duration} 分钟 ≠ ${HISTORY_STRUCTURE.duration} 分钟`);
  check(
    choice?.count === HISTORY_STRUCTURE.choice.count && choice?.score === HISTORY_STRUCTURE.choice.score,
    `选择题结构应为 ${HISTORY_STRUCTURE.choice.count} 题 ${HISTORY_STRUCTURE.choice.score} 分，实际 ${choice?.count} 题 ${choice?.score} 分`,
  );
  check(
    material?.count === HISTORY_STRUCTURE.material.count && material?.score === HISTORY_STRUCTURE.material.score,
    `非选择题结构应为 ${HISTORY_STRUCTURE.material.count} 题 ${HISTORY_STRUCTURE.material.score} 分，实际 ${material?.count} 题 ${material?.score} 分`,
  );
  check(choiceQs === HISTORY_STRUCTURE.choice.count, `卷内选择题 ${choiceQs} 道 ≠ ${HISTORY_STRUCTURE.choice.count} 道`);
  check(p.materials.length === HISTORY_STRUCTURE.material.count, `材料题 ${p.materials.length} 组 ≠ ${HISTORY_STRUCTURE.material.count} 组`);
  check(Boolean(p.basis?.includes('广州')), '缺少「按广州中考结构命题」的说明（basis）');
}

console.log(
  `  历史备考          条目 ${historyTopics.length} 个 / 模拟卷 ${papers.length} 套` +
    `（结构异常 ${histBad + paperBad} 处）`,
);
console.log(
  `      分层考点           重点 ${levelCount['重点']} · 次重点 ${levelCount['次重点']} · 了解 ${levelCount['了解']}`,
);
console.log(
  `      材料大题           ${histMaterialGroups} 组 / ${histAsks} 问（参考答案与踩分点齐全）`,
);

/* ----------------- 历史：中考专题与考点索引是否覆盖各册 ----------------- */

/**
 * 两个「导航性」检查：
 *   1. 中考专题必须真的**跨册**：一个专题只引用一册的内容就不是专题，而是单元复习；
 *   2. 六册教材每一册都要有内容，否则学生点进去是空的（新学科最容易漏一册）。
 */
const HISTORY_TEXTBOOK_MODULES = ['hist-7a', 'hist-7b', 'hist-8a', 'hist-8b', 'hist-9a', 'hist-9b'];
const emptyModules = HISTORY_TEXTBOOK_MODULES.filter(
  (m) => !allEntries.some((e) => e.moduleId === m),
);
if (emptyModules.length) err(`[历史] 下列教材模块没有任何内容：${emptyModules.join('、')}`);

const crossBookTopics = historyTopics.filter((t) => t.id.startsWith('ht-'));
if (crossBookTopics.length < 6) {
  warn(`[历史] 中考专题只有 ${crossBookTopics.length} 个（建议 ≥6 个，覆盖主要横向线索）`);
}
for (const t of crossBookTopics) {
  const text = [
    t.mainline,
    ...t.timeline.map((p) => `${p.time}${p.event}`),
    ...t.points.map((p) => p.text),
  ].join(' ');
  /**
   * 跨册判据：一条专题必须触及**两「段」教材**，否则它只是单元复习。
   * 这里按四个「段落」打桶，命中 ≥2 桶即算跨册：
   *   ① 古代（朝代名或公元前的年份）；② 近代中国（1840—1949）；
   *   ③ 现代中国（1950 年及以后）；④ 世界史（一战/二战/苏联/新航路/工业革命…）。
   *
   * 一开始只按「年代跨度 ≥300 年」判断，结果把「党史百年」这种正经专题误判了——
   * 近现代专题跨度本来就不到 200 年，但它横跨八上、八下与九下，显然是跨册的。
   */
  const years = [...text.matchAll(/(公元前)?(\d{1,4})\s?年/g)].map((m) =>
    m[1] ? -Number(m[2]) : Number(m[2]),
  );
  const buckets = [
    /[秦汉魏晋隋唐宋元明清]|公元前/.test(text),
    years.some((y) => y >= 1840 && y <= 1949),
    years.some((y) => y >= 1950),
    /一战|一战|第二次世界大战|苏联|新航路|工业革命|文艺复兴|冷战|联合国|欧洲|美国|日本|英国|法国|俄国|雅典|罗马/.test(text),
  ].filter(Boolean).length;
  if (buckets < 2) {
    warn(`[历史·专题] ${t.id}「${t.title}」看不出跨册跨度（只触及 ${buckets} 段教材范围）`);
  }
}

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

/* --------------- 朗读分段 / 逐词释义 / 小段遮罩 --------------- */

/**
 * 这三块都是「页面渲染得出来、但可能悄悄缺内容」的功能，因此逐条内容检查：
 *
 *   1. **整页朗读**：每条内容都要能拆出段落（没有段落的条目点朗读等于没反应）；
 *      段落文本必须非空、不含公式（`$…$` 读出来是乱码）；
 *   2. **逐词释义**：古诗词与文言文的正文里必须真的能匹配到词条，
 *      否则正文上一条虚线也不会出现，tooltip 形同虚设；
 *   3. **小段遮罩**：`splitSegments` 切出来的小段拼回去必须等于原句（不能丢字、不能吞标点），
 *      且每段不超过 6 个汉字——这就是「五言一句正好一段」：按标点切成小句后，
 *      六字以内的小句自成一段（如「枯藤老树昏鸦」），更长的才按 5 个汉字再断
 *      （七言断成 5+2）。学生一次只练半句，不必整行一起遮。
 */
let speechEmpty = 0;
let speechBad = 0;
let speechSegs = 0;
for (const e of allEntries) {
  const segs = speechSegmentsOf(e);
  speechSegs += segs.length;
  if (!segs.length) {
    speechEmpty += 1;
    err(`[朗读] ${e.id}（${e.moduleId}）拆不出任何可朗读段落`);
    continue;
  }
  for (const s of segs) {
    if (!s.text.trim() || s.text.includes('$')) speechBad += 1;
  }
}
if (speechBad) err(`[朗读] 有 ${speechBad} 段为空或含公式（公式读出来是乱码）`);

/** 正文里真的能标出词条的内容条数（tooltip 有没有实际效果） */
let glossEntries = 0;
let glossWords = 0;
const glossNoHit: string[] = [];
const glossNoHitByModule = new Map<string, number>();
for (const e of allEntries) {
  if (e.moduleId !== 'poems' && e.moduleId !== 'classical') continue;
  const words = glossaryOf(e);
  const body =
    e.moduleId === 'poems'
      ? (e.data.lines ?? []).join('')
      : (e.data.paragraphs ?? []).join('');
  const hit = words.filter((w) => body.includes(w.word));
  glossWords += hit.length;
  if (hit.length) glossEntries += 1;
  else {
    glossNoHit.push(e.id);
    glossNoHitByModule.set(e.moduleId, (glossNoHitByModule.get(e.moduleId) ?? 0) + 1);
  }
}

let maskBad = 0;
let maskSegments = 0;
for (const p of allPoems) {
  for (const line of p.lines) {
    const segs = splitSegments(line);
    maskSegments += segs.length;
    const joined = segs.join('');
    if (joined !== line) {
      maskBad += 1;
      err(`[小段遮罩] ${p.id}「${line}」切段后拼不回原句：${joined}`);
    }
    for (const s of segs) {
      const hanzi = s.replace(/[^\u4e00-\u9fa5]/g, '').length;
      if (hanzi > 6) {
        maskBad += 1;
        err(`[小段遮罩] ${p.id}「${line}」有一段 ${hanzi} 个汉字（应 ≤6）：${s}`);
      }
    }
  }
}

console.log(
  `  朗读与释义        整页朗读 ${speechSegs} 段（${allEntries.length} 条内容，拆不出段落的 ${speechEmpty} 条）`,
);
console.log(
  `      ${'正文可标词条'.padEnd(22)} ${glossEntries} 条内容 / ${glossWords} 个词条命中` +
    `（${glossNoHit.length} 条一个词都标不出：${[...glossNoHitByModule]
      .map(([m, n]) => `${m} ${n}`)
      .join('、') || '无'}）`,
);
if (glossNoHit.length) console.log(`      标不出词条的条目：${glossNoHit.slice(0, 8).join('、')}`);
console.log(
  `      ${'背诵小段'.padEnd(22)} ${maskSegments} 个小段，异常 ${maskBad} 处`,
);

console.log(
  `  知识联动         学一补多 ${suppTotal} 条 / 关联学习 ${relTotal} 条`,
);
console.log(
  `      ${'自指'.padEnd(22)} ${String(suppSelfRef + relSelfRef).padStart(4)}` +
    `   重复 ${suppDup}   空分组条目 ${suppEmpty}   不对称 ${suppAsym}   缺理由 ${relNoReason}`,
);
console.log(
  `      按需加载一致性      ${allEntries.length} 条逐条比对，` +
    `「只加载当前模块」与「全量数据」结果不一致 ${suppParity} 条`,
);
if (suppEmptyIds.length) {
  console.log(`      补不出内容的条目：${suppEmptyIds.slice(0, 8).join('、')}`);
}
console.log(
  `      文学常识被关联      ${litAll.length - litNoInbound} / ${litAll.length} 条` +
    `（无入边 ${litNoInbound} 条，其中 l-au- / l-tical- 为 ${unreachable.length} 条）`,
);
console.log(
  `      古诗词考点          ${poemPoints.length} 个（主题/意象/作者聚类）` +
    `，覆盖 ${coveredPoems.size} / ${allPoems.length} 首，异常 ${poemPointBad} 处`,
);
console.log(
  `      名著章节脉络        ${bookPlotEntries.length} / ${requiredBooks.length} 部` +
    `，考点题 ${bookPlotQuestions} 道，异常 ${bookPlotBad} 处`,
);
console.log(
  `      课时思维导图        ${lessonMapTotal} 张（由数据推导，语文条目全覆盖）`,
);
console.log(
  `      响应式导航          顶栏 ≤${hideTopnav?.[1] ?? '?'}px 隐藏 / 标签栏 ≥${hideTabbar?.[1] ?? '?'}px 隐藏`,
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
