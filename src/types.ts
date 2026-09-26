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
  /**
   * 2027—2029 广州中考该科满分。一级菜单按此降序排列（权重即分值 / 810）。
   * 只列**录取计分科目**：生物、地理是学业水平考试科目，不计入总分，故不在册。
   */
  score: number;
  /** 考试形式说明，如「闭卷笔试 + 听说（5 月）」 */
  examNote?: string;
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
  /**
   * 非连续性文本：广州中考现代文阅读的固定题型，由多则材料（图表、数据、短文）组合而成，
   * 单独成类才能在模块页按文体筛出来做专项。
   */
  genre: '记叙文' | '说明文' | '议论文' | '散文' | '小说' | '非连续性文本';
  /** 原文段落 */
  paragraphs: string[];
  questions: QuizQuestion[];
  /** 答题技巧/踩分点提示 */
  tips?: string[];
}

/* ------------------------------------------------------------------ */
/* 模块五：作文训练                                                    */
/* ------------------------------------------------------------------ */

/**
 * 一篇范文 + 点评。
 *
 * 为什么把点评拆成「分项 + 亮点句」而不是一段总评：中考作文按**内容、结构、语言**分项
 * 评分（广州 60 分），学生看一段笼统的好评学不到可迁移的东西。拆开之后：
 * `review` 说清每个评分维度好在哪、还差什么；`highlights` 把原文里值得背下来的句子
 * 单列出来并说明为什么好——这是最能被直接学走的部分。
 */
export interface WritingExample {
  title: string;
  /** 命题形式（中考原题风格的一两句情境或题目要求） */
  prompt?: string;
  /** 全文，段落用 \n 分隔 */
  text: string;
  /** 总评：一段话讲清这篇的得分点与不足 */
  comment: string;
  /** 分项点评：审题立意 / 结构布局 / 语言表达 / 素材运用 / 升格建议 等 */
  review?: { aspect: string; text: string }[];
  /** 亮点句：原句 + 为什么好（可背下来化用） */
  highlights?: { sentence: string; why: string }[];
  /**
   * 档次参考，如「一类文上（55—60 分）」。
   *
   * 注意这里**没有字数字段**：字数由 `lib/writing.ts` 的 `sampleLength()` 现算
   * （去掉空白后的字符数，含标点，与考场按格计字一致）。曾经在数据里写死 `words`，
   * 36 篇由多人分批撰写时立刻出现「含标点」与「纯汉字」两种口径混用，
   * 同一篇范文在不同文件里的数字含义不同——能推导的就不存。
   */
  score?: string;
}

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
  /**
   * 中考高频主题（亲情、师生、成长、家国、文化传承……）。
   * 范文类条目必填：它会被装配成筛选标签，学生才能「按主题找同题多篇范文」。
   */
  theme?: string;
  /** 正文段落，首行 `## ` 视为小标题 */
  content: string[];
  /** 范例（片段或全文）+点评 */
  examples?: WritingExample[];
  /** 可积累的写作素材 */
  materials?: { theme: string; items: string[] }[];
  /** 训练任务 */
  exercise?: { prompt: string; tips: string[] };
  questions?: QuizQuestion[];
}

/* ------------------------------------------------------------------ */
/* 模块六：文学常识与名著导读                                          */
/* ------------------------------------------------------------------ */

export interface LiteratureItem {  id: string;
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
    /**
     * 分章（分回、分篇）内容简介：按这本书**实际的结构**逐章串下来，
     * 让「整本书」在学生脑子里先有骨架，再填细节。小说按回目/章节，
     * 散文集按单篇，诗歌选本按卷/体裁，科普著作按卷/主题。
     */
    chapters?: { name: string; summary: string }[];
    /**
     * 情节脉络：一环一句，**按顺序**串起来就是全书主线。
     * 与 `plots`（挑几个经典情节细讲）不同，这里求「少而连贯」，
     * 是学生背诵与答题时调取情节的索引。
     */
    plotChain?: string[];
    /** 记忆口诀/结构提示：谐音、首字串联、数字概括等 */
    mnemonic?: string[];
  };
  questions: QuizQuestion[];
}

/**
 * 名著的「章节脉络 + 情节链 + 记忆口诀 + 考点题」补充数据。
 *
 * 12 部必读名著的正文已经很长，把这些结构化补充单独成文件维护：
 * 一部的补充集中在一处，便于逐部撰写、逐部核对，也不会把既有条目改乱。
 * 装配时由 `src/data/chinese/index.ts` 按 `id` 合并回对应的名著条目。
 */
export interface BookPlot {
  /** 对应的文学常识条目 id（如 `l-xiyouji`） */
  id: string;
  /** 分章/分回/分篇内容简介，按书本身的结构顺序 */
  chapters: { name: string; summary: string }[];
  /** 情节脉络：一环一句，按顺序串成全书主线 */
  plotChain: string[];
  /** 记忆口诀/结构提示 */
  mnemonic: string[];
  /** 按广州中考「整本书阅读」标准命制的考点题 */
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
  /**
   * 错题墓碑：questionId -> 消错（移出错题本）时间戳。
   * 「答对消错」是删除操作，删除本身无法被同步；记录删除时间后，
   * 云端合并时才能区分一条错题是「待同步的旧记录」还是「已被消掉」，
   * 避免消掉的错题在下次登录时复活。
   */
  wrongRemoved?: Record<string, number>;
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

/**
 * 历史学科模块 id。
 *
 * 六册教材各成一块（七上～九下），另有两块**备考专用**：
 * `hist-topics` 中考专题（横向串联、中外对比），`hist-exam` 整卷模拟考试。
 * 这两块不是教材单元，但正是初三总复习最需要的入口，因此与教材模块同级。
 */
export type HistoryModuleId =
  | 'hist-7a'
  | 'hist-7b'
  | 'hist-8a'
  | 'hist-8b'
  | 'hist-9a'
  | 'hist-9b'
  | 'hist-topics'
  | 'hist-exam';

/**
 * 英语学科模块 id：**按广州中考知识模块组织，不按教材单元**。
 *
 * 用户的要求很明确：广州初中英语用的是沪教牛津版（上海版）教材，但英语学习最需要的
 * 不是「跟着课本第几单元走」，而是**按中考考什么来组织**——词汇、语法、阅读、听说、
 * 写作五大知识板块，加上横向串讲的中考专题与整卷模拟。
 */
export type EnglishModuleId =
  | 'eng-vocab'
  | 'eng-grammar'
  | 'eng-reading'
  | 'eng-listening'
  | 'eng-writing'
  | 'eng-topics'
  | 'eng-exam';

/** 全部模块 id；新增学科时在此扩展 */
export type ModuleId = ChineseModuleId | MathModuleId | HistoryModuleId | EnglishModuleId;

interface EntryBase {
  id: string;
  /** 列表主标题 */
  title: string;
  /** 列表副标题，如「唐·李白」「成语」 */
  subtitle: string;
  grade: GradeOrAll;
  /** 标签，用于筛选与展示 */
  tags: string[];
  /**
   * 检索文本（小写）。
   *
   * **已废弃为可选**：它几乎是把标题、作者、正文、译文、要点原样再拼一遍，
   * 等于让同一段文字在发布包里出现两次（语文内容里这份重复超过 1 MB）。
   * 现在改由 `src/lib/searchText.ts` 的 `searchTextOf(entry)` 按需推导并记忆，
   * 搜索与知识联动都走那个函数。字段保留只为兼容历史数据，装配时一律不再写入。
   */
  searchText?: string;
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

/* ------------------------------ 历史 ------------------------------ */

/**
 * 考点层级：备考时最先要分清的一件事——哪些必须滚瓜烂熟，哪些认得出来即可。
 * 取值有意用中文，因为它会直接显示在学生面前。
 */
export type HistoryLevel = '重点' | '次重点' | '了解';

/** 时间轴上的一个坐标 */
export interface HistoryTimePoint {
  /** 时间，如「1842 年」「公元前 221 年」 */
  time: string;
  /** 事件 */
  event: string;
  /** 补充说明（意义、易错点、关联） */
  note?: string;
  /** 是否为重点时间（页面上加重显示） */
  key?: boolean;
}

/** 分层考点 */
export interface HistoryPoint {
  level: HistoryLevel;
  /** 考点表述（尽量写成「可作答」的句子，而不是关键词） */
  text: string;
  /** 展开说明：为什么考、怎么答、易错在哪 */
  explain?: string;
}

/** 对比表：中外对比、跨册对比、同一主题的横向比较 */
export interface HistoryCompare {
  title: string;
  /** 比较的维度说明，如「同一时期的中西方」 */
  aspect: string;
  /** 表头左右两栏的名称 */
  left: string;
  right: string;
  rows: { item: string; left: string; right: string }[];
}

/**
 * 材料题（广州中考历史的非选择题：「阅读材料，回答问题」）。
 * 材料可多则（用 `【材料一】` 这类标记写在 `material` 里），设问带分值。
 */
export interface HistoryMaterialGroup {
  id: string;
  material: string;
  /** 设问与参考答案、踩分点 */
  questions: { id: string; stem: string; answer: string; rubric?: string[]; tags?: string[] }[];
}

/** 命题角度：这一考点在历年中考里怎么被考（考情研判） */
export interface HistoryExamAngle {
  angle: string;
  /** 出现过的年份或范围（如「2021—2025」），没有具体年份时留空 */
  years?: string;
  detail: string;
}

/** 一条历史内容（一个单元/一课/一个专题） */
export interface HistoryTopic {
  id: string;
  grade: GradeOrAll;
  title: string;
  /** 时段，如「1840—1919」 */
  period: string;
  /** 所属单元或专题分组名 */
  unit?: string;
  /** 一句话主线：这一段的「因果一句话」 */
  mainline: string;
  /** 时空坐标 */
  timeline: HistoryTimePoint[];
  /** 分层考点 */
  points: HistoryPoint[];
  /** 必背结论与答题术语 */
  conclusions?: string[];
  /** 易错易混 */
  confusions?: { wrong: string; right: string; why: string }[];
  /** 关联与对比表 */
  compares?: HistoryCompare[];
  /** 命题角度与考情 */
  examAngles?: HistoryExamAngle[];
  /** 材料大题 */
  materials?: HistoryMaterialGroup[];
  questions: QuizQuestion[];
}

/**
 * 一套模拟卷。
 *
 * 结构**照 2027—2029 年广州中考历史真题的结构**设置（见 `basis`）：
 * 单项选择 20 小题 40 分 + 非选择题（阅读材料，回答问题）3 小题 30 分 = 23 题 70 分，60 分钟闭卷。
 * 因此这里的 `sections` 是**验卷依据**：`pnpm validate` 会核对题量与分值是否与官方结构一致，
 * 以后官方若调整结构（如 2027 年配套文件公布具体分值），改数据即可，不需要改代码。
 */
export interface HistoryPaper {
  id: string;
  grade: GradeOrAll;
  title: string;
  /** 卷面说明（如「按 2027—2029 年广州中考历史结构命题」） */
  basis: string;
  /** 考试时长（分钟） */
  duration: number;
  /** 全卷满分 */
  totalScore: number;
  /** 试卷结构（用于验卷与页面上的结构表） */
  sections: { name: string; kind: 'choice' | 'material'; count: number; score: number }[];
  /** 材料题材料组 */
  materials: HistoryMaterialGroup[];
  /** 全卷题目：选择题 + 材料题的设问（材料题设问按 `material` 题型入库） */
  questions: QuizQuestion[];
}

export interface HistoryTopicEntry extends EntryBase {
  moduleId: Exclude<HistoryModuleId, 'hist-exam'>;
  data: HistoryTopic;
}
export interface HistoryPaperEntry extends EntryBase {
  moduleId: 'hist-exam';
  data: HistoryPaper;
}

export type HistoryEntry = HistoryTopicEntry | HistoryPaperEntry;

/* ------------------------------ 英语 ------------------------------ */

/** 英语知识条目的分组（模块页的筛选主标签），如「词根词缀」「时态」「书面表达」 */
export interface EnglishPoint {
  level: HistoryLevel;
  text: string;
  explain?: string;
}

/** 词根词缀：一个词缀带一串例词 */
export interface EnglishAffix {
  /** 词根/前缀/后缀本身，如 `-less`、`un-`、`spect` */
  affix: string;
  /** 词缀类型与含义，如「后缀：无……的」 */
  meaning: string;
  examples: { word: string; cn: string }[];
}

/**
 * 近义词辨析：学生最需要的是**区别**，所以每条必须给 `diff`（差别在哪）
 * 与两边各自的例句，而不是简单罗列两个近义词。
 */
export interface EnglishConfusable {
  a: string;
  b: string;
  diff: string;
  exampleA?: string;
  exampleB?: string;
}

/** 语法规则：规则 + 形式 + 例句 + 提示 */
export interface EnglishRule {
  rule: string;
  form?: string;
  example: string;
  cn?: string;
  tip?: string;
}

/** 阅读 / 项目情境读写的语篇 */
export interface EnglishPassage {
  title: string;
  /** 英文正文（段落用 \n 分隔） */
  text: string;
  cn?: string;
  /** 语篇类型：应用文、记叙文、说明文、图表、多模态… */
  kind?: string;
  questions?: QuizQuestion[];
}

/**
 * 听说材料。
 *
 * 本应用**不提供音频文件**，而是把听力材料写成脚本，由 `SpeechBar` 用浏览器内置语音
 * 朗读出来当「听力音频」用（见 `lib/entrySpeech.ts`）；模仿朗读则给出重音、连读提示。
 */
export interface EnglishScript {
  title: string;
  /** 英文脚本（段落用 \n 分隔） */
  text: string;
  cn?: string;
  /** 朗读提示：重音、连读、语调 */
  cues?: string[];
  tasks?: QuizQuestion[];
}

/** 书面表达 */
export interface EnglishWriting {
  /** 题目要求（中文题干 + 英文要点提示） */
  topic: string;
  requirements: string[];
  /** 分档范文：同一题目的不同档次，让学生看出分差在哪 */
  samples?: { level: string; text: string; cn?: string; comment: string; highlights?: { sentence: string; why: string }[] }[];
  /** 可套用的句型与连接词 */
  usefulExpressions?: string[];
}

/** 一条英语知识内容（词汇/语法/阅读/听说/写作/专题通用） */
export interface EnglishKnowledge {
  id: string;
  grade: GradeOrAll;
  /** 知识分组，如「词根词缀」「同义辨析」「时态」「从句」「书面表达」 */
  unit: string;
  /** 中文标题 */
  title: string;
  /** 英文知识点名或主题词 */
  enTitle?: string;
  summary: string;
  /** 考点分层（与历史同一套：重点/次重点/了解） */
  points: EnglishPoint[];
  /** 词根词缀（词汇类） */
  affixes?: EnglishAffix[];
  /** 同义词与近义词（含区别） */
  confusables?: EnglishConfusable[];
  /** 高频搭配与短语 */
  collocations?: { phrase: string; cn: string; note?: string }[];
  /** 语法规则 */
  rules?: EnglishRule[];
  /** 易错点 */
  mistakes?: { wrong: string; right: string; why: string }[];
  /** 阅读语篇 */
  passages?: EnglishPassage[];
  /** 听说脚本 */
  scripts?: EnglishScript[];
  /** 书面表达 */
  writing?: EnglishWriting;
  /** 应试策略 */
  examTips?: string[];
  questions: QuizQuestion[];
}

/**
 * 一套英语模拟卷：结构与分值**照 2027—2029 年广州中考英语**设置
 * （见 `basis` 与 `sections`），`pnpm validate` 会按官方结构验卷。
 * 听说部分单独成段（模仿朗读 8 + 信息获取 13 + 角色扮演 9 = 30 分）。
 */
export interface EnglishPaper {
  id: string;
  grade: GradeOrAll;
  title: string;
  /** 卷面依据说明 */
  basis: string;
  /** 笔试时长（分钟） */
  duration: number;
  /** 笔试满分 */
  totalScore: number;
  /** 听说满分（0 表示本卷不含听说） */
  speakingScore?: number;
  /** 笔试结构 */
  sections: { name: string; kind: 'choice' | 'blank' | 'short' | 'writing'; count: number; score: number }[];
  /** 卷内题目（按卷面顺序） */
  questions: QuizQuestion[];
  /** 书面表达（写作第三节） */
  writing?: EnglishWriting;
  /** 听说材料（若本卷含听说） */
  listening?: EnglishScript[];
}

export interface EnglishKnowledgeEntry extends EntryBase {
  moduleId: Exclude<EnglishModuleId, 'eng-exam'>;
  data: EnglishKnowledge;
}
export interface EnglishPaperEntry extends EntryBase {
  moduleId: 'eng-exam';
  data: EnglishPaper;
}

export type EnglishEntry = EnglishKnowledgeEntry | EnglishPaperEntry;

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
  | HistoryEntry
  | EnglishEntry
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
