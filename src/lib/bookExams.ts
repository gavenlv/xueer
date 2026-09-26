/**
 * 名著（整本书阅读）考点体系 —— 按广州中考的考查面定的一套**受控词表**。
 *
 * 为什么要有这份词表：题目上的 tags 会被「中考考点」页聚合成考点卡片。
 * 如果每道题各写各的（「情节」/「情节梳理」/「梳理情节」…），页面上就会出现
 * 一堆只有一两道题的碎片考点，学生看不出「名著阅读到底考哪几类」。
 * 因此名著类的题目一律从这 9 个考点里选，其它标签（书名、人物名）只作筛选用。
 */

export interface BookExamPointMeta {
  /** 考点名（写进题目的 tags） */
  tag: string;
  /** 学生看得懂的一句话说明 */
  desc: string;
  /** 图标 */
  icon: string;
}

/** 广州中考「整本书阅读」的 9 个考点 */
export const BOOK_EXAM_POINTS: BookExamPointMeta[] = [
  { tag: '情节梳理', desc: '事件的先后与因果、按顺序概括情节', icon: '🧵' },
  { tag: '人物形象', desc: '性格特征、形象分析、人物评价', icon: '👤' },
  { tag: '人物关系', desc: '人物之间的关系网与相互影响', icon: '🕸️' },
  { tag: '细节辨识', desc: '具体细节、易混情节、名场面', icon: '🔍' },
  { tag: '主题探究', desc: '主旨、思想意义、作品的现实意义', icon: '💡' },
  { tag: '艺术特色', desc: '手法、结构、语言风格（讽刺、白描、纪实…）', icon: '🎨' },
  { tag: '跨书比较', desc: '与另一部名著在人物、主题或写法上的比较', icon: '⚖️' },
  { tag: '联系实际', desc: '结合自身体验或现实生活谈启示', icon: '🌱' },
  { tag: '作品常识', desc: '作者、体裁、成书背景、文学地位', icon: '📗' },
];

/** 考点名集合，供校验器做白名单 */
export const BOOK_EXAM_POINT_TAGS: string[] = BOOK_EXAM_POINTS.map((p) => p.tag);
