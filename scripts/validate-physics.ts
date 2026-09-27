/**
 * 物理内容的校验规则（独立成文件）。
 *
 * 为什么单独一份：`validate-entry.ts` 已经两千多行，而且物理的规则**多且专**——
 * 卷面结构、每知识点最低题量、四种题型搭配、图必须有 alt、公式必须有适用条件、
 * 作图题必须给标准作图、计算题必须给解题步骤……混进大文件里以后很难维护。
 * 这里只依赖「一个 err 回调 + 全部条目」，接入方一行调用即可。
 *
 * 规则背后是用户对理科的明确要求：
 *   ① 从「怎么理解、怎么应用」讲 → `steps` / `apps` / `formulas.usage` 逐项查；
 *   ② 图文并茂 → 图是数据画的，每张都必须有 `alt`（朗读与检索要用）；
 *   ③ 每个知识点多个练习 → **≥8 道**，且选择/填空/解答混搭；
 *   ④ 所有习题过关才算掌握 → 题量就是验收清单的长度，太少这个知识点就太好过。
 */

import type { Entry, PhysicsFigure, PhysicsPaper, PhysicsTopic } from '../src/types';
import { allPapers, allTopics, TEXTBOOK_MODULE_IDS } from '../src/data/physics';

/**
 * 广州中考物理卷面（穗教规字〔2025〕1 号及官方解读）：
 * 笔试 90 分 / 60 分钟，选择 10 小题 × 3 分 = 30 分，非选择 6 小题 = 60 分；
 * 另有实验操作考试 10 分（另场，不进笔试卷面）。
 */
export const PHYSICS_STRUCTURE = {
  totalScore: 90,
  duration: 60,
  choice: { count: 10, score: 30 },
  material: { count: 6, score: 60 },
};

/** 每个知识点的最低题量（全部过关才算掌握，题量 = 验收清单长度） */
export const PHYSICS_MIN_QUESTIONS = 8;

export interface PhysicsReport {
  topics: number;
  papers: number;
  bad: number;
  questions: number;
  figures: number;
  figureQuestions: number;
  drawQuestions: number;
  formulas: number;
  steps: number;
  materials: number;
  asks: number;
}

export function validatePhysics(opts: {
  err: (msg: string) => void;
  allEntries: Entry[];
  /** 不打印报告（由调用方统一打印）时为 false */
  silent?: boolean;
}): PhysicsReport {
  const { err, allEntries } = opts;
  let bad = 0;
  let questions = 0;
  let figures = 0;
  let figureQuestions = 0;
  let drawQuestions = 0;
  let formulas = 0;
  let steps = 0;
  let materials = 0;
  let asks = 0;

  /** 图必须带 alt：整页朗读与检索都靠它，缺了就等于一段读不出也搜不到的内容 */
  const checkFigureAlt = (where: string, fig: PhysicsFigure | undefined, at: string): boolean => {
    if (!fig) return false;
    if (!fig.alt?.trim()) {
      bad += 1;
      err(`${at}: ${where} 的图「${fig.id || '(无 id)'}」缺少 alt（朗读与检索要用它）`);
    }
    return true;
  };

  for (const t of allTopics as PhysicsTopic[]) {
    const at = `[物理] ${t.id}`;
    const need = (cond: boolean, msg: string) => {
      if (!cond) {
        bad += 1;
        err(`${at}: ${msg}`);
      }
    };

    need(Boolean(t.question?.trim()), '缺少 question（这个知识点要回答的问题）');
    need(Boolean(t.keyIdea?.trim()), '缺少 keyIdea（理解的关键）');
    need(Boolean(t.unit?.trim()), '缺少 unit（教材章节归属，模块页筛选标签）');
    need(t.steps.length >= 3, `理解步骤只有 ${t.steps.length} 步（应 ≥3）`);
    need(t.apps.length >= 2, `应用例题只有 ${t.apps.length} 个（应 ≥2，理科要讲「怎么用」）`);
    need((t.confusions?.length ?? 0) >= 2, '易错辨析不足 2 条');
    need((t.compares?.length ?? 0) >= 1, '缺少关联与对比表');
    need((t.examAngles?.length ?? 0) >= 2, '命题角度不足 2 条');
    need((t.materials?.length ?? 0) >= 1, '缺少综合题（中考非选择题形态）');
    need(
      t.questions.length >= PHYSICS_MIN_QUESTIONS,
      `练习只有 ${t.questions.length} 道（应 ≥${PHYSICS_MIN_QUESTIONS}：全部过关才算掌握，题太少这个知识点就太好过）`,
    );

    const byType = { choice: 0, fill: 0, short: 0 };
    for (const q of t.questions) byType[q.type] += 1;
    need(byType.choice >= 4, `选择题只有 ${byType.choice} 道（应 ≥4）`);
    need(byType.fill >= 1, '缺少填空题（数值 + 单位是物理的基本功）');
    need(byType.short >= 2, `解答题只有 ${byType.short} 道（应 ≥2：至少一题计算、一题实验或说理）`);

    const withFigure = t.questions.filter((q) => q.figure).length;
    const withAnswerFigure = t.questions.filter((q) => q.answerFigure).length;
    const withSteps = t.questions.filter((q) => q.answerSteps?.length).length;
    need(withFigure >= 1, '没有一道配图题（物理中考离不开图）');
    need(withAnswerFigure >= 1, '没有作图题（short + answerFigure 给学生标准作图对照）');
    need(withSteps >= 1, '没有一道题给出 answerSteps（计算题要分步给分）');

    questions += t.questions.length;
    figureQuestions += withFigure;
    drawQuestions += withAnswerFigure;
    formulas += t.formulas?.length ?? 0;
    steps += t.steps.length;

    for (const [i, s] of t.steps.entries()) {
      if (!s.heading?.trim() || !s.body?.trim()) err(`${at}: 第 ${i + 1} 步缺少标题或正文`);
      if (checkFigureAlt(`第 ${i + 1} 步`, s.figure, at)) figures += 1;
    }
    for (const [i, a] of t.apps.entries()) {
      if (!a.title?.trim() || !a.scene?.trim() || !a.model?.trim()) {
        err(`${at}: 应用 ${i + 1} 缺少标题、情境或物理模型`);
      }
      if (a.steps.length < 2) err(`${at}: 应用「${a.title}」的解答步骤不足 2 步（要写清卷面上怎么写）`);
      if (!a.result?.trim()) err(`${at}: 应用「${a.title}」缺少结论`);
      if (checkFigureAlt(`应用「${a.title}」`, a.figure, at)) figures += 1;
    }
    for (const f of t.formulas ?? []) {
      if (!f.usage?.trim()) {
        err(`${at}: 公式「${f.name}」缺少 usage（适用条件——只背公式不写条件等于教错）`);
      }
      if (!f.tex?.trim() && !f.text?.trim()) err(`${at}: 公式「${f.name}」既没有 tex 也没有 text`);
    }
    for (const q of t.questions) {
      if (!q.explanation?.trim()) err(`${at}: 题目 ${q.id} 缺少解析（理科要讲清「为什么」）`);
      if (checkFigureAlt(`题目 ${q.id}`, q.figure, at)) figures += 1;
      if (checkFigureAlt(`题目 ${q.id} 的参考答案图`, q.answerFigure, at)) figures += 1;
      if (q.type === 'choice' && (q.options?.length ?? 0) !== 4) {
        err(`${at}: 选择题 ${q.id} 的选项数为 ${q.options?.length ?? 0}（应为 4）`);
      }
    }
    for (const g of t.materials ?? []) {
      materials += 1;
      asks += g.questions.length;
      if (g.questions.length < 2) err(`${at}: 综合题 ${g.id} 只有 ${g.questions.length} 个设问（应 ≥2）`);
      for (const q of g.questions) {
        if (!q.answer?.trim()) err(`${at}: 综合题设问 ${q.id} 没有参考答案`);
        if (!q.rubric?.length) err(`${at}: 综合题设问 ${q.id} 没有踩分点`);
      }
    }
  }

  /** 整卷：按**节的位置**逐节比对，避免「同题型同分值」的两节互相误认 */
  for (const p of allPapers as PhysicsPaper[]) {
    const at = `[物理·模拟卷] ${p.id}`;
    const check = (cond: boolean, msg: string) => {
      if (!cond) {
        bad += 1;
        err(`${at}: ${msg}`);
      }
    };
    const scoreSum = p.sections.reduce((n, s) => n + s.score, 0);
    const countSum = p.sections.reduce((n, s) => n + s.count, 0);
    check(
      p.totalScore === PHYSICS_STRUCTURE.totalScore,
      `全卷 ${p.totalScore} 分 ≠ ${PHYSICS_STRUCTURE.totalScore} 分`,
    );
    check(
      p.duration === PHYSICS_STRUCTURE.duration,
      `时长 ${p.duration} 分钟 ≠ ${PHYSICS_STRUCTURE.duration} 分钟`,
    );
    check(scoreSum === PHYSICS_STRUCTURE.totalScore, `各节分值合计 ${scoreSum} ≠ ${PHYSICS_STRUCTURE.totalScore}`);
    check(p.sections.length === 2, `应为「选择题 + 非选择题」两节，实际 ${p.sections.length} 节`);
    check(
      p.sections[0]?.kind === 'choice' &&
        p.sections[0].count === PHYSICS_STRUCTURE.choice.count &&
        p.sections[0].score === PHYSICS_STRUCTURE.choice.score,
      `第一节应为选择 ${PHYSICS_STRUCTURE.choice.count} 题 ${PHYSICS_STRUCTURE.choice.score} 分，实际 ${p.sections[0]?.count} 题 ${p.sections[0]?.score} 分`,
    );
    check(
      p.sections[1]?.kind === 'material' &&
        p.sections[1].count === PHYSICS_STRUCTURE.material.count &&
        p.sections[1].score === PHYSICS_STRUCTURE.material.score,
      `第二节应为非选择 ${PHYSICS_STRUCTURE.material.count} 题 ${PHYSICS_STRUCTURE.material.score} 分，实际 ${p.sections[1]?.count} 题 ${p.sections[1]?.score} 分`,
    );
    check(
      countSum === PHYSICS_STRUCTURE.choice.count + PHYSICS_STRUCTURE.material.count,
      `全卷小题 ${countSum} ≠ ${PHYSICS_STRUCTURE.choice.count + PHYSICS_STRUCTURE.material.count}`,
    );
    check(p.basis.includes('广州'), 'basis 缺少「按广州中考结构命题」的说明');
    check(p.basis.includes('原创') || p.basis.includes('非历年真题'), 'basis 必须写明原创仿真、非历年真题');
    check(
      p.materials.length === PHYSICS_STRUCTURE.material.count,
      `非选择题组数 ${p.materials.length} ≠ ${PHYSICS_STRUCTURE.material.count}`,
    );
    const choiceQs = p.questions.filter((q) => q.type === 'choice').length;
    check(
      choiceQs === PHYSICS_STRUCTURE.choice.count,
      `卷内选择题 ${choiceQs} 道 ≠ ${PHYSICS_STRUCTURE.choice.count} 道`,
    );
    for (const g of p.materials) {
      for (const q of g.questions) {
        if (!q.answer?.trim() || !q.rubric?.length) err(`${at}: 非选择题设问 ${q.id} 缺少参考答案或踩分点`);
      }
    }
  }

  // 教材知识模块不得为空（新科目最容易漏一整块）
  const empty = TEXTBOOK_MODULE_IDS.filter((m) => !allEntries.some((e) => e.moduleId === m));
  if (empty.length) {
    bad += 1;
    err(`[物理] 下列教材模块没有任何内容：${empty.join('、')}`);
  }

  const report: PhysicsReport = {
    topics: allTopics.length,
    papers: allPapers.length,
    bad,
    questions,
    figures,
    figureQuestions,
    drawQuestions,
    formulas,
    steps,
    materials,
    asks,
  };

  if (!opts.silent) {
    console.log(
      `  物理备考          ${report.topics} 个知识点 / ${report.papers} 套卷（异常 ${report.bad} 处）`,
    );
    console.log(
      `      理解与应用         理解 ${report.steps} 步 · 图解 ${report.figures} 张 · 公式 ${report.formulas} 条（每条都写了适用条件）`,
    );
    console.log(
      `      练习与过关         题目 ${report.questions} 道（配图 ${report.figureQuestions} 道 · 作图题 ${report.drawQuestions} 道）` +
        `· 综合题 ${report.materials} 组 / ${report.asks} 问`,
    );
    console.log(`      掌握判定           全部题目过关才算掌握（每个知识点 ≥${PHYSICS_MIN_QUESTIONS} 道）`);
  }

  return report;
}
