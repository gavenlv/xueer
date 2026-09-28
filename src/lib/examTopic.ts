/**
 * 「题型专题」（`ExamTopic`）的**学科无关**判据与小工具。
 *
 * 这套数据形态原本只属于语文的中考专题（`zh-topics`）：一个专题 =
 * 近五年考情 + 命题角度 + 分步讲解 + 逐类章节 + 模板/评分点/易错 + 专项训练。
 * 数学的「中考题型专题」（`math-topics`）用的是**同一套字段**（见
 * `src/data/math/TOPICS-SPEC.md`），因此凡是「按 moduleId 判断专题」的地方都要
 * 改成**按数据形状判断**——否则每加一个学科就要再补一轮 `case`，漏一处就是白屏：
 *
 *   - `lib/searchText.ts`：数学专题落到数学分支会去读 `concepts`（专题没有这个字段）
 *     并直接抛 TypeError，专题详情页底部的「关联学习 / 学一补多」随之整页白屏；
 *   - `lib/entrySpeech.ts`：数学专题整页朗读会变成「没有可读段落」；
 *   - `scripts/validate-exam-topics.ts`：校验规则要能遍历任意 ExamTopic 模块。
 *
 * 判据用两个必填字段（`trends` 与 `drills`）：它们在 `ExamTopic` 上是必填，
 * 在其它任何内容形态上都不存在，而且是数组，检查成本极低。
 */

import type { ExamExample, ExamTopic } from '../types';

/** 这条数据是不是「题型专题」形态（与 moduleId 无关） */
export function isExamTopicData(data: unknown): data is ExamTopic {
  if (!data || typeof data !== 'object') return false;
  const t = data as Partial<ExamTopic>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    Array.isArray(t.trends) &&
    Array.isArray(t.drills)
  );
}

/**
 * 一条例子是「分步解答」形态（数学）还是「正误对照」形态（语文）。
 *
 * 两者共用 `ExamExample`，区别只在字段：数学写 `steps` + `answer`（一步一行走完整过程），
 * 语文写 `ok` + `fix`（这道例子的写法对不对、该怎么改）。渲染层据此分流，
 * 因此**不需要**按 subjectId 硬编码——同一个模块里两种写法混着也不会渲染错。
 */
export function isStepExample(ex: ExamExample): boolean {
  return Array.isArray(ex.steps) && ex.steps.filter((s) => s?.trim()).length > 0;
}

/**
 * 专题条目的副标题 = 卷面定位 + 这一专题的规模。
 *
 * 抽成**唯一一份**实现是有原因的：模块列表页显示的是轻量清单（`data/summary.ts`）
 * 里生成好的那份字符串，详情页显示的是正文装配出来的那份；两个算法一旦不一致，
 * 学生点进去会发现「列表说 17 节 116 题，详情页说 9 节 0 题」。
 * `pnpm validate` 会逐条比对清单与真实数据（见 `scripts/validate-entry.ts`），
 * 因此这里必须是语文与数学共用的同一个函数。
 */
export function examTopicSubtitle(t: ExamTopic, questionCount: number): string {
  const secs = t.sections?.length ?? 0;
  return secs
    ? `${t.paper} · ${secs} 节逐类讲透 · ${questionCount} 题`
    : `${t.paper} · ${questionCount} 题 · ${t.drills.length} 组训练`;
}

/**
 * 专题数据放进检索文本的部分（`lib/searchText.ts` 用）。
 *
 * 专题是靠「考情 + 讲解 + 训练」三件套拿分的，所以检索文本要把五年考情、命题角度、
 * 分步讲解（含示范）、模板、评分点、易错失分、章节与训练分组全部收进来——
 * 学生按「病句」「二次函数」「步骤分」这些词应该能直接搜到专题。
 */
export function examTopicSearchParts(t: ExamTopic): (string | string[] | undefined)[] {
  return [
    t.title,
    t.paper,
    t.summary,
    t.trendSummary,
    t.trends.map((x) => `${x.year}${x.note}`),
    t.angles.map((x) => `${x.angle}${x.years ?? ''}${x.detail}`),
    t.steps.map((s) => `${s.heading}${s.body}${s.demo ?? ''}`),
    t.sections?.map((s) =>
      [
        s.name,
        s.intro,
        (s.rules ?? []).join(''),
        s.examples.map((ex) => `${ex.text}${(ex.steps ?? []).join('')}${ex.answer ?? ''}${ex.fix ?? ''}${ex.analysis}`),
        (s.pitfalls ?? []).map((p) => (typeof p === 'string' ? p : `${p.wrong}${p.right}${p.why}`)),
      ].join(''),
    ),
    t.templates?.map((g) => `${g.name}${g.items.join('')}`),
    t.scoring,
    t.pitfalls?.map((p) => `${p.wrong}${p.right}${p.why}`),
    t.drills.map((d) => `${d.name}${d.note}`),
    t.questions.map((q) => `${q.stem}${(q.options ?? []).join('')}`),
  ];
}
