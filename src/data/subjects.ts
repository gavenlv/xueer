/**
 * 学科注册表 —— **按 2027—2029 广州中考录取计分科目满分降序排列**。
 *
 * 依据：《2027—2029 年广州市初中学业水平考试录取计分科目考试实施方案》
 * （穗教发〔2025〕32 号）。8 个录取计分科目，总分 810：
 *
 *   数学 150 · 语文 140 · 英语 140 · 物理 100 ·
 *   化学 70 · 道德与法治 70 · 历史 70 · 体育与健康 70
 *
 * 两处刻意的取舍：
 *
 *  1. **一级菜单的顺序 = 分值顺序**，学生打开应用第一眼看到的排布就是分数权重，
 *     不用自己判断「哪科更该花时间」。所以数组顺序本身就是产品逻辑，
 *     分值相同的科目按官方文件的表述顺序（化学 → 道德与法治 → 历史 → 体育与健康）。
 *  2. **生物、地理不入册**：它们属于学业水平考试，不计入中考总分，
 *     放进权重菜单只会误导学生分配时间。
 *
 * `available: false` 的学科表示内容尚未开发：仍然出现在菜单里、仍然可以点进去，
 * 但进去看到的是**模块轮廓 + 待开发提示**（`SubjectPage` / `ModulePage` 处理），
 * 学生能提前知道这门课将按什么结构组织。占位模块必须有 id，否则无法建路由。
 */

import type { Subject, SubjectModule } from '../types';

/** 快速造一个「待开发」模块，省得把 available:false 抄十遍 */
function pending(
  id: string,
  name: string,
  icon: string,
  desc: string,
  color: string,
): SubjectModule {
  return { id, name, icon, desc, color, available: false };
}

export const SUBJECTS: Subject[] = [
  {
    id: 'math',
    name: '数学',
    icon: '📐',
    color: '#1a9a6c',
    score: 150,
    desc: '数与代数·图形与几何·统计与概率·公式定理·应用题·中考专题',
    available: true,
    examNote: '闭卷笔试 · 不得使用计算器',
    modules: [
      {
        id: 'math-number',
        name: '数与代数',
        icon: '🔢',
        desc: '有理数、实数、代数式、方程与不等式、函数',
        color: '#1a9a6c',
        available: true,
      },
      {
        id: 'math-geometry',
        name: '图形与几何',
        icon: '📐',
        desc: '相交线与平行线、三角形、四边形、圆、相似与三角函数',
        color: '#2f66d6',
        available: true,
      },
      {
        id: 'math-stats',
        name: '统计与概率',
        icon: '📊',
        desc: '数据的收集整理、平均数中位数众数、方差、概率初步',
        color: '#7355cf',
        available: true,
      },
      {
        id: 'math-formula',
        name: '公式定理速查',
        icon: '🧮',
        desc: '初中三年必背公式与定理，按板块归类速查',
        color: '#bd8a25',
        available: true,
      },
      {
        id: 'math-model',
        name: '应用题模型',
        icon: '🧩',
        desc: '行程、工程、利润、增长率、方案设计等典型模型',
        color: '#d24f3d',
        available: true,
      },
      {
        id: 'math-exam',
        name: '中考专题',
        icon: '🎯',
        desc: '广州中考高频题型、压轴题与应试策略',
        color: '#0f7b8a',
        available: true,
      },
    ],
  },
  {
    id: 'chinese',
    name: '语文',
    icon: '📕',
    color: '#2f66d6',
    score: 140,
    desc: '古诗词·字词·文言文·现代文阅读·作文·名著',
    available: true,
    examNote: '闭卷笔试',
    modules: [
      {
        id: 'poems',
        name: '古诗词背诵与默写',
        icon: '📜',
        desc: '部编版必背篇目，逐句默写、译文注释与考点赏析',
        color: '#2f66d6',
        available: true,
      },
      {
        id: 'vocab',
        name: '字词基础',
        icon: '🔤',
        desc: '字音字形、成语词语、近义词辨析，专治易错点',
        color: '#1a9a6c',
        available: true,
      },
      {
        id: 'classical',
        name: '文言文阅读',
        icon: '🏛️',
        desc: '实词虚词、通假活用、一词多义与句子翻译',
        color: '#bd8a25',
        available: true,
      },
      {
        id: 'reading',
        name: '现代文阅读',
        icon: '📖',
        desc: '记叙文·说明文·议论文，按题型拆解答题思路',
        color: '#7355cf',
        available: true,
      },
      {
        id: 'writing',
        name: '作文训练',
        icon: '✍️',
        desc: '审题立意、结构布局、语言表达与范文点评',
        color: '#d24f3d',
        available: true,
      },
      {
        id: 'literature',
        name: '文学常识与名著',
        icon: '📚',
        desc: '作家作品、名著导读、文体与文化常识速记',
        color: '#0f7b8a',
        available: true,
      },
    ],
  },
  {
    id: 'english',
    name: '英语',
    icon: '🅰️',
    color: '#7355cf',
    score: 140,
    desc: '词汇·语法·阅读·听说·写作 + 中考专题与整卷模拟（按中考知识模块组织）',
    available: true,
    examNote: '闭卷笔试 110 分 + 听说 30 分（5 月）',
    modules: [
      {
        id: 'eng-vocab',
        name: '词汇·词根词缀与辨析',
        icon: '📚',
        desc: '词根词缀、同义近义辨析、高频搭配、拼写易错',
        color: '#7355cf',
        available: true,
      },
      {
        id: 'eng-grammar',
        name: '语法·词法与句法',
        icon: '🔤',
        desc: '时态语态、非谓语、从句、情态动词、介词冠词',
        color: '#2f66d6',
        available: true,
      },
      {
        id: 'eng-reading',
        name: '阅读·完形与语篇',
        icon: '📖',
        desc: '完形填空、阅读选择、阅读填空、项目情境读写',
        color: '#0f7b8a',
        available: true,
      },
      {
        id: 'eng-listening',
        name: '听说·模仿朗读与信息获取',
        icon: '🎧',
        desc: '模仿朗读、听选、回答、角色扮演复述与询问（30 分）',
        color: '#1a9a6c',
        available: true,
      },
      {
        id: 'eng-writing',
        name: '写作·完成句子与书面表达',
        icon: '✍️',
        desc: '语篇填空、句型升级、书面表达分档范文',
        color: '#d24f3d',
        available: true,
      },
      {
        id: 'eng-topics',
        name: '中考专题·知识模块串讲',
        icon: '🎯',
        desc: '按广州中考题型与话题横向串讲，含应试策略',
        color: '#bd8a25',
        available: true,
      },
      {
        id: 'eng-exam',
        name: '中考模拟考试（整卷）',
        icon: '📝',
        desc: '按广州结构：笔试 110 分 + 听说 30 分，计时交卷',
        color: '#8a6a3b',
        available: true,
      },
    ],
  },
  {
    id: 'physics',
    name: '物理',
    icon: '⚛️',
    color: '#0f7b8a',
    score: 100,
    desc: '声光热·力学·电与磁 + 实验操作考试与中考专题',
    available: false,
    examNote: '闭卷笔试 + 实验操作考试（5 月）',
    modules: [
      pending('phy-light', '声与光', '🔊', '声音的产生与传播、光的反射折射、凸透镜成像规律', '#2b7fbf'),
      pending('phy-heat', '热学', '🌡️', '物态变化、分子热运动、内能与热机、比热容计算', '#d24f3d'),
      pending('phy-mech', '力学基础', '⚖️', '机械运动、质量与密度、力与运动、压强与浮力', '#1a9a6c'),
      pending('phy-work', '功与机械能', '🔧', '功、功率、机械效率、动能与势能、简单机械', '#bd8a25'),
      pending('phy-electric', '电学', '⚡', '电流与电路、电压电阻、欧姆定律、电功与电功率', '#7355cf'),
      pending('phy-magnet', '电与磁·信息能源', '🧲', '磁场与电磁感应、电磁波、能源与可持续发展', '#0f7b8a'),
      pending('phy-experiment', '实验操作考试', '🧪', '广州中考实验操作 10 分：必做实验与评分要点', '#8a6a3b'),
      pending('phy-exam', '中考专题与整卷模拟', '🎯', '按广州题型横向串讲，整卷计时模拟', '#8a6a3b'),
    ],
  },
  {
    id: 'chemistry',
    name: '化学',
    icon: '🧪',
    color: '#bd8a25',
    score: 70,
    desc: '物质构成·身边的化学物质·化学方程式·实验探究',
    available: false,
    examNote: '闭卷笔试 + 实验操作考试（5 月）',
    modules: [
      pending('chem-matter', '物质构成与化学用语', '⚛️', '分子原子离子、元素与化学式、化合价与化学用语', '#bd8a25'),
      pending('chem-substance', '身边的化学物质', '💧', '空气与氧气、水与溶液、碳和碳的氧化物、金属', '#2b7fbf'),
      pending('chem-acid', '酸碱盐', '🧫', '常见酸碱盐的性质与用途、中和反应、复分解反应条件', '#d24f3d'),
      pending('chem-equation', '化学方程式与守恒计算', '🔬', '方程式书写与配平、质量守恒定律、化学计算', '#1a9a6c'),
      pending('chem-experiment', '实验操作与气体制备', '🧪', '基本操作、氧气与二氧化碳的制备、实验探究与评价', '#7355cf'),
      pending('chem-exam', '中考专题与整卷模拟', '🎯', '按广州题型横向串讲，整卷计时模拟', '#8a6a3b'),
    ],
  },
  {
    id: 'politics',
    name: '道德与法治',
    icon: '⚖️',
    color: '#6b7a8f',
    score: 70,
    desc: '成长·道德·法治·国情 + 时政热点与中考专题',
    available: true,
    examNote: '闭卷笔试',
    modules: [
      { id: 'pol-growth', name: '七年级·成长与自我', icon: '🌱', desc: '认识自我、情绪管理、生命价值、学习与成长', color: '#1a9a6c', available: true },
      { id: 'pol-moral', name: '八年级·道德与交往', icon: '🤝', desc: '尊重与责任、诚信友善、社会秩序与公共生活', color: '#2b7fbf', available: true },
      { id: 'pol-law', name: '八年级·法治与规则', icon: '⚖️', desc: '法律基础、违法犯罪、宪法与公民权利义务', color: '#7355cf', available: true },
      { id: 'pol-nation', name: '九年级·国情与发展', icon: '🇨🇳', desc: '基本国情、经济建设、政治制度、文化生态与国家发展', color: '#d24f3d', available: true },
      { id: 'pol-current', name: '时政热点专题', icon: '📰', desc: '本年重大时政与常考热点材料的答题角度', color: '#bd8a25', available: true },
      { id: 'pol-exam', name: '中考专题与整卷模拟', icon: '🎯', desc: '按广州题型横向串讲，整卷计时模拟', color: '#8a6a3b', available: true },
    ],
  },
  {
    id: 'history',
    name: '历史',
    icon: '🏺',
    color: '#8a6a3b',
    score: 70,
    desc: '中国古代史·近代史·现代史·世界史 + 中考专题与整卷模拟',
    available: true,
    examNote: '闭卷笔试',
    modules: [
      {
        id: 'hist-7a',
        name: '七上·中国古代史（史前—南北朝）',
        icon: '🏺',
        desc: '中华文明起源、夏商周、秦汉统一、三国两晋南北朝',
        color: '#8a6a3b',
        available: true,
      },
      {
        id: 'hist-7b',
        name: '七下·中国古代史（隋唐—明清前期）',
        icon: '🏯',
        desc: '隋唐繁荣开放、宋元民族关系、明清统一多民族国家',
        color: '#a5793f',
        available: true,
      },
      {
        id: 'hist-8a',
        name: '八上·中国近代史（1840—1949）',
        icon: '💥',
        desc: '列强侵略与民族危机、近代化探索、新民主主义革命',
        color: '#c1483a',
        available: true,
      },
      {
        id: 'hist-8b',
        name: '八下·中国现代史（1949 至今）',
        icon: '🚩',
        desc: '新中国成立与巩固、社会主义制度建立、中国特色社会主义道路',
        color: '#d24f3d',
        available: true,
      },
      {
        id: 'hist-9a',
        name: '九上·世界古代与近代史',
        icon: '🌍',
        desc: '古代亚非欧文明、封建时代、走向近代、资本主义制度确立',
        color: '#2b7fbf',
        available: true,
      },
      {
        id: 'hist-9b',
        name: '九下·世界现代史',
        icon: '🕊️',
        desc: '殖民反抗与资本主义扩展、两次世界大战、战后世界变化',
        color: '#0f7b8a',
        available: true,
      },
      {
        id: 'hist-topics',
        name: '中考专题·关联与对比',
        icon: '🎯',
        desc: '跨册横向专题：侵略与抗争、近代化探索、中外改革、两次世界大战…',
        color: '#7355cf',
        available: true,
      },
      {
        id: 'hist-exam',
        name: '中考模拟考试（整卷）',
        icon: '📝',
        desc: '按广州中考结构：20 选择 + 3 材料题 / 70 分 / 60 分钟，计时交卷',
        color: '#bd8a25',
        available: true,
      },
    ],
  },
  {
    id: 'pe',
    name: '体育与健康',
    icon: '🏃',
    color: '#c1483a',
    score: 70,
    desc: '耐力·素质·球类 + 体育素质综合评价与训练计划',
    available: false,
    examNote: '统一考试 + 体育素质综合评价（5 月前）',
    modules: [
      pending('pe-endurance', '耐力与心肺', '🏃', '中长跑（男 1000 米 / 女 800 米）与游泳选项的训练与配速', '#c1483a'),
      pending('pe-strength', '力量与素质', '💪', '立定跳远、跳绳、实心球等项目动作要点与提分训练', '#bd8a25'),
      pending('pe-ball', '球类项目', '⚽', '足球、篮球、排球的考试规则、技术动作与评分标准', '#1a9a6c'),
      pending('pe-prep', '评分标准与训练计划', '📋', '各项目分档评分对照，考前 8 周训练计划与饮食恢复', '#2b7fbf'),
    ],
  },
];

/** 中考总分（权重分母）——由各科分值求和，改分值不用同步改这里 */
export const TOTAL_SCORE = SUBJECTS.reduce((n, s) => n + s.score, 0);

/** 该科在中考总分中的权重（百分比，保留一位小数） */
export function weightOf(subject: Subject): number {
  return Math.round((subject.score / TOTAL_SCORE) * 1000) / 10;
}

/** 一级菜单用：全部计分科目，已按分值降序（数组顺序即权重顺序） */
export function menuSubjects(): Subject[] {
  return SUBJECTS;
}

/** 已有内容的学科（首页进度、学习报告等统计只用这些） */
export function liveSubjects(): Subject[] {
  return SUBJECTS.filter((s) => s.available && !s.hidden);
}

export function getSubject(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function getModules(subjectId: string) {
  return getSubject(subjectId)?.modules ?? [];
}

export function getModuleMeta(moduleId: string) {
  for (const s of SUBJECTS) {
    const m = s.modules.find((x) => x.id === moduleId);
    if (m) return { subject: s, module: m };
  }
  return undefined;
}