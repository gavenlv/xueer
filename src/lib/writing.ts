/**
 * 范文的字数统计。
 *
 * 为什么**算**而不是在数据里写死：36 篇范文由多人分批撰写，一开始就出现了两种口径——
 * 有人按「含标点的字符数」（848），有人按「纯汉字数」（736），同一篇范文在不同文件里
 * 数字含义不同，学生对着「800 字」去数却发现只有 700 字。
 *
 * 中考作文是按格写字、标点也占格，所以「不少于 600 字」说的是**含标点的字符数**。
 * 统一用这个口径现算，数据里就再也不需要维护一个容易写错的 `words` 字段
 * （与 `lib/searchText.ts` 对检索文本的处理同一个思路：能推导的就不存）。
 */

/** 范文长度：去掉空白后的字符数（含标点），即考场上的「字数」 */
export function sampleLength(text: string): number {
  return text.replace(/\s/g, '').length;
}

/** 纯汉字数（去掉标点），用于判断「是不是真写了内容」而不是靠标点凑格数 */
export function sampleHanzi(text: string): number {
  return (text.match(/[\u4e00-\u9fa5]/g) ?? []).length;
}

/** 中考作文的常见要求：不少于 600 字 */
export const EXAM_MIN_WORDS = 600;
