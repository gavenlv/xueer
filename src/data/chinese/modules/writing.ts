/** 作文训练模块的原始数据（按需加载，见 `data/chinese/index.ts`） */

import type { WritingLesson } from '../../../types';

import { writingLessons as writingBase } from '../writing';
import { writingExtra } from '../writing-extra';
import { writingTopics } from '../writing-topics';
import { writingUpgrade } from '../writing-upgrade';
import { writingSamples } from '../writing-samples';

/** 作文训练 = 原题库 + 新教材写作专题 + 中考导向的题库／升格训练／范文库 */
export const writing: WritingLesson[] = [
  ...writingBase,
  ...writingExtra,
  // 中考导向的三个大块：题库、升格训练、范文库
  ...writingTopics,
  ...writingUpgrade,
  ...writingSamples,
];
