/** 现代文阅读模块的原始数据（按需加载，见 `data/chinese/index.ts`） */

import type { ReadingPassage } from '../../../types';

import { readingPassages as readingBase } from '../reading';
import { readingGrade7 } from '../reading-7';
import { readingGrade8 } from '../reading-8';
import { readingGrade9 } from '../reading-9';
import { readingMore78 } from '../reading-more-78';
import { readingMore9 } from '../reading-more-9';

/** 现代文阅读 = 原题库 + 七/八/九年级补充选文 */
export const reading: ReadingPassage[] = [
  ...readingBase,
  ...readingGrade7,
  ...readingGrade8,
  ...readingGrade9,
  ...readingMore78,
  ...readingMore9,
];
