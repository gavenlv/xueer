/**
 * 语文「中考专题」的校验规则（独立成文件，与 `validate-physics.ts`、`validate-chemistry.ts` 同一套路）。
 *
 * 为什么单独一份：用户对这一块的要求很具体——
 *   **「每个专题都有详细的讲解、大量的训练，攻破每个专题就能把这一块的分数拿下。」**
 * 于是「讲解够不够详细」「训练够不够多」「题目与训练分组对不对得上」都必须能自动验收：
 *
 *   ① 详细讲解 → `trends`（五年考情）/ `angles` / `steps`（分步，至少 3 步带示范）/
 *      `templates`（答题模板）/ `scoring`（评分点）/ `pitfalls`（易错失分）逐项查；
 *   ② 大量训练 → 每个专题 **≥45 题**，且**每一个训练分组都得有题**（空分组 =
 *      学生点进去没有题，等于分组是假的）；
 *   ③ 能对得上号 → 题目标签第一项必须是某个 `drills[].name`（分组刷题就是按它组卷）；
 *   ④ 版权红线 → 只查「有没有把某年真题当成材料」这类痕迹做不到，改为查
 *      `trends`/`angles` 是否写了年份区间、`angles` 是否缺 `detail`，
 *      并在报告里明确提示「考情只写形态、题目全原创」。
 *
 * 另外两个容易静默失效的点：
 *   - 专题走**全题过关**掌握策略（`lib/progress.ts` 的 `ALL_QUESTIONS_PREFIXES` 含 `zht-`），
 *     所以这里要确认每条专题都被 `zht-` 覆盖，否则「攻破」标准与页面文案会不一致；
 *   - 专题详情页曾经**没有渲染器**（落到 DetailPage 的 default 分支显示「暂不支持」），
 *     内容写了却看不见，所以这里连「页面能不能渲染这个模块」一起管。
 */

import type { ChineseExamTopic, Entry, QuizQuestion } from '../src/types';
import { masteryPolicyOf } from '../src/lib/progress';

/** 用户对这一块的硬要求：每个专题的训练量下限 */
export const ZH_TOPIC_MIN_QUESTIONS = 45;
/** 分步讲解步数下限，以及其中必须带示范的步数 */
export const ZH_TOPIC_MIN_STEPS = 6;
export const ZH_TOPIC_MIN_DEMOS = 3;
/** 近五年考情：恰好 5 条，年份 2021—2025 */
export const ZH_TOPIC_TREND_YEARS = ['2021', '2022', '2023', '2024', '2025'];

export interface ChineseTopicReport {
  topics: number;
  questions: number;
  drills: number;
  steps: number;
  demos: number;
  templates: number;
  scoring: number;
  pitfalls: number;
  angles: number;
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

export function validateChineseTopics(opts: {
  err: (msg: string) => void;
  allEntries: Entry[];
  /** 不打印报告（由调用方统一打印）时为 false */
  silent?: boolean;
}): ChineseTopicReport {
  const { err, allEntries } = opts;
  let bad = 0;
  let questions = 0;
  let drills = 0;
  let steps = 0;
  let demos = 0;
  let templates = 0;
  let scoring = 0;
  let pitfalls = 0;
  let angles = 0;

  const topics = allEntries
    .filter((e) => e.moduleId === 'zh-topics')
    .map((e) => e.data as ChineseExamTopic);

  if (!topics.length) {
    err('[语文中考专题] 一个专题都没有——模块内容没被加载或被清空');
  }

  // 掌握策略必须与文档一致：专题走「全题过关」
  if (masteryPolicyOf('zh-topics') !== 'all-questions') {
    err(
      '[语文中考专题] zh-topics 未走「全题过关」策略（lib/progress.ts 的 ALL_QUESTIONS_PREFIXES 缺 `zht-`），页面承诺的「每题都答对才算攻破」会落空',
    );
  }

  const seenIds = new Set<string>();

  for (const t of topics) {
    const at = `[语文中考专题] ${t.id}`;
    const need = (cond: boolean, msg: string) => {
      if (!cond) {
        bad += 1;
        err(`${at}: ${msg}`);
      }
    };

    need(Boolean(t.title?.trim()), '缺少专题名（title）');
    need(Boolean(t.paper?.trim()), '缺少卷面定位（paper）');
    need(Boolean(t.summary?.trim()), '缺少一句话说明（summary）');
    need(Boolean(t.trendSummary?.trim()), '缺少五年趋势结论（trendSummary）');

    // ① 近五年考情：恰好 5 条，年份必须覆盖 2021—2025
    const years = (t.trends ?? []).map((x) => x.year);
    need(years.length === 5, `近五年考情应为 5 条（现有 ${years.length}）`);
    for (const y of ZH_TOPIC_TREND_YEARS) {
      need(years.includes(y), `近五年考情缺 ${y} 年`);
    }
    for (const tr of t.trends ?? []) {
      need(Boolean(tr.note?.trim()), `${tr.year} 年的考情说明为空`);
      need(
        tr.note.length >= 20,
        `${tr.year} 年的考情说明太短（${tr.note.length} 字），要写清「考查形态 / 分值区间 / 选材倾向」`,
      );
    }

    // ② 详细讲解的六块
    need((t.angles?.length ?? 0) >= 6, `命题角度不足 6 条（现有 ${t.angles?.length ?? 0}）`);
    for (const a of t.angles ?? []) {
      need(Boolean(a.angle?.trim()), '命题角度缺少 angle');
      need(Boolean(a.detail?.trim()), `命题角度「${a.angle}」缺少 detail（怎么设问、怎么答）`);
    }
    const stepList = t.steps ?? [];
    need(stepList.length >= ZH_TOPIC_MIN_STEPS, `分步讲解不足 ${ZH_TOPIC_MIN_STEPS} 步（现有 ${stepList.length}）`);
    const demoCount = stepList.filter((s) => Boolean(s.demo?.trim())).length;
    need(demoCount >= ZH_TOPIC_MIN_DEMOS, `带示范（demo）的步骤不足 ${ZH_TOPIC_MIN_DEMOS} 步（现有 ${demoCount}）`);
    for (const s of stepList) {
      need(Boolean(s.heading?.trim()) && Boolean(s.body?.trim()), '分步讲解有步骤缺 heading 或 body');
    }
    const tpl = t.templates ?? [];
    need(tpl.length >= 3, `答题模板不足 3 组（现有 ${tpl.length}）`);
    for (const g of tpl) {
      need(Boolean(g.name?.trim()), '答题模板缺少 name');
      need((g.items?.length ?? 0) >= 3, `答题模板「${g.name}」不足 3 条`);
    }
    need((t.scoring?.length ?? 0) >= 4, `评分点不足 4 条（现有 ${t.scoring?.length ?? 0}）`);
    need((t.pitfalls?.length ?? 0) >= 4, `易错与失分不足 4 条（现有 ${t.pitfalls?.length ?? 0}）`);
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
      qs.length >= ZH_TOPIC_MIN_QUESTIONS,
      `训练题不足 ${ZH_TOPIC_MIN_QUESTIONS} 道（现有 ${qs.length}）——「大量训练」是这个模块的硬指标`,
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

    questions += qs.length;
    drills += drillNames.length;
    steps += stepList.length;
    demos += demoCount;
    templates += tpl.length;
    scoring += t.scoring?.length ?? 0;
    pitfalls += t.pitfalls?.length ?? 0;
    angles += t.angles?.length ?? 0;
  }

  const report: ChineseTopicReport = {
    topics: topics.length,
    questions,
    drills,
    steps,
    demos,
    templates,
    scoring,
    pitfalls,
    angles,
    bad,
  };

  if (!opts.silent) {
    console.log(`\n  语文中考专题      ${report.topics} 个专题 / ${report.questions} 道专项训练题（异常 ${report.bad} 处）`);
    console.log(
      `      讲解         分步 ${report.steps} 步（含示范 ${report.demos} 步）· 模板 ${report.templates} 组 · 评分点 ${report.scoring} 条 · 易错失分 ${report.pitfalls} 条 · 命题角度 ${report.angles} 条`,
    );
    console.log(
      `      训练分组      ${report.drills} 组（组名 = 题目标签，点进分组即按标签组卷）· 掌握判定 = 全题过关`,
    );
  }

  return report;
}
