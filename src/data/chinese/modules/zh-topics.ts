/**
 * 「中考专题」模块的原始数据（按需加载）。
 *
 * 这是语文唯一**为备考而设**的模块：前六块按教材内容组织（古诗词、字词、文言文、
 * 现代文、作文、名著），这一块按**广州中考语文卷面题型**组织——卷面板块本身就是
 * 命题单位，学生拿到卷子也按这几块分配时间，因此「逐个攻破」的单位定在题型上，
 * 每攻破一个专题就有可验证的终点（专题内每一道题都曾答对）。
 *
 * 七块与卷面的对应关系：
 *
 * | 文件 | 专题 | 卷面位置 |
 * | --- | --- | --- |
 * | `t1-jilei` | 积累与运用 | 第一大题 · 基础积累与语言运用（约 20—24 分） |
 * | `t2-moxie` | 古诗文默写 | 第二大题之一 · 古诗文积累与默写（约 8—10 分） |
 * | `t3-wenyan` | 文言文阅读 | 第二大题之二 · 课内课外文言文阅读（约 12—16 分） |
 * | `t4-gushi` | 古诗词鉴赏 | 第二大题之三 · 古诗词鉴赏（约 4—6 分） |
 * | `t5-xiandai` | 现代文阅读 | 第三大题 · 文学类 + 实用类文本（约 30—40 分） |
 * | `t6-mingzhu` | 名著阅读与整本书阅读 | 第四大题 + 附加题（约 4—8 分） |
 * | `t7-xiezuo` | 写作 | 第五大题 · 写作（60 分） |
 *
 * 数组顺序即专题页的展示顺序（也等于卷面顺序），因此**不要重排**。
 * 按知识点聚合的那套仍然由「考点」页（`/s/chinese/exam`）负责，两者互补：
 * 考点页回答「这个知识点考过几次」，专题页回答「这一大块怎么一步步拿下」。
 *
 * 与其它模块一致，本文件被 `data/chinese/index.ts` **动态 import**：只有真的
 * 打开中考专题相关页面时才下载这一块。
 */

import type { ChineseExamTopic } from '../../../types';

import { t1Jilei } from '../zh-topics/t1-jilei';
import { t2Moxie } from '../zh-topics/t2-moxie';
import { t3Wenyan } from '../zh-topics/t3-wenyan';
import { t4Gushi } from '../zh-topics/t4-gushi';
import { t5Xiandai } from '../zh-topics/t5-xiandai';
import { t6Mingzhu } from '../zh-topics/t6-mingzhu';
import { t7Xiezuo } from '../zh-topics/t7-xiezuo';

/** 七个中考专题，顺序 = 卷面顺序 */
export const zhExamTopics: ChineseExamTopic[] = [
  t1Jilei,
  t2Moxie,
  t3Wenyan,
  t4Gushi,
  t5Xiandai,
  t6Mingzhu,
  t7Xiezuo,
];