/** 文言文阅读模块的原始数据（按需加载，见 `data/chinese/index.ts`） */

import type { ClassicalText } from '../../../types';

import { classicalTexts as classicalBase } from '../classical';
import { classicalExtra } from '../classical-extra';

/** 文言文 = 原题库 + 新教材（2024 修订版）补充篇目 */
export const classical: ClassicalText[] = [...classicalBase, ...classicalExtra];
