/**
 * 「题型专题」（`ExamTopic`）的**通用校验**：对注册表里的每一块懒加载专题模块逐项检查。
 *
 * ## 为什么通用化
 *
 * 这套规则原本只校验语文的中考专题（`scripts/validate-chinese-topics.ts`），
 * 但数学的「中考题型专题」（`math-topics`）用的是**同一套数据形状与同一套攻破标准**
 * （见 `src/data/math/TOPICS-SPEC.md`）——规则一条都不该重写，只该换一份字段下限。
 * 于是这里把规则抽出来，**遍历 `data/lazyEntries.ts` 的注册表**：
 * 以后任何学科再接一块题型专题，`pnpm validate` 自动覆盖，不必再写第三个校验脚本。
 *
 * ## 用户对这一块的硬要求（语文与数学同一条）
 *
 *   **「每个专题都有详细的讲解、大量的训练，攻破每个专题就能把这一块的分数拿下。」**
 *
 * 于是「讲解够不够详细」「训练够不够多」「题目与训练分组对不对得上」必须能自动验收：
 *
 *   ① 详细讲解 → `trends`（五年考情，恰好 5 条）/ `angles` / `steps`（分步，至少 3 步带示范）/
 *      `templates`（模板）/ `scoring`（评分点 / 数学的步骤分）/ `pitfalls`（易错失分）逐项查；
 *   ② 大量训练 → 每个专题 **≥45 题**，且**每一个训练分组都得有题**（空分组 =
 *      学生点进去没有题，等于分组是假的）；
 *   ③ 能对得上号 → 题目标签第一项必须是某个 `drills[].name`（分组刷题就是按它组卷），
 *      且**章节名 = 训练分组名 = 题目标签**（讲练一一对应，缺一边就落空组）；
 *   ④ 版权红线 → 只查「有没有把某年真题当成材料」这类痕迹做不到，改为查
 *      `trends`/`angles` 是否写了年份区间、`angles` 是否缺 `detail`，
 *      并在报告里明确提示「考情只写形态、题目全原创」。
 *
 * 另外两个容易静默失效的点：
 *   - 专题走**全题过关**掌握策略（`lib/progress.ts` 的 `ALL_QUESTIONS_PREFIXES`
 *     要含模块 id 与题目 id 前缀），否则页面写着「每题都答对才算攻破」，
 *     判定却按答对率放行；
 *   - 正文**没加载**（骨架阶段）时不能拿空数据去逐项报错——那会刷出几百条假错，
 *     把真正的错误淹掉；这里直接报一句「正文没被加载」并跳过该专题。
 */

import type { Entry, ExamTopic, QuizQuestion } from '../src/types';
import { readFileSync } from 'node:fs';
import { masteryPolicyOf } from '../src/lib/progress';
import { isExamTopicData } from '../src/lib/examTopic';
import { lazyEntryModules } from '../src/data/lazyEntries';
import { MATH_TOPIC_FILES, MATH_TOPIC_SPECS } from '../src/data/math/modules/math-topics';

/** 一块专题模块的字段下限与口径 */
export interface ExamTopicRules {
  /** 报告与报错里的名字，如「语文中考专题」 */
  label: string;
  /** 模块 id，如 `'zh-topics'` / `'math-topics'` */
  moduleId: string;
  /** 每个专题的训练量下限 */
  minQuestions: number;
  /** 分步讲解步数下限，以及其中必须带示范的步数 */
  minSteps: number;
  minDemos: number;
  /** 每个专题的章节数下限，以及每节的例子数 / 要点数 / 题目数下限 */
  minSections: number;
  minExamples: number;
  minRules: number;
  minSectionQuestions: number;
  /** 命题角度 / 模板 / 评分点 / 易错失分的下限 */
  minAngles: number;
  minTemplates: number;
  minScoring: number;
  minPitfalls: number;
  /** 每节易错的下限 */
  minSectionPitfalls: number;
  /** 讲解正文（`intro`）的字数下限 */
  minIntroChars: number;
  /**
   * `intro` 里必须出现的字样。
   *
   * 为什么要专门钉一句：加厚之后的每一节讲解都要收在「学完这一节，你应该能：①…②…③…」，
   * 学生读完能自查会不会用。这句话一旦被谁删掉，光看字数看不出来，只能按字样钉住。
   */
  introMustInclude?: string;
  /**
   * 「跨节综合变式」例子的判据字样。
   *
   * 中考不会一次只考一个考点，所以每节至少要有**一条**例子把本节与相邻考点合起来考。
   * 判据写成字样而不是精确格式，是为了让作者用顺手的说法（综合、合在一起…），
   * 同时也接受「例子里点到同专题另一节的名称」这种更自然的写法。
   */
  variantMarkers?: string[];
  /** 近五年考情：恰好 5 条、年份必须覆盖这些值 */
  trendYears: string[];
  /** 每节的例子是「正误对照」（语文 ok/fix）还是「分步解答」（数学 steps/answer） */
  exampleStyle: 'pair' | 'solve';
  /** 例子 / 要点的称呼（报告用词：语文「正误对照例子」、数学「例题」） */
  exampleWord: string;
  rulesWord: string;
  /**
   * `TOPICS-SPEC.md` 里逐字规定的章节清单（只有数学有这份清单）。
   * 对不上只**告警**而不报错：章节名本身还有「= 分组名 = 题目标签」的硬校验兜着，
   * 而规范文件与内容文件的所有权不在同一个工程师手里，硬失败会挡住内容交付。
   */
  expectedSections?: (topicId: string) => string[] | undefined;
  /**
   * 内容侧的**文件与导出名契约**（多人并行写内容时由协调方固定）：
   * 专题 id → `{ 文件短名, 导出名 }`。校验器逐条核对「清单 id ↔ 文件 ↔ 导出名」，
   * 漂移时**告警**（加载器有形状兜底，内容照样能打开，但契约漂移必须让人知道）。
   */
  exportContract?: Record<string, { file: string; exportName: string }>;
}

export interface ExamTopicReport {
  moduleId: string;
  label: string;
  topics: number;
  questions: number;
  drills: number;
  steps: number;
  demos: number;
  templates: number;
  scoring: number;
  pitfalls: number;
  angles: number;
  /** 章节（类目/子类）总数与其中的例子总数 */
  sections: number;
  examples: number;
  /** 内容文件与导出名符合契约的条数（只有配了 `exportContract` 的模块才有意义） */
  contractOk: number;
  contractTotal: number;
  bad: number;
}

/** 一道题是否「答得出来」：选择题要有 4 个选项与合法答案，主观题要有答案与踩分点 */
function questionProblem(q: QuizQuestion): string | null {
  if (!q.id?.trim()) return '题目缺少 id';
  if (!q.stem?.trim()) return `${q.id} 缺少题干`;
  if (!q.explanation?.trim()) return `${q.id} 缺少解析（学生要看到「怎么想到的」）`;
  if (q.type === 'choice') {
    const opts = q.options ?? [];
    if (opts.length !== 4) return `${q.id} 选择题应有 4 个选项（现有 ${opts.length}）`;
    if (!['A', 'B', 'C', 'D'].includes((q.answer ?? '').trim())) {
      return `${q.id} 选择题答案必须是 A/B/C/D（现为「${q.answer}」）`;
    }
    return null;
  }
  if (!q.answer?.trim()) return `${q.id} 缺少答案`;
  if (q.type === 'short' && (q.rubric?.length ?? 0) < 2) {
    return `${q.id} 简答题必须给 ≥2 条踩分点（rubric），否则学生不知道答到什么程度给分`;
  }
  return null;
}

/**
 * 校验一块专题模块。
 *
 * `entries` 传该模块的全部条目（骨架或正文都行）：没有正文的条目会报一句
 * 「正文没被加载」——这条错误提示的是**接线问题**（`ensureAll()` 少调了
 * `loadAllLazyEntries()`，或数据文件根本没被写出来），而不是内容质量问题。
 */
export function validateExamTopicModule(opts: {
  rules: ExamTopicRules;
  err: (msg: string) => void;
  /** 内容规范类的问题（不阻断交付），可选 */
  warn?: (msg: string) => void;
  /** 该模块的全部条目（含骨架） */
  entries: Entry[];
  /** 这一条的正文是否已在内存里 */
  isReady: (id: string) => boolean;
  /** 正文数据文件所在目录（注册表提供；核对契约文件时用） */
  contentDir?: string;
  /** 打印报告时用（由入口统一打印时为 false） */
  silent?: boolean;
}): ExamTopicReport {
  const { rules, err, warn, entries, isReady, contentDir } = opts;
  const at0 = `[${rules.label}]`;
  let bad = 0;
  let questions = 0;
  let drills = 0;
  let steps = 0;
  let demos = 0;
  let templates = 0;
  let scoring = 0;
  let pitfalls = 0;
  let angles = 0;
  let sections = 0;
  let examples = 0;
  let contractOk = 0;

  const topics = entries
    .filter((e) => e.moduleId === rules.moduleId)
    .map((e) => (isExamTopicData(e.data) ? e.data : undefined))
    .filter((t): t is ExamTopic => Boolean(t));

  /**
   * 内容契约：清单里的专题 ↔ 数据文件 ↔ 固定导出名。
   *
   * 加载器对命名有形状兜底（导出名写歪也能打开），所以这里**只告警**；
   * 但契约漂移会让「一个专题一个单文件 import」这条约定慢慢失效
   * （例如有人把两个专题塞进一个文件），必须有人看见。
   */
  const contractEntries = Object.entries(rules.exportContract ?? {});
  for (const [id, c] of contractEntries) {
    if (!topics.some((t) => t.id === id)) continue; // 这个专题还没有内容：不在契约核对范围
    const file = `${contentDir ?? ''}/${c.file}.ts`.replace(/^\//, '');
    let src = '';
    try {
      src = readFileSync(file, 'utf8');
    } catch {
      warn?.(`${at0} ${id}: 契约文件不存在（${file}）——请按约定放在 ${contentDir} 下`);
      continue;
    }
    if (new RegExp(`export\\s+(const|let|var)\\s+${c.exportName}\\b`).test(src)) {
      contractOk += 1;
    } else {
      warn?.(
        `${at0} ${id}: 契约要求 ${file} 导出 \`${c.exportName}\`（示例：\`export const ${c.exportName}: ExamTopic = {…}\`），` +
          `当前文件里找不到该导出——加载器会按数据形状兜底取到它，但请照契约写，别让下一个人踩坑`,
      );
    }
  }

  // 掌握策略必须与文档一致：专题走「全题过关」（模块 id 前缀或题目 id 前缀命中即可）
  if (masteryPolicyOf(rules.moduleId) !== 'all-questions') {
    err(
      `${at0} ${rules.moduleId} 未走「全题过关」策略（lib/progress.ts 的 ALL_QUESTIONS_PREFIXES ` +
        `缺少该模块 id 或题目 id 前缀），页面承诺的「每题都答对才算攻破」会落空`,
    );
    bad += 1;
  }

  const seenIds = new Set<string>();

  for (const t of topics) {
    const at = `${at0} ${t.id}`;
    const need = (cond: boolean, msg: string) => {
      if (!cond) {
        bad += 1;
        err(`${at}: ${msg}`);
      }
    };

    /**
     * 正文没到位：只报一句，**不要**继续逐项报「不足」。
     * 骨架阶段每个专题都会缺 everything，几百条假错会把真正的错误淹掉。
     */
    if (!isReady(t.id)) {
      bad += 1;
      err(
        `${at}: 正文没有被加载（骨架阶段）——` +
          `ensureAll() 应当调用注册表的 loadAllLazyEntries()，且数据文件要真的写出来`,
      );
      continue;
    }

    need(Boolean(t.title?.trim()), '缺少专题名（title）');
    need(Boolean(t.paper?.trim()), '缺少卷面定位（paper）');
    need(Boolean(t.summary?.trim()), '缺少一句话说明（summary）');
    need(Boolean(t.trendSummary?.trim()), '缺少五年趋势结论（trendSummary）');

    /**
     * ① 近五年考情：恰好 5 条，年份必须覆盖规则里点名的五年。
     * 数学的 `TOPICS-SPEC.md` 同样要求 2021—2025 一年一条。
     */
    const years = (t.trends ?? []).map((x) => x.year);
    need(years.length === 5, `近五年考情应为 5 条（现有 ${years.length}）`);
    for (const y of rules.trendYears) {
      need(years.includes(y), `近五年考情缺 ${y} 年`);
    }
    for (const tr of t.trends ?? []) {
      need(Boolean(tr.note?.trim()), `${tr.year} 年的考情说明为空`);
      need(
        tr.note.length >= 20,
        `${tr.year} 年的考情说明太短（${tr.note.length} 字），要写清「考查形态 / 分值区间 / 选材倾向」`,
      );
    }

    // ② 详细讲解的各块
    need(
      (t.angles?.length ?? 0) >= rules.minAngles,
      `命题角度不足 ${rules.minAngles} 条（现有 ${t.angles?.length ?? 0}）`,
    );
    for (const a of t.angles ?? []) {
      need(Boolean(a.angle?.trim()), '命题角度缺少 angle');
      need(Boolean(a.detail?.trim()), `命题角度「${a.angle}」缺少 detail（怎么设问、怎么答）`);
    }
    const stepList = t.steps ?? [];
    need(stepList.length >= rules.minSteps, `分步讲解不足 ${rules.minSteps} 步（现有 ${stepList.length}）`);
    const demoCount = stepList.filter((s) => Boolean(s.demo?.trim())).length;
    need(demoCount >= rules.minDemos, `带示范（demo）的步骤不足 ${rules.minDemos} 步（现有 ${demoCount}）`);
    for (const s of stepList) {
      need(Boolean(s.heading?.trim()) && Boolean(s.body?.trim()), '分步讲解有步骤缺 heading 或 body');
    }
    const tpl = t.templates ?? [];
    need(tpl.length >= rules.minTemplates, `模板不足 ${rules.minTemplates} 组（现有 ${tpl.length}）`);
    for (const g of tpl) {
      need(Boolean(g.name?.trim()), '模板缺少 name');
      need((g.items?.length ?? 0) >= 3, `模板「${g.name}」不足 3 条`);
    }
    need(
      (t.scoring?.length ?? 0) >= rules.minScoring,
      `评分点不足 ${rules.minScoring} 条（现有 ${t.scoring?.length ?? 0}）`,
    );
    need(
      (t.pitfalls?.length ?? 0) >= rules.minPitfalls,
      `易错与失分不足 ${rules.minPitfalls} 条（现有 ${t.pitfalls?.length ?? 0}）`,
    );
    for (const p of t.pitfalls ?? []) {
      need(
        Boolean(p.wrong?.trim()) && Boolean(p.right?.trim()) && Boolean(p.why?.trim()),
        '易错与失分要写全 wrong / right / why 三行',
      );
    }

    // ③ 大量训练：题量 + 分组与标签必须对得上
    const drillNames = (t.drills ?? []).map((d) => d.name);
    need(drillNames.length >= 5, `训练分组不足 5 组（现有 ${drillNames.length}）`);
    for (const d of t.drills ?? []) {
      need(Boolean(d.note?.trim()), `训练分组「${d.name}」缺少说明（note）`);
    }
    const qs = t.questions ?? [];
    need(
      qs.length >= rules.minQuestions,
      `训练题不足 ${rules.minQuestions} 道（现有 ${qs.length}）——「大量训练」是这个模块的硬指标`,
    );

    const byTag = new Map<string, number>();
    for (const q of qs) {
      if (seenIds.has(q.id)) {
        bad += 1;
        err(`${at}: 题目 id 重复：${q.id}`);
      }
      seenIds.add(q.id);

      const problem = questionProblem(q);
      if (problem) {
        bad += 1;
        err(`${at}: ${problem}`);
      }

      const tags = q.tags ?? [];
      if (tags.length < 2) {
        bad += 1;
        err(`${at}: ${q.id} 只有 ${tags.length} 个标签，应 ≥2（第一个是训练分组名）`);
      }
      /**
       * 断句填空题的答案里必须带 `/`。
       *
       * 这不是格式洁癖：`lib/utils.ts` 的 `answerModeFor` 就是拿「答案里有没有 `/`」
       * 当断句的唯一判据——有 `/` 走 `strict`（保留 `/`，学生不敲斜杠判错）；
       * 答案若写成「，」，这题会按 `loose` 判，标点当成空白剥掉，**完全不断句也算对**。
       * 判据取「题干要求用 / 断句」（题干里同时出现「断句」与 `/`），
       * 避免误伤「先断句再翻译」这类答案是译文的题。
       */
      const askSlash = /断句/.test(q.stem ?? '') && /[/／]/.test(q.stem ?? '');
      if (q.type === 'fill' && askSlash && !/[/／]/.test(q.answer ?? '')) {
        bad += 1;
        err(
          `${at}: ${q.id} 题干要求用「/」断句，但答案里没有「/」——判分会退回 loose，学生不断句也被判对；答案要写成「甲/乙/丙」`,
        );
      }
      const group = tags[0];
      if (!group || !drillNames.includes(group)) {
        bad += 1;
        err(
          `${at}: ${q.id} 的首个标签「${group ?? ''}」不在 drills 分组里（分组刷题按它组卷，对不上这题就永远刷不到）`,
        );
      }
      for (const tag of tags) byTag.set(tag, (byTag.get(tag) ?? 0) + 1);
    }

    for (const name of drillNames) {
      const n = byTag.get(name) ?? 0;
      if (n === 0) {
        bad += 1;
        err(`${at}: 训练分组「${name}」一道题都没有，学生点进去是空组`);
      }
    }

    /**
     * ④ 章节（逐类讲透）—— 用户对这一块最在意的一件事：
     * 「每个类别都要讲透，每一种类型都有独立的章节，有讲解、有例子、有练习」。
     * 因此逐节检查：讲解字数、要点、例子（语文正误对照 / 数学分步解答）、
     * 以及「同名训练分组 ≥4 题」——讲完一节必须能马上练这一节。
     */
    const secs = t.sections ?? [];
    need(
      secs.length >= rules.minSections,
      `章节不足 ${rules.minSections} 节（现有 ${secs.length}）——每个类目都要有自己的章节`,
    );
    const sectionNames = new Set<string>();
    // 判「跨节综合变式」时要能认出**同专题另一节**的名字，所以先把清单准备好
    const allSectionNames = secs.map((s) => s.name).filter((n): n is string => Boolean(n?.trim()));
    for (const s of secs) {
      if (!s.name?.trim()) {
        bad += 1;
        err(`${at}: 有章节缺少 name`);
        continue;
      }
      const sat = `${at}·${s.name}`;
      if (sectionNames.has(s.name)) {
        bad += 1;
        err(`${sat}: 章节名重复`);
      }
      sectionNames.add(s.name);

      need(
        (s.intro?.trim().length ?? 0) >= rules.minIntroChars,
        `${s.name}: 讲解正文不足 ${rules.minIntroChars} 字（现有 ${s.intro?.trim().length ?? 0} 字）——要讲清「怎么判断 / 怎么下手」`,
      );
      if (rules.introMustInclude && !(s.intro ?? '').includes(rules.introMustInclude)) {
        bad += 1;
        err(
          `${s.name}: 讲解结尾缺少「${rules.introMustInclude}…」自查清单——讲完要让学生知道自己会不会用`,
        );
      }
      need((s.rules?.length ?? 0) >= rules.minRules, `${s.name}: ${rules.rulesWord}不足 ${rules.minRules} 条`);
      const exs = s.examples ?? [];
      need(
        exs.length >= rules.minExamples,
        `${s.name}: ${rules.exampleWord}不足 ${rules.minExamples} 条（现有 ${exs.length}）`,
      );
      for (const ex of exs) {
        if (!ex.text?.trim() || !ex.analysis?.trim()) {
          bad += 1;
          err(`${s.name}: 有例子缺 text 或 analysis（例子必须逐句讲清为什么对／为什么错）`);
          continue;
        }
        if (rules.exampleStyle === 'solve') {
          // 数学：例子要「完整做一遍」——分步解答 + 答案，缺一样都讲不透
          if (!ex.steps?.filter((x) => x?.trim()).length) {
            bad += 1;
            err(`${s.name}: 例题「${ex.text.slice(0, 14)}…」没有分步解答（steps）——数学靠步骤讲透`);
          }
          if (!ex.answer?.trim()) {
            bad += 1;
            err(`${s.name}: 例题「${ex.text.slice(0, 14)}…」没给答案（answer）`);
          }
        } else if (ex.ok !== true && !ex.fix?.trim()) {
          bad += 1;
          err(`${s.name}: 错例「${ex.text.slice(0, 14)}…」没给修改后的句子（fix）`);
        }
      }
      need(
        (s.pitfalls?.length ?? 0) >= rules.minSectionPitfalls,
        `${s.name}: 本节易错不足 ${rules.minSectionPitfalls} 条`,
      );
      if (rules.variantMarkers?.length) {
        const markers = rules.variantMarkers;
        // 两种写法都算「跨节综合」：写明「综合／合在一起」，或在例子里点到同专题另一节的名称
        const hasVariant = exs.some((ex) => {
          const blob = `${ex.text ?? ''}\n${ex.analysis ?? ''}\n${(ex.steps ?? []).join('\n')}`;
          if (markers.some((m) => blob.includes(m))) return true;
          return allSectionNames.some((n) => n !== s.name && blob.includes(n));
        });
        need(
          hasVariant,
          `${s.name}: 缺一条跨节综合变式例子（把本节与相邻考点合在一起考）——中考不会一次只考一节`,
        );
      }
      for (const p of s.pitfalls ?? []) {
        if (typeof p === 'string') {
          need(p.trim().length >= 8, `${s.name}: 本节易错「${p.slice(0, 12)}…」太短，要写清「错在哪 → 怎么办」`);
        } else {
          need(
            Boolean(p?.wrong?.trim()) && Boolean(p?.right?.trim()) && Boolean(p?.why?.trim()),
            `${s.name}: 本节易错用三行对象时要写全 wrong / right / why`,
          );
        }
      }

      // 讲练一一对应：章节名 = 训练分组名 = 题目首个标签
      if (!drillNames.includes(s.name)) {
        bad += 1;
        err(`${sat}: 章节名不在 drills 分组里（学生点「刷这一节」会落到空组）`);
      } else {
        const n = byTag.get(s.name) ?? 0;
        if (n < rules.minSectionQuestions) {
          bad += 1;
          err(
            `${sat}: 这一节只有 ${n} 道题（应 ≥${rules.minSectionQuestions}）——「讲完就练」缺了练习那一半`,
          );
        }
      }
    }

    // 反向检查：不许有「有分组、没章节」的组（讲练必须成对）
    if (secs.length) {
      for (const name of drillNames) {
        if (!sectionNames.has(name)) {
          bad += 1;
          err(`${at}: 训练分组「${name}」没有对应章节（要么补一节讲透它，要么把这个分组去掉）`);
        }
      }
    }

    /**
     * ⑤ 与内容规范（`TOPICS-SPEC.md`）的章节清单对一下：**只告警**。
     * 章节名的硬校验是「= 分组名 = 题目标签」，那一条已经能拦住「点进去是空组」；
     * 规范清单对不上说明内容与规范文件有了偏差，需要人去看一眼，但不该直接判失败。
     */
    const expected = rules.expectedSections?.(t.id);
    if (expected?.length && warn) {
      const missing = expected.filter((n) => !sectionNames.has(n));
      const extra = [...sectionNames].filter((n) => !expected.includes(n));
      if (missing.length) {
        warn(
          `${at}: 章节清单与内容规范不一致，规范里有而数据里没有：${missing.join('、')}` +
            `（章节名必须逐字照用，否则清单、分组、题目标签会对不上）`,
        );
      }
      if (extra.length) {
        warn(`${at}: 数据里有规范清单之外的章节：${extra.join('、')}`);
      }
    }

    questions += qs.length;
    drills += drillNames.length;
    steps += stepList.length;
    demos += demoCount;
    templates += tpl.length;
    scoring += t.scoring?.length ?? 0;
    pitfalls += t.pitfalls?.length ?? 0;
    angles += t.angles?.length ?? 0;
    sections += secs.length;
    examples += secs.reduce((n, s) => n + (s.examples?.length ?? 0), 0);
  }

  const report: ExamTopicReport = {
    moduleId: rules.moduleId,
    label: rules.label,
    topics: topics.length,
    questions,
    drills,
    steps,
    demos,
    templates,
    scoring,
    pitfalls,
    angles,
    sections,
    examples,
    contractOk,
    contractTotal: contractEntries.filter(([id]) => topics.some((t) => t.id === id)).length,
    bad,
  };

  if (!opts.silent) {
    console.log(
      `\n  ${rules.label}      ${report.topics} 个专题 / ${report.sections} 节章节 / ${report.questions} 道专项训练题（异常 ${report.bad} 处）`,
    );
    console.log(
      `      讲解         分步 ${report.steps} 步（含示范 ${report.demos} 步）· 模板 ${report.templates} 组 · 评分点 ${report.scoring} 条 · 易错失分 ${report.pitfalls} 条 · 命题角度 ${report.angles} 条`,
    );
    console.log(
      `      逐类讲透      ${report.sections} 节 · ${report.examples} 个${rules.exampleWord}（每节 ≥${rules.minExamples} 例、≥${rules.minRules} 条${rules.rulesWord}、≥${rules.minSectionQuestions} 题）`,
    );
    console.log(
      `      训练分组      ${report.drills} 组（组名 = 章节名 = 题目标签，点进分组即按标签组卷）· 掌握判定 = 全题过关`,
    );
    if (report.contractTotal) {
      console.log(
        `      内容契约      ${report.contractOk}/${report.contractTotal} 个专题的「文件 + 导出名」与约定一致（一专题一文件一 import = 打开一条只下载那一块）`,
      );
    }
  }

  return report;
}

/* ------------------------------------------------------------------ */
/* 各模块的字段下限                                                     */
/* ------------------------------------------------------------------ */

/**
 * 语文中考专题（`zh-topics`）：下限按 `CONTENT-SPEC.md` 第八节「加厚」后的标准。
 *
 * 这一版把每节的门槛从「≥3 例 / ≥3 要点 / ≥4 题 / ≥60 字」提到
 * 「≥4 例（含一条跨节综合变式）/ ≥4 要点 / ≥8 题 / ≥120 字 + 自查清单」，
 * 并且**没有下调任何一条旧门槛**：81 节已经全部按新标准加厚，
 * 门口抬到实际水平，后面谁再补一节就会被同一把尺子量。
 */
export const ZH_TOPIC_RULES: ExamTopicRules = {
  label: '语文中考专题',
  moduleId: 'zh-topics',
  minQuestions: 45,
  minSteps: 6,
  minDemos: 3,
  minSections: 6,
  minExamples: 4,
  minRules: 4,
  minSectionQuestions: 8,
  minAngles: 6,
  minTemplates: 3,
  minScoring: 4,
  minPitfalls: 4,
  minSectionPitfalls: 2,
  minIntroChars: 120,
  introMustInclude: '你应该能',
  variantMarkers: ['综合变式', '综合运用', '合在一起', '跨节'],
  trendYears: ['2021', '2022', '2023', '2024', '2025'],
  exampleStyle: 'pair',
  exampleWord: '正误对照例子',
  rulesWord: '判定要点',
};

/**
 * 数学中考题型专题（`math-topics`）：下限照 `src/data/math/TOPICS-SPEC.md` 第三节。
 *
 * 与语文的两处差异，都来自「数学怎么考」本身：
 *   - `minSections` 是 5 不是 6：「统计与概率」在 2027 卷面上只有 5 节（规范第二节逐字规定）；
 *   - `exampleStyle: 'solve'`：例子是**分步解答**（`steps` + `answer`），
 *     不是语文的正误对照（`ok` / `fix`）——数学靠步骤讲透，光给答案学不会。
 */
export const MATH_TOPIC_RULES: ExamTopicRules = {
  label: '数学中考题型专题',
  moduleId: 'math-topics',
  minQuestions: 45,
  minSteps: 6,
  minDemos: 3,
  minSections: 5,
  minExamples: 3,
  minRules: 3,
  minSectionQuestions: 4,
  minAngles: 6,
  minTemplates: 3,
  minScoring: 4,
  minPitfalls: 4,
  minSectionPitfalls: 2,
  minIntroChars: 60,
  trendYears: ['2021', '2022', '2023', '2024', '2025'],
  exampleStyle: 'solve',
  exampleWord: '例题',
  rulesWord: '解题套路',
  /** 章节清单逐字来自 `TOPICS-SPEC.md` 第二节（对不上只告警，见 `expectedSections` 的说明） */
  expectedSections: (id) => MATH_TOPIC_SPECS.find((s) => s.id === id)?.sections,
  /** 协调方固定的「文件 + 导出名」契约（与加载器同一张表，防止两边漂移） */
  exportContract: MATH_TOPIC_FILES,
};

/** 模块 id → 规则（新增一块题型专题时在这里登记一条，`pnpm validate` 自动覆盖它） */
export const EXAM_TOPIC_RULES: Record<string, ExamTopicRules> = {
  [ZH_TOPIC_RULES.moduleId]: ZH_TOPIC_RULES,
  [MATH_TOPIC_RULES.moduleId]: MATH_TOPIC_RULES,
};

/* ------------------------------------------------------------------ */
/* 遍历注册表：一次校验全部题型专题模块                                  */
/* ------------------------------------------------------------------ */

/**
 * 遍历「按条目懒加载」注册表里**所有装题型专题的模块**，逐个跑上面那套规则。
 *
 * 为什么从注册表取而不是写死两个模块 id：新学科再接一块题型专题时，
 * 只要它在注册表里登记过，`pnpm validate` 就会自动校验它——不需要有人记得
 * 再来这里加一行（那正是「内容写了却没人校验」的来源）。
 */
export function validateAllExamTopics(opts: {
  err: (msg: string) => void;
  warn?: (msg: string) => void;
  /** 全部条目（`ensureAll()` 之后的 `allEntries`） */
  allEntries: Entry[];
  silent?: boolean;
}): ExamTopicReport[] {
  const { err, warn, allEntries } = opts;
  const reports: ExamTopicReport[] = [];

  for (const mod of lazyEntryModules()) {
    const entries = allEntries.filter((e) => e.moduleId === mod.moduleId);
    // 这一块还没有题型专题内容（例如数学内容文件还没写完）：没有可校验的东西，跳过
    if (!entries.some((e) => isExamTopicData(e.data))) continue;

    const rules = EXAM_TOPIC_RULES[mod.moduleId];
    if (!rules) {
      err(
        `[题型专题] 注册表里的「${mod.moduleId}」装有题型专题内容，却没有配置校验规则（EXAM_TOPIC_RULES）` +
          `——它会静默逃过全部下限检查，请到 scripts/validate-exam-topics.ts 补一条`,
      );
      continue;
    }

    reports.push(
      validateExamTopicModule({
        rules,
        err,
        warn,
        entries,
        isReady: (id) => mod.isReady(id),
        // 契约核对的路径从注册表拿，规则表里不重复写一遍目录
        contentDir: mod.contentDir,
        silent: opts.silent,
      }),
    );
  }

  return reports;
}
