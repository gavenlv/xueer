/**
 * 文学常识与名著模块的原始数据（按需加载，见 `data/chinese/index.ts`）。
 *
 * 这一块是六个模块里最大的一块（名著章节脉络、作家作品常识、广州风格简答题…），
 * 所以拆出去对首屏影响最明显。
 */

import type { BookPlot, LiteratureItem } from '../../../types';

import { literatureItems as literatureBase } from '../literature';
import { literatureExtra } from '../literature-extra';
// 课内古诗文作者的「作家作品」常识：直接服务「学一补多」的按作者关联
import { literatureAuthorsTang } from '../literature-authors-tang';
import { literatureAuthorsSong } from '../literature-authors-song';
import { literatureAuthorsClassical1 } from '../literature-authors-classical1';
import { literatureAuthorsClassical2 } from '../literature-authors-classical2';
// 诗歌源头的体裁常识：《诗经》、楚辞、乐府与汉魏古诗
import { literatureExtraGenres } from '../literature-extra-genres';
// 课外古诗词诵读相关作者
import { literatureAuthorsMore } from '../literature-authors-more';
// 课内主要作者（分批补齐，见各文件头注释）
import { literatureAuthorsMore2 } from '../literature-authors-more2';
import { literatureAuthorsMore3 } from '../literature-authors-more3';
import { literatureAuthorsMore4 } from '../literature-authors-more4';
import { literatureAuthorsMore5 } from '../literature-authors-more5';
import { bookShortQuestions } from '../guangzhou-questions';
import { bookPlots1 } from '../books-plot-1';
import { bookPlots2 } from '../books-plot-2';
import { bookPlots3 } from '../books-plot-3';

/** 文学常识与名著 = 原题库 + 新教材新增名著 + 课内作者的作家作品常识 + 诗歌源头体裁常识 */
export const literature: LiteratureItem[] = [
  ...literatureBase,
  ...literatureExtra,
  ...literatureAuthorsTang,
  ...literatureAuthorsSong,
  ...literatureAuthorsClassical1,
  ...literatureAuthorsClassical2,
  ...literatureExtraGenres,
  ...literatureAuthorsMore,
  ...literatureAuthorsMore2,
  ...literatureAuthorsMore3,
  ...literatureAuthorsMore4,
  ...literatureAuthorsMore5,
];

/** 广州中考「整本书阅读」附加题风格的简答题，按条目 id 归组 */
export const guangzhouQuestions: Record<string, import('../../../types').QuizQuestion[]> =
  bookShortQuestions;

/** 名著的章节脉络/情节链/口诀/考点题，按条目 id 归组 */
export const bookPlots: BookPlot[] = [...bookPlots1, ...bookPlots2, ...bookPlots3];
