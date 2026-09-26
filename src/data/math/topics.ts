/**
 * 数学各模块的知识点数据（按需加载）。
 *
 * 数学在界面上是隐藏的（只有直接访问 `/s/math` 才用得到），而它本身的文本量不小，
 * 因此这一块单独成一个 chunk：语文学生永远不会下载它。
 */

import type { MathModuleId, MathTopic } from '../../types';

import { mathNumber } from './number';
import { mathGeometry } from './geometry';
import { mathStats } from './stats';
import { mathFormula } from './formula';
import { mathModel } from './model';
import { mathExam } from './exam';

/** 各模块的知识点 */
export const TOPICS_BY_MODULE: Partial<Record<MathModuleId, MathTopic[]>> = {
  'math-number': mathNumber,
  'math-geometry': mathGeometry,
  'math-stats': mathStats,
  'math-formula': mathFormula,
  'math-model': mathModel,
  'math-exam': mathExam,
};
