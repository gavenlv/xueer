/**
 * 高中语文的**课时内容**注册表：哪几个单元已经写好了「讲解 + 练习」。
 *
 * ## 为什么单独一层，而不是塞进 `books.ts`
 *
 * `books.ts` 是**目录**（五册 159 条课时，全部是核对过的目录性事实），它要保证「打开就有」，
 * 体量小、随时可读。课时内容则是**逐单元补**的：一篇课文的讲解四五百字、再加四道题，
 * 五册 125 篇全写下来是几十万字，必须按册、按单元分批交付。
 *
 * 所以这里用「单元 → 该单元各篇的内容」的映射：有内容就渲染讲解与练习，没有就显示
 * 「正在补充」——**不假装有**。`books.ts` 与页面都不需要知道哪些单元写完了，问这个注册表就行。
 *
 * ## 键的规则
 *
 * `"<册 id>:<单元号>"`，例如 `'bx-1:1'` = 必修上册第一单元。册 id 与 `books.ts` 一致；
 * 单元号是该册内的序号（1 起）。课时按 `title`（篇名，册内唯一）匹配，
 * 这样即使某天教材把两课合并/拆分，只要篇名不变，内容仍然能对得上。
 */

import { BX1_U1 } from './bx1-u1';

/** 一道题：与初中练习引擎的字段同名，将来接进度统计时不必再转换 */
export interface HsDrill {
  id: string;
  type: 'choice' | 'fill' | 'short';
  stem: string;
  options?: string[];
  answer: string;
  rubric?: string[];
  explanation: string;
}

/** 一篇课时的讲解与练习 */
export interface HsLessonContent {
  /** 篇名，与 `books.ts` 里的 `title` 逐字一致 */
  title: string;
  author: string;
  genre: string;
  /** 这一篇在本单元/高考里为什么重要（50—90 字） */
  why: string;
  /** 讲解主体：每段一个小标题 + 正文，写「怎么看出来的」而不是「表达了什么」 */
  notes: { heading: string; body: string }[];
  /** 这一篇（这类文本）在高考里怎么被考 */
  exam: string;
  /** 易错：每条「错在哪 → 怎么办」 */
  pitfalls: string[];
  drills: HsDrill[];
}

/**
 * 已写好的单元。新增一个单元 = 新建一个数据文件 + 在这里登记一行。
 * 目前只完成了必修上册第一单元（7 篇 / 28 题），其余按册推进。
 */
export const HS_UNIT_CONTENT: Record<string, HsLessonContent[]> = {
  'bx-1:1': BX1_U1,
};

/** 这一篇有没有内容 */
export function hsLessonContentOf(
  bookId: string,
  unitNo: number,
  title: string,
): HsLessonContent | undefined {
  return HS_UNIT_CONTENT[`${bookId}:${unitNo}`]?.find((l) => l.title === title);
}

/** 这个单元写完了几篇（用于册页显示「已写 n / m 篇」） */
export function hsUnitDoneCount(bookId: string, unitNo: number): number {
  return HS_UNIT_CONTENT[`${bookId}:${unitNo}`]?.length ?? 0;
}
