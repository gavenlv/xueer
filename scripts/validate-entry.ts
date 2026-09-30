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
  isScopeReady,
  loadProgress,
  mindMaps,
  extensions,
  poemExamPoints,
  subscribeLoadProgress,
  ensureAll,
  ensureModules,
  type LoadProgress,
} from '../src/data';
import { allPoems } from '../src/data/chinese';
// 「按条目懒加载」的注册表：题型专题的骨架 / 正文 / 页面接线都由它统一校验
// （语文中考专题与数学中考题型专题登记在同一张表里，见 src/data/lazyEntries.ts）
import { lazyEntryModules } from '../src/data/lazyEntries';
import { allTopics, allPapers } from '../src/data/history';
// allTopics 含 pol-exam 的「题型专题」（与整卷共用 pol-exam），allPapers 只含卷子：
// 校验卷面结构必须从 allPapers 取，不能按 moduleId === 'pol-exam' 从条目里筛。
import { allPapers as polPapers, allTopics as polTopics } from '../src/data/politics';
import { validateChemistry } from './validate-chemistry';
import { validateAllExamTopics } from './validate-exam-topics';
import { validatePhysics } from './validate-physics';
import type { EnglishKnowledge, EnglishPaper, PoliticsPaper } from '../src/types';
import { BOOK_EXAM_POINT_TAGS } from '../src/lib/bookExams';
import { DAILY_LINES, ENTRY_META, MODULE_TOTALS } from '../src/data/summary';
import { lessonMindMap } from '../src/lib/lessonMaps';
import { searchTextOf } from '../src/lib/searchText';
import { isExamTopicData } from '../src/lib/examTopic';
import { SUBJECTS } from '../src/data/subjects';
import { makeReciteQuestions } from '../src/lib/quiz';
import { relatedEntries, supplementsOf, litMatchIndex } from '../src/lib/relations';
import { relOfEntry, relOfEntryFull, relPool } from '../src/lib/relNode';
import { speechSegmentsOf } from '../src/lib/entrySpeech';
import { glossaryOf } from '../src/lib/glossary';
import { splitSegments } from '../src/components/ReciteTrainer';
import { sampleLength, EXAM_MIN_WORDS } from '../src/lib/writing';
import { answerModeFor, checkFill } from '../src/lib/utils';
import { applyAnswerToProgress } from '../src/lib/progress';
import {
  RECITE_INTERVALS,
  RECITE_MASTER_STREAK,
  applyCardRecite,
  applyRecite,
  cardLevelLabel,
  daysUntilDue,
  isDue,
  isMastered,
  toMastery,
} from '../src/lib/recite';
import { reciteCardsOf } from '../src/lib/reciteCards';
import { mergeStates, normalizeStudyState } from '../src/lib/sync';
import type {
  Entry,
  GradeId,
  MindNode,
  ModuleId,
  PhysicsFigure,
  QuizQuestion,
  StudyState,
  WritingLesson,
} from '../src/types';

/**
 * 内容数据已改为**按需加载**（见 `src/data/chinese/index.ts`）：
 * 页面各自声明需要的模块，而这里在校验开始前一次性把全部模块加载进来，
 * 之后所有同步查询 API 照旧可用——因此下面几百条断言完全不用改写。
 *
 * 加载进度管线放在 `ensureAll()` **之前**自测：那时内存里一个模块都没有，
 * 才能观察到「0 / N → N / N → synced」的完整过程（见下面的 `bootErrors`）。
 */
const bootErrors: string[] = [];
{
  const seen: LoadProgress[] = [];
  const unsub = subscribeLoadProgress(() => seen.push(loadProgress()));
  await ensureModules(['phy-mech', 'phy-light']);
  unsub();

  const last = seen[seen.length - 1];
  if (!seen.some((p) => p.total === 2 && p.done === 1)) {
    bootErrors.push(
      '[加载进度] 没观察到「已加载 1 / 2 块」的中间态 → 加载器没有逐模块回报，占位又变成一句静止的「正在加载内容…」',
    );
  }
  if (!last?.synced || last.failed) {
    bootErrors.push(
      '[加载进度] 加载完成后没有进入 synced 终态 → 页面会一直停在占位上或渲染出空内容',
    );
  }
  if (!last?.labels?.length) {
    bootErrors.push('[加载进度] 进度里没有范围名称 → 占位无法告诉学生正在下载哪一块');
  }
  if (!isScopeReady(['phy-mech'])) {
    bootErrors.push('[加载进度] 加载完成后 isScopeReady 仍为假');
  }
  if (!allEntries.some((e) => e.moduleId === 'phy-mech')) {
    bootErrors.push('[加载进度] 加载完成后全局容器里没有 phy-mech 的条目（syncSubjectContainers 没跑？）');
  }
}

await ensureAll();

/**
 * 全部**已上线模块**的 id（校验器必须覆盖所有学科，不能只看语文）。
 * 待开发科目的占位模块没有内容，若纳入清单比对会全部误报「缺少汇总」。
 */
const ALL_MODULE_IDS = SUBJECTS.flatMap((s) =>
  s.modules.filter((m) => m.available).map((m) => m.id),
) as ModuleId[];

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

/**
 * 数学的图必须带 `alt` 与 `prims`。
 *
 * 与物理同一条红线：整页朗读靠 `alt` 把图读出来、检索靠 `alt` 把问题搜到图上，
 * 缺了就等于一段「读不出也搜不到」的内容；`prims` 为空则图上什么都没有。
 */
function checkMathFigure(where: string, fig?: { id?: string; alt?: string; prims?: unknown[] }) {
  if (!fig) return;
  if (!fig.alt?.trim()) err(`${where}: 图「${fig.id || '(无 id)'}」缺少 alt（朗读与检索要用它）`);
  if (!Array.isArray(fig.prims) || !fig.prims.length) {
    err(`${where}: 图「${fig.id || '(无 id)'}」没有图元 prims`);
  }
}

/** 写法类缩写：`$SSS$`、`$\\mathrm{Rt}\\triangle ABC$` 里的 Rt 不是点名字母 */
const ACRONYMS = new Set(['SSS', 'SAS', 'ASA', 'AAS', 'SSA', 'AAA', 'HL', 'Rt', 'Rt△']);

/**
 * 量名字母：`S` 是面积、`V` 是体积，几何图上也**不用**这两个字母标点
 * （与量名撞车，教材一律避开），所以不要求它们在图上出现。
 */
const QUANTITY_NAMES = new Set(['S', 'V']);

/**
 * 正文是否在**用字母指代点／线段**（「$D$ 是 $AB$ 的中点」）。
 *
 * 这是「图文配套」的判据：文字用字母说话，图上就必须有这些字母；
 * 只认 `$...$` 里成串的大写字母与「如图」两种写法，避免把普通中文当图形描述。
 */
function pointLetters(text: string): Set<string> {
  const out = new Set<string>();
  if (!text) return out;
  for (const m of text.match(/\$[^$]*\$/g) ?? []) {
    // 去掉 LaTeX 命令（\triangle、\angle、\mathrm…）后再看剩下的字母
    const body = m.slice(1, -1).replace(/\\[a-zA-Z]+/g, ' ');
    // 只有**全大写**的字母串才是点名字母：`\mathrm{Rt}` 去掉命令后剩下的 `Rt`、
    // 以及 `\frac` 里的 `frac`，都是命令残渣，不能当成点 A 之类的标记。
    for (const run of body.match(/[A-Za-z]{1,4}/g) ?? []) {
      if (!/^[A-Z]+$/.test(run) || ACRONYMS.has(run)) continue;
      for (const ch of run) if (!QUANTITY_NAMES.has(ch)) out.add(ch);
    }
  }
  return out;
}

/**
 * 图里已经标出的字母（带 label 的点，或单字母的 text 标注）。
 *
 * 点的标注可以是「A」，也可以是「A(0,3.5)」这种带坐标的写法，两者都算标了 A；
 * 下标记号（`B₁`）按主字母 B 计。
 */
function figureLetters(fig: PhysicsFigure): Set<string> {
  const out = new Set<string>();
  const take = (s: string) => {
    const m = /^([A-Z])/.exec(s.trim());
    if (m) out.add(m[1]);
  };
  for (const p of fig.prims) {
    if (p.t === 'dot' && p.label) take(p.label);
    else if (p.t === 'text' && /^[A-Z][′']?$/.test(p.text.trim())) take(p.text.trim());
    // 坐标系图元自带原点字母 O（渲染器画出来的），不能因为作者没再写一个 dot 就判「没标」
    else if (p.t === 'plane') take('O');
    else if (p.t === 'axis' && p.origin) take('O');
  }
  return out;
}

/** 数学条目里每个**能配图的位置**：概念、系统讲解、公式、例题、题目 */
function mathFigureItems(
  t: import('../src/types').MathTopic,
): { at: string; text: string; figure?: PhysicsFigure }[] {
  const out: { at: string; text: string; figure?: PhysicsFigure }[] = [];
  (t.concepts ?? []).forEach((c) =>
    out.push({ at: `概念「${c.term}」`, text: `${c.explain}${c.insight ?? ''}`, figure: c.figure }),
  );
  (t.steps ?? []).forEach((s, i) =>
    out.push({ at: `系统讲解第 ${i + 1} 步「${s.heading}」`, text: `${s.body}${s.note ?? ''}`, figure: s.figure }),
  );
  (t.formulas ?? []).forEach((f) =>
    out.push({ at: `公式「${f.name}」`, text: `${f.text ?? ''}${f.note ?? ''}`, figure: f.figure }),
  );
  (t.examples ?? []).forEach((x, i) =>
    out.push({ at: `例题 ${i + 1}`, text: `${x.stem}${x.steps.join('')}${x.tip ?? ''}`, figure: x.figure }),
  );
  // 题目只看题干：选项里的 $SSS$／$SAS$ 是方法名，不是点名字母
  (t.questions ?? []).forEach((q) => out.push({ at: `题目 ${q.id}`, text: q.stem, figure: q.figure }));
  return out;
}

/**
 * 逐条核对「图文配套」：
 *
 *   ① 正文用字母指代点／线段（或写了「如图」）却**没有配图** → 告警（内容还没写完）；
 *   ② 有图，图上却**一个字母都没有** → **报错**（和「图缺 alt」同级：这不是没写完，是画错了）；
 *   ③ 图上有字母，但正文用到的字母没标全 → 告警（「哪个顶点是 A」答不上来的图就是废图）。
 */
function checkMathFigureText(where: string, t: import('../src/types').MathTopic) {
  for (const item of mathFigureItems(t)) {
    const want = pointLetters(item.text);
    const need = want.size > 0 || /如图|图意/.test(item.text);
    if (!need) continue;
    if (!item.figure) {
      warn(`${where}: ${item.at} 用字母／图说话但没有配图（几何不看图讲不清）`);
      continue;
    }
    const got = figureLetters(item.figure);
    if (!got.size) {
      err(`${where}: ${item.at} 的图「${item.figure.id}」一个字母都没标——正文靠字母指代点，图必须标出来`);
      continue;
    }
    const missing = [...want].filter((l) => !got.has(l));
    if (missing.length) warn(`${where}: ${item.at} 的图「${item.figure.id}」没标出 ${missing.join('、')}`);
  }
}

// 加载进度管线的自测结果（必须在 ensureAll 之前跑，见上面的 bootErrors）
for (const m of bootErrors) err(m);

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
        /**
         * 「中考题型专题」（`math-topics`）是**另一种形状**（`ExamTopic`：章节 / 训练 /
         * 考情，没有 `concepts` 这个字段），它的下限由 `validate-exam-topics.ts`
         * 逐项校验。这里必须先分流，否则会为每个专题刷一条「缺少核心概念 concepts」的假错
         * ——**不是内容缺失，而是拿错了尺子**。
         */
        if (isExamTopicData(entry.data)) break;
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
            // 判定定理的配图与其它图同一条红线：必须能朗读、必须画得出东西
            checkMathFigure(`${where}: 公式「${f.name}」`, f.figure);
          }
        }
        if (t.examples) {
          for (const ex of t.examples) {
            if (!ex.stem?.trim()) err(`${where}: 例题缺少题干`);
            if (!ex.steps?.length) err(`${where}: 例题缺少解题步骤`);
            if (!ex.answer?.trim()) err(`${where}: 例题缺少答案`);
            if (!ex.figure) warn(`${where}: 例题「${ex.stem.slice(0, 16)}」没有配图`);
            checkMathFigure(`${where}: 例题`, ex.figure);
          }
        }
        /**
         * 「系统讲解」与配图：数学的图不是装饰（数轴、几何图形、函数图象、统计图
         * 不看图讲不清），物理已有的 `alt` 红线这里照搬——**图必须能朗读**。
         * 缺图只告警、缺 `alt` 直接报错：前者是内容还没写完，后者是写错了。
         */
        if (!t.steps?.length) warn(`${where}: 数学知识点缺少系统讲解 steps`);
        else {
          for (const [i, s] of t.steps.entries()) {
            if (!s.heading?.trim() || !s.body?.trim()) err(`${where}: 系统讲解第 ${i + 1} 步不完整`);
            if (!s.figure) warn(`${where}: 系统讲解第 ${i + 1} 步没有配图`);
            checkMathFigure(`${where}: 系统讲解第 ${i + 1} 步`, s.figure);
          }
        }
        if (t.concepts?.length && !t.concepts.some((c) => c.figure)) {
          warn(`${where}: 核心概念一条配图都没有`);
        }
        for (const c of t.concepts ?? []) checkMathFigure(`${where}: 概念「${c.term}」`, c.figure);
        // 图文配套：正文用字母说话就必须有图，图必须有字母（见 checkMathFigureText 注释）
        checkMathFigureText(where, t);
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
/** 「同一考点」分组的关联条数（降噪规则的直接体现） */
let suppSamePoint = 0;
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
    // 「同一考点」是靠稀有标签挑出来的，数量直接反映降噪规则的松紧，单独统计给报告用
    if (g.kind === '同一考点') suppSamePoint += g.items.length;

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

/* --------------- 知识点卡片：覆盖情况（供轻量清单比对与总览统计用） --------------- */

/**
 * 卡片覆盖：**文科（语文/历史/道法/英语）与数学的每个内容条目都必须派生出卡片**。
 *
 * 这条断言直接对应「每个知识点都包含在内」——比如历史条目里的时间点、
 * 材料大题的踩分点，只要数据里有，就必须能在背诵页看到，不能悄悄漏掉。
 * 只列**确定应该产卡片**的模块，整卷模拟（题目在考试页）与待开发模块不在其中。
 */
const CARD_MODULES = new Set<string>([
  'poems',
  'vocab',
  'classical',
  'reading',
  'writing',
  'literature',
  'hist-7a',
  'hist-7b',
  'hist-8a',
  'hist-8b',
  'hist-9a',
  'hist-9b',
  'hist-topics',
  'pol-growth',
  'pol-youth',
  'pol-moral',
  'pol-law',
  'pol-nation',
  'pol-world',
  'pol-current',
  'eng-vocab',
  'eng-grammar',
  'eng-reading',
  'eng-listening',
  'eng-writing',
  'eng-topics',
  'math-number',
  'math-geometry',
  'math-stats',
  'math-formula',
  'math-model',
]);

let cardTotal = 0;
const cardCountByEntry = new Map<string, number>();
for (const e of allEntries) {
  const n = reciteCardsOf(e).length;
  cardCountByEntry.set(e.id, n);
  cardTotal += n;
  if (n === 0 && CARD_MODULES.has(e.moduleId)) {
    err(`[知识点卡片] ${e.moduleId}/${e.id}（${e.title}）派生不出任何卡片，知识点会漏在背诵页之外`);
  }
}
// 卡片 id 必须能反查回条目，否则「按学科/模块统计掌握数」会错位
for (const e of allEntries) {
  for (const c of reciteCardsOf(e)) {
    if (!c.id.startsWith(`${e.id}#`) || c.entryId !== e.id || c.moduleId !== e.moduleId) {
      err(`[知识点卡片] 卡片 ${c.id} 归属信息与实际条目 ${e.id} 不一致`);
      break;
    }
  }
}
// 同一模块内卡片 id 不得重复（id 冲突会让两条内容共享一条背诵记录）
const seenCardIds = new Set<string>();
for (const e of allEntries) {
  for (const c of reciteCardsOf(e)) {
    if (seenCardIds.has(c.id)) {
      err(`[知识点卡片] 卡片 id 重复：${c.id}`);
      break;
    }
    seenCardIds.add(c.id);
  }
}

/**
 * 关键卡片类型必须真的存在。
 *
 * 「每个知识点都包含在内」这句话最容易在这里落空：抽取器写漏一个字段，
 * 页面照样渲染、总数也照样很大，只是**历史时间点**或**材料大题踩分点**这类
 * 学生最需要背的东西一张都没有。所以按类型点名核对数量。
 */
const kindCount = new Map<string, number>();
for (const e of allEntries) {
  for (const c of reciteCardsOf(e)) kindCount.set(c.kind, (kindCount.get(c.kind) ?? 0) + 1);
}
const REQUIRED_KINDS: [kind: string, min: number, why: string][] = [
  ['默写', 500, '古诗文逐句默写（语文最核心的背诵任务）'],
  ['历史时间点', 300, '历史时间轴的每个时间点'],
  ['材料大题踩分点', 120, '历史/道法材料大题的踩分点'],
  ['必背结论', 150, '历史必背结论'],
  ['考点·重点', 300, '分层考点里的重点条目'],
  ['必背金句', 120, '道法必背金句'],
  ['概念', 250, '数学概念'],
  ['公式定理', 250, '数学公式定理'],
  // ↓ 文科「理解性」知识点：只抽了能机械默写的（默写句、时间点）而漏掉这些，
  //   学生背完字音字形却答不出赏析与考点——古诗赏析就是最典型的一项。
  ['赏析', 100, '古诗词作品赏析与考点（理解性默写与赏析题的落脚点）'],
  ['译文', 100, '古诗词整篇译文'],
  ['千古名句', 150, '古诗词千古名句'],
  ['易错字', 600, '古诗词易错字词与通假字'],
  ['主题', 120, '古诗词主题情感 + 名著主题思想'],
  ['文学常识', 20, '文言文作者、朝代与出处'],
  ['主线', 65, '历史/道法的因果主线（大题总起句）'],
  ['要点', 85, '写作方法课的核心要点'],
  ['范文点评', 130, '范文总评（作文范文 + 英语书面表达）'],
  ['整本书阅读', 160, '名著整本书阅读简答题（广州中考附加题风格）'],
  ['朗读提示', 45, '英语听说朗读与听记提示'],
];
for (const [kind, min, why] of REQUIRED_KINDS) {
  const n = kindCount.get(kind) ?? 0;
  if (n < min) {
    err(`[知识点卡片] 类型「${kind}」只有 ${n} 张（期望 ≥ ${min}）——${why} 可能漏抽了`);
  }
}

// 分项点评的类型名带维度（审题立意/结构布局/语言表达…），按前缀汇总
const reviewKindTotal = [...kindCount.entries()]
  .filter(([k]) => k.startsWith('分项点评·'))
  .reduce((n, [, v]) => n + v, 0);
if (reviewKindTotal < 250) {
  err(`[知识点卡片] 分项点评只有 ${reviewKindTotal} 张（期望 ≥ 250）——范文的审题/结构/语言/素材点评可能漏抽了`);
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
    // 卡片张数：首页/学习报告的「已标熟 N / 总数 M」全靠清单里的这个数字，
    // 清单一旦过期，掌握率就会算错（分母与实际卡片对不上）
    const cards = cardCountByEntry.get(e.id) ?? 0;
    if (m.cards !== cards) {
      err(
        `[轻量清单] 条目 ${e.id} 的卡片张数 ${m.cards} 与实际 ${cards} 不符 → 请运行 pnpm gen`,
      );
    }
  }

  const totalsById = new Map(MODULE_TOTALS.map((m) => [m.id, m]));
  for (const s of SUBJECTS) {
    for (const mod of s.modules) {
      // 待开发模块（物理/化学/道法/体育的占位轮廓）本来就没有内容，不该有汇总
      if (!mod.available) continue;
      const t = totalsById.get(mod.id as ModuleId);
      if (!t) {
        err(`[轻量清单] 缺少模块 ${mod.id} 的汇总 → 请运行 pnpm gen 重新生成`);
        continue;
      }
      const list = allEntries.filter((e) => e.moduleId === mod.id);
      const qs = list.reduce((n, e) => n + e.questions.length, 0);
      const cs = list.reduce((n, e) => n + (cardCountByEntry.get(e.id) ?? 0), 0);
      if (t.entries !== list.length || t.questions !== qs || t.cards !== cs) {
        err(
          `[轻量清单] 模块 ${mod.id} 汇总为 ${t.entries} 条 / ${t.questions} 题 / ${t.cards} 张卡片，` +
            `实际 ${list.length} 条 / ${qs} 题 / ${cs} 张 → 请运行 pnpm gen 重新生成`,
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
 * 学段：**学科页不得把「全局学段」当成「本页选过」写进模块链接**。
 *
 * 全局学段是用户级持久化设置（可能是很久以前在别处选的「九上」），一旦被写进
 * `?grade=`，模块页就会把它当成权威选择，于是从任何一科进任何单册模块都被顶到那个
 * 学段——「物理·力学基础」是人教版八上/八下内容，进来直接是空白页。
 * 这类错只在浏览器里点才暴露（SSR 下全局学段与模块学段常常恰好一致），所以钉源码写法。
 */
{
  const src = readFileSync('src/pages/SubjectPage.tsx', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  if (!/const gradeQuery = picked \? `\?grade=\$\{picked\}` : ''/.test(src)) {
    err(
      '[学段] 学科页找不到「仅在本页显式选过时才带 ?grade=」的 gradeQuery 写法：' +
        '模块链接可能又把全局学段（用户级设置）当成显式选择，会让单册模块撞空白页',
    );
  }
  if (/\?grade=\$\{(grade|gradeFilter)\}/.test(src)) {
    err(
      '[学段] 学科页把全局学段直接写进了链接（?grade=${grade}/${gradeFilter}）：' +
        '会把用户级设置当成本页的显式选择，从这一科进单册模块会被顶成空白页',
    );
  }
}

/**
 * 「正在加载内容…」必须显示**真实进度**，并且失败要有出口。
 *
 * 手机上某一科的内容有几百 KB 到数 MB，慢的时候要好几分钟。原来只有一个静止的占位：
 * 学生分不清是在下载、下了多少、还是已经卡死；更糟的是任意一次 chunk 加载失败都会
 * **永远停在这个占位上**（`useDataScope` 只在成功回调里置 ready）。这两点都只能在
 * 真机慢网下暴露，因此把「占位必须订阅进度 + 失败必须能重试」固化成规则。
 */
{
  const src = readFileSync('src/lib/useData.tsx', 'utf8');
  for (const [needle, why] of [
    ['useSyncExternalStore', '占位必须订阅加载进度（useSyncExternalStore + loadProgress）'],
    ['已等待', '占位必须显示已等待秒数，让学生分得清「在下载」与「卡死了」'],
    ['p.failed', '占位必须区分「加载失败」，不能只当成功路径'],
    ['重试', '加载失败必须给重试入口，否则失败后会一直停在占位上'],
    ['synced', '就绪判定必须等到容器同步完成，不能拿「进度 100%」当就绪（会渲染出空内容）'],
  ] as const) {
    if (!src.includes(needle)) err(`[加载进度] src/lib/useData.tsx 缺少「${needle}」→ ${why}`);
  }
}

/* --------- 题型专题：按条目懒加载（骨架 / 正文 / 页面接线 / 清单一致） --------- */

/**
 * 语文「中考专题」曾经被拼成**一个 495 kB 的块**（gzip 455 kB，比首屏还大）：
 * 学生只想看「古诗文默写」，也得先把写作、现代文、名著全部下载完。改造后是
 * 「轻量骨架 + 一条一块」，数学的「中考题型专题」用的是同一套机制
 * （`data/lazyEntries.ts` 的注册表）。于是有四件事必须**自动化**守住——它们出问题时
 * 页面都不会报错，只是「慢」或「静默少数据」，人工点几下根本发现不了：
 *
 *   ① 清单 / 骨架 / 正文三者一致：模块列表页显示的是轻量清单里的副标题
 *      （「几节 · 多少题」），正文装配出来的那条必须算出一模一样的字符串，
 *      否则点进去数字会变；
 *   ② 加载器不许静态 import 正文（那正是 495 kB 块的成因）；
 *   ③ `ensureAll()` 之后**每一条**的正文都必须已在内存里——校验脚本与冒烟测试都靠它，
 *      否则专题页会退化成加载占位、断言全红；
 *   ④ 用到正文的页面（详情 / 章节 / 练习 / 错题本 / 报告 / 考点）必须显式声明
 *      懒加载范围，否则错题与考点会静默少掉一整块。
 *
 * 这一段**遍历注册表**，因此语文、数学（以及以后任何一块）自动被覆盖。
 */
{
  // ④ 用到正文的页面必须声明范围（`useLazyEntries` 是唯一的声明方式）
  const LAZY_BODY_PAGES: [string, string][] = [
    ['src/pages/DetailPage.tsx', '详情页要渲染考情与讲解，正文没到会渲染成空白专题'],
    ['src/pages/PracticePage.tsx', '练习页要按专题正文组卷，正文没到会组出一张空卷子'],
    ['src/pages/WrongBook.tsx', '错题本按题目 id 反查题干，少一条就少一批错题'],
    ['src/pages/StatsPage.tsx', '薄弱知识点按题目标签聚合，少一条就少一片考点'],
    ['src/pages/ExamPage.tsx', '考点页按题目标签聚合，少一条就少一片考点'],
    [
      'src/pages/detail/ExamTopicSectionPage.tsx',
      '章节页要自己把这一条的正文下载下来（直接刷新 / 分享链接打开也要能看）',
    ],
  ];
  for (const [file, why] of LAZY_BODY_PAGES) {
    const src = readFileSync(file, 'utf8');
    if (!src.includes('useLazyEntries')) {
      err(`[题型专题] ${file} 没有声明懒加载正文范围（useLazyEntries）→ ${why}`);
    }
  }

  const metaById = new Map(ENTRY_META.map((m) => [m.id, m]));

  for (const mod of lazyEntryModules()) {
    const at = `[题型专题·${mod.moduleId}]`;
    const ids = [...mod.ids()];
    const list = allEntries.filter((e) => e.moduleId === mod.moduleId);

    // ① 清单 ↔ 骨架 ↔ 正文：三者必须说同一件事
    const manifest = await mod.manifest();
    const byId = new Map(manifest.map((m) => [m.id, m]));
    if (manifest.length !== ids.length) {
      err(`${at} 轻量清单有 ${manifest.length} 条，条目 id 有 ${ids.length} 个 —— 骨架或清单装配有问题`);
    }
    if (list.length !== ids.length) {
      err(`${at} 条目数为 ${list.length}，应为 ${ids.length} 个 —— 骨架或正文装配有问题`);
    }
    for (const id of ids) {
      const m = byId.get(id);
      const entry = list.find((e) => e.id === id);
      if (!m) {
        err(`${at} 轻量清单里没有 ${id} —— 模块页会少列一条内容`);
        continue;
      }
      if (!entry) {
        err(`${at} 清单里有 ${id}，但条目容器里没有它 —— 学生点进去会看到「没有找到这条内容」`);
        continue;
      }
      /**
       * 副标题必须与正文装配算出来的**完全一致**：模块列表页显示的是清单里那份
       * 「几节逐类讲透 · 多少题」，正文到位后条目会被原地补成真实数字，
       * 两者一旦不同，学生点进去会发现列表页的数字是错的。
       *
       * 清单里根本没有这一条时（内容刚写、还没跑 `pnpm gen`）跳过——
       * 那种情况由上面的 `[轻量清单]` 逐条检查统一报「请运行 pnpm gen」，不必重复刷屏。
       */
      const meta = metaById.get(id);
      if (meta && meta.subtitle !== entry.subtitle) {
        err(
          `${at} ${id} 的副标题与轻量清单不一致：` +
            `列表页（骨架）显示「${meta.subtitle}」，正文装配为「${entry.subtitle}」→ 请运行 pnpm gen`,
        );
      }
    }

    // ③ ensureAll() 之后每一条的正文都必须在内存里（顺序 = 清单顺序）
    const notReady = ids.filter((id) => !mod.isReady(id));
    if (notReady.length) {
      err(
        `${at} ensureAll() 之后仍有 ${notReady.length} 条的正文没被加载（${notReady.join('、')}）——` +
          `校验与冒烟测试会看到空内容，页面在浏览器里也会退化成加载占位`,
      );
    }
    const loaded = [...mod.loadedIds()];
    if (loaded.length !== ids.length) {
      err(`${at} 已加载的正文有 ${loaded.length} 条，应为 ${ids.length} 条`);
    } else if (loaded.some((id, i) => id !== ids[i])) {
      err(`${at} 已加载正文的顺序与清单顺序（卷面顺序）不一致`);
    }

    // ② 加载器只许动态 import / glob：静态 import 会把全部正文并成一个大 chunk
    const loaderCode = readFileSync(mod.sourceFile, 'utf8')
      // 先去掉注释：这些文件的文档注释里就写着「不要这样写」的反例，直接匹配会误报
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    const dirName = mod.contentDir.split('/').pop() ?? '';
    const staticImports = [...loaderCode.matchAll(/from\s+'([^']+)'/g)]
      .map((m) => m[1])
      .filter((p) => p.includes(`/${dirName}/`) || p.startsWith(`../${dirName}/`));
    if (staticImports.length) {
      err(
        `${at} ${mod.sourceFile} 里出现了对正文的静态 import（${staticImports.join('、')}）：` +
          `全部内容会被重新打进同一个 chunk（曾经是 495 kB），打开一条就要下载全部`,
      );
    }
    if (!/import\.meta\.glob|import\(/.test(loaderCode)) {
      err(`${at} ${mod.sourceFile} 里找不到 import() / import.meta.glob —— 正文只能按需加载，不能静态并进来`);
    }
    for (const id of ids) {
      if (!loaderCode.includes(`'${id}'`)) {
        err(`${at} 加载器表里没有 ${id} 这一条 —— 它将永远加载不出来`);
      }
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

/**
 * 手机底部弹起面板（学科 / 我的）必须是**独立滚动容器**。
 *
 * 面板贴在视口底部（bottom: 0），内容一超过一屏，多出来的部分就跑到屏幕上方；
 * 若面板自己不能滚动，学生看到的是「面板划不动，排在后面的科目怎么也点不到」——
 * 真机上才会暴露、渲染冒烟测试完全看不出来，所以把这条约束固定成规则。
 */
const sheetPanel = /\.moresheet__panel\s*\{([^}]*)\}/.exec(css);
if (!sheetPanel) {
  err('[响应式] 找不到 .moresheet__panel 样式，手机端底部面板的滚动约束可能被改坏了');
} else if (
  !/max-height\s*:/.test(sheetPanel[1]) ||
  !/overflow-y\s*:\s*auto/.test(sheetPanel[1])
) {
  err(
    '[响应式] .moresheet__panel 必须同时声明 max-height 与 overflow-y: auto：' +
      '面板贴底弹出，没有自己的滚动条时，超出一屏的科目永远够不着' +
      '（手机上「点学科进不去具体科目」就是这么来的）。',
  );
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

/**
 * 「反斜杠被 JS 字符串转义吃掉」的**静默变体**：`\f` / `\t` / `\b` 会变成控制字符，
 * KaTeX 直接报错（上面那条检查能抓到）；但 `\angle` → `angle`、`\circ` → `circ`、
 * `\sqrt` → `sqrt` 这类**反斜杠只是被丢掉**，KaTeX 照样能解析，只是渲染成一串
 * 斜体字母（学生看到的是「a n g l e PEF」而不是 ∠PEF）。
 *
 * 也就是说：把 `\frac` 写成单反斜杠的内容，**只有一部分会被 KaTeX 报错抓住**，
 * 剩下的静默渲染成错符号。这里按专题汇总一次（而不是逐处刷屏），
 * 提示作者把 `\xxx` 写成 `\\xxx`。
 *
 * 判据是「这个命令名前面既不是反斜杠也不是字母」：
 *   - 正确写法 `\frac`（运行时字符串里就是 `\frac`）→ `rac` 前面是字母 `f`，不匹配；
 *   - 被吃掉的写法（运行时字符串里是「换页符 + rac」）→ `rac` 前面既不是 `\` 也不是字母，命中。
 * 用「前面不是字母」而不是只判「前面不是反斜杠」，是因为 `\frac` 的反斜杠与 `rac` 之间
 * 隔着一个 `f`——只判反斜杠会把**正确**的公式全部误报（这个坑本文件自己踩过一次）。
 */
const EATEN_BACKSLASH =
  /(?<![\\A-Za-z])(?:rac\{|imes|riangle|ecause|herefore|angle|circ|sqrt|perp|parallel|cdot|neq|geq|leq)/;
const eatenBackslashByTopic = new Map<string, { n: number; sample: string }>();

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
  const where = `[${entry.moduleId}] ${entry.id}`;

  /**
   * 数学的「中考题型专题」（`math-topics`）与知识点条目**形状不同**：
   * 它的 `pitfalls` 是三行对象 `{wrong,right,why}`（知识点是字符串数组）、
   * 例题在 `sections[].examples` 里且是**分步解答**（`steps` + `answer`）。
   * 若照 `MathTopic` 去读，`pitfalls` 里的对象会被当成字符串交给 `$` 配对检查，
   * **校验脚本自己先崩**（`value.match is not a function`）——这也是一处「内容写了却没人校验」
   * 的入口，所以两类字段分别收集，然后跑同一套公式检查。
   */
  const fields: [string, string | undefined][] = [];

  if (isExamTopicData(entry.data)) {
    const t = entry.data;
    fields.push(['paper', t.paper], ['summary', t.summary], ['trendSummary', t.trendSummary]);
    (t.trends ?? []).forEach((x, i) => fields.push([`trends[${i}].note`, x.note]));
    (t.angles ?? []).forEach((a, i) =>
      fields.push([`angles[${i}].angle`, a.angle], [`angles[${i}].years`, a.years], [`angles[${i}].detail`, a.detail]),
    );
    (t.steps ?? []).forEach((s, i) =>
      fields.push([`steps[${i}].heading`, s.heading], [`steps[${i}].body`, s.body], [`steps[${i}].demo`, s.demo]),
    );
    (t.templates ?? []).forEach((g, i) =>
      g.items.forEach((it, k) => fields.push([`templates[${i}].items[${k}]`, it])),
    );
    (t.scoring ?? []).forEach((s, i) => fields.push([`scoring[${i}]`, s]));
    (t.pitfalls ?? []).forEach((p, i) =>
      fields.push([`pitfalls[${i}].wrong`, p.wrong], [`pitfalls[${i}].right`, p.right], [`pitfalls[${i}].why`, p.why]),
    );
    (t.sections ?? []).forEach((s, i) => {
      fields.push([`sections[${i}].intro`, s.intro], [`sections[${i}].name`, s.name]);
      (s.rules ?? []).forEach((r, k) => fields.push([`sections[${i}].rules[${k}]`, r]));
      (s.examples ?? []).forEach((ex, k) => {
        fields.push(
          [`sections[${i}].examples[${k}].text`, ex.text],
          [`sections[${i}].examples[${k}].answer`, ex.answer],
          [`sections[${i}].examples[${k}].analysis`, ex.analysis],
          [`sections[${i}].examples[${k}].fix`, ex.fix],
        );
        (ex.steps ?? []).forEach((st, j) => fields.push([`sections[${i}].examples[${k}].steps[${j}]`, st]));
      });
      // 本节易错：字符串与三行对象两种写法都允许（见 types.ts 的 ExamSection）
      (s.pitfalls ?? []).forEach((p, k) => {
        if (typeof p === 'string') fields.push([`sections[${i}].pitfalls[${k}]`, p]);
        else {
          fields.push(
            [`sections[${i}].pitfalls[${k}].wrong`, p?.wrong],
            [`sections[${i}].pitfalls[${k}].right`, p?.right],
            [`sections[${i}].pitfalls[${k}].why`, p?.why],
          );
        }
      });
    });
    (t.drills ?? []).forEach((d, i) =>
      fields.push([`drills[${i}].name`, d.name], [`drills[${i}].note`, d.note]),
    );
    (t.questions ?? []).forEach((q, i) => {
      fields.push([`questions[${i}].stem`, q.stem], [`questions[${i}].explanation`, q.explanation]);
      if (q.type !== 'choice') fields.push([`questions[${i}].answer`, String(q.answer)]);
      (q.options ?? []).forEach((o) => fields.push([`questions[${i}].option`, o]));
      (q.rubric ?? []).forEach((r, j) => fields.push([`questions[${i}].rubric[${j}]`, r]));
    });
  } else {
    const t = entry.data as import('../src/types').MathTopic;
    fields.push(['summary', t.summary]);
    // 解析（insight）也要过 KaTeX：它与 explain 同走 RichText，写错公式同样会露在页面上
    (t.concepts ?? []).forEach((c, i) =>
      fields.push([`concepts[${i}]`, c.explain], [`concepts[${i}].insight`, c.insight]),
    );
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
  }

  for (const [name, value] of fields) {
    if (!value) continue;
    // 非字符串（例如误把对象塞进来）会让下面的 `.match` 直接抛错，先挡住并报出来
    if (typeof value !== 'string') {
      err(`${where}.${name}: 字段不是字符串（${typeof value}），公式检查无法进行`);
      continue;
    }
    // 未配对的 $ 会吞掉后续内容，也是常见错误
    const dollars = (value.match(/\$/g) ?? []).length;
    if (dollars % 2 !== 0) err(`${where}.${name}: $ 符号个数为奇数（${dollars}），行内公式未闭合`);
    for (const sub of inlineTexOf(value)) {
      checkTex(sub, `${where}.${name}`);
      // 专题正文里的行内公式按规范必须是 `$…$` 包裹的 KaTeX 源码，因此可以放心按形状查
      if (isExamTopicData(entry.data) && EATEN_BACKSLASH.test(sub)) {
        const cur = eatenBackslashByTopic.get(entry.id) ?? { n: 0, sample: sub.slice(0, 40) };
        cur.n += 1;
        eatenBackslashByTopic.set(entry.id, cur);
      }
    }
  }
}

for (const [topicId, info] of eatenBackslashByTopic) {
  err(
    `[math-topics] ${topicId}: 有 ${info.n} 处 LaTeX 命令的反斜杠被 JS 字符串转义吃掉` +
      `（例如「${info.sample}」）——在单引号/双引号字符串里必须写两个反斜杠（$\\angle ABC$），` +
      `否则 KaTeX 虽然不报错，却会把 ∠ 渲染成一串斜体字母，学生看到的是「angle ABC」`,
  );
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

/* ------------------------ 知识点卡片（标熟）规则自测 ------------------------ */

// 「标熟 = 完全掌握」是学习进度的判定依据，规则一旦写错，进度数字就会骗人，
// 所以这里把遗忘曲线、同日不叠加、掉出标熟这几条都钉死。

let cc = applyCardRecite(undefined, true, T0);
const cc1 = { ...cc };
// 同一天又点了一次「背了」：只加打卡次数，熟练度与排期都不动
cc = applyCardRecite(cc, true, T0 + 60_000);
const ccSameDay = { ...cc };
// 第二天背对 → 熟练度 2
cc = applyCardRecite(cc, true, T0 + DAY_MS);
const cc2 = { ...cc };
// 第三天背对 → 达到标熟
cc = applyCardRecite(cc, true, T0 + 3 * DAY_MS);
const ccMastered = { ...cc };
// 标熟之后又背错 → 掉出标熟，明天重来
cc = applyCardRecite(cc, false, T0 + 4 * DAY_MS);
const ccFall = { ...cc };

const cardCases: [string, boolean, string][] = [
  [
    '首次背对 → 熟练度 1，1 天后复习',
    cc1.streak === 1 && cc1.times === 1 && cc1.dueAt === T0 + RECITE_INTERVALS[0] * DAY_MS,
    JSON.stringify(cc1),
  ],
  [
    '同一天重复「背了」只加次数、不加熟练度（防连点刷熟）',
    ccSameDay.times === 2 &&
      ccSameDay.streak === 1 &&
      ccSameDay.dueAt === cc1.dueAt &&
      !isMastered(ccSameDay),
    JSON.stringify(ccSameDay),
  ],
  [
    '隔天背对 → 熟练度 2，按 2 天档排期',
    cc2.streak === 2 &&
      cc2.times === 3 &&
      cc2.dueAt === T0 + DAY_MS + RECITE_INTERVALS[1] * DAY_MS,
    JSON.stringify(cc2),
  ],
  [
    `连背 ${RECITE_MASTER_STREAK} 天 → 标熟（= 完全掌握）`,
    isMastered(ccMastered) && ccMastered.masteredAt === T0 + 3 * DAY_MS,
    JSON.stringify(ccMastered),
  ],
  ['标熟后「还差几次」归零', toMastery(ccMastered) === 0, String(toMastery(ccMastered))],
  ['标熟标签文案正确', cardLevelLabel(ccMastered) === '已标熟', cardLevelLabel(ccMastered)],
  [
    '背错 → 掉出标熟，1 天后重来',
    !isMastered(ccFall) &&
      ccFall.streak === 0 &&
      ccFall.dueAt === T0 + 4 * DAY_MS + RECITE_INTERVALS[0] * DAY_MS,
    JSON.stringify(ccFall),
  ],
  ['未背过的卡片显示「还没背过」', cardLevelLabel(undefined) === '还没背过', cardLevelLabel(undefined)],
];

const cardFailures = cardCases.filter(([, ok]) => !ok);

/* ------------------------ 云端合并规则自测 ------------------------ */

/**
 * 学段的合并曾写成 `grade !== '7a' ? local.grade : remote.grade`——
 * 拿默认值 `'7a'` 当「本地没选过」的哨兵。可「七上」本身就是学生会主动选的学段，
 * 于是一个在设备上明确选了七上的学生，一登录就被云端学段覆盖掉。
 * 这里把「按 gradePicked 标记判断」钉死，防止哨兵写法回潮。
 */
function stateWith(grade: GradeId, gradePicked: boolean): StudyState {
  return normalizeStudyState({ grade, gradePicked });
}

const localPicked7a = stateWith('7a', true);
const localNeverPicked = stateWith('7a', false);
const remote9b = stateWith('9b', true);

const mergeCases: [string, boolean, string][] = [
  [
    '本地主动选「七上」时保留本地，不被云端学段覆盖',
    mergeStates(localPicked7a, remote9b).grade === '7a',
    mergeStates(localPicked7a, remote9b).grade,
  ],
  [
    '本地从没选过学段 → 跟随云端',
    mergeStates(localNeverPicked, remote9b).grade === '9b',
    mergeStates(localNeverPicked, remote9b).grade,
  ],
  [
    '「学生选过」标记在合并后保留（任一侧选过即算选过）',
    mergeStates(localNeverPicked, remote9b).gradePicked === true &&
      mergeStates(localPicked7a, normalizeStudyState({})).gradePicked === true,
    String(mergeStates(localNeverPicked, remote9b).gradePicked),
  ],
  [
    '没选过的旧数据不会被凭空标成「选过」',
    normalizeStudyState({ grade: '7a' }).gradePicked === false,
    String(normalizeStudyState({ grade: '7a' }).gradePicked),
  ],
];

const mergeFailures = mergeCases.filter(([, ok]) => !ok);


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
  // —— 英语填空题：大小写不该算错（中文没有大小写，这几条同时也是回归保护）——
  ['Enough', 'enough', true, '英语填空首字母大写应判对'],
  ['ENOUGH', 'enough', true, '全大写应判对'],
  ['has been', 'hasbeen', true, '英语填空空格容错'],
  ['enough', 'enough|Enough', true, '旧写法（列举大小写）仍然有效'],
  ['enoug', 'enough', false, '英语拼错必须判错'],
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

/**
 * 理科数值填空题用例（物理、化学）。
 *
 * 这一组是**真实踩过的坑**：物理填空题的答案就是一个数，而 `loose` 归一化会把小数点
 * 当成标点删掉（`2.7` → `27`），于是学生填 `27` 会被判对、`3.6` 与 `36` 会互相判对。
 * 理科的掌握判定是「每道题都过关」——判分一松，过关记录本身就是错的。
 * 现在 `phy-` / `chem-` 走 `numeric` 模式：按数值比，容忍写法差异、不容忍数量级错误。
 */
const numericCases: [input: string, answer: string, expect: boolean, note: string][] = [
  ['2.7', '2.7', true, '同一个数'],
  ['2.70', '2.7', true, '末尾多余的 0 容错'],
  ['2.7', '27', false, '小数点被吞掉会判对——这条就是修 bug 的原因'],
  ['3.6', '36', false, '3.6 与 36 不是同一个数'],
  ['0.5', '1/2', true, '分数与小数等价'],
  ['１２０００', '12000', true, '全角数字容错'],
  ['1.0e4', '10000', true, '科学计数法'],
  ['1200', '12000', false, '数量级错必须判错'],
  ['0.50 A', '0.5|0.5 A|0.50', true, '带单位 + 多一个尾零仍算对'],
  ['2A', '2|2 A|2A', true, '紧贴单位'],
  ['10 Ω', '10Ω|10 Ω', true, '带空格与不带空格的单位写法都容错'],
  ['2.5 A', '2|2 A|2A', false, '数值不对，带单位也不能判对'],
  ['平衡力', '平衡力', true, '非数值答案退回文字比较'],
  ['平衡力', '非平衡力', false, '非数值答案仍要判错'],
  ['', '2.7', false, '空答案判错'],
];
const numericFailures = numericCases.filter(
  ([input, answer, expect]) => checkFill(input, answer, answerModeFor('phy-mech-6', answer)) !== expect,
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

/**
 * 材料设问必须标注分值，且一组的合计要说得通。
 *
 * 广州中考的非选择题设问都带分值（如「……（4 分）」），学生据此分配答题篇幅——
 * 少了分值，学生只能凭感觉写。这条检查很便宜，但能挡住「抄漏括号」这种低级错。
 * 中考专题与模拟卷的一组材料固定 10 分（3+3+4 或 4+3+3 这类组合），因此顺便核对合计。
 */
let askNoScore = 0;
const scoreSumOf = (stems: string[]): number => {
  let sum = 0;
  for (const stem of stems) {
    const m = /[（(]\s*(\d+)\s*分\s*[)）]/.exec(stem);
    if (!m) {
      askNoScore += 1;
      err(`[历史] 设问「${stem.slice(0, 26)}…」没有标注分值`);
    } else sum += Number(m[1]);
  }
  return sum;
};
for (const t of historyTopics) {
  for (const g of t.materials ?? []) {
    const sum = scoreSumOf(g.questions.map((q) => q.stem));
    if (t.id.startsWith('ht-') && sum !== 10) {
      warn(`[历史·专题] ${g.id} 各设问分值合计 ${sum} 分（专题材料题应为 10 分）`);
    }
  }
}
for (const p of papers) {
  for (const g of p.materials) {
    const sum = scoreSumOf(g.questions.map((q) => q.stem));
    if (sum !== HISTORY_STRUCTURE.material.score / HISTORY_STRUCTURE.material.count) {
      warn(`[历史·模拟卷] ${g.id} 各设问分值合计 ${sum} 分（整套应为每题 10 分）`);
    }
  }
}
console.log(
  `      材料设问分值       ${histMaterialGroups} 组 / ${histAsks} 问全部标注分值` +
    `（专题与模拟卷每组合计 10 分，缺分值 ${askNoScore} 处）`,
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

/* --------------- 选择题答案分布（防「全押一个字母」） --------------- */

/**
 * 题库最容易出的「一眼假」问题：答案全集中在某个字母上，甚至某个字母一次都没出现。
 * 这不仅让题目显得是凑出来的，还会让学生**靠位置蒙对**——选择题就失去区分度了。
 *
 * 实测抓过一次：某册历史初稿 36 道选择题里 B 占 23 道、D 一道没有（已用「重排选项顺序」
 * 修正，答案分布改为 A6/B10/C10/D10）。这类问题逐题看不出来，只有统计才看得见。
 * 只报警告不报错：偶尔缺一个字母可能是内容本身决定的。
 */
let distWarned = 0;
const distLines: string[] = [];
for (const m of ALL_MODULE_IDS) {
  const qs = allEntries
    .filter((e) => e.moduleId === m)
    .flatMap((e) => e.questions)
    .filter((q) => q.type === 'choice');
  if (qs.length < 10) continue;
  const counts = new Map<string, number>();
  for (const q of qs) counts.set(q.answer, (counts.get(q.answer) ?? 0) + 1);
  const missing = ['A', 'B', 'C', 'D'].filter((k) => !counts.has(k));
  const [topLetter, topCount] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? ['-', 0];
  const ratio = topCount / qs.length;
  distLines.push(
    `${m}（${qs.length} 题：${[...counts]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}${v}`)
      .join(' ')}）`,
  );
  if (missing.length || ratio > 0.45) {
    distWarned += 1;
    warn(
      `[答案分布] ${m}：${qs.length} 道选择题中「${topLetter}」占 ${Math.round(ratio * 100)}%` +
        `${missing.length ? `，且没有 ${missing.join('/')}` : ''}——学生能靠位置蒙对，建议打乱选项顺序`,
    );
  }
}
console.log(
  `  选择题答案分布    ${distWarned} 个模块分布异常（单字母占比 >45% 或某字母完全缺失）`,
);

/* --------------- 中考作文范文：每个主题都要有多篇完整例文 --------------- */

/**
 * 作文是语文中考里单项分值最高的题（广州 2027 起：写作与表达 60 分 / 全卷 140 分，约 43%），
 * 所以范文不能只给「片段 + 一段好评」。这里逐主题、逐篇检查：
 *
 *   1. 每个中考高频主题至少 **3 篇完整例文**（不是片段）；
 *   2. 每篇例文要能直接拿来学：命题形式、字数、档次、亮点句（≥2）、
 *      分项点评（≥4 个评分维度）、总评（≥120 字）；
 *   3. 正文字数要够（≥500 汉字），且**声明字数与正文实际字数一致**（差得太多会误导学生）。
 *
 * 「完整例文」是这次改版的核心要求：片段范文能讲技法，但学生看不到一篇 800 字的文章
 * 是怎么一步步走完的，所以按主题成组给全文。
 */
const WRITING_THEMES = [
  '亲情', '师生', '成长', '城市生活', '家国', '文化传承',
  '挫折', '思辨', '自然感悟', '平凡英雄', '传统文化', '生活哲理',
];
const hanziCount = (s: string) => (s.match(/[\u4e00-\u9fa5]/g) ?? []).length;

const sampleLessons = allEntries.filter(
  (e) => e.moduleId === 'writing' && (e.data as WritingLesson).category === '范文点评',
);
const themeStat = new Map<string, { samples: number; words: number; lessons: number }>();
let sampleBad = 0;
let sampleTotal = 0;
let sampleWords = 0;

/**
 * 范文条目里有两类 example，要求不同，不能一刀切：
 *
 *   - **完整例文**（≥600 字，按含标点计）——学生要拿它当整篇的样板，因此必须带
 *     命题形式、档次参考、亮点句、分项点评与足量总评；
 *   - **片段对照 / 升格示例**（短）——它是「改前 → 改后」的局部示范，
 *     只要求 `comment` 讲清改动的道理，不要求命题形式与档次。
 *
 * 主题覆盖率只统计**完整例文**：用户要的是「每个主题多篇完整例文」。
 */
for (const e of sampleLessons) {
  const w = e.data as WritingLesson;
  const at = `[作文范文] ${e.id}`;
  if (!w.theme) {
    sampleBad += 1;
    err(`${at}: 范文点评条目缺少 theme（主题），学生无法按主题筛同题范文`);
  }
  const stat = themeStat.get(w.theme ?? '未标注') ?? { samples: 0, words: 0, lessons: 0 };
  stat.lessons += 1;
  if (!w.examples?.length) {
    sampleBad += 1;
    err(`${at}: 范文点评条目没有任何例文`);
  }
  for (const [i, ex] of (w.examples ?? []).entries()) {
    sampleTotal += 1;
    /**
     * 字数**现算**（去掉空白后的字符数，含标点）——中考按格计字、标点占格，
     * 所以「不少于 600 字」说的是这个数。数据里不再写死 `words`：
     * 36 篇由多人分批撰写，一开始就出现了「含标点」与「纯汉字」两种口径混用。
     */
    const chars = sampleLength(ex.text);
    const hanzi = hanziCount(ex.text);
    const isFull = chars >= EXAM_MIN_WORDS;
    sampleWords += chars;
    if (!isFull) {
      // 片段：只要求点评讲清道理（片段确实可以只写一两句，短了不报错只提醒）
      if (hanziCount(ex.comment ?? '') < 45) {
        warn(`${at} 第 ${i + 1} 篇（片段 ${chars} 字）的点评偏短，最好讲清改动前后的差别`);
      }
      continue;
    }

    stat.samples += 1;
    if (hanzi < 450) {
      sampleBad += 1;
      err(`${at} 第 ${i + 1} 篇 ${chars} 字里汉字仅 ${hanzi} 个，标点占比过高`);
    }
    if (!ex.prompt?.trim()) err(`${at} 第 ${i + 1} 篇缺少命题形式（prompt）`);
    if (!ex.score?.trim()) warn(`${at} 第 ${i + 1} 篇缺少档次参考（score）`);
    if ((ex.highlights?.length ?? 0) < 2) {
      sampleBad += 1;
      err(`${at} 第 ${i + 1} 篇亮点句不足 2 条（学生最需要能背下来化用的句子）`);
    }
    if ((ex.review?.length ?? 0) < 4) {
      sampleBad += 1;
      err(`${at} 第 ${i + 1} 篇分项点评不足 4 项（应对照中考评分维度）`);
    }
    if (hanziCount(ex.comment ?? '') < 120) {
      sampleBad += 1;
      err(`${at} 第 ${i + 1} 篇总评过短（应 ≥120 字，讲清得分点与不足）`);
    }
    // 亮点句必须真的摘自正文，否则学生按图索骥会找不到
    // （两边都按同一套规则归一：忽略空白与引号差异，但汉字一字不能差）
    const norm = (s: string) => s.replace(/[「」“”‘’…\s]/g, '');
    for (const h of ex.highlights ?? []) {
      const key = norm(h.sentence);
      if (key.length >= 6 && !norm(ex.text).includes(key)) {
        sampleBad += 1;
        err(`${at} 第 ${i + 1} 篇的亮点句未在正文中原样出现：${h.sentence.slice(0, 20)}…`);
      }
    }
  }
  themeStat.set(w.theme ?? '未标注', stat);
}

for (const theme of WRITING_THEMES) {
  const stat = themeStat.get(theme);
  if (!stat) {
    sampleBad += 1;
    err(`[作文范文] 主题「${theme}」没有任何范文`);
    continue;
  }
  if (stat.samples < 3) {
    sampleBad += 1;
    err(`[作文范文] 主题「${theme}」只有 ${stat.samples} 篇例文（每个主题应 ≥3 篇完整例文）`);
  }
}

/**
 * 范文标题不得重复（跨文件、跨主题都算）。
 *
 * 这条检查来自一次真实事故：新写的「文化传承」组里有一篇《爷爷的刨子》，
 * 而旧范文库里**同一个主题**早有一篇同题同题材的《爷爷的刨子》——两批内容由不同人
 * 分批撰写，谁都没看过对方的稿子。逐篇看是看不出来的，只有把全库标题摊在一起才发现。
 * （另一处「同主题同物件」的重复——两篇都写自行车——标题不同，机器抓不住，
 * 那次靠人工核对主题与题材发现，也一并改掉了。）
 */
const titleSeen = new Map<string, string>();
for (const e of sampleLessons) {
  for (const ex of (e.data as WritingLesson).examples ?? []) {
    if (sampleLength(ex.text) < EXAM_MIN_WORDS) continue;
    // 标题形如「范文：爷爷的刨子」「范文一：爷爷的刨子」——去掉前缀与书名号后只比篇名
    const name = ex.title
      .replace(/^范文[一二三四五六七八九十]?\s*[：:]\s*/, '')
      .replace(/^片段对照\s*[：:]\s*/, '')
      .replace(/[《》\s]/g, '')
      .trim();
    const prev = titleSeen.get(name);
    if (prev) {
      sampleBad += 1;
      err(`[作文范文] 范文标题重复：「${name}」同时出现在 ${prev} 与 ${e.id}`);
    } else {
      titleSeen.set(name, e.id);
    }
  }
}

const fullSampleTotal = [...themeStat.values()].reduce((n, s) => n + s.samples, 0);
console.log(
  `  中考作文范文      ${WRITING_THEMES.length} 个主题 / ${fullSampleTotal} 篇完整例文` +
    `（另有 ${sampleTotal - fullSampleTotal} 则片段对照，合计约 ${(sampleWords / 10000).toFixed(1)} 万字；异常 ${sampleBad} 处）`,
);
console.log(
  `      ${'按主题分布'.padEnd(22)} ${[...themeStat]
    .sort((a, b) => b[1].samples - a[1].samples)
    .map(([k, v]) => `${k} ${v.samples}`)
    .join(' · ')}`,
);

/* --------------- 英语：知识模块完整性 + 整卷按官方结构验卷 --------------- */

/**
 * 英语按**中考知识模块**组织（不是教材单元），所以校验要盯两件事：
 *
 *   1. **每个知识点是不是真的能拿来复习**：分层考点、题目、以及该模块专属的材料
 *      （词汇要有词根词缀与近义辨析、语法要有规则与易错、阅读要有语篇、听说要有脚本、
 *      写作要有分档范文），缺一块学生在那一页就学不到东西；
 *   2. **模拟卷是不是广州的卷子**：笔试 61 小题 110 分、100 分钟、听说 30 分，
 *      各节题量与分值逐项对齐官方结构（穗教规字〔2025〕1 号附件 2）。
 */
const ENGLISH_STRUCTURE = {
  totalQuestions: 61,
  totalScore: 110,
  duration: 100,
  speakingScore: 30,
  sections: [
    { name: '语言知识运用·第一节', kind: 'choice', count: 10, score: 15 },
    { name: '语言知识运用·第二节', kind: 'choice', count: 10, score: 10 },
    { name: '阅读·第一节', kind: 'choice', count: 15, score: 30 },
    { name: '阅读·第二节', kind: 'choice', count: 5, score: 5 },
    { name: '项目情境·第一节', kind: 'choice', count: 5, score: 10 },
    { name: '项目情境·第二节', kind: 'short', count: 5, score: 10 },
    { name: '写作·第一节', kind: 'blank', count: 5, score: 5 },
    { name: '写作·第二节', kind: 'blank', count: 5, score: 5 },
    { name: '写作·第三节', kind: 'writing', count: 1, score: 20 },
  ],
};

let engBad = 0;
let engPoints = 0;
let engAffixExamples = 0;
let engConfusables = 0;
let engPassages = 0;
let engScripts = 0;

for (const e of allEntries.filter((x) => x.moduleId.startsWith('eng-'))) {
  const isPaper = e.moduleId === 'eng-exam';
  if (isPaper) continue;
  const d = e.data as EnglishKnowledge;
  const at = `[英语] ${d.id}`;
  const need = (cond: boolean, msg: string) => {
    if (!cond) {
      engBad += 1;
      err(`${at}: ${msg}`);
    }
  };

  need(Boolean(d.unit?.trim()), '缺少知识分组（unit，会作为模块页筛选标签）');
  need(Boolean(d.summary?.trim()), '缺少 summary');
  need(d.points.length >= 5, `分层考点只有 ${d.points.length} 条（应 ≥5）`);
  need(d.points.filter((p) => p.level === '重点').length >= 3, '「重点」不足 3 条');
  need(d.questions.length >= 5, `题目不足 5 道（只有 ${d.questions.length}）`);
  engPoints += d.points.length;

  for (const p of d.points) {
    if (!['重点', '次重点', '了解'].includes(p.level)) err(`${at}: 考点层级非法「${p.level}」`);
  }

  // 近义辨析必须写清区别（只罗列同义词对学生没有用）
  for (const c of d.confusables ?? []) {
    engConfusables += 1;
    if (!c.diff?.trim()) err(`${at}: 辨析「${c.a} / ${c.b}」没有写区别（diff）`);
    if (!c.a?.trim() || !c.b?.trim()) err(`${at}: 辨析缺少两个对比词`);
  }
  for (const a of d.affixes ?? []) {
    engAffixExamples += a.examples.length;
    if (!a.affix?.trim() || !a.meaning?.trim()) err(`${at}: 词缀条目缺少词缀或含义`);
    if (a.examples.length < 3) err(`${at}: 词缀「${a.affix}」例词不足 3 个`);
  }

  switch (e.moduleId) {
    case 'eng-vocab': {
      /**
       * 词汇条目的材料是**分散**的：词根词缀条目讲词缀、辨析条目讲区别、搭配条目讲短语、
       * 分类词表条目就是一张词表。硬要求每条都写满四类材料只会逼出凑数内容，
       * 所以这里只要求「每条至少有一类材料」，搭配与易错的下限放到**模块级**统计。
       */
      const hasAny =
        (d.affixes?.length ?? 0) > 0 ||
        (d.confusables?.length ?? 0) > 0 ||
        (d.collocations?.length ?? 0) > 0 ||
        (d.wordList?.length ?? 0) > 0;
      need(hasAny, '词汇条目既没有词根词缀、近义辨析、高频搭配，也没有分类词表');
      // 挂词表的条目：分组与词量要够，否则「按类别整理词汇」就成了摆设
      if (d.wordList?.length) {
        const words = d.wordList.reduce((n, g) => n + g.words.length, 0);
        need(d.wordList.length >= 3, `分类词表只有 ${d.wordList.length} 组（应 ≥3）`);
        need(words >= 40, `分类词表只有 ${words} 个词（应 ≥40）`);
      }
      break;
    }
    case 'eng-grammar':
      need((d.rules?.length ?? 0) >= 6, `语法规则不足 6 条（只有 ${d.rules?.length ?? 0}）`);
      need((d.mistakes?.length ?? 0) >= 3, `易错点不足 3 条（只有 ${d.mistakes?.length ?? 0}）`);
      break;
    case 'eng-reading':
      need((d.passages?.length ?? 0) >= 2, `语篇不足 2 篇（只有 ${d.passages?.length ?? 0}）`);
      for (const p of d.passages ?? []) {
        engPassages += 1;
        if (!p.text?.trim()) err(`${at}: 语篇「${p.title}」没有正文`);
        if ((p.questions?.length ?? 0) < 4) err(`${at}: 语篇「${p.title}」题目不足 4 道`);
      }
      break;
    case 'eng-listening':
      need((d.scripts?.length ?? 0) >= 2, `听说材料不足 2 段（只有 ${d.scripts?.length ?? 0}）`);
      for (const s of d.scripts ?? []) {
        engScripts += 1;
        if (!s.text?.trim()) err(`${at}: 听说材料「${s.title}」没有脚本`);
        if ((s.cues?.length ?? 0) < 3) err(`${at}: 听说材料「${s.title}」朗读提示不足 3 条`);
        if ((s.tasks?.length ?? 0) < 3) err(`${at}: 听说材料「${s.title}」任务不足 3 道`);
      }
      break;
    case 'eng-writing':
      need(Boolean(d.writing), '写作条目没有 writing 字段');
      break;
    case 'eng-topics':
      need((d.examTips?.length ?? 0) >= 5, `应试策略不足 5 条（只有 ${d.examTips?.length ?? 0}）`);
      break;
    default:
      break;
  }

  for (const s of d.writing?.samples ?? []) {
    if (!s.text?.trim()) err(`${at}: 范文（${s.level}）没有正文`);
    if ((s.text.match(/[A-Za-z]/g) ?? []).length < 60) err(`${at}: 范文（${s.level}）英文过短`);
    if (!s.comment?.trim()) err(`${at}: 范文（${s.level}）缺少点评`);
    for (const h of s.highlights ?? []) {
      // 亮点句必须逐字出自范文（与作文模块同一条规矩）
      const key = h.sentence.replace(/[\s“”"']/g, '');
      if (key.length >= 10 && !s.text.replace(/[\s]/g, '').includes(key)) {
        engBad += 1;
        err(`${at}: 范文亮点句未在范文中原样出现：${h.sentence.slice(0, 30)}…`);
      }
    }
  }
}

/* 英语模拟卷：逐节对齐官方结构 */
const englishPapers = allEntries.filter((e) => e.moduleId === 'eng-exam').map((e) => e.data as EnglishPaper);
let engPaperBad = 0;
for (const p of englishPapers) {
  const at = `[英语·模拟卷] ${p.id}`;
  const check = (cond: boolean, msg: string) => {
    if (!cond) {
      engPaperBad += 1;
      err(`${at}: ${msg}`);
    }
  };
  /**
   * 全卷 61 小题**含书面表达那 1 小题**（官方结构表把「写作·第三节 书面表达 1 小题 20 分」
   * 计入 61 之内），而书面表达以 `writing` 字段表达、不放进 `questions`，
   * 所以这里按「questions + 书面表达」核对。
   */
  const paperCount = p.questions.length + (p.writing ? 1 : 0);
  check(paperCount === ENGLISH_STRUCTURE.totalQuestions, `全卷小题 ${paperCount} 道 ≠ ${ENGLISH_STRUCTURE.totalQuestions} 道`);
  check(p.totalScore === ENGLISH_STRUCTURE.totalScore, `笔试总分 ${p.totalScore} ≠ ${ENGLISH_STRUCTURE.totalScore}`);
  check(p.duration === ENGLISH_STRUCTURE.duration, `时长 ${p.duration} 分钟 ≠ ${ENGLISH_STRUCTURE.duration}`);
  check(p.speakingScore === ENGLISH_STRUCTURE.speakingScore, `听说分值 ${p.speakingScore} ≠ ${ENGLISH_STRUCTURE.speakingScore}`);
  const sum = p.sections.reduce((n, s) => n + s.score, 0);
  check(sum === ENGLISH_STRUCTURE.totalScore, `各节分值合计 ${sum} ≠ ${ENGLISH_STRUCTURE.totalScore}`);
  /**
   * 逐节按**顺序**对齐官方结构。
   *
   * 一开始按「题型 + 分值」去 find，结果把「语言知识运用·第二节」（选择 10 题 10 分）
   * 误当成了「项目情境·第一节」（选择 5 题 10 分）——两节题型与分值恰好相同。
   * 卷面各节的顺序是固定的，按位置比对既简单又不会认错。
   */
  for (const [i, want] of ENGLISH_STRUCTURE.sections.entries()) {
    const got = p.sections[i];
    if (!got) {
      check(false, `缺少第 ${i + 1} 节「${want.name}」`);
      continue;
    }
    check(got.kind === want.kind, `第 ${i + 1} 节「${got.name}」题型 ${got.kind} ≠ ${want.kind}`);
    check(got.count === want.count, `第 ${i + 1} 节「${got.name}」题量 ${got.count} ≠ ${want.count}`);
    check(got.score === want.score, `第 ${i + 1} 节「${got.name}」分值 ${got.score} ≠ ${want.score}`);
  }
  // 卷面题目类型要与结构吻合（写作是卷面第 61 题之外的一道大题，用 writing 字段表达）
  const byType = {
    choice: p.questions.filter((q) => q.type === 'choice').length,
    fill: p.questions.filter((q) => q.type === 'fill').length,
    short: p.questions.filter((q) => q.type === 'short').length,
  };
  check(byType.choice === 45, `选择题 ${byType.choice} 道 ≠ 45 道`);
  check(byType.fill === 10, `填空题 ${byType.fill} 道 ≠ 10 道`);
  check(byType.short === 5, `简答题 ${byType.short} 道 ≠ 5 道`);
  check(Boolean(p.writing), '缺少书面表达（writing）');
  check(p.basis.includes('原创') || p.basis.includes('非历年真题'), 'basis 必须写明这是原创仿真卷、非历年真题');
}

console.log(
  `  英语备考          ${allEntries.filter((e) => e.moduleId.startsWith('eng-') && e.moduleId !== 'eng-exam').length} 个知识点 / ${englishPapers.length} 套卷` +
    `（异常 ${engBad + engPaperBad} 处）`,
);
console.log(
  `      知识点材料         考点 ${engPoints} 条 · 词缀例词 ${engAffixExamples} 个 · 近义辨析 ${engConfusables} 组 · 语篇 ${engPassages} 篇 · 听说脚本 ${engScripts} 段`,
);

/* 英语分类词表：初中词汇按类别整理（话题 / 词性 / 考点） */
const engWordSet = new Set<string>();
let engWordTotal = 0;
let engWordGroups = 0;
const engWordByUnit = new Map<string, number>();
const badWords: string[] = [];

for (const e of allEntries.filter((x) => x.moduleId.startsWith('eng-') && x.moduleId !== 'eng-exam')) {
  const d = e.data as EnglishKnowledge;
  for (const g of d.wordList ?? []) {
    engWordGroups += 1;
    if (!g.group?.trim()) err(`[英语·词表] ${d.id}: 有分组缺少名字`);
    if (g.words.length < 8) warn(`[英语·词表] ${d.id}「${g.group}」只有 ${g.words.length} 个词，分组太碎`);
    for (const w of g.words) {
      engWordTotal += 1;
      engWordByUnit.set(d.unit, (engWordByUnit.get(d.unit) ?? 0) + 1);
      const key = w.word.trim().toLowerCase();
      if (!key) {
        err(`[英语·词表] ${d.id}「${g.group}」有词条缺少单词`);
        continue;
      }
      // 单词里不该混入中文（最常见的是把释义写进了 word 字段）
      if (/[\u4e00-\u9fa5]/.test(w.word)) badWords.push(`${d.id}「${w.word}」`);
      if (!w.cn?.trim()) err(`[英语·词表] ${d.id}「${w.word}」缺少中文释义`);
      engWordSet.add(key);
    }
  }
}
if (badWords.length) {
  err(`[英语·词表] 有 ${badWords.length} 个词条把中文写进了 word 字段：${badWords.slice(0, 5).join('、')}`);
}
// 词汇总量是「按类别把初中词汇整理好」的直接证据：低于门槛说明还没补全
if (engWordSet.size < 1000) {
  warn(`[英语·词表] 去重后只有 ${engWordSet.size} 个词，离覆盖初中课标词汇（约 1600）还有距离`);
}

console.log(
  `  英语词汇表        ${engWordTotal} 个词条 / 去重 ${engWordSet.size} 词 · ${engWordGroups} 组` +
    `（${[...engWordByUnit].map(([k, v]) => `${k} ${v}`).join(' · ')}）`,
);

/* --------------- 道德与法治：备考八块 + 按官方结构验卷 --------------- */

/**
 * 道法与历史同一套要求：每条内容给全「备考八块」，模拟卷按官方结构验卷。
 *
 * 官方结构（穗教规字〔2025〕1 号附件 2）：单项选择 17 小题 34 分 +
 * 非选择题（阅读材料，回答问题）3 小题 36 分 = 全卷 20 小题 70 分，闭卷 60 分钟，
 * 与历史同场分卷。道法的特点是**非选择题分值过半**，所以材料题的参考答案与踩分点
 * 是这一科的核心资产，缺了就等于白做。
 */
const POLITICS_STRUCTURE = {
  choice: { count: 17, score: 34 },
  material: { count: 3, score: 36 },
  totalQuestions: 20,
  totalScore: 70,
  duration: 60,
};

const politicsTopics = polTopics;
const POLITICS_TEXTBOOK_MODULES = ['pol-growth', 'pol-youth', 'pol-moral', 'pol-law', 'pol-nation', 'pol-world'];
let polBad = 0;
let polPoints = 0;
let polKeySentences = 0;
let polMaterialGroups = 0;
let polAsks = 0;
let polHotspots = 0;
let polAngles = 0;
/** 考点分层统计（与历史同口径：重点 / 次重点 / 了解） */
const polLevels: Record<string, number> = { 重点: 0, 次重点: 0, 了解: 0 };
let polConfusions = 0;
let polCompares = 0;

for (const t of politicsTopics) {
  const at = `[道法] ${t.id}`;
  const isCurrent = t.id.startsWith('pol-current');
  const need = (cond: boolean, msg: string) => {
    if (!cond) {
      polBad += 1;
      err(`${at}: ${msg}`);
    }
  };

  need(Boolean(t.mainline?.trim()), '缺少主线（mainline）');
  need(Boolean(t.unit?.trim()), '缺少单元/专题分组（unit，会作为模块页筛选主标签）');
  need(t.points.length >= 5, `核心观点只有 ${t.points.length} 条（应 ≥5）`);
  need(t.points.filter((p) => p.level === '重点').length >= 3, '「重点」不足 3 条');
  need((t.keySentences?.length ?? 0) >= 3, `必背金句不足 3 条（只有 ${t.keySentences?.length ?? 0}）`);
  need((t.confusions?.length ?? 0) >= 2, '易错辨析不足 2 条');
  need((t.compares?.length ?? 0) >= 1, '缺少关联与对比表');
  need((t.examAngles?.length ?? 0) >= 2, '命题角度不足 2 条');
  need((t.materials?.length ?? 0) >= 1, '缺少材料大题');
  need(t.questions.length >= 5, `选择题不足 5 道（只有 ${t.questions.length}）`);
  if (isCurrent) {
    need((t.hotspots?.length ?? 0) >= 1, '时政专题条目缺少 hotspots（时政热点与答题角度）');
  }

  polPoints += t.points.length;
  polKeySentences += t.keySentences?.length ?? 0;
  polAngles += t.examAngles?.length ?? 0;
  polHotspots += t.hotspots?.length ?? 0;

  for (const p of t.points) {
    if (!['重点', '次重点', '了解'].includes(p.level)) err(`${at}: 考点层级非法「${p.level}」`);
    else polLevels[p.level] += 1;
    if (!p.text?.trim()) err(`${at}: 有核心观点没有内容`);
  }
  polConfusions += t.confusions?.length ?? 0;
  polCompares += t.compares?.length ?? 0;
  for (const c of t.compares ?? []) {
    if (!c.rows?.length) err(`${at}: 对比表「${c.title}」没有行`);
  }
  for (const h of t.hotspots ?? []) {
    if (!h.event?.trim() || !h.background?.trim()) err(`${at}: 时政热点缺少事件或背景`);
    if ((h.angles?.length ?? 0) < 3) err(`${at}: 时政热点「${h.event}」答题角度不足 3 个`);
    for (const a of h.angles ?? []) {
      if (!a.point?.trim() || !a.answer?.trim()) {
        err(`${at}: 时政热点「${h.event}」的角度「${a.angle}」缺少教材考点或答案`);
      }
    }
  }
  for (const g of t.materials ?? []) {
    polMaterialGroups += 1;
    polAsks += g.questions.length;
    if (g.questions.length < 2) err(`${at}: 材料组 ${g.id} 只有 ${g.questions.length} 个设问（应 ≥2）`);
    if (!g.material?.includes('【材料')) warn(`${at}: 材料组 ${g.id} 未用【材料一】标注材料`);
    for (const q of g.questions) {
      if (!q.answer?.trim()) err(`${at}: 材料设问 ${q.id} 没有参考答案`);
      if (!q.rubric?.length) err(`${at}: 材料设问 ${q.id} 没有踩分点`);
    }
  }
}

/* 道法模拟卷：按官方结构验卷 */
const politicsPapers = polPapers;
let polPaperBad = 0;
for (const p of politicsPapers) {
  const at = `[道法·模拟卷] ${p.id}`;
  const choice = p.sections.find((s) => s.kind === 'choice');
  const material = p.sections.find((s) => s.kind === 'material');
  const scoreSum = p.sections.reduce((n, s) => n + s.score, 0);
  const countSum = p.sections.reduce((n, s) => n + s.count, 0);
  const choiceQs = p.questions.filter((q) => q.type === 'choice').length;
  const check = (cond: boolean, msg: string) => {
    if (!cond) {
      polPaperBad += 1;
      err(`${at}: ${msg}`);
    }
  };
  check(p.totalScore === POLITICS_STRUCTURE.totalScore, `全卷 ${p.totalScore} 分 ≠ ${POLITICS_STRUCTURE.totalScore} 分`);
  check(scoreSum === POLITICS_STRUCTURE.totalScore, `各节分值合计 ${scoreSum} ≠ ${POLITICS_STRUCTURE.totalScore}`);
  check(p.duration === POLITICS_STRUCTURE.duration, `时长 ${p.duration} 分钟 ≠ ${POLITICS_STRUCTURE.duration}`);
  check(
    countSum === POLITICS_STRUCTURE.totalQuestions,
    `全卷小题 ${countSum} ≠ ${POLITICS_STRUCTURE.totalQuestions}`,
  );
  check(
    choice?.count === POLITICS_STRUCTURE.choice.count && choice?.score === POLITICS_STRUCTURE.choice.score,
    `选择题结构应为 ${POLITICS_STRUCTURE.choice.count} 题 ${POLITICS_STRUCTURE.choice.score} 分，实际 ${choice?.count} 题 ${choice?.score} 分`,
  );
  check(
    material?.count === POLITICS_STRUCTURE.material.count && material?.score === POLITICS_STRUCTURE.material.score,
    `非选择题结构应为 ${POLITICS_STRUCTURE.material.count} 题 ${POLITICS_STRUCTURE.material.score} 分，实际 ${material?.count} 题 ${material?.score} 分`,
  );
  check(choiceQs === POLITICS_STRUCTURE.choice.count, `卷内选择题 ${choiceQs} 道 ≠ ${POLITICS_STRUCTURE.choice.count} 道`);
  check(p.materials.length === POLITICS_STRUCTURE.material.count, `材料题 ${p.materials.length} 组 ≠ ${POLITICS_STRUCTURE.material.count} 组`);
  check(p.basis.includes('广州'), 'basis 缺少「按广州中考结构命题」的说明');
  check(p.basis.includes('原创') || p.basis.includes('非历年真题'), 'basis 必须写明原创仿真、非历年真题');
  for (const g of p.materials) {
    for (const q of g.questions) {
      if (!q.answer?.trim() || !q.rubric?.length) err(`${at}: 材料设问 ${q.id} 缺少参考答案或踩分点`);
    }
  }
}

// 教材四块不得为空（新科目最容易漏一册）
const emptyPolModules = POLITICS_TEXTBOOK_MODULES.filter(
  (m) => !allEntries.some((e) => e.moduleId === m),
);
if (emptyPolModules.length) err(`[道法] 下列教材模块没有任何内容：${emptyPolModules.join('、')}`);

console.log(
  `  道法备考          ${politicsTopics.length} 个单元/专题 / ${politicsPapers.length} 套卷` +
    `（异常 ${polBad + polPaperBad} 处）`,
);
console.log(
  `      核心观点与金句     观点 ${polPoints} 条 · 必背金句 ${polKeySentences} 句 · 命题角度 ${polAngles} 条 · 时政热点 ${polHotspots} 个`,
);
console.log(
  `      分层考点           重点 ${polLevels['重点']} · 次重点 ${polLevels['次重点']} · 了解 ${polLevels['了解']}` +
    `（易错辨析 ${polConfusions} 条 · 对比表 ${polCompares} 张）`,
);
console.log(
  `      材料大题           ${polMaterialGroups} 组 / ${polAsks} 问（参考答案与踩分点齐全）`,
);

/**
 * 物理：卷面结构 + 理科内容的硬性要求 + 图解规范。
 * 规则多且专，单独放在 `scripts/validate-physics.ts`，这里只调用一次并打印报告。
 */
validatePhysics({ err, allEntries });

/**
 * 化学：卷面结构 + 三重表征 + 化学用语（方程式配平与条件）+ 实验注意事项。
 * 与物理一样单独成文件，这里只调用一次并打印报告。
 */
validateChemistry({ err, allEntries });

/**
 * 「题型专题」模块（语文中考专题 / 数学中考题型专题…）：2027 卷面口径下的题型专题——
 * 「详细讲解」（五年考情 / 分步讲解含示范 / 模板 / 评分点 / 易错失分）
 * 与「大量训练」（每专题 ≥45 题、每个训练分组都要有题、题目标签与分组必须对得上）。
 *
 * 规则本体在 `scripts/validate-exam-topics.ts`，这里**遍历懒加载注册表**跑一遍：
 * 语文与数学（以及以后任何一块题型专题）自动被覆盖，不需要有人记得回来加一行。
 */
validateAllExamTopics({ err, warn, allEntries });

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
console.log(`  知识点卡片        ${String(cardTotal).padStart(4)} 张（背诵页与掌握率的分母）`);

const perGrade = new Map<string, number>();
for (const e of allEntries) perGrade.set(e.grade, (perGrade.get(e.grade) ?? 0) + 1);
console.log(
  '  按学段            ' + [...perGrade.entries()].sort().map(([g, n]) => `${g}:${n}`).join('  '),
);

console.log('\n================ 校验结果 ================');
const gradeTotal = fillCases.length + mathCases.length + duanjuCases.length + numericCases.length;
const gradeBad =
  fillFailures.length + mathFailures.length + duanjuFailures.length + numericFailures.length;
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
for (const [input, answer, expect, note] of numericFailures) {
  console.log(`    ❌ [理科数值] 输入「${input}」对答案「${answer}」应为 ${expect}（${note}）`);
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
  `  知识点卡片标熟    ${cardCases.length - cardFailures.length} / ${cardCases.length} 通过`,
);
for (const [note, , detail] of cardFailures) {
  console.log(`    ❌ ${note}  实际 ${detail}`);
}

console.log(
  `  云端合并规则      ${mergeCases.length - mergeFailures.length} / ${mergeCases.length} 通过`,
);
for (const [note, , detail] of mergeFailures) {
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
{
  /**
   * 题库里的**知识点标签**总数与稀有标签数。
   * 「同一考点」分组只认有区分度的标签（权重要求见 lib/relations.ts），
   * 这个数字直接用来说明「为什么不能拿『实词』这种标签做关联」——降到多少条有意义关联，
   * 与标签基数直接相关，所以顺手打印出来，别让 README 里再出现手抄的旧数字。
   */
  const tagFreq = new Map<string, number>();
  for (const e of FULL_POOL) for (const t of e.qTags) tagFreq.set(t, (tagFreq.get(t) ?? 0) + 1);
  const rare = [...tagFreq.values()].filter((n) => n <= 8).length;
  const perEntry = (suppTotal / allEntries.length).toFixed(1);
  console.log(
    `      ${'知识点标签'.padEnd(22)} 题库共 ${tagFreq.size} 个` +
      `（其中 ${rare} 个为稀有标签，覆盖条目数 ≤8）· 每条内容平均补出 ${perEntry} 个知识点`,
  );
  console.log(
    `      ${'同一考点关联'.padEnd(22)} ${suppSamePoint} 条（只有「有区分度」的标签才成组）`,
  );
}
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
  reciteFailures.length > 0 ||
  cardFailures.length > 0 ||
  mergeFailures.length > 0
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
  if (cardFailures.length > 0) {
    console.log(`\n❌ 知识点卡片标熟规则自测失败 ${cardFailures.length} 条`);
  }
  if (mergeFailures.length > 0) {
    console.log(`\n❌ 云端合并规则自测失败 ${mergeFailures.length} 条`);
  }
  process.exitCode = 1;
} else {
  console.log('✅ 全部检查通过：数据结构无误，判分逻辑自测全通过。');
}
console.log('');
