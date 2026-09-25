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
    desc: '词汇·语法·完形·阅读理解',
    available: false,
    modules: [],
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
    desc: '中国古代史·近代史·世界史',
    available: false,
    modules: [],
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
