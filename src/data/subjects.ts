/**
 * 学科注册表。
 * 目前「语文」已上线；其余学科占位，后续接入时只需填充模块数据，
 * 上层路由与 UI 无需改动。
 */

import type { Subject } from '../types';

export const SUBJECTS: Subject[] = [
  {
    id: 'chinese',
    name: '语文',
    icon: '📕',
    color: '#2f66d6',
    desc: '古诗词·字词·文言文·现代文阅读·作文·名著',
    available: true,
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
    id: 'math',
    name: '数学',
    icon: '📐',
    color: '#1a9a6c',
    desc: '数与代数·图形与几何·统计与概率·公式定理·应用题·中考专题',
    available: true,
    // 按用户要求暂不上线：内容与代码完整保留，只是不出现在导航与首页。
    // 想恢复展示，删掉下面这一行即可（路由 /s/math 现在也仍然可访问）。
    hidden: true,
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
    id: 'english',
    name: '英语',
    icon: '🅰️',
    color: '#7355cf',
    desc: '词汇·语法·阅读·听说·写作 + 中考专题与整卷模拟（按中考知识模块组织）',
    available: true,
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
        desc: '按广州结构：笔试 61 小题 110 分 + 听说 30 分，计时交卷',
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
    desc: '力学·声光热·电与磁',
    available: false,
    modules: [],
  },
  {
    id: 'chemistry',
    name: '化学',
    icon: '🧪',
    color: '#bd8a25',
    desc: '物质构成·化学方程式·实验探究',
    available: false,
    modules: [],
  },
  {
    id: 'biology',
    name: '生物',
    icon: '🧬',
    color: '#d24f3d',
    desc: '细胞·遗传·生态系统',
    available: false,
    modules: [],
  },
  {
    id: 'history',
    name: '历史',
    icon: '🏺',
    color: '#8a6a3b',
    desc: '中国古代史·近代史·现代史·世界史 + 中考专题与整卷模拟',
    available: true,
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
    id: 'geography',
    name: '地理',
    icon: '🌏',
    color: '#2b7fbf',
    desc: '地球·气候·区域地理',
    available: false,
    modules: [],
  },
  {
    id: 'politics',
    name: '道德与法治',
    icon: '⚖️',
    color: '#6b7a8f',
    desc: '成长·法治·国情',
    available: false,
    modules: [],
  },
];

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
