/**
 * 语文「中考专题」的校验入口（薄封装）。
 *
 * 规则本体已经**通用化**到 `scripts/validate-exam-topics.ts`：语文的这套要求
 * （每专题 ≥45 题、每节 ≥3 例 / ≥3 要点 / ≥4 题、章节 ≥6 节、五年考情恰好 5 条、
 * 「章节名 = 分组名 = 题目标签」、简答题必须有踩分点、走「全题过关」策略…）
 * 与数学的「中考题型专题」是同一套，区别只在字段下限与例子的讲法。
 *
 * 这个文件保留下来，是为了：
 *   ① **对外 API 不变**——`scripts/validate-entry.ts` 与既有的调用点照旧可用；
 *   ② 语文的下限常量继续从这里导出（`ZH_TOPIC_MIN_QUESTIONS` 等），
 *      别处引用它们时不会因为这次通用化而编译不过；
 *   ③ 需要**只校验语文**时（调试用）有一个现成的入口。
 *
 * 想校验全部题型专题模块（语文 + 数学 + 以后的任何一块）请用
 * `validateAllExamTopics()`——它遍历 `data/lazyEntries.ts` 的注册表。
 */

import type { ChineseExamTopic, Entry } from '../src/types';
import { isZhTopicReady } from '../src/data/chinese';
import {
  ZH_TOPIC_RULES,
  validateExamTopicModule,
  type ExamTopicReport,
} from './validate-exam-topics';

/** 用户对这一块的硬要求：每个专题的训练量下限 */
export const ZH_TOPIC_MIN_QUESTIONS = ZH_TOPIC_RULES.minQuestions;
/** 分步讲解步数下限，以及其中必须带示范的步数 */
export const ZH_TOPIC_MIN_STEPS = ZH_TOPIC_RULES.minSteps;
export const ZH_TOPIC_MIN_DEMOS = ZH_TOPIC_RULES.minDemos;
/** 每个专题的章节（类目/子类）数量下限，以及每节的例子数与题目数下限 */
export const ZH_TOPIC_MIN_SECTIONS = ZH_TOPIC_RULES.minSections;
export const ZH_SECTION_MIN_EXAMPLES = ZH_TOPIC_RULES.minExamples;
export const ZH_SECTION_MIN_RULES = ZH_TOPIC_RULES.minRules;
export const ZH_SECTION_MIN_QUESTIONS = ZH_TOPIC_RULES.minSectionQuestions;
/** 近五年考情：恰好 5 条，年份 2021—2025 */
export const ZH_TOPIC_TREND_YEARS = ZH_TOPIC_RULES.trendYears;

/** 校验报告的字段（与通用报告同形；旧名字继续可用） */
export type ChineseTopicReport = ExamTopicReport;

/**
 * 只校验语文中考专题。
 *
 * `allEntries` 传全量条目（`ensureAll()` 之后），这里自己筛出 `zh-topics` 的那些；
 * 专题正文没加载时通用校验会给出一句「正文没有被加载」，而不是刷几百条假错。
 */
export function validateChineseTopics(opts: {
  err: (msg: string) => void;
  allEntries: Entry[];
  /** 内容规范类问题（不阻断交付）；不传则只报错 */
  warn?: (msg: string) => void;
  /** 不打印报告（由调用方统一打印）时为 false */
  silent?: boolean;
}): ChineseTopicReport {
  return validateExamTopicModule({
    rules: ZH_TOPIC_RULES,
    err: opts.err,
    warn: opts.warn,
    entries: opts.allEntries.filter((e) => e.moduleId === ZH_TOPIC_RULES.moduleId),
    isReady: (id) => isZhTopicReady(id),
    silent: opts.silent,
  });
}

/** 一份专题数据的类型别名（历史调用点用得到，保留导出） */
export type { ChineseExamTopic };
