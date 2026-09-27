/**
 * 化学内容的校验规则（独立成文件，与 `validate-physics.ts` 同一套路）。
 *
 * 规则背后是化学这一科的三个硬要求：
 *   ① **三重表征**：每个知识点的讲解必须同时有「微观」与「符号」两步——
 *      学生「会背不会用」几乎都是在这两重上断链；
 *   ② **化学用语不能错**：化学式下标、离子电荷、方程式配平与条件，错了就是教错；
 *   ③ **全部习题过关才算掌握**：题量就是验收清单的长度，每个知识点 ≥8 道。
 */

import type { ChemPaper, ChemTopic, Entry } from '../src/types';
import { allPapers, allTopics, TEXTBOOK_MODULE_IDS } from '../src/data/chemistry';

/**
 * 广州中考化学卷面（穗教规字〔2025〕1 号及官方解读）：
 * 化学 70 分 = 笔试 60 分（60 分钟）+ 实验操作考试 10 分；
 * 笔试为选择 12 小题 × 2 分 = 24 分 + 非选择 5 小题 = 36 分。
 */
export const CHEM_STRUCTURE = {
  totalScore: 60,
  duration: 60,
  choice: { count: 12, score: 24 },
  material: { count: 5, score: 36 },
};

/** 每个知识点的最低题量（全部过关才算掌握） */
export const CHEM_MIN_QUESTIONS = 8;

export interface ChemReport {
  topics: number;
  papers: number;
  bad: number;
  questions: number;
  equations: number;
  experiments: number;
  figures: number;
  materials: number;
  asks: number;
}

export function validateChemistry(opts: {
  err: (msg: string) => void;
  allEntries: Entry[];
  silent?: boolean;
}): ChemReport {
  const { err, allEntries } = opts;
  let bad = 0;
  let questions = 0;
  let equations = 0;
  let experiments = 0;
  let figures = 0;
  let materials = 0;
  let asks = 0;

  const checkFigureAlt = (where: string, fig: { id?: string; alt?: string } | undefined, at: string): boolean => {
    if (!fig) return false;
    if (!fig.alt?.trim()) {
      bad += 1;
      err(`${at}: ${where} 的图「${fig.id || '(无 id)'}」缺少 alt（朗读与检索要用它）`);
    }
    return true;
  };

  /**
   * 化学方程式配平检查：把式子按 `=`／`→` 拆成两侧，逐元素统计原子个数是否相等。
   *
   * 这里必须自己写一个小解析器，**不能**用 `\d` 加正则硬凑：
   *   ① 化学式里的下标是 **Unicode 下标字符**（H₂O、Fe₂O₃），`\d` 不认，会把 `5O₂` 读成 `5O`，
   *      于是一大批**配平正确**的方程式被误报成没配平（我第一版就是这么错的，化学内容一进来
   *      立刻炸出 60 条假警报）；
   *   ② 括号要按倍数展开（Ca(OH)₂ 是 Ca₁O₂H₂）；
   *   ③ 状态符号 `(aq)`、`↑↓`、空白、箭头上的中文条件都不参与计数。
   *
   * 解析不出来时返回 `null`（跳过而不误报）：校验器的价值是抓「明显没配平」，
   * 不是替作者做化学判断。
   */
  const unbalanced = (equation: string): string | null => {
    const sides = equation.split(/=|→|->|--?>|—[^→]*→|-[^>]*->/);
    if (sides.length !== 2) return null;

    /** Unicode 下标 → 普通数字 */
    const SUBSCRIPT = '₀₁₂₃₄₅₆₇₈₉';
    const normSub = (s: string) =>
      s.replace(/[₀-₉]/g, (c) => String(SUBSCRIPT.indexOf(c))).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)));

    /** 把一个化学式（可能含括号）按系数累加进 map */
    const addFormula = (body: string, coef: number, map: Map<string, number>): boolean => {
      let i = 0;
      while (i < body.length) {
        const ch = body[i];
        if (ch === '(') {
          let depth = 1;
          let j = i + 1;
          while (j < body.length && depth > 0) {
            if (body[j] === '(') depth += 1;
            else if (body[j] === ')') depth -= 1;
            j += 1;
          }
          if (depth !== 0) return false;
          const inner = body.slice(i + 1, j - 1);
          const rest = body.slice(j);
          const numMatch = rest.match(/^(\d+)/);
          const mult = numMatch ? Number(numMatch[1]) : 1;
          const innerMap = new Map<string, number>();
          if (!addFormula(inner, 1, innerMap)) return false;
          for (const [el, n] of innerMap) map.set(el, (map.get(el) ?? 0) + n * mult * coef);
          i = j + (numMatch ? numMatch[1].length : 0);
          continue;
        }
        const m = body.slice(i).match(/^([A-Z][a-z]?)(\d*)/);
        if (!m) return false;
        const count = m[2] ? Number(m[2]) : 1;
        map.set(m[1], (map.get(m[1]) ?? 0) + count * coef);
        i += m[0].length;
      }
      return true;
    };

    const countSide = (side: string): Map<string, number> | null => {
      const s = normSub(side)
        .replace(/[↑↓]/g, '')
        .replace(/\((aq|s|l|g)\)/gi, '')
        .replace(/\s/g, '');
      if (!s) return null;
      const map = new Map<string, number>();
      for (const term of s.split('+')) {
        if (!term) return null;
        const m = term.match(/^(\d*)(.*)$/);
        if (!m || !m[2]) return null;
        const coef = m[1] ? Number(m[1]) : 1;
        if (!addFormula(m[2], coef, map)) return null;
      }
      return map.size ? map : null;
    };

    const left = countSide(sides[0]);
    const right = countSide(sides[1]);
    if (!left || !right) return null;
    const els = new Set([...left.keys(), ...right.keys()]);
    for (const el of els) {
      if ((left.get(el) ?? 0) !== (right.get(el) ?? 0)) {
        return `${el} 原子数不等（左 ${left.get(el) ?? 0} / 右 ${right.get(el) ?? 0}）`;
      }
    }
    return null;
  };

  for (const t of allTopics as ChemTopic[]) {
    const at = `[化学] ${t.id}`;
    const need = (cond: boolean, msg: string) => {
      if (!cond) {
        bad += 1;
        err(`${at}: ${msg}`);
      }
    };

    need(Boolean(t.question?.trim()), '缺少 question（这个知识点要回答的问题）');
    need(Boolean(t.keyIdea?.trim()), '缺少 keyIdea（理解的关键）');
    need(Boolean(t.unit?.trim()), '缺少 unit（教材单元归属，模块页筛选标签）');
    need(t.steps.length >= 3, `理解步骤只有 ${t.steps.length} 步（应 ≥3）`);

    // 三重表征：教材知识模块必须同时有「微观」与「符号」两步（学生断链就断在这里）。
    //
    // 但**实验操作与中考题型专题不能这么要求**：「药品的取用」「装置气密性检查」
    // 「60 分钟怎么分配」这类内容根本没有粒子层面，硬要求微观表征等于逼作者写废话。
    // 因此技能型条目只要求至少两重表征（通常是宏观 + 应用）。
    const reps = new Set(t.steps.map((s) => s.representation).filter(Boolean));
    const isSkillTopic = t.id.startsWith('chem-experiment-') || t.id.startsWith('chem-exam-');
    if (isSkillTopic) {
      need(reps.size >= 2, `理解过程只有 ${reps.size} 重表征（技能型条目至少要有两重，如宏观 + 应用）`);
    } else {
      need(reps.has('微观'), '理解过程缺少「微观」表征（粒子层面怎么解释）');
      need(reps.has('符号'), '理解过程缺少「符号」表征（化学式/方程式怎么写）');
    }

    need(t.apps.length >= 2, `应用例题只有 ${t.apps.length} 个（应 ≥2）`);
    need((t.confusions?.length ?? 0) >= 2, '易错辨析不足 2 条');
    need((t.compares?.length ?? 0) >= 1, '缺少关联与对比表');
    need((t.examAngles?.length ?? 0) >= 2, '命题角度不足 2 条');
    need((t.materials?.length ?? 0) >= 1, '缺少综合题（化学用语 / 实验探究 / 计算）');
    need(
      t.questions.length >= CHEM_MIN_QUESTIONS,
      `练习只有 ${t.questions.length} 道（应 ≥${CHEM_MIN_QUESTIONS}：全部过关才算掌握）`,
    );

    const byType = { choice: 0, fill: 0, short: 0 };
    for (const q of t.questions) byType[q.type] += 1;
    need(byType.choice >= 4, `选择题只有 ${byType.choice} 道（应 ≥4）`);
    need(byType.fill >= 1, '缺少填空题（化学式、符号、数值都要手写一遍）');
    need(byType.short >= 2, `解答题只有 ${byType.short} 道（应 ≥2：至少一题计算、一题实验或说理）`);

    const withFigure = t.questions.filter((q) => q.figure).length;
    const withAnswerFigure = t.questions.filter((q) => q.answerFigure).length;
    const withSteps = t.questions.filter((q) => q.answerSteps?.length).length;
    need(withFigure >= 1, '没有一道配图题（装置图/粒子模型/曲线都是化学的必考图）');
    need(withAnswerFigure >= 1, '没有作图题（short + answerFigure 给学生标准作图/书写对照）');
    need(withSteps >= 1, '没有一道题给出 answerSteps（化学计算按步骤给分）');

    questions += t.questions.length;
    equations += t.equations?.length ?? 0;
    experiments += t.experiments?.length ?? 0;

    for (const [i, s] of t.steps.entries()) {
      if (!s.heading?.trim() || !s.body?.trim()) err(`${at}: 第 ${i + 1} 步缺少标题或正文`);
      if (checkFigureAlt(`第 ${i + 1} 步`, s.figure, at)) figures += 1;
    }
    for (const [i, e] of (t.equations ?? []).entries()) {
      if (!e.equation?.trim()) err(`${at}: 第 ${i + 1} 个化学方程式为空`);
      if (!e.phenomenon?.trim()) err(`${at}: 方程式「${e.equation}」缺少现象描述`);
      if (!e.condition?.trim()) {
        bad += 1;
        err(`${at}: 方程式「${e.equation}」缺少反应条件（初中化学的方程式不写条件直接不给分；无条件的写「无」）`);
      }
      const why = unbalanced(e.equation);
      if (why) {
        bad += 1;
        err(`${at}: 方程式「${e.equation}」没有配平——${why}`);
      }
    }
    for (const [i, x] of (t.experiments ?? []).entries()) {
      if (!x.title?.trim() || !x.purpose?.trim()) err(`${at}: 实验 ${i + 1} 缺少标题或目的`);
      if (!x.apparatus?.length) err(`${at}: 实验「${x.title}」缺少器材与药品`);
      if (x.steps.length < 2) err(`${at}: 实验「${x.title}」的步骤不足 2 步`);
      if (!x.phenomenon?.trim() || !x.conclusion?.trim()) {
        err(`${at}: 实验「${x.title}」缺少现象或结论`);
      }
      if (!x.cautions?.length) {
        bad += 1;
        err(`${at}: 实验「${x.title}」缺少注意事项（安全与操作顺序是中考必考）`);
      }
      if (checkFigureAlt(`实验「${x.title}」`, x.figure, at)) figures += 1;
    }
    for (const [i, a] of t.apps.entries()) {
      if (!a.title?.trim() || !a.scene?.trim() || !a.analysis?.trim()) {
        err(`${at}: 应用 ${i + 1} 缺少标题、情境或化学分析`);
      }
      if (a.steps.length < 2) err(`${at}: 应用「${a.title}」的解答步骤不足 2 步`);
      if (!a.result?.trim()) err(`${at}: 应用「${a.title}」缺少结论`);
      if (checkFigureAlt(`应用「${a.title}」`, a.figure, at)) figures += 1;
    }
    for (const f of t.formulas ?? []) {
      if (!f.usage?.trim()) err(`${at}: 计算关系「${f.name}」缺少 usage（适用范围）`);
      if (!f.tex?.trim() && !f.text?.trim()) err(`${at}: 计算关系「${f.name}」既没有 tex 也没有 text`);
    }
    for (const q of t.questions) {
      if (!q.explanation?.trim()) err(`${at}: 题目 ${q.id} 缺少解析（化学要讲清为什么）`);
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

  /** 整卷：按节的位置逐节比对，避免「同题型同分值」的两节互相误认 */
  for (const p of allPapers as ChemPaper[]) {
    const at = `[化学·模拟卷] ${p.id}`;
    const check = (cond: boolean, msg: string) => {
      if (!cond) {
        bad += 1;
        err(`${at}: ${msg}`);
      }
    };
    const scoreSum = p.sections.reduce((n, s) => n + s.score, 0);
    const countSum = p.sections.reduce((n, s) => n + s.count, 0);
    check(
      p.totalScore === CHEM_STRUCTURE.totalScore,
      `全卷 ${p.totalScore} 分 ≠ ${CHEM_STRUCTURE.totalScore} 分（化学笔试 60 分，不含实验操作 10 分）`,
    );
    check(p.duration === CHEM_STRUCTURE.duration, `时长 ${p.duration} 分钟 ≠ ${CHEM_STRUCTURE.duration} 分钟`);
    check(scoreSum === CHEM_STRUCTURE.totalScore, `各节分值合计 ${scoreSum} ≠ ${CHEM_STRUCTURE.totalScore}`);
    check(p.sections.length === 2, `应为「选择题 + 非选择题」两节，实际 ${p.sections.length} 节`);
    check(
      p.sections[0]?.kind === 'choice' &&
        p.sections[0].count === CHEM_STRUCTURE.choice.count &&
        p.sections[0].score === CHEM_STRUCTURE.choice.score,
      `第一节应为选择 ${CHEM_STRUCTURE.choice.count} 题 ${CHEM_STRUCTURE.choice.score} 分，实际 ${p.sections[0]?.count} 题 ${p.sections[0]?.score} 分`,
    );
    check(
      p.sections[1]?.kind === 'material' &&
        p.sections[1].count === CHEM_STRUCTURE.material.count &&
        p.sections[1].score === CHEM_STRUCTURE.material.score,
      `第二节应为非选择 ${CHEM_STRUCTURE.material.count} 题 ${CHEM_STRUCTURE.material.score} 分，实际 ${p.sections[1]?.count} 题 ${p.sections[1]?.score} 分`,
    );
    check(
      countSum === CHEM_STRUCTURE.choice.count + CHEM_STRUCTURE.material.count,
      `全卷小题 ${countSum} ≠ ${CHEM_STRUCTURE.choice.count + CHEM_STRUCTURE.material.count}`,
    );
    check(p.basis.includes('广州'), 'basis 缺少「按广州中考结构命题」的说明');
    check(p.basis.includes('原创') || p.basis.includes('非历年真题'), 'basis 必须写明原创仿真、非历年真题');
    check(
      p.materials.length === CHEM_STRUCTURE.material.count,
      `非选择题组数 ${p.materials.length} ≠ ${CHEM_STRUCTURE.material.count}`,
    );
    const choiceQs = p.questions.filter((q) => q.type === 'choice').length;
    check(
      choiceQs === CHEM_STRUCTURE.choice.count,
      `卷内选择题 ${choiceQs} 道 ≠ ${CHEM_STRUCTURE.choice.count} 道`,
    );
    for (const g of p.materials) {
      for (const q of g.questions) {
        if (!q.answer?.trim() || !q.rubric?.length) err(`${at}: 非选择题设问 ${q.id} 缺少参考答案或踩分点`);
      }
    }
  }

  const empty = TEXTBOOK_MODULE_IDS.filter((m) => !allEntries.some((e) => e.moduleId === m));
  if (empty.length) {
    bad += 1;
    err(`[化学] 下列教材模块没有任何内容：${empty.join('、')}`);
  }

  const report: ChemReport = {
    topics: allTopics.length,
    papers: allPapers.length,
    bad,
    questions,
    equations,
    experiments,
    figures,
    materials,
    asks,
  };

  if (!opts.silent) {
    console.log(`  化学备考          ${report.topics} 个知识点 / ${report.papers} 套卷（异常 ${report.bad} 处）`);
    console.log(
      `      三重表征与用语     化学方程式 ${report.equations} 个（含条件与现象、已验配平）· 实验 ${report.experiments} 个 · 图解 ${report.figures} 张`,
    );
    console.log(
      `      练习与过关         题目 ${report.questions} 道 · 综合题 ${report.materials} 组 / ${report.asks} 问（每题带答案与踩分点）`,
    );
    console.log(`      掌握判定           全部题目过关才算掌握（每个知识点 ≥${CHEM_MIN_QUESTIONS} 道）`);
  }

  return report;
}
