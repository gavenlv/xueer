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
  /**
   * 题干配图（物理、化学等理科用）。
   *
   * 理科题目大量依赖图：受力分析、光路、电路、坐标图像、装置图。
   * 图由**数据描述**、渲染器画成内联 SVG，因此离线可用、可检索、可朗读，
   * 也不需要在发布包里放图片文件。
   */
  figure?: PhysicsFigure;
  /**
   * 作图题的参考答案图：学生自己画完再展开对照。
   * 与 `figure` 分开，是因为作图题**不能**在题干里就把答案画出来。
   */
  answerFigure?: PhysicsFigure;
  /**
   * 计算题/解答题的规范解题步骤（分步给分）。
   * 与 `explanation` 的分工：`explanation` 讲「为什么」，这里给「怎么写」。
   */
  answerSteps?: string[];
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
/* 模块七：中考专题（按广州卷面题型逐个攻破）                            */
/* ------------------------------------------------------------------ */

/**
 * 一条「分步讲解」：把方法拆成「先做什么、再做什么」。
 *
 * 与写作课的 `content`（成段的讲稿）不同，专题要的是**可执行的顺序**：
 * 学生考场上需要的是「第一步先判定文体，第二步再定读法」这样的动作序列，
 * 因此每一步都必须有 `heading`（这一步做什么）。`demo` 是可选的「做一遍给你看」。
 */
/**
 * 备考型「题型专题」的通用类型（语文中考专题与数学中考专题共用）。
 *
 * 为什么做成**学科无关**：语文这套「专题 → 章节（逐类讲透）→ 同名专项训练」
 * 是用户明确认可的形态（「每一种类型都有独立的章节讲透，有讲解、有例子、有练习」），
 * 数学要的是同一套东西。抽成通用类型后，两科共用同一份渲染器、同一套折叠与
 * 按块懒加载，新增第三科时只需写数据。
 */
export interface ExamStep {
  /** 这一步做什么，如「先判定文体，再决定读法」 */
  heading: string;
  /** 讲解正文 */
  body: string;
  /** 示范（可选）：按这一步的方法完整做一遍 */
  demo?: string;
}

/**
 * 近 5 年考情的一条记录。
 *
 * 只做**考情归纳**（考查形态、分值区间、选材倾向），不复刻真题原文——
 * 真题的原题与材料有版权，而且学生真正需要的是「这几年都在考什么形态」，
 * 不是再读一遍某年的具体题目。
 */
export interface ExamTrend {
  /** 年份，如「2025」 */
  year: string;
  /** 这一年的考查形态、分值区间与选材倾向 */
  note: string;
}

/**
 * 章节里的一个**例子讲解**。
 *
 * 设计成两种用法都装得下：
 * - **语文**靠「正误对照」讲透——`ok: false`（默认）表示这是一个错例，
 *   `analysis` 说清错在哪、属于哪一类，`fix` 给改后的句子；`ok: true` 放规范例句对照。
 * - **数学**靠「一道题完整做一遍」讲透——`text` 写题目，`steps` 给分步解答（每步一行，
 *   行内公式用 `$…$`），`answer` 给答案，`analysis` 写「怎么想到的、为什么这样入手」。
 *
 * 因此除 `text` 与 `analysis` 外的字段都是可选的：写哪科用哪科。
 */
export interface ExamExample {
  /** 例子主体：语文是例句（对句/错句），数学是题目 */
  text: string;
  /** 是否是规范例句（语文用；省略即「有问题的例子」） */
  ok?: boolean;
  /** 讲解：为什么对／为什么错；数学写「怎么想到的、关键在哪一步」 */
  analysis: string;
  /** 语文：修改后的句子（错例建议都给） */
  fix?: string;
  /** 数学：分步解答（每步一行，可含 $…$ 行内公式） */
  steps?: string[];
  /** 数学：答案（可与 `steps` 末步重复，便于快速核对） */
  answer?: string;
  /** 数学：配图（几何、函数图象等不看图难理解的例子用） */
  figure?: PhysicsFigure;
}

/**
 * 一个**章节**：专题之下的一个类目或子类（如语文的「病句·搭配不当」、
 * 数学的「二次函数图象与系数关系」）。
 *
 * 用户的要求是「每个类别都要讲透：每一种类型都有独立的章节，有讲解、有例子、有练习」。
 * 所以章节是**讲练一体的最小单位**：
 *   `intro` + `rules` 讲清方法 → `examples` 逐例拆解（正误对照或完整解答）→
 *   同名的训练分组（`drills`）让学生在**刚学完的这一节**上立刻练。
 *
 * 因此 `name` 必须同时是：章节标题、`drills[].name`、以及该节题目的首个标签。
 */
export interface ExamSection {
  /** 章节名，如「病句·搭配不当」——同时是训练分组名与题目标签 */
  name: string;
  /** 这一节讲什么、怎么判断（讲解正文，可以是一段或多段） */
  intro: string;
  /** 判定要点／口诀／解题套路，逐条（写「怎么一眼看出来」而不是复述定义） */
  rules?: string[];
  /** 例子讲解（语文 ≥3 条正误对照；数学 ≥3 道例题带分步解答） */
  examples: ExamExample[];
  /**
   * 本节易错。**两种写法都接受**，页面上分别渲染：
   *   - 字符串：一句话写「错在哪 → 怎么办」（最省地方，适合只说一个坑）；
   *   - 三行对象：与专题级 `pitfalls` 同一套 `{ wrong, right, why }`（信息更全，推荐）。
   */
  pitfalls?: (string | { wrong: string; right: string; why: string })[];
}

/* 兼容别名：语文中考专题的数据文件与渲染器沿用带 Chinese 前缀的老名字，无需改动 */
export type ChineseExamStep = ExamStep;
export type ChineseExamTrend = ExamTrend;
export type ChineseExamExample = ExamExample;
export type ChineseExamSection = ExamSection;

/**
 * 一个「题型专题」。**按广州卷面题型**设专题，内容是
 * 「考情归纳 + 专门讲解 + 逐类章节 + 专项训练」四件套。
 *
 * 为什么按题型而不是按知识点设专题：卷面板块本身就是命题单位，学生拿到卷子
 * 也是按这几块分配时间的；「逐个攻破」的单位必须是题型，攻破才有可验证的终点。
 * 按知识点聚合的那套仍然由「考点」页（`/s/:subjectId/exam`）负责，两者互补。
 */
export interface ExamTopic {
  id: string;
  /** 一律 `'all'`：专题是初三总复习内容，不归属某一册 */
  grade: GradeOrAll;
  /** 专题名，如「古诗文默写」「函数与几何综合」 */
  title: string;
  /** 卷面定位，如「第二大题之一 · 古诗文积累与默写（约 8—10 分）」 */
  paper: string;
  /** 一句话：这个专题在考什么、拿分靠什么 */
  summary: string;
  /** 近 5 年考情（恰好 5 条，一年一条） */
  trends: ExamTrend[];
  /** 五年趋势结论：一句话说清「现在怎么考、往哪走」 */
  trendSummary: string;
  /** 命题角度（与历史/道法共用同一套：angle + years + detail） */
  angles: HistoryExamAngle[];
  /** 分步讲解（怎么做这一类题的整体流程） */
  steps: ExamStep[];
  /** 答题／解题模板：可直接背下来套用 */
  templates?: { name: string; items: string[] }[];
  /** 评分点／踩分点：写成「写到什么才给分」（数学写步骤分） */
  scoring?: string[];
  /** 易错与失分 */
  pitfalls?: { wrong: string; right: string; why: string }[];
  /**
   * **章节（逐类讲透）**：把本专题的类目与子类一个不漏地拆开讲——
   * 每一节都要有讲解、要点、例子（≥3 条）与同名训练分组（≥4 题），
   * 学生「看完这一节就刷这一节」，一节一节把这一块吃下来。
   */
  sections?: ExamSection[];
  /**
   * 专项训练分组。`name` **同时是题目上的标签**：分组刷题走
   * `/practice/<moduleId>/<条目 id>?tag=<name>`，不再另建一套组的 id 与路由。
   */
  drills: { name: string; note: string }[];
  /** 专项训练题库（每题至少带一个 `drills` 里的标签） */
  questions: QuizQuestion[];
}

/** 兼容别名：语文中考专题的数据文件、渲染器与校验器沿用带 Chinese 前缀的老名字 */
export type ChineseExamTopic = ExamTopic;

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
  /**
   * 题目 id -> 首次答对时间戳（「过关」记录）。
   *
   * 为什么需要它：理科的掌握判定不是「答对率够高」而是「**这个知识点的每一道题都过关**」
   * （用户明确要求：所有的习题都过关了才算是掌握）。聚合的 correct/total 无法回答
   * 「还剩哪几题没对过」，所以必须逐题记一笔。
   *
   * 为什么记的是**首次**答对时间而不是「当前是否答对」：单调递增的数据才能安全合并——
   * 两台设备各自答对不同的题，取并集即可，不需要墓碑、也不会互相覆盖。
   */
  passed?: Record<string, number>;
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
  /**
   * 学生是否**主动选过**学段。
   *
   * 为什么需要这个标记：`grade` 的默认值是 `'7a'`（七上），而「七上」本身也是学生会
   * 主动选的正常学段。云端合并若直接用 `grade !== '7a'` 判断「本地选过没有」，
   * 就会把**主动选七上**和**从没选过**混为一谈——学生明明选了七上，一登录就被云端
   * 的学段覆盖掉。因此单独记一个标记来表达「这是学生的选择，不是默认值」。
   */
  gradePicked?: boolean;
  /** 总学习时长（秒） */
  totalSeconds: number;
  /** 背诵安排：内容 id -> 背诵记录（间隔重复） */
  recite?: Record<string, ReciteRecord>;
  /**
   * 知识点卡片背诵记录：卡片 id -> 记录。
   *
   * **稀疏存储**：只在学生真的背过某张卡时才写入一条。全库知识点有数千张，
   * 给每张卡都留一条空记录会把 localStorage 撑到几 MB，同步上传也会变慢。
   */
  cards?: Record<string, CardRecord>;
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

/**
 * 一张「必背知识点卡片」。
 *
 * 与 `ReciteRecord`（整篇古诗词的四级遮罩训练）不同，卡片是**知识点的最小单位**：
 * 一句默写、一个历史时间点、一条材料大题的踩分点，各是一张卡。
 * 卡片由内容数据**自动派生**（见 `lib/reciteCards.ts`），不单独维护一份数据，
 * 因此每新增一条内容，它的知识点就自动进了背诵清单。
 */
export interface ReciteCard {
  /** 稳定 id：`${entryId}#${kind}#${序号}`，可从中反查所属条目与模块 */
  id: string;
  /** 归属内容条目 id */
  entryId: string;
  /** 归属模块 id（统计分模块掌握率用） */
  moduleId: ModuleId;
  /** 来源条目标题，如「观沧海」，跨条目的清单里要标明出处 */
  title: string;
  /** 知识点类型，如「默写」「时间点」「材料大题踩分点」 */
  kind: string;
  /** 卡片正面：提示（挖空、上句、设问、词条…） */
  front: string;
  /** 卡片背面：要记住的内容 */
  back: string;
  /** 补充说明：易错、意义、用法、为什么好 */
  note?: string;
  /** 逐条踩分点（材料大题／主观题用，逐条展示） */
  points?: string[];
  /** 是否是本科目划定的「重点」（历史/道法考点分层带过来的标记） */
  key?: boolean;
}

/**
 * 一张知识点卡片的背诵记录。
 *
 * `streak` 是「连续背对次数」，也是熟练度与「标熟」的唯一依据；
 * 级别的 `level` 不落库，需要时由 streak 推导——**能推导的就不存**，
 * 免得同步合并时两个字段互相打架。
 */
export interface CardRecord {
  /** 累计背诵次数（每点一次「背了」都算，学生会看到 1 次、2 次…） */
  times: number;
  /** 连续背对次数（同一天重复点不叠加，背错清零） */
  streak: number;
  /** 最近一次背诵时间戳 */
  lastAt: number;
  /** 下次应复习的时间戳（按遗忘曲线推出） */
  dueAt: number;
  /** 首次达到「标熟」的时间戳；掉出标熟后清空 */
  masteredAt?: number;
}

/* ------------------------------------------------------------------ */
/* 统一内容条目（列表页 / 练习引擎 / 统计都基于它工作）                 */
/* ------------------------------------------------------------------ */

/**
 * 语文学科模块 id。
 *
 * 前六块是教材模块；`zh-topics` 是**备考专用**的「中考专题」——按广州卷面题型
 * 设专题（积累与运用 / 默写 / 文言文 / 古诗词鉴赏 / 现代文 / 名著 / 写作），
 * 每块给「考情归纳 + 专门讲解 + 专项训练」，逐个攻破。
 *
 * 为什么不叫 `exam`：`/s/:subjectId/exam` 已经被「考点」子页面占用
 * （见 `App.tsx` 的 `SubjectExamRoute`），模块 id 撞上它就没有路由了。
 * `zh-` 前缀同时让掌握判定能按前缀识别（见 `lib/progress.ts` 的全题过关策略）。
 */
export type ChineseModuleId =
  | 'poems'
  | 'vocab'
  | 'classical'
  | 'reading'
  | 'writing'
  | 'literature'
  | 'zh-topics';

/** 数学学科模块 id */
export type MathModuleId =
  | 'math-number'
  | 'math-geometry'
  | 'math-stats'
  | 'math-formula'
  | 'math-model'
  | 'math-exam'
  /**
   * 「中考题型专题」：按 2027 年 150 分卷面题型设 5 个专题、35 节逐类讲透，
   * 条目数据是 `ExamTopic`（与语文 `zh-topics` 同一形态），走「轻量清单 + 按条目懒加载」
   * （见 `src/data/lazyEntries.ts` 与 `src/data/math/modules/math-topics.ts`）。
   * 与 `math-exam`（策略型专题：试卷结构与时间分配）是两块不同的模块。
   */
  | 'math-topics';

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

/**
 * 物理 / 化学 / 道德与法治 / 体育的模块 id。
 *
 * 这四科在学科注册表里已经按 2027—2029 广州中考的 8 个计分科目排好位置、
 * 模块骨架也列了出来（`pending()` 占位），但**内容还没建**，因此这里先把 id 收进类型，
 * 否则生成出来的轻量清单（`summary.ts` 会带这些模块）过不了类型检查。
 * 内容落地时只需补数据层与渲染器，类型不用再动。
 */
export type PhysicsModuleId =
  | 'phy-light'
  | 'phy-heat'
  | 'phy-mech'
  | 'phy-work'
  | 'phy-electric'
  | 'phy-magnet'
  | 'phy-experiment'
  | 'phy-exam';

export type ChemistryModuleId =
  | 'chem-matter'
  | 'chem-substance'
  | 'chem-acid'
  | 'chem-equation'
  | 'chem-experiment'
  | 'chem-exam';

export type PoliticsModuleId =
  | 'pol-growth'
  | 'pol-youth'
  | 'pol-moral'
  | 'pol-law'
  | 'pol-nation'
  | 'pol-world'
  | 'pol-current'
  | 'pol-exam';

export type PeModuleId = 'pe-endurance' | 'pe-strength' | 'pe-ball' | 'pe-prep';

/** 全部模块 id；新增学科时在此扩展 */
export type ModuleId =
  | ChineseModuleId
  | MathModuleId
  | HistoryModuleId
  | EnglishModuleId
  | PhysicsModuleId
  | ChemistryModuleId
  | PoliticsModuleId
  | PeModuleId;

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
export interface ChineseExamTopicEntry extends EntryBase {
  moduleId: 'zh-topics';
  data: ChineseExamTopic;
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
  questions: {
    id: string;
    stem: string;
    answer: string;
    rubric?: string[];
    tags?: string[];
    /**
     * 规范解题步骤（可选）。
     *
     * 物理与数学这类**计算/解答题**要用它：`answer` 给的是「答案与思路」，
     * 这里给的是「卷面上该按什么步骤写」，理科按步骤给分，两者不能混为一谈。
     */
    answerSteps?: string[];
    /**
     * 设问解析（可选）。
     *
     * 材料设问原本只有参考答案与踩分点，但理科的材料题常常「错得很有道理」——
     * 写清「为什么这样答」比只给答案更有用，因此允许设问单独带解析。
     */
    explanation?: string;
    /** 设问配图（物理/化学的探究与实验题常给装置图、数据表或图像） */
    figure?: PhysicsFigure;
    /** 设问的参考答案图（作图小题：学生自己画完再展开对照） */
    answerFigure?: PhysicsFigure;
  }[];
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

/**
 * 分类词表里的一个词。
 *
 * 初中词汇量上千，逐词做成条目既写不完也查不动；按类别成表才是学生真正用得上的形态：
 * 一个话题下面几十个词排在一起，**成串记、按需查**。因此每条知识内容可以挂一张词表。
 */
export interface EnglishWord {
  /** 单词或短语 */
  word: string;
  /** 音标（可选，只给容易读错的） */
  phonetic?: string;
  /** 词性，如 `n.` `v.` `adj.` `adv.` `phr.` */
  pos?: string;
  /** 中文释义（多义用「；」分隔） */
  cn: string;
  /** 考点提示：搭配、用法、易错、同义替换（能直接用在作文里的那种） */
  note?: string;
}

/** 词表分组：一个话题/词性/考点下面的一组词 */
export interface EnglishWordGroup {
  /** 分组名，如「家庭成员」「天气词」「不规则动词」 */
  group: string;
  words: EnglishWord[];
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
  /**
   * **分类词表**：按话题 / 词性 / 考点整理的初中词汇。
   * 页面会渲成可搜索的词汇表（音标、词性、释义、考点提示），并按 `group` 分组。
   */
  wordList?: EnglishWordGroup[];
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

/* ------------------------------ 道德与法治 ------------------------------ */

/**
 * 时政热点：道法中考试题的「材料」几乎都是当年的时政事件，
 * 因此热点条目要写清「事件是什么 + 可以从哪几个教材考点切入答题」。
 */
export interface PoliticsHotspot {
  /** 热点名称，如「全过程人民民主的基层实践」 */
  event: string;
  /** 背景与关键事实（写清可核查的公开信息，不编造细节） */
  background: string;
  /** 答题角度：每个角度对应一个教材考点 + 怎么说 */
  angles: { angle: string; point: string; answer: string }[];
}

/**
 * 一条道法内容（一个教材单元或一个专题）。
 *
 * 与历史条目同一套骨架（主线 → 分层考点 → 必背结论 → 易错 → 对比 → 考法 → 材料题），
 * 但道法的「时空坐标」换成了**核心观点与金句**：这一科考的是价值判断与规范表述，
 * 学生要能把教材上的结论准确写进答题卡，而不是背年份。
 */
export interface PoliticsTopic {
  id: string;
  grade: GradeOrAll;
  title: string;
  /** 所属教材单元或专题分组（作为模块页的筛选主标签） */
  unit: string;
  /** 一句话主线：这一单元在讲什么、为什么重要 */
  mainline: string;
  /** 核心观点与考点分层（重点/次重点/了解） */
  points: PoliticsPoint[];
  /** 必背金句与答题术语（材料题直接能用的规范表述） */
  keySentences?: string[];
  /** 易错辨析 */
  confusions?: { wrong: string; right: string; why: string }[];
  /** 关联与对比（跨单元/跨册/概念对照） */
  compares?: HistoryCompare[];
  /** 命题角度与考法 */
  examAngles?: HistoryExamAngle[];
  /** 时政热点与答题角度（时政专题条目用） */
  hotspots?: PoliticsHotspot[];
  /** 材料大题（阅读材料，回答问题） */
  materials?: HistoryMaterialGroup[];
  questions: QuizQuestion[];
}

/** 核心观点：与历史同一套层级词，但内容是一句可作答的规范表述 */
export interface PoliticsPoint {
  level: HistoryLevel;
  text: string;
  explain?: string;
}

/** 道法模拟卷：结构与历史类似（选择 + 材料题），分值照官方结构 */
export interface PoliticsPaper {
  id: string;
  grade: GradeOrAll;
  title: string;
  basis: string;
  duration: number;
  totalScore: number;
  sections: { name: string; kind: 'choice' | 'material'; count: number; score: number }[];
  materials: HistoryMaterialGroup[];
  questions: QuizQuestion[];
}

export interface PoliticsTopicEntry extends EntryBase {
  /**
   * 知识条目可以落在**任意**道法模块——包括 `pol-exam`。
   * `pol-exam` 里除整卷模拟外还有「题型专题」这类知识条目（卷面时间分配、非选择题
   * 答题模板、材料读题与取材）。因此它与 PoliticsPaperEntry 共用 `pol-exam`，
   * 渲染时按数据形状区分（有 `sections` 的是卷子，否则是知识条目）。
   */
  moduleId: PoliticsModuleId;
  data: PoliticsTopic;
}
export interface PoliticsPaperEntry extends EntryBase {
  moduleId: 'pol-exam';
  data: PoliticsPaper;
}

export type PoliticsEntry = PoliticsTopicEntry | PoliticsPaperEntry;

/* ------------------------------------------------------------------ */
/* 物理                                                                */
/* ------------------------------------------------------------------ */

/**
 * 图解的画布色调。只描述**语义**（重点 / 辅助线 / 警示 / 正确），
 * 具体颜色由渲染器从设计系统的 CSS 变量里取，数据不写颜色值。
 */
export type FigureTone = 'main' | 'accent' | 'muted' | 'danger' | 'ok';

/** 角标记（光学入射角、斜面倾角、力的夹角都用它） */
export interface FigureAngleMark {
  /** 顶点 */
  x: number;
  y: number;
  /** 起始角（度，0 = 正右，逆时针为正） */
  from: number;
  /** 结束角（度） */
  to: number;
  /** 半径，默认 6 */
  r?: number;
  /** 弧上的标注，如「30°」「i」「r」 */
  label?: string;
  tone?: FigureTone;
  /** 直角用方框标记而不是圆弧 */
  right?: boolean;
}

/**
 * 图解里的一个图元。
 *
 * 坐标用 **0—100 的画布单位**（左上角为原点、y 向下），渲染器按 viewBox 等比缩放，
 * 因此同一张图在手机与桌面上比例一致，作者也不需要算像素。
 *
 * 设计取舍：**先有通用图元，再有物理符号图元**。通用图元能画任何示意图；
 * 物理符号图元（电源、灯泡、凸透镜、磁体、滑轮…）按教材标准画法画，
 * 保证「画错就没分」的电路符号不会因作者手绘而走样。
 */
export type FigurePrim =
  /* ---------------- 通用图元 ---------------- */
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number; dashed?: boolean; tone?: FigureTone; width?: number }
  | {
      t: 'arrow';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      /** 双向箭头（拉伸、形变示意） */
      both?: boolean;
      dashed?: boolean;
      tone?: FigureTone;
      width?: number;
      label?: string;
      /** 标注相对中点的偏移（画布单位），默认贴线外侧 */
      labelDx?: number;
      labelDy?: number;
    }
  | {
      t: 'rect';
      x: number;
      y: number;
      w: number;
      h: number;
      tone?: FigureTone;
      fill?: boolean;
      dashed?: boolean;
      rx?: number;
      label?: string;
    }
  | {
      t: 'circle';
      cx: number;
      cy: number;
      r: number;
      tone?: FigureTone;
      fill?: boolean;
      dashed?: boolean;
      label?: string;
      labelDx?: number;
      labelDy?: number;
    }
  | { t: 'poly'; points: [number, number][]; closed?: boolean; tone?: FigureTone; fill?: boolean; dashed?: boolean }
  | { t: 'arc'; cx: number; cy: number; r: number; from: number; to: number; tone?: FigureTone; dashed?: boolean; arrow?: boolean }
  | { t: 'text'; x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; size?: number; tone?: FigureTone }
  /**
   * 标记点（实心 dot / 空心圈）。
   *
   * 作图规范里需要「把某个点标出来」的地方很多：力臂的**垂足**、光学的**光心 O 与焦点 F**、
   * 像点、交点、杠杆的**支点**。`circle` 也能画，但它默认半径与描边是给「物体」用的，
   * 标点需要更小、可实心、可空心，所以单独给一个图元，避免每张图各写一遍半径。
   */
  | {
      t: 'dot';
      x: number;
      y: number;
      /** 半径，默认 1.1（画布单位） */
      r?: number;
      /** 空心圈（如光学作图里的焦点标记） */
      hollow?: boolean;
      tone?: FigureTone;
      label?: string;
      labelDx?: number;
      labelDy?: number;
    }
  | ({ t: 'angle' } & FigureAngleMark)
  /**
   * 坐标图像。理科的「图像法」全靠它：s-t、v-t、m-V、U-I、I-U、熔化曲线。
   * 只画轴与刻度，数据曲线用 `curve` 图元叠上去。
   */
  | {
      t: 'axis';
      x: number;
      y: number;
      w: number;
      h: number;
      xLabel: string;
      yLabel: string;
      xTicks?: { at: number; label: string }[];
      yTicks?: { at: number; label: string }[];
      /** 画网格（读数题用） */
      grid?: boolean;
      /** 原点是否标 0 */
      origin?: boolean;
    }
  /** 折线/曲线（函数图像、光路、运动轨迹） */
  | { t: 'curve'; points: [number, number][]; tone?: FigureTone; dashed?: boolean; width?: number; arrow?: boolean }
  /** 斜线阴影（地面、墙面、不透光区域） */
  | { t: 'hatch'; x: number; y: number; w: number; h: number; tone?: FigureTone; gap?: number }

  /* ---------------- 电学符号（教材标准画法） ---------------- */
  /** 电源：长线是正极、短线是负极 */
  | { t: 'battery'; x: number; y: number; vertical?: boolean; label?: string; cells?: number }
  | { t: 'switch'; x: number; y: number; closed?: boolean; vertical?: boolean; label?: string }
  /** 灯泡（圆圈内画叉） */
  | { t: 'bulb'; x: number; y: number; label?: string }
  /** 定值电阻（矩形） */
  | { t: 'resistor'; x: number; y: number; vertical?: boolean; label?: string; w?: number; h?: number }
  /** 滑动变阻器（矩形 + 滑片箭头） */
  | { t: 'rheostat'; x: number; y: number; vertical?: boolean; label?: string }
  /** 电流表（A）/ 电压表（V）：圆圈内写字母 */
  | { t: 'meter'; x: number; y: number; kind: 'A' | 'V'; label?: string }
  /** 导线结点（实心圆点） */
  | { t: 'junction'; x: number; y: number }

  /* ---------------- 光学元件 ---------------- */
  /** 凸/凹透镜 */
  | { t: 'lens'; x: number; y: number; kind: 'convex' | 'concave'; h?: number; label?: string }
  /** 平面镜（背面带斜线） */
  | { t: 'mirror'; x: number; y: number; len?: number; angle?: number; label?: string }
  /** 界面（水面、玻璃砖表面） */
  | { t: 'surface'; x1: number; y1: number; x2: number; y2: number; kind: 'water' | 'glass'; label?: string }

  /* ---------------- 力学元件 ---------------- */
  | { t: 'pulley'; x: number; y: number; r?: number; kind?: 'fixed' | 'moving'; label?: string }
  /** 杠杆：两端点 + 支点位置 0—1 */
  | { t: 'lever'; x1: number; y1: number; x2: number; y2: number; pivot: number; label?: string }
  /** 斜面：自动画直角三角形与倾角标记 */
  | { t: 'incline'; x: number; y: number; w: number; deg: number; label?: string }
  | { t: 'spring'; x1: number; y1: number; x2: number; y2: number; coils?: number; label?: string }
  /** 容器（烧杯/水槽），`fill` 为水位 0—1 */
  | { t: 'beaker'; x: number; y: number; w: number; h: number; fill?: number; label?: string }

  /* ---------------- 热学与磁 ---------------- */
  /** 温度计，`value` 为液柱高度 0—1 */
  | { t: 'thermometer'; x: number; y: number; h: number; value?: number; label?: string }
  /**
   * 机械停表（双盘）。
   *
   * 停表是初中读数题里最容易错的一件器材：**大盘一圈只有 30 s**，
   * 所以「大盘读数取 10.4 s 还是 40.4 s」要由**小盘是否过半格**决定。
   * 这个图元把两个盘按真实结构画出来（小盘在 12 点位置、大盘在外圈），
   * 学生一眼能看出「先看小盘、再看大盘」的读数顺序。
   *
   * - `minute`：小盘示数 0—15，步进 0.5（大盘每转一圈，小盘走半格）
   * - `second`：大盘示数 0—60，步进 0.1；`≥30` 表示指针已进入第二圈
   *   （画出来时取 `second − 30` 的位置，靠小盘位置区分是哪一圈）
   */
  | {
      t: 'stopwatch';
      x: number;
      y: number;
      /** 大盘半径，默认 30（配合 `view: 'square'` 使用） */
      r?: number;
      minute?: number;
      second?: number;
      label?: string;
    }
  /** 条形磁体（左 N 右 S） */
  | { t: 'magnet'; x: number; y: number; w?: number; h?: number; label?: string }
  /**
   * 通电螺线管（带电流方向与 N/S）。
   *
   * `frontCurrent` 是**正面（朝向读者的那一面）导线的电流方向**，默认 `'up'`。
   * N/S 由它按安培定则算出来，不由作者填写——极性写反就是教错：
   * 正面电流向上时磁矩指向 −x，故 N 在左、S 在右；向下则反过来。
   *
   * `showCurrent` 默认 **false**：多数作者会在图上自己画电流箭头（往往还带 `I` 标注与说明文字），
   * 如果图元也自动画一支，同一张图就会出现两支重复的箭头。需要图元代画时显式打开它。
   */
  | {
      t: 'coil';
      x: number;
      y: number;
      turns?: number;
      w?: number;
      label?: string;
      frontCurrent?: 'up' | 'down';
      /** 由图元代画正面电流方向箭头（默认不画，避免与作者自绘的箭头重复） */
      showCurrent?: boolean;
    }
  /** 小磁针，`deg` 为北极指向 */
  | { t: 'compass'; x: number; y: number; deg?: number; label?: string }
  /* ---------------- 化学装置与微观粒子（化学模块用；物理内容不会用到） ---------------- */
  /** 试管：`tilt` 为倾斜角（度，0 竖直），`liquid` 液面 0—1，`color` 液体颜色 */
  | {
      t: 'testTube';
      x: number;
      y: number;
      h?: number;
      w?: number;
      tilt?: number;
      liquid?: number;
      color?: ChemColor;
      label?: string;
    }
  | {
      t: 'flask';
      x: number;
      y: number;
      kind?: 'conical' | 'round';
      h?: number;
      w?: number;
      liquid?: number;
      color?: ChemColor;
      label?: string;
    }
  | { t: 'alcoholLamp'; x: number; y: number; lit?: boolean; label?: string }
  | {
      t: 'gasJar';
      x: number;
      y: number;
      w?: number;
      h?: number;
      liquid?: number;
      color?: ChemColor;
      cover?: boolean;
      label?: string;
    }
  | { t: 'funnel'; x: number; y: number; kind?: 'funnel' | 'long' | 'sep'; h?: number; label?: string }
  | { t: 'stand'; x: number; y: number; h?: number; w?: number; clamps?: number[]; label?: string }
  | { t: 'atom'; x: number; y: number; r?: number; symbol: string; charge?: string; color?: ChemColor; label?: string }
  | {
      t: 'molecule';
      x: number;
      y: number;
      atoms: { dx: number; dy: number; r?: number; symbol?: string; color?: ChemColor }[];
      bonds?: [number, number][];
      label?: string;
    };

/**
 * 一张图解。
 *
 * `alt` 不是装饰：整页朗读靠它把图读出来，检索也靠它把「凸透镜成像规律」这类
 * 问题搜到图上——所以校验器要求每张图都必须有 `alt`。
 *
 * 这个 DSL 是**理科共用**的（物理、化学）：名字保留 `PhysicsFigure` 是为了不动既有内容的引用，
 * 化学代码里用 `SciFigure` 这个别名。
 */
export interface PhysicsFigure {
  id: string;
  /** 图题（画在图下方） */
  title: string;
  /** 一句话点出这张图要看什么 */
  caption?: string;
  /** 画布比例，默认 wide（16:10） */
  view?: 'wide' | 'square' | 'tall';
  prims: FigurePrim[];
  /** 无障碍与朗读用的文字描述（必填） */
  alt: string;
}

/** 理解过程的一步：理科讲解按「先看现象 → 再建立概念 → 再看它会怎么变」排 */
export interface PhysicsStep {
  heading: string;
  body: string;
  figure?: PhysicsFigure;
  /** 规范表述提醒 / 常见错误 */
  note?: string;
}

/**
 * 应用/例题：把知识点落到情境上。
 * 与 `materials` 的分工：`apps` 是课堂例题式的应用（解答紧跟其后）；
 * `materials` 是中考非选择题形态（材料 + 设问 + 踩分点），供自测。
 */
export interface PhysicsApp {
  title: string;
  scene: string;
  /** 物理模型：从情境里抓出哪些量、用哪条规律 */
  model: string;
  /** 规范解答步骤 */
  steps: string[];
  result: string;
  figure?: PhysicsFigure;
}

/** 公式与单位。理科要「会用」公式，所以每个公式必须写适用条件 */
export interface PhysicsFormula {
  name: string;
  /** KaTeX 源码，如 `p = \\frac{F}{S}` */
  tex?: string;
  text?: string;
  /** 各物理量的单位（如「p：帕斯卡 Pa」） */
  units?: string;
  /** 适用条件与变形用法——背公式没用，知道什么时候能用才有用 */
  usage: string;
}

/** 一个知识点（物理的最小学习单元） */
export interface PhysicsTopic {
  id: string;
  /** 教材章节归属，如「人教版八下 · 第 7 章 力」 */
  unit: string;
  grade: GradeOrAll;
  title: string;
  /** 这个知识点要回答的问题（从问题切入，不从定义切入） */
  question: string;
  /** 理解的关键在哪（一句话） */
  keyIdea: string;
  /** 理解：分步讲解，每步尽量配图 */
  steps: PhysicsStep[];
  /** 应用：典型例题与生活/工程应用 */
  apps: PhysicsApp[];
  formulas?: PhysicsFormula[];
  confusions?: { wrong: string; right: string; why: string }[];
  compares?: HistoryCompare[];
  examAngles?: HistoryExamAngle[];
  /** 中考非选择题形态的综合题（解答与计算 / 探究与实验 / 阅读与理解） */
  materials?: HistoryMaterialGroup[];
  /** 练习：每个知识点不少于 8 道，且**全部过关才算掌握**（见 lib/progress.ts） */
  questions: QuizQuestion[];
}

/** 物理整卷模拟（按广州中考卷面结构命题） */
export interface PhysicsPaper {
  id: string;
  grade: GradeOrAll;
  title: string;
  basis: string;
  duration: number;
  totalScore: number;
  sections: { name: string; kind: 'choice' | 'material'; count: number; score: number }[];
  materials: HistoryMaterialGroup[];
  questions: QuizQuestion[];
}

export interface PhysicsTopicEntry extends EntryBase {
  /** 知识条目可落在任意物理模块（`phy-exam` 里除整卷外还有题型专题） */
  moduleId: PhysicsModuleId;
  data: PhysicsTopic;
}
export interface PhysicsPaperEntry extends EntryBase {
  moduleId: 'phy-exam';
  data: PhysicsPaper;
}

export type PhysicsEntry = PhysicsTopicEntry | PhysicsPaperEntry;

/* ------------------------------------------------------------------ */
/* 化学                                                                */
/* ------------------------------------------------------------------ */

/** 理科共用的图解类型别名（物理与化学同一套 DSL） */
export type SciFigure = PhysicsFigure;
/** 理科共用的公式/计算关系类型别名 */
export type ChemFormula = PhysicsFormula;

/**
 * 溶液或物质的颜色。
 *
 * 化学里「颜色」不是装饰而是**物质的属性**（硫酸铜溶液蓝色、氯化铁溶液黄色、
 * 高锰酸钾溶液紫红色……），所以它属于内容，写进数据；渲染器只负责把它画成对应的色值。
 * `colorless` 画成空心（无色透明）。
 */
export type ChemColor = 'colorless' | 'blue' | 'yellow' | 'green' | 'brown' | 'red' | 'purple' | 'black' | 'white';

/**
 * 化学装置的图元（除下面这些，通用图元、坐标图像、`dot`、`beaker`、`thermometer`、
 * `stopwatch` 等与物理共用）。
 */
export type ChemPrim =
  /** 试管：`tilt` 为倾斜角（度，0 竖直），`liquid` 为液面高度 0—1 */
  | {
      t: 'testTube';
      x: number;
      y: number;
      h?: number;
      w?: number;
      tilt?: number;
      liquid?: number;
      color?: ChemColor;
      label?: string;
    }
  /** 锥形瓶 / 圆底烧瓶 */
  | {
      t: 'flask';
      x: number;
      y: number;
      kind?: 'conical' | 'round';
      h?: number;
      w?: number;
      liquid?: number;
      color?: ChemColor;
      label?: string;
    }
  /** 酒精灯（`lit` 是否点燃，画火焰） */
  | { t: 'alcoholLamp'; x: number; y: number; lit?: boolean; label?: string }
  /** 集气瓶（`cover` 是否盖玻璃片，`liquid` 为瓶内液体高度） */
  | { t: 'gasJar'; x: number; y: number; w?: number; h?: number; liquid?: number; color?: ChemColor; cover?: boolean; label?: string }
  /** 漏斗：普通漏斗 / 长颈漏斗 / 分液漏斗 */
  | { t: 'funnel'; x: number; y: number; kind?: 'funnel' | 'long' | 'sep'; h?: number; label?: string }
  /** 铁架台：底座 + 立杆 + 若干铁夹（`clamps` 给出夹持点的高度比例 0—1） */
  | { t: 'stand'; x: number; y: number; h?: number; w?: number; clamps?: number[]; label?: string }
  /** 原子/离子模型：圆内写元素符号，右上角标电荷 */
  | { t: 'atom'; x: number; y: number; r?: number; symbol: string; charge?: string; color?: ChemColor; label?: string }
  /**
   * 分子模型：`atoms` 给出各原子相对分子中心的偏移，`bonds` 用下标连线。
   * 例如水分子：O 在中心、两个 H 分别偏左上与右上，两条键连到 O。
   */
  | {
      t: 'molecule';
      x: number;
      y: number;
      atoms: { dx: number; dy: number; r?: number; symbol?: string; color?: ChemColor }[];
      bonds?: [number, number][];
      label?: string;
    };

/** 化学方程式 */
export interface ChemEquation {
  /** 化学方程式（用 `=` 连接，条件写在等号上下方由渲染器排；这里直接写完整式） */
  equation: string;
  /** 反应条件，如「点燃」「加热」「高温」「催化剂」 */
  condition?: string;
  /** 现象（学生要会描述） */
  phenomenon: string;
  /** 配平要点与易错说明 */
  note?: string;
}

/** 化学实验（含装置图） */
export interface ChemExperiment {
  title: string;
  /** 实验目的 */
  purpose: string;
  /** 器材与药品 */
  apparatus: string[];
  /** 装置图 */
  figure?: SciFigure;
  /** 操作步骤 */
  steps: string[];
  /** 现象 */
  phenomenon: string;
  /** 结论与化学方程式 */
  conclusion: string;
  /** 注意事项与安全（中考必考） */
  cautions?: string[];
}

/** 理解过程的一步：化学按**三重表征**排——宏观现象 → 微观解释 → 符号表达 */
export interface ChemStep {
  heading: string;
  /** 这一步属于哪一重表征 */
  representation?: '宏观' | '微观' | '符号' | '应用';
  body: string;
  figure?: SciFigure;
  note?: string;
}

/** 应用/例题：从真实情境到化学表达 */
export interface ChemApp {
  title: string;
  scene: string;
  /** 化学视角：抓住哪些物质、发生了什么反应 */
  analysis: string;
  steps: string[];
  result: string;
  figure?: SciFigure;
}

/** 一个知识点（化学的最小学习单元） */
export interface ChemTopic {
  id: string;
  /** 教材章节归属，如「人教版九年级 · 第三单元 物质构成的奥秘」 */
  unit: string;
  grade: GradeOrAll;
  title: string;
  /** 这个知识点要回答的问题 */
  question: string;
  /** 理解的关键一句话（化学常落在一句规律上） */
  keyIdea: string;
  steps: ChemStep[];
  /** 化学方程式（本知识点涉及的，含现象与配平要点） */
  equations?: ChemEquation[];
  /** 实验（含装置图、现象、注意事项） */
  experiments?: ChemExperiment[];
  apps: ChemApp[];
  /** 计算关系与化学用语规则（每条都要写适用范围） */
  formulas?: ChemFormula[];
  confusions?: { wrong: string; right: string; why: string }[];
  compares?: HistoryCompare[];
  examAngles?: HistoryExamAngle[];
  materials?: HistoryMaterialGroup[];
  /** 练习：每个知识点不少于 8 道，且**全部过关才算掌握** */
  questions: QuizQuestion[];
}

/** 化学整卷模拟（按广州中考卷面结构） */
export interface ChemPaper {
  id: string;
  grade: GradeOrAll;
  title: string;
  basis: string;
  duration: number;
  totalScore: number;
  sections: { name: string; kind: 'choice' | 'material'; count: number; score: number }[];
  materials: HistoryMaterialGroup[];
  questions: QuizQuestion[];
}

export interface ChemTopicEntry extends EntryBase {
  moduleId: ChemistryModuleId;
  data: ChemTopic;
}
export interface ChemPaperEntry extends EntryBase {
  moduleId: 'chem-exam';
  data: ChemPaper;
}

export type ChemEntry = ChemTopicEntry | ChemPaperEntry;

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
  /** 配图：几何、函数、数轴等不看图难理解的例题用 */
  figure?: PhysicsFigure;
}

/**
 * 中考考点（综合）：这个知识点在广州中考里怎么被考。
 *
 * 与易错点（写「别怎么做」）互补，考点写「会怎么考」：题位与题型、
 * 与哪些知识**综合**着考、踩分靠什么——学生据此判断这一块要学到什么深度。
 */
export interface MathExamPoint {
  /** 考点表述：一句话说清考什么（如「以函数图象为背景的动点最值」） */
  point: string;
  /** 综合怎么考：题位、常见组合与拿分要点 */
  how: string;
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
  /** 中考考点（综合）：这个知识点在中考里怎么被考、与哪些知识综合 */
  examPoints?: MathExamPoint[];
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

/**
 * 数学「中考题型专题」条目（`math-topics`）。
 *
 * 为什么单列一个类型而不是塞进 `MathEntry`：这一块的数据是**题型专题**形态
 * （`ExamTopic`：考情 / 分步讲解 / 章节 / 专项训练），与知识点形态的 `MathTopic`
 * （概念 / 公式 / 例题 / 方法）根本不同。先前为了少改类型，装配处只能写
 * `as unknown as MathTopic` 硬转——那种 casts 一旦有人按 `MathTopic` 去读字段
 * （例如 `concepts.map`）就会在运行时炸掉，而且编译器完全帮不上忙。
 * 单列类型后，装配与读取都按真实形状走，页面上按数据形状分流（`isExamTopicData`）。
 */
export interface MathExamTopicEntry extends EntryBase {
  moduleId: 'math-topics';
  data: ExamTopic;
}

export type Entry =
  | PoemEntry
  | VocabEntry
  | ClassicalEntry
  | ReadingEntry
  | WritingEntry
  | LiteratureEntry
  | ChineseExamTopicEntry
  | HistoryEntry
  | EnglishEntry
  | PoliticsEntry
  | PhysicsEntry
  | ChemEntry
  | MathEntry
  | MathExamTopicEntry;

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
