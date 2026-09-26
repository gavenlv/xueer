/** 作文训练模块的原始数据（按需加载，见 `data/chinese/index.ts`） */

import type { WritingLesson } from '../../../types';

import { writingLessons as writingBase } from '../writing';
import { writingExtra } from '../writing-extra';
import { writingTopics } from '../writing-topics';
import { writingUpgrade } from '../writing-upgrade';
import { writingSamples } from '../writing-samples';
// 按主题补充的「同题多篇完整例文 + 深度点评」。作文 60 分 / 全卷 140 分（约 43%），
// 是单项分值最高的题，因此范文按中考高频主题分组，每组给多篇全文而非片段。
import { writingSamplesFamily } from '../writing-samples-family';
import { writingSamplesSchool } from '../writing-samples-school';
import { writingSamplesResilience } from '../writing-samples-resilience';
import { writingSamplesNation } from '../writing-samples-nation';
import { writingSamplesHeritage } from '../writing-samples-heritage';
import { writingSamplesNature } from '../writing-samples-nature';
import { writingSamplesPhilosophy } from '../writing-samples-philosophy';

/** 作文训练 = 原题库 + 新教材写作专题 + 中考导向的题库／升格训练／范文库 */
export const writing: WritingLesson[] = [
  ...writingBase,
  ...writingExtra,
  // 中考导向的三个大块：题库、升格训练、范文库
  ...writingTopics,
  ...writingUpgrade,
  ...writingSamples,
  // 主题范文（每个中考高频主题多篇完整例文）
  ...writingSamplesFamily,
  ...writingSamplesSchool,
  ...writingSamplesResilience,
  ...writingSamplesNation,
  ...writingSamplesHeritage,
  ...writingSamplesNature,
  ...writingSamplesPhilosophy,
];
