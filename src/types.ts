/**
 * 全局类型定义 —— 所有学科内容数据的统一契约。
 *
 * 设计原则：
 * 1. 学科无关的骨架（Subject / SubjectModule）与学科内容分开，
 *    后续新增数学、英语等学科时只需实现同样的 Module 契约。
 * 2. 所有内容条目都带 `grade` 与 `id`，便于按学段筛选、去重与进度记录。
 * 3. 练习题统一使用 `QuizQuestion`，因此练习引擎、错题本、统计只需一套实现。
 */

/** 部编版初中学段：七年级上/下、八年级上/下、九年级上/下 */
export type GradeId = '7a' | '7b' | '8a' | '8b' | '9a' | '9b';

/** 跨学段通用内容（如文学常识、写作技巧） */
export type GradeOrAll = GradeId | 'all';

export interface GradeMeta {
  id: GradeId;
  /** 显示名，如「七年级上册」 */
  name: string;
  /** 短名，如「七上」 */
  short: string;
  /** 所属年级 */
  year: 7 | 8 | 9;
  term: '上' | '下';
}

/* ------------------------------------------------------------------ */
/* 学科骨架                                                            */
/* ------------------------------------------------------------------ */

export interface SubjectModule {
  /** 模块路由片段，如 'poems' */
  id: string;
  name: string;
  /** emoji 图标 */
  icon: string;
  /** 一句话说明 */
  desc: string;
  /** 主题色（CSS 颜色值） */
  color: string;
  /** 是否已上线内容 */
  available: boolean;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
  available: boolean;
  /**
   * 暂不在导航与首页展示（内容仍在、直接访问路由仍可用、仍纳入数据校验）。
   * 用于「先不推这个学科，但保留已完成的工作」——删掉这一行即可恢复展示。
   */
  hidden?: boolean;
  modules: SubjectModule[];
}

/* ------------------------------------------------------------------ */
/* 练习题目                                                            */
/* ------------------------------------------------------------------ */

/**
 * 统一练习题模型。
 * - choice：4 个选项，answer 为 'A' | 'B' | 'C' | 'D'
 * - fill：answer 为文本，多个可接受答案用半角竖线 `|` 分隔，例如 `"海内存知己|海内存知已"`
 * - short：简答题，answer 为参考答案，rubric 为踩分点；由学生自行对照评分。
 *   广州中考「整本书阅读」附加题六年来从不以选择题考查，全部是表格填空、
 *   比较探究、写小传、补写内心独白这类主观表达题，故需要该题型。
 */
export interface QuizQuestion {
  id: string;
  type: 'choice' | 'fill' | 'short';
  /** 题干 */
  stem: string;
  /** 仅 choice 使用，固定 4 个选项 */
  options?: string[];
  /** choice: 'A'|'B'|'C'|'D'；fill: 答案文本，多个用 `|` 分隔；short: 参考答案 */
  answer: string;
  /** 解析（必填，学生答错后展示） */
  explanation: string;
  /** 1 易 · 2 中 · 3 难 */
  difficulty?: 1 | 2 | 3;
  /** 知识点标签，用于统计薄弱环节 */
  tags?: string[];
  /** 仅 short 使用：踩分点，逐条列出，供学生自评 */
  rubric?: string[];
}

/** 一组带标题的题目，用于按篇目/主题组织 */
export interface QuizGroup {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

/* ------------------------------------------------------------------ */
/* 模块一：古诗词背诵与默写                                            */
/* ------------------------------------------------------------------ */

export interface Poem {
  id: string;
  title: string;
  author: string;
  /** 朝代，如「唐」「宋」「先秦」「现代」 */
  dynasty: string;
  grade: GradeId;
  genre: '诗' | '词' | '曲' | '文' | '现代诗';
  /** 原文，逐句拆分（默写练习以「句」为单位挖空） */
  lines: string[];
  /** 逐句注释/白话翻译，长度与 lines 一致（无则省略） */
  lineNotes?: string[];
  /** 整篇译文 */
  translation: string;
  /** 作品赏析与考点 */
  appreciation: string;
  /** 千古名句 */
  famousLines?: string[];
  /** 主题标签，如 ['思乡','写景'] */
  tags?: string[];
  /** 背诵提示：易错字、通假字等 */
  pitfalls?: string[];
}

/* ------------------------------------------------------------------ */
/* 模块二：字词基础                                                    */
/* ------------------------------------------------------------------ */

export interface VocabItem {
  id: string;
  grade: GradeOrAll;
  /** 修辞手法：2022 课标列出的 8 种常见修辞，新教材已全部做成课后知识补白 */
  category: '字音' | '字形' | '成语' | '词语' | '近义辨析' | '修辞手法';
  /** 词条本身，如「咄咄逼人」 */
  term: string;
  pinyin?: string;
  /** 释义 */
  meaning: string;
  /** 易错点/辨析要点 */
  pitfall?: string;
  /** 例句 */
  example?: string;
  /** 易混词对照 */
  confusable?: { term: string; meaning: string }[];
  questions: QuizQuestion[];
}

/* ------------------------------------------------------------------ */
/* 模块三：文言文阅读                                                  */
/* ------------------------------------------------------------------ */

export interface ClassicalText {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  grade: GradeId;
  /** 出处，如《孟子·告子下》 */
  source?: string;
  /** 原文段落 */
  paragraphs: string[];
  /** 重点注释 */
  annotations: { word: string; explain: string }[];
  /** 语法归类：通假字 / 古今异义 / 词类活用 / 特殊句式 / 一词多义 */
  grammar: { type: string; items: { word: string; explain: string }[] }[];
  /** 全文翻译 */
  translation: string;
  /** 主旨与写作特色 */
  theme: string;
  questions: QuizQuestion[];
}

/* ------------------------------------------------------------------ */
/* 模块四：现代文阅读理解                                              */
/* ------------------------------------------------------------------ */

export interface ReadingPassage {
  id: string;
  grade: GradeId;
  title: string;
  author?: string;
  genre: '记叙文' | '说明文' | '议论文' | '散文' | '小说';
  /** 原文段落 */
  paragraphs: string[];
  questions: QuizQuestion[];
  /** 答题技巧/踩分点提示 */
  tips?: string[];
}

/* ------------------------------------------------------------------ */
/* 模块五：作文训练                                                    */
/* ------------------------------------------------------------------ */

export interface WritingLesson {
  id: string;
  grade: GradeOrAll;
  /**
   * 文体写作：新教材（2024 修订版）把「缩写」升级为「学写小小说」等。
   * 作文题库：可直接拿来练笔的中考作文题，含审题提示、立意方向与提纲示范。
   * 升格训练：同一篇习作的平庸版与升格版对照，指出每一处改动为什么有效。
   * 考场技巧：时间分配、字数、卷面、应急处理等考场实务。
   */
  category:
    | '审题立意'
    | '素材积累'
    | '结构布局'
    | '语言表达'
    | '文体写作'
    | '范文点评'
    | '素材库'
    | '作文题库'
    | '升格训练'
    | '考场技巧';
  title: string;
  summary: string;
  /** 正文段落，首行 `## ` 视为小标题 */
  content: string[];
  /** 范例（片段或全文）+点评 */
  examples?: { title: string; text: string; comment: string }[];
  /** 可积累的写作素材 */
  materials?: { theme: string; items: string[] }[];
  /** 训练任务 */
  exercise?: { prompt: string; tips: string[] };
  questions?: QuizQuestion[];
}

/* ------------------------------------------------------------------ */
/* 模块六：文学常识与名著导读                                          */
/* ------------------------------------------------------------------ */

export interface LiteratureItem {
  id: string;
  grade: GradeOrAll;
  /**
   * 名著导读：统编版新教材（2024 修订版）「整本书阅读」必读篇目，中考名著阅读的考查范围。
   * 拓展阅读：曾为必读、现已被新教材移出考查范围的经典，保留供课外阅读。
   */
  category: '作家作品' | '文学体裁' | '名著导读' | '拓展阅读' | '文化常识';
  title: string;
  /** 正文段落 */
  content: string[];
  /** 必记要点 */
  keyPoints: string[];
  /** 名著专属结构化信息 */
  book?: {
    name: string;
    author: string;
    dynasty?: string;
    /** 主要人物 */
    characters?: { name: string; desc: string }[];
    /** 经典情节 */
    plots?: { title: string; desc: string }[];
    /** 主题思想 */
    theme?: string;
    /** 艺术特色 */
    features?: string[];
  };
  questions: QuizQuestion[];
}

/* ------------------------------------------------------------------ */
/* 学习进度                                                            */
/* ------------------------------------------------------------------ */

/** 单条内容的学习记录 */
export interface ItemProgress {
  /** 已学习次数（进入详情/卡片学习） */
  studied: number;
  /** 累计答对题数 */
  correct: number;
  /** 累计答题数 */
  total: number;
  /** 最近一次学习时间戳 */
  lastAt: number;
  /** 是否已掌握（连续答对） */
  mastered: boolean;
  /** 是否收藏 */
  starred?: boolean;
  /** 背诵打卡次数（古诗词模块） */
  recited?: number;
}

export interface WrongRecord {
  questionId: string;
  /** 题目归属的内容标题，便于错题本展示 */
  sourceTitle: string;
  /** 模块 id */
  moduleId: string;
  /** 最近一次答错的用户答案 */
  lastAnswer: string;
  wrongCount: number;
  lastAt: number;
}

export interface StudyState {
  /** 内容 id -> 进度 */
  progress: Record<string, ItemProgress>;
  /** 题目 id -> 错题记录 */
  wrong: Record<string, WrongRecord>;
  /** 已打卡日期，YYYY-MM-DD */
  checkins: string[];
  /** 每日学习统计 date -> 答题数 */
  daily: Record<string, { answered: number; correct: number; minutes: number }>;
  /** 上次选择的学段 */
  grade: GradeId;
  /** 总学习时长（秒） */
  totalSeconds: number;
  /** 背诵安排：内容 id -> 背诵记录（间隔重复） */
  recite?: Record<string, ReciteRecord>;
}

/* ------------------------------ 背诵与复习 ------------------------------ */

/**
 * 一条内容的背诵记录。
 * 采用简化的间隔重复：熟练度越高，下次复习间隔越长。
 */
export interface ReciteRecord {
  /** 累计背诵次数 */
  times: number;
  /** 最近一次背诵时间戳 */
  lastAt: number;
  /** 下次应复习的时间戳 */
  dueAt: number;
  /** 熟练度档位 0-5，对应 1/2/4/7/15/30 天 */
  level: number;
  /** 连续背对次数（背错则清零） */
  streak: number;
}

/* ------------------------------------------------------------------ */
/* 统一内容条目（列表页 / 练习引擎 / 统计都基于它工作）                 */
/* ------------------------------------------------------------------ */

/** 语文学科模块 id */
export type ChineseModuleId =
  | 'poems'
  | 'vocab'
  | 'classical'
  | 'reading'
  | 'writing'
  | 'literature';

/** 数学学科模块 id */
export type MathModuleId =
  | 'math-number'
  | 'math-geometry'
  | 'math-stats'
  | 'math-formula'
  | 'math-model'
  | 'math-exam';

/** 全部模块 id；新增学科时在此扩展 */
export type ModuleId = ChineseModuleId | MathModuleId;

interface EntryBase {
  id: string;
  /** 列表主标题 */
  title: string;
  /** 列表副标题，如「唐·李白」「成语」 */
  subtitle: string;
  grade: GradeOrAll;
  /** 标签，用于筛选与展示 */
  tags: string[];
  /** 预拼接的检索文本（小写） */
  searchText: string;
  /** 该条目下的练习题 */
  questions: QuizQuestion[];
}

export interface PoemEntry extends EntryBase {
  moduleId: 'poems';
  data: Poem;
}
export interface VocabEntry extends EntryBase {
  moduleId: 'vocab';
  data: VocabItem;
}
export interface ClassicalEntry extends EntryBase {
  moduleId: 'classical';
  data: ClassicalText;
}
export interface ReadingEntry extends EntryBase {
  moduleId: 'reading';
  data: ReadingPassage;
}
export interface WritingEntry extends EntryBase {
  moduleId: 'writing';
  data: WritingLesson;
}
export interface LiteratureEntry extends EntryBase {
  moduleId: 'literature';
  data: LiteratureItem;
}

/* ------------------------------ 数学 ------------------------------ */

/** 公式 / 定理 */
export interface MathFormula {
  name: string;
  /** KaTeX 源码，如 `a^2+b^2=c^2` */
  tex?: string;
  /** 文字表述；无 tex 时必填，有 tex 时作为补充说明 */
  text?: string;
  /** 适用条件 / 注意点 */
  note?: string;
}

/** 例题精讲 */
export interface MathExample {
  /** 题目 */
  stem: string;
  /** 解题步骤，逐步说明 */
  steps: string[];
  /** 答案 */
  answer: string;
  /** 方法小结或易错提醒 */
  tip?: string;
}

/** 数学知识点 */
export interface MathTopic {
  id: string;
  title: string;
  /** 归属册次；跨册次的通用知识点用 'all' */
  grade: GradeOrAll;
  /** 所属章节，如「人教版八上 · 第十四章」 */
  chapter?: string;
  /** 一句话概述 */
  summary: string;
  /** 核心概念与定义 */
  concepts: { term: string; explain: string }[];
  /** 公式与定理 */
  formulas?: MathFormula[];
  /** 例题精讲 */
  examples?: MathExample[];
  /** 易错点 */
  pitfalls?: string[];
  /** 解题方法与思路 */
  methods?: string[];
  questions: QuizQuestion[];
}

export interface MathEntry extends EntryBase {
  moduleId: MathModuleId;
  data: MathTopic;
}

export type Entry =
  | PoemEntry
  | VocabEntry
  | ClassicalEntry
  | ReadingEntry
  | WritingEntry
  | LiteratureEntry
  | MathEntry;

/** 练习会话中的一道题（带来源信息） */
export interface QuizItem extends QuizQuestion {
  sourceId: string;
  sourceTitle: string;
  moduleId: ModuleId;
}

/* ------------------------------------------------------------------ */
/* 思维导图                                                            */
/* ------------------------------------------------------------------ */

/** 导图节点：label 必填，note 为补充说明，children 为下级分支 */
export interface MindNode {
  label: string;
  /** 节点补充说明（如例句、辨析要点、记忆口诀），展示在节点下方 */
  note?: string;
  children?: MindNode[];
}

export interface MindMap {
  id: string;
  moduleId: ModuleId;
  /** 关联的内容条目 id；有此字段时会在该条目的详情页一并展示 */
  entryId?: string;
  grade: GradeOrAll;
  /** 导图标题 */
  title: string;
  /** 一句话说明这张图解决什么问题 */
  summary: string;
  /** 中心主题 */
  root: MindNode;
}

/* ------------------------------------------------------------------ */
/* 拓展阅读                                                            */
/* ------------------------------------------------------------------ */

export type ExtensionKind =
  | '背景拓展'
  | '对比阅读'
  | '文化常识'
  | '考点延伸'
  | '趣味知识'
  | '学法指导';

export interface Extension {
  id: string;
  moduleId: ModuleId;
  /** 关联的内容条目 id；有此字段时会在该条目的详情页一并展示 */
  entryId?: string;
  grade: GradeOrAll;
  kind: ExtensionKind;
  title: string;
  /** 一句话摘要 */
  summary: string;
  /** 正文段落，以 `## ` 开头视为小标题 */
  content: string[];
  /** 可选：延伸思考题，引导学生进一步联想 */
  think?: string[];
}
