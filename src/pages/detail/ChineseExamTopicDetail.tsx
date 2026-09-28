/**
 * 语文「中考专题」（`zh-topics`）**专题页**：通用版 `ExamTopicDetail` 的薄封装。
 *
 * 为什么变成薄封装：数学的「中考题型专题」（`math-topics`）与本模块用的是**同一套
 * 数据形状**（`types.ts` 的 `ExamTopic`），页面结构、折叠、章节清单与两个入口的口径
 * 没有任何一处是语文独有的。把结构与措辞分开之后：
 *
 *   - 结构（总览 + 章节清单 + 折叠 + 浮动按钮）全在 `ExamTopicDetail` 里，语文数学共用；
 *   - 这一页只声明三件语文专属的事：条目类型（对外 props **一字未变**）、
 *     语文的措辞（答题模板 / 评分点与踩分点）、折叠状态用的 `zht` 前缀。
 *
 * 章节正文（讲解 / 判定要点 / 正误对照例子 / 本节易错）**不在这一页**，
 * 各自成页：`/s/:subjectId/:moduleId/:itemId/sec/:sectionNo`
 * （见 `ExamTopicSectionPage` 与 `ExamTopicParts`）。
 *
 * 页面区块、两级拆分的原因、以及「章节名 = 训练分组名 = 题目标签」的口径，
 * 全部写在 `ExamTopicDetail.tsx` 的文件头注释里。
 */

import type { ChineseExamTopicEntry } from '../../types';
import { ExamTopicDetail } from './ExamTopicDetail';

export default function ChineseExamTopicDetail({
  entry,
  moduleName,
}: {
  entry: ChineseExamTopicEntry;
  moduleName: string;
}) {
  return (
    <ExamTopicDetail
      entry={entry}
      moduleName={moduleName}
      subjectId="chinese"
      /* 折叠状态键：语文沿用 `zht-`（学生上次收起的那几块不该因为这次通用化而全部弹开） */
      storageKeyPrefix="zht"
    />
  );
}

/**
 * 具名导出：与其它详情页 `import { XDetail } from './detail/XDetail'` 的写法保持兼容。
 * `DetailPage` 与冒烟脚本都用具名导入，**这个对外形状不要改**。
 */
export { ChineseExamTopicDetail };
