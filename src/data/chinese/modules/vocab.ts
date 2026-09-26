/** 字词基础模块的原始数据（按需加载，见 `data/chinese/index.ts`） */

import type { VocabItem } from '../../../types';

import { vocabItems as vocabBase } from '../vocab';
import { vocabRhetoric } from '../vocab-rhetoric';

/** 字词基础 = 原题库 + 修辞手法（新教材 8 种修辞全部进入补白） */
export const vocab: VocabItem[] = [...vocabBase, ...vocabRhetoric];
