/**
 * 古诗词模块的原始数据（按需加载）。
 *
 * 这个文件被 `data/chinese/index.ts` **动态 import**：只有真的打开古诗词相关页面
 * （模块列表、某首诗详情、背诵页、默写练习）时，浏览器才下载这一块。
 * 因此本模块的原始数据与其它模块的互不牵连——详见 `data/chinese/index.ts` 的说明。
 */

import type { Poem } from '../../../types';

import { poems7a } from '../poems/j7a';
import { poems7b } from '../poems/j7b';
import { poems8a } from '../poems/j8a';
import { poems8b } from '../poems/j8b';
import { poems8bExtra } from '../poems/j8b-extra';
import { poems9a } from '../poems/j9a';
import { poems9b } from '../poems/j9b';
import { poemsExtra } from '../poems/j-extra';
import { poemsMore1 } from '../poems/j-more-1';
import { poemsMore2 } from '../poems/j-more-2';

export const poems: Poem[] = [
  ...poems7a,
  ...poems7b,
  ...poems8a,
  ...poems8b,
  // 八下「课外古诗词诵读」第一组补齐（《式微》《子衿》《望洞庭湖赠张丞相》）
  ...poems8bExtra,
  ...poems9a,
  ...poems9b,
  // 各册「课外古诗词诵读」的补齐篇目（跨册次，故统一放在册次分组之后）
  ...poemsMore1,
  ...poemsMore2,
  // 2022 课标必背但原题库遗漏的 7 首
  ...poemsExtra,
];
