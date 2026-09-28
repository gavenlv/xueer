/**
 * 「题型专题」**专题页**（通用版）：总览 + 章节清单 —— 语文与数学共用。
 *
 * ## 为什么要有这个文件
 *
 * 语文的「中考专题」（`zh-topics`）与数学的「中考题型专题」（`math-topics`）用的是
 * **同一套数据形状**（`types.ts` 的 `ExamTopic`：考情 / 角度 / 分步讲解 / 章节 /
 * 模板 / 评分点 / 易错 / 训练分组）。页面结构、折叠、链接口径没有任何一处是语文独有的，
 * 所以这一页**只认字段、不认学科**：
 *
 *   - 语文那一页（`ChineseExamTopicDetail`）保留为**薄封装**，只是把「语文的措辞」
 *     传进来（`答题模板` / `评分点与踩分点`），因此它的对外 props 与渲染结果一字未变；
 *   - 数学（`DetailPage` 的 `case 'math-topics'`）用同一组件 + 数学措辞
 *     （`解题模板` / `步骤分`）；
 *   - 例子的两种讲法（语文的 `ok`/`fix` 正误对照、数学的 `steps`/`answer` 分步解答）
 *     不在这里判断：章节正文在章节页（`ExamTopicSectionPage`）里渲染，
 *     那里由 `ExamTopicParts` 的 `ExampleList` **逐条按数据形状**分流。
 *
 * ## 页面区块（自上而下）
 *
 *   ① 攻破标准       —— 本专题每一道题都答对过才算攻破（全题过关），进度摆最上面
 *   ①′ 一句话拿分逻辑 —— 这个专题考什么、分丢在哪，决定复习时间怎么分配
 *   ② 近五年考情     —— 逐年形态（最新一年置顶并标出），末尾单列趋势结论
 *   ③ 命题角度       —— 这几年反复从哪几个角度考，复习时对号入座
 *   ④ 分步讲解       —— 考场上的动作序列，`demo` 以「示范」引用块呈现
 *   ⑤ 模板           —— 可以直接背下来套用的成套写法（语文答题模板 / 数学解题模板）
 *   ⑥ 评分点         —— 写成「写到什么才给分」（语文评分点 / 数学步骤分）
 *   ⑦ 易错与失分     —— 三行写法：错在哪 / 应该怎么做 / 为什么容易错
 *   ⑧ 章节清单       —— 每节一张紧凑卡片（正文在章节页里讲）
 *   ⑨ 专项训练分组    —— 每组一个「刷这一组」入口，组名即题目标签
 *   ⑩ 题库总览       —— 默认收起，只列前 20 题，作答一律走练习页
 *   ⑪ 底部行动条     —— 「从头练这个专题（全部 N 题）」
 *   ⑫ 浮动按钮       —— 滚动一段距离后淡入：回顶部 / 退回专题列表
 *
 * ## 两类「学科差异」是怎么处理的
 *
 * 1. **文案措辞**：集中在 `ExamTopicWording` 里，按 `subjectId` 选预设
 *    （`examTopicWordingOf`），调用方还能用 `wording` 覆盖任意几条。
 * 2. **例子渲染**：不在这一页——本页只放章节清单（卡片 + 两个入口），
 *    正文由章节页按**数据里有什么**自动切换（`steps` → 分步解答，`ok`/`fix` → 正误对照）。
 *
 * ## 样式
 *
 * 折叠等新结构用通用类 `.exam-*`（`index.css` 末尾追加的那一块）；
 * 考情 / 步骤 / 模板 / 题库那几块沿用语文先写好的 `.zht-*` 观感类**不改**：
 * 它们本来就是学科无关的排版（`zht-ex__*` 这类与学科无关的例子排版已经在
 * `ExamTopicParts` 里换成了 `.exam-*`），而这里再复制一套样式只会让两套观感慢慢走样。
 */

import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { ExamTopic, QuizQuestion } from '../../types';
import { cn } from '../../lib/utils';
import { passedCount, unpassedIds } from '../../lib/progress';
import { useStudy } from '../../store/StudyContext';
import { getModuleMeta } from '../../data/subjects';
import type { ExamTopicEntryLike } from '../../data/lazyEntries';
import { Tag } from '../../components/common';
import { DetailShell, Section } from './DetailShell';
import {
  Emph,
  Fold,
  FloatNav,
  SectionCard,
  firstSentence,
  practiceTagPath,
  sectionListPath,
  sectionPath,
  summarize,
} from './ExamTopicParts';

/**
 * 题库总览最多列这么多题：专题页只用来「看清题量与考法」，作答在练习页。
 * 学生要判断的是「这个专题有多少题、都是什么考法」，看 20 条足够，
 * 剩下的一半纯粹是把页面拉长（真要练就直接进练习页）。
 */
const PREVIEW_LIMIT = 20;
/** 题干摘要的截断长度（题干多是长材料，整段铺开会把页面拉爆） */
const STEM_LIMIT = 60;

const TYPE_LABEL: Record<QuizQuestion['type'], string> = {
  choice: '选择题',
  fill: '填空·默写',
  short: '简答题',
};

const DIFFICULTY_LABEL: Record<1 | 2 | 3, string> = { 1: '易', 2: '中', 3: '难' };

/** 章节卡片的 DOM id（从章节页带 `?sec=` 回来时按它滚过去） */
const cardAnchorId = (no: number) => `exam-sec-${no}`;

/* ------------------------------------------------------------------ */
/* 学科差异之一：文案措辞                                                */
/* ------------------------------------------------------------------ */

/**
 * 专题页上的全部措辞。
 *
 * 只把**真正会因学科而异**的说法抽出来（语文「答题模板／踩分点」、数学「解题模板／
 * 步骤分」），其余一律共用——措辞一旦散落在 JSX 里，数学接线时就得再抄一遍整页。
 */
export interface ExamTopicWording {
  /** 攻破标准：怎样才算学完（两个学科都是「全题过关」，说法一致） */
  standardLabel: string;
  standardText: string;
  /** 一句话拿分逻辑 */
  mainlineLabel: string;
  paperLabel: string;
  trendsTitle: (n: number) => string;
  trendsHint: string;
  trendsBlurb: string;
  trendSummaryLabel: string;
  anglesTitle: (n: number) => string;
  anglesHint: string;
  stepsTitle: (n: number) => string;
  stepsHint: string;
  stepsBlurb: string;
  demoLabel: string;
  templatesTitle: (n: number) => string;
  templatesHint: string;
  templatesBadge: string;
  templatesBlurb: string;
  scoringTitle: (n: number) => string;
  scoringHint: string;
  scoringBlurb: string;
  scoringCheckTitle: string;
  pitfallsTitle: (n: number) => string;
  pitfallsHint: string;
  pitfallsWrongLabel: string;
  pitfallsRightLabel: string;
  sectionsTitle: (n: number, examples: number) => string;
  sectionsBadge: string;
  sectionsBlurb: string;
  sectionsFoot: string;
  drillsTitle: (groups: number, total: number) => string;
  drillsHint: string;
  drillsBlurb: string;
  drillsPracticeLabel: string;
  drillsReadLabel: string;
  drillsEmptyLabel: string;
  ungroupedNote: (n: number) => string;
  bankTitle: (total: number) => string;
  bankHint: string;
  bankBlurb: string;
  bankEmpty: string;
  ctaTitle: (total: number) => string;
  ctaIdle: string;
  ctaPassed: (passed: number, total: number) => string;
  ctaLabel: string;
  ctaUnpassed: (n: number) => string;
  floatListLabel: string;
}

/**
 * 语文中考专题（**默认**）：这些字符串就是原 `ChineseExamTopicDetail` 里的原文，
 * 冒烟测试逐条断言它们（「攻破」「示范」「刷这一组」「节逐类讲透」…），不要顺手改字。
 */
export const ZH_EXAM_TOPIC_WORDING: ExamTopicWording = {
  standardLabel: '这个专题攻破的标准',
  standardText: '本专题每一道题都答对过，才算攻破。',
  mainlineLabel: '一句话拿分逻辑',
  paperLabel: '卷面定位：',
  trendsTitle: (n) => `近五年考情（${n} 条）`,
  trendsHint: '逐年形态与分值',
  trendsBlurb:
    '只看「这几年都在考什么形态、分值大概多少、选材偏向什么」——考情用来决定复习时间往哪块倾斜，具体某一年考了哪道题不必记。',
  trendSummaryLabel: '五年趋势结论',
  anglesTitle: (n) => `命题角度（${n} 类）`,
  anglesHint: '复习时对号入座',
  stepsTitle: (n) => `分步讲解（${n} 步）`,
  stepsHint: '按顺序做，别跳步',
  stepsBlurb:
    '这几步是考场上真按这个顺序执行的，读的时候把每一步的「动作」记下来，带「示范」的引用块是这一步的完整做法。',
  demoLabel: '示范',
  templatesTitle: (n) => `答题模板（${n} 套）`,
  templatesHint: '保证不漏项',
  templatesBadge: '可以直接背下来套用',
  templatesBlurb:
    '用法：先背成条的句式（顺序也一起背），考场上按句式填内容——模板的作用是保证不漏项，不是代替思考。',
  scoringTitle: (n) => `评分点与踩分点（${n} 条）`,
  scoringHint: '写到什么才给分',
  scoringBlurb:
    '做完一组题，拿这几条对自己的答案过一遍：说到哪几条、漏了哪几条，比「感觉答得还行」准得多。',
  scoringCheckTitle: '对照检查自己答到了几条',
  pitfallsTitle: (n) => `易错与失分（${n} 条）`,
  pitfallsHint: '都是「好像会了」的地方',
  pitfallsWrongLabel: '✘ 常见做法',
  pitfallsRightLabel: '✔ 应该这样做',
  sectionsTitle: (n, examples) => `逐类讲透（${n} 节 · ${examples} 个例子）`,
  sectionsBadge: '一页一节 · 点「看讲解」',
  sectionsBlurb:
    '一个专题不是一个能直接下手的单位，真正要练的是它下面的子类。每一节都有自己的讲解、判定要点、例子与易错——点「📖 看讲解」单独一页读完这一节，点「✍️ 刷这一节」立刻开练。读完一节直接点下一节，不必再回来找。',
  sectionsFoot:
    '这些节名同时是题目上的标签：「刷这一节」只出这一节的题，练完这一节的题就记进上面的过关进度。',
  drillsTitle: (groups, total) => `专项训练（${groups} 组 · ${total} 题）`,
  drillsHint: '点「刷这一组」只出这一组的题',
  drillsBlurb:
    '每一组对应一种卷面考法，组名就是题目上的标签。建议一组一组过：练完一组，这一组的题都会记进上面的过关进度。',
  drillsPracticeLabel: '✍️ 刷这一组',
  drillsReadLabel: '📖 先看讲解',
  drillsEmptyLabel: '本组题目正在补充',
  ungroupedNote: (n) => `另有 ${n} 题暂未归入上面的训练组，练「从头练这个专题」时会一并出现。`,
  bankTitle: (total) => `题库总览（共 ${total} 题）`,
  bankHint: '只列题干，作答在练习页',
  bankBlurb:
    '这里只列题干，用来判断这一专题的题量与考法；不在专题页作答，做题请走上面的训练组或章节入口。',
  bankEmpty: '本专题的题库正在补充，先看讲解，题目到位后入口会自动出现。',
  ctaTitle: (total) => `🎯 从头练这个专题（全部 ${total} 题）`,
  ctaIdle: '按顺序过一遍，答对的题记一次过关，答错的题进错题本，重做答对同样算过关。',
  ctaPassed: (passed, total) => `已过关 ${passed} / ${total}，还差 ${Math.max(total - passed, 0)} 题。`,
  ctaLabel: '✍️ 从头练这个专题',
  ctaUnpassed: (n) => `🎯 只练还没过关的 ${n} 题`,
  floatListLabel: '← 专题列表',
};

/**
 * 数学中考题型专题：只覆盖说法不同的那几条。
 *
 * 「答题模板 → 解题模板」「评分点与踩分点 → 步骤分（写到哪一步给几分）」是数学最
 * 看重的一件事（`TOPICS-SPEC.md` 第三节把 `scoring` 定成「数学最看这个」）；
 * 其余（考情、角度、易错、训练、题库）说法本来就通用，不重复写一遍。
 */
export const MATH_EXAM_TOPIC_WORDING: ExamTopicWording = {
  ...ZH_EXAM_TOPIC_WORDING,
  stepsTitle: (n) => `解题流程（${n} 步）`,
  stepsBlurb:
    '这几步是这一类题的通用流程：先做什么、再做什么、在哪一步容易卡住。带「示范」的引用块是这一步的完整写法。',
  templatesTitle: (n) => `解题模板（${n} 套）`,
  templatesHint: '照着写不漏步',
  templatesBadge: '可以直接背下来套用',
  templatesBlurb:
    '用法：先把每一步的写法（含必写的格式语句，如「设」「由题意得」「答」）背下来，考场上按模板把式子填进去——模板保证不漏步骤，而步骤分就是按步骤给的。',
  scoringTitle: (n) => `步骤分与评分点（${n} 条）`,
  scoringHint: '写到哪一步给几分',
  scoringBlurb:
    '解答题的分数是**按步骤给的**：把这几条当成阅卷老师的给分点，做完一道题逐条对一遍——哪一步写了、哪一步漏了，比「答案对不对」更能说明还能拿几分。',
  scoringCheckTitle: '对照检查自己的解答写到哪几步',
  pitfallsWrongLabel: '✘ 常见错误',
  pitfallsRightLabel: '✔ 应该这样做',
  sectionsTitle: (n, examples) => `逐类讲透（${n} 节 · ${examples} 个例题）`,
  sectionsBlurb:
    '数学这一块不是「一个专题做完就会了」，真正要练的是它下面的题型。每一节都有讲解、解题套路、例题（分步解答）与易错——点「📖 看讲解」单独一页读完这一节，点「✍️ 刷这一节」立刻开练。',
  drillsBlurb:
    '每一组对应一种题型与考法，组名就是题目上的标签。建议一组一组过：练完一组，这一组的题都会记进上面的过关进度。',
  bankBlurb:
    '这里只列题干，用来判断这一专题的题量与考法；不在专题页作答，做题请走上面的章节或训练组入口。',
  ctaLabel: '✍️ 从头练这个专题',
  floatListLabel: '← 专题列表',
};

/** 按学科取措辞预设（未知学科退回语文那一套，措辞差异只影响文字，不影响结构） */
export function examTopicWordingOf(subjectId: string): ExamTopicWording {
  return subjectId === 'math' || subjectId === 'math-topics'
    ? MATH_EXAM_TOPIC_WORDING
    : ZH_EXAM_TOPIC_WORDING;
}

/* ------------------------------------------------------------------ */
/* 页面                                                                */
/* ------------------------------------------------------------------ */

export default function ExamTopicDetail({
  entry,
  moduleName,
  subjectId,
  storageKeyPrefix = 'exam',
  wording,
}: {
  entry: ExamTopicEntryLike;
  moduleName: string;
  /** 科目 id（面包屑、章节页链接、返回链接都要用）；不传则从模块注册表推导 */
  subjectId?: string;
  /**
   * 折叠状态在 localStorage 里的前缀。语文传 `zht`、数学传 `mth`：
   * 两个模块的条目 id 不会重名，分开只是为了让「谁的状态」一眼可辨。
   */
  storageKeyPrefix?: string;
  /** 覆盖任意几条措辞（默认按 `subjectId` 取预设） */
  wording?: Partial<ExamTopicWording>;
}) {
  const raw: ExamTopic = entry.data;
  /**
   * 科目 id 不写死：面包屑、章节页链接、返回链接都从模块注册表推导，
   * 所以同一份代码在语文与数学下都指向正确的一级菜单。
   */
  const meta = getModuleMeta(entry.moduleId);
  const sid = subjectId ?? meta?.subject.id ?? 'chinese';
  const text = useMemo<ExamTopicWording>(
    () => ({ ...examTopicWordingOf(sid), ...wording }),
    [sid, wording],
  );

  const { state } = useStudy();
  const questions = entry.questions;
  const total = questions.length;
  const practiceBase = `/practice/${entry.moduleId}/${entry.id}`;
  const foldKey = (part: string) => `${storageKeyPrefix}-fold:${entry.id}:${part}`;

  /** 已过关题数：「全题过关」策略下的进度（`lib/progress.ts`），答题页写入 */
  const passed = useMemo(
    () => passedCount(questions.map((q) => q.id), state.passed),
    [questions, state.passed],
  );
  const unpassed = useMemo(
    () => unpassedIds(questions.map((q) => q.id), state.passed),
    [questions, state.passed],
  );

  /** 考情按年份倒序：最近一年在最上面，学生第一眼看到的是「现在怎么考」 */
  const trends = useMemo(
    () => [...raw.trends].sort((a, b) => b.year.localeCompare(a.year)),
    [raw.trends],
  );
  const latestYear = useMemo(
    () => raw.trends.reduce((max, tr) => (tr.year > max ? tr.year : max), ''),
    [raw.trends],
  );

  /** 每个训练组的题量；组名就是题目标签，与练习页 `?tag=` 的筛选口径完全一致 */
  const drills = useMemo(
    () =>
      raw.drills.map((d) => ({
        ...d,
        count: questions.filter((q) => (q.tags ?? []).includes(d.name)).length,
      })),
    [raw.drills, questions],
  );

  /** 没有任何训练组标签的题：它们仍会出现在「从头练这个专题」里，这里如实说明 */
  const ungrouped = useMemo(
    () => questions.filter((q) => !raw.drills.some((d) => (q.tags ?? []).includes(d.name))).length,
    [raw.drills, questions],
  );

  /**
   * 章节清单：每节带上**本节题量**与**一句话要点**，与训练分组同一口径
   * （节名 = 组名 = 题目标签）。`sections` 是后补字段，没写的专题拿到 undefined，
   * 区块自动消失（优雅降级）。
   */
  const sections = useMemo(
    () =>
      (raw.sections ?? []).map((s, i) => ({
        ...s,
        /** 序号即章节页地址里的 `sectionNo`，从 1 开始 */
        no: i + 1,
        count: questions.filter((q) => (q.tags ?? []).includes(s.name)).length,
        hint: firstSentence(s.intro),
        examples: s.examples?.length ?? 0,
      })),
    [raw.sections, questions],
  );

  /** 汇总用的例子总数（清单标题旁给「共 N 节 · M 个例子」） */
  const exampleCount = useMemo(() => sections.reduce((n, s) => n + s.examples, 0), [sections]);

  /** 题库总览：只取前若干条，切片也在 memo 里，避免每次渲染重算 */
  const preview = useMemo(() => questions.slice(0, PREVIEW_LIMIT), [questions]);

  /* ------------------ 从章节页回来：标出并滚到那一节 ------------------ */

  const [search] = useSearchParams();
  const focusNo = Number(search.get('sec') ?? '');
  const focused = Number.isInteger(focusNo) && focusNo >= 1 && focusNo <= sections.length ? focusNo : 0;

  useEffect(() => {
    if (!focused) return;
    // 等一帧：清单是新挂载的，DOM 提交完才有高度可算，否则滚不到准地方
    if (typeof requestAnimationFrame !== 'function') return;
    const id = cardAnchorId(focused);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'center' });
    });
  }, [focused]);

  return (
    <DetailShell
      entry={entry}
      subjectId={sid}
      moduleName={moduleName}
      backTo={`/s/${sid}/${entry.moduleId}`}
      subtitle={<Emph text={raw.paper} />}
      actions={
        total > 0 ? (
          <Link className="btn btn--sm btn--primary" to={practiceBase}>
            ✍️ 刷题（全部 {total} 题）
          </Link>
        ) : null
      }
    >
      {/* ① 攻破标准：把「怎样才算学完」说在最前面，并把全题过关进度摆出来 */}
      <section className="card card--pad zht-standard">
        <div className="zht-standard__label">{text.standardLabel}</div>
        <div className="zht-standard__text">{text.standardText}</div>
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          <Tag tone="red">共 {total} 题</Tag>
          <Tag tone="jade">
            已过关 {passed} / {total}
          </Tag>
          {sections.length ? <Tag tone="purple">{sections.length} 节逐类讲透</Tag> : null}
          {drills.length ? <Tag tone="gold">{drills.length} 组专项训练</Tag> : null}
        </div>
        <div className="small muted" style={{ marginTop: 8, lineHeight: 1.85 }}>
          过关按「每道题曾经答对过一次」记：答错的题会进错题本，重做后答对同样算过关，
          不必从头再来一遍。因此这一块的进度只增不减，凑够 {total} / {total} 就是把这个专题拿下。
        </div>
      </section>

      {/* ①′ 一句话拿分逻辑：试卷上这一块考什么、分丢在哪 */}
      <section className="card card--pad history-mainline">
        <div className="history-mainline__label">{text.mainlineLabel}</div>
        <div className="history-mainline__text">
          <Emph text={raw.summary} />
        </div>
        <div className="small muted" style={{ marginTop: 8 }}>
          {text.paperLabel}
          <Emph text={raw.paper} />
        </div>
      </section>

      {/* ② 近五年考情：逐年一条，最近一年置顶；结论单独强调 */}
      {trends.length ? (
        <Fold
          icon="📈"
          title={text.trendsTitle(trends.length)}
          count={latestYear ? <Tag tone="purple">最近一年 · {latestYear}</Tag> : null}
          hint={text.trendsHint}
          storeKey={foldKey('trends')}
          bodyClassName="exam-cv"
        >
          <div className="small muted" style={{ marginBottom: 8, lineHeight: 1.85 }}>
            {text.trendsBlurb}
          </div>
          <div className="stack stack--sm">
            {trends.map((tr) => (
              <div className={cn('zht-trend', tr.year === latestYear && 'is-latest')} key={tr.year}>
                <div className="zht-trend__year">
                  <span>{tr.year}</span>
                  {tr.year === latestYear ? <Tag tone="red">最近一年</Tag> : null}
                </div>
                <div className="zht-trend__note">
                  <Emph text={tr.note} />
                </div>
              </div>
            ))}
          </div>

          {/* 趋势结论：单列强调，它是「接下来怎么复习」的依据 */}
          <div className="sample-highlight" style={{ marginTop: 12 }}>
            <div className="small muted" style={{ marginBottom: 4 }}>
              {text.trendSummaryLabel}
            </div>
            <div className="sample-highlight__sentence">
              <Emph text={raw.trendSummary} />
            </div>
          </div>
        </Fold>
      ) : null}

      {/* ③ 命题角度：这几年反复从哪几个角度考，复习时对号入座 */}
      {raw.angles.length ? (
        <Fold
          icon="🎯"
          title={text.anglesTitle(raw.angles.length)}
          hint={text.anglesHint}
          storeKey={foldKey('angles')}
          bodyClassName="exam-cv"
        >
          <div className="stack stack--sm">
            {raw.angles.map((a, i) => (
              <div className="history-angle" key={`${a.angle}-${i}`}>
                <div className="history-angle__head">
                  <Tag tone="purple">
                    <Emph text={a.angle} />
                  </Tag>
                  {a.years ? <span className="small muted">{a.years}</span> : null}
                </div>
                <div className="history-angle__detail">
                  <Emph text={a.detail} />
                </div>
              </div>
            ))}
          </div>
        </Fold>
      ) : null}

      {/* ④ 分步讲解：考场上的动作序列，每一步「做什么」，demo 是「做一遍给你看」 */}
      {raw.steps.length ? (
        <Fold
          icon="🧭"
          title={text.stepsTitle(raw.steps.length)}
          hint={text.stepsHint}
          storeKey={foldKey('steps')}
          bodyClassName="exam-cv"
        >
          <div className="small muted" style={{ marginBottom: 10, lineHeight: 1.85 }}>
            {text.stepsBlurb}
          </div>
          <div className="stack stack--sm">
            {raw.steps.map((s, i) => (
              <div className="zht-step" key={`${s.heading}-${i}`}>
                <div className="zht-step__head">
                  <span className="zht-step__no">{i + 1}</span>
                  <span className="zht-step__heading">
                    <Emph text={s.heading} />
                  </span>
                </div>
                <div className="zht-step__body">
                  <Emph text={s.body} />
                </div>
                {s.demo ? (
                  <div className="zht-demo">
                    <div className="zht-demo__label">{text.demoLabel}</div>
                    <div className="zht-demo__text">
                      <Emph text={s.demo} />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Fold>
      ) : null}

      {/* ⑤ 模板：可以直接背下来套用的成套写法（语文答题模板 / 数学解题模板） */}
      {raw.templates?.length ? (
        <Fold
          icon="📋"
          title={text.templatesTitle(raw.templates.length)}
          count={<Tag tone="jade">{text.templatesBadge}</Tag>}
          hint={text.templatesHint}
          storeKey={foldKey('templates')}
          bodyClassName="exam-cv"
        >
          <div className="stack stack--lg">
            {raw.templates.map((tpl, i) => (
              <div className="zht-template" key={`${tpl.name}-${i}`}>
                <div className="zht-template__name">
                  <Emph text={tpl.name} />
                </div>
                <ol className="zht-template__items">
                  {tpl.items.map((it, k) => (
                    <li key={k}>
                      <Emph text={it} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <div className="small muted" style={{ marginTop: 10, lineHeight: 1.85 }}>
            {text.templatesBlurb}
          </div>
        </Fold>
      ) : null}

      {/* ⑥ 评分点／踩分点（数学：步骤分）：写成「写到什么才给分」，做完题逐条对照 */}
      {raw.scoring?.length ? (
        <Fold
          icon="✅"
          title={text.scoringTitle(raw.scoring.length)}
          hint={text.scoringHint}
          storeKey={foldKey('scoring')}
          bodyClassName="exam-cv"
        >
          <div className="small muted" style={{ marginBottom: 8, lineHeight: 1.85 }}>
            {text.scoringBlurb}
          </div>
          <div className="rubric">
            <div className="rubric__title">{text.scoringCheckTitle}</div>
            {raw.scoring.map((s, i) => (
              <div className="rubric__item" key={i}>
                <span className="rubric__mark">◆</span>
                <span>
                  <Emph text={s} />
                </span>
              </div>
            ))}
          </div>
        </Fold>
      ) : null}

      {/* ⑦ 易错与失分：错在哪 → 应该怎么做 → 为什么容易错（三行） */}
      {raw.pitfalls?.length ? (
        <Fold
          icon="⚠️"
          title={text.pitfallsTitle(raw.pitfalls.length)}
          hint={text.pitfallsHint}
          storeKey={foldKey('pitfalls')}
          bodyClassName="exam-cv"
        >
          <div className="stack stack--sm">
            {raw.pitfalls.map((p, i) => (
              <div className="history-confuse" key={i}>
                <div className="history-confuse__row">
                  <Tag tone="red">{text.pitfallsWrongLabel}</Tag>
                  {/* 三行都过一遍富文本：数学的易错句里几乎一定带行内公式 */}
                  <Emph text={p.wrong} />
                </div>
                <div className="history-confuse__row">
                  <Tag tone="jade">{text.pitfallsRightLabel}</Tag>
                  <Emph text={p.right} />
                </div>
                <div className="small muted">
                  为什么容易错：<Emph text={p.why} />
                </div>
              </div>
            ))}
          </div>
        </Fold>
      ) : null}

      {/*
        ⑧ 章节清单：**这一页最要紧的一块**。
        每一节只占三四行——序号 + 节名 + 一句话要点 + 「几个例子 / 本节几题」+ 两个入口。
        正文在章节页里讲，这里只负责让整套内容一眼看完、一步进得去。
      */}
      {sections.length ? (
        <Section
          title={text.sectionsTitle(sections.length, exampleCount)}
          icon="🧩"
          extra={<Tag tone="purple">{text.sectionsBadge}</Tag>}
        >
          <div className="small muted" style={{ marginBottom: 12, lineHeight: 1.85 }}>
            {text.sectionsBlurb}
          </div>

          <div className="stack stack--sm">
            {sections.map((s) => (
              <SectionCard
                key={s.name}
                id={cardAnchorId(s.no)}
                no={s.no}
                name={s.name}
                hint={s.hint}
                exampleCount={s.examples}
                questionCount={s.count}
                current={s.no === focused}
                readTo={sectionPath(sid, entry.moduleId, entry.id, s.no)}
                practiceTo={practiceTagPath(entry.moduleId, entry.id, s.name)}
              />
            ))}
          </div>

          <div className="small muted" style={{ marginTop: 12, lineHeight: 1.85 }}>
            {text.sectionsFoot}
          </div>
        </Section>
      ) : null}

      {/* ⑨ 专项训练分组：组名即题目标签，一组一个入口，只出这一组的题 */}
      {drills.length ? (
        <Fold
          icon="🏋️"
          title={text.drillsTitle(drills.length, total)}
          hint={text.drillsHint}
          storeKey={foldKey('drills')}
          bodyClassName="exam-cv"
        >
          <div className="small muted" style={{ marginBottom: 12, lineHeight: 1.85 }}>
            {text.drillsBlurb}
          </div>
          <div className="grid grid--auto">
            {drills.map((d, i) => (
              <div
                className="card card--pad card--flat stack stack--sm"
                key={d.name}
                style={{ background: 'var(--c-surface-2)' }}
              >
                <div className="row row--between">
                  <span className="bold">
                    {i + 1}. {d.name}
                  </span>
                  <Tag tone={d.count ? 'jade' : 'default'}>{d.count} 题</Tag>
                </div>
                <div className="small muted" style={{ lineHeight: 1.8 }}>
                  <Emph text={d.note} />
                </div>
                <div className="row row--wrap">
                  <Link
                    className="btn btn--sm"
                    to={practiceTagPath(entry.moduleId, entry.id, d.name)}
                  >
                    {text.drillsPracticeLabel}
                  </Link>
                  {/* 与「逐类讲透」同名的组：直接给一个进讲解页的入口，两组内容不要各找一遍 */}
                  {sections.some((s) => s.name === d.name) ? (
                    <Link
                      className="btn btn--sm"
                      to={sectionPath(
                        sid,
                        entry.moduleId,
                        entry.id,
                        sections.findIndex((s) => s.name === d.name) + 1,
                      )}
                    >
                      {text.drillsReadLabel}
                    </Link>
                  ) : null}
                  {d.count === 0 ? (
                    <span className="small muted">{text.drillsEmptyLabel}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          {ungrouped > 0 ? (
            <div className="small muted" style={{ marginTop: 10 }}>
              {text.ungroupedNote(ungrouped)}
            </div>
          ) : null}
        </Fold>
      ) : null}

      {/*
        ⑩ 题库总览：只给题干摘要与题型，用来判断题量，作答一律走练习页。
        **默认收起**：这一块最多就是一份长清单，学生进专题页要的是总览与清单；
        展开后也只列前 `PREVIEW_LIMIT` 条，其余的去练习页按组出题。
      */}
      <Fold
        icon="📚"
        title={text.bankTitle(total)}
        hint={text.bankHint}
        defaultOpen={false}
        storeKey={foldKey('bank')}
        bodyClassName="exam-cv"
      >
        {preview.length ? (
          <>
            <div className="small muted" style={{ marginBottom: 10, lineHeight: 1.85 }}>
              {text.bankBlurb}
            </div>
            <div>
              {preview.map((q, i) => (
                <div className="zht-q" key={q.id}>
                  <span className="zht-q__no">{i + 1}</span>
                  <span className="zht-q__stem">
                    <Emph text={summarize(q.stem, STEM_LIMIT)} />
                  </span>
                  <span className="zht-q__type">
                    <Tag tone="blue">{TYPE_LABEL[q.type]}</Tag>
                    {q.difficulty ? (
                      <span className="small muted">{DIFFICULTY_LABEL[q.difficulty]}</span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
            {total > preview.length ? (
              <div className="small muted" style={{ marginTop: 10 }}>
                以上是第 1—{preview.length} 题，其余 {total - preview.length} 题在练习页里按组出题。
              </div>
            ) : null}
          </>
        ) : (
          <div className="small muted">{text.bankEmpty}</div>
        )}
      </Fold>

      {/* ⑪ 底部行动条：从头练全部题；已经练过的，只练还没过关的那几题 */}
      <section className="card card--pad zht-cta">
        <div className="row row--between row--wrap" style={{ alignItems: 'center', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="zht-cta__title">{text.ctaTitle(total)}</div>
            <div className="small muted" style={{ marginTop: 4, lineHeight: 1.85 }}>
              {passed > 0 ? text.ctaPassed(passed, total) : text.ctaIdle}
            </div>
          </div>
          {total > 0 ? (
            <div className="row row--wrap">
              {unpassed.length > 0 && unpassed.length < total ? (
                <Link
                  className="btn btn--sm"
                  to={`${practiceBase}?ids=${unpassed.slice(0, 60).join(',')}`}
                >
                  {text.ctaUnpassed(unpassed.length)}
                </Link>
              ) : null}
              <Link className="btn btn--primary" to={practiceBase}>
                {text.ctaLabel}（全部 {total} 题）
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      {/*
        ⑫ 浮动按钮：页面长起来之后才淡入；回顶部 + 退回专题列表。
        从章节页回来时会落在清单中段，这两个按钮是「跳回来之后立刻能走」的出口。
      */}
      <FloatNav
        listTo={sectionListPath(sid, entry.moduleId, entry.id)}
        listLabel={text.floatListLabel}
      />
    </DetailShell>
  );
}

export { ExamTopicDetail };
