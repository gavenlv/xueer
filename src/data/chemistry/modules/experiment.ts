/**
 * 化学 · 实验操作与气体制备（`chem-experiment` 模块）。
 *
 * 这个模块同时服务两个考试部分：
 *
 * 1. 笔试（60 分）里的实验题——基本操作判断正误、装置图选择与连接、
 *    气体制取与性质（氧气、二氧化碳）、实验方案的设计与评价、误差与异常现象分析。
 *    这类题在非选择题里权重很高（非选择题共 36 分），选择题里也常以装置图出现。
 * 2. 实验操作考试（10 分，另场进行）——学生现场动手操作，评委按细则打分。
 *    考的是「手上做得出、嘴上说得清」：器材检查、药品取用、操作顺序、
 *    读数与记录、现象描述、整理器材与安全。第 7 个知识点专门写这一部分。
 *
 * 内容口径：
 *   - 操作规范与实验事实，依据义务教育化学课程标准（2022 年版）对
 *     「科学探究与化学实验」学习主题的要求，以及人教版九年级化学教材的
 *     实验栏目（实验活动、探究实验、演示实验）与课后「实验操作」图示的通行画法；
 *   - 装置图的画法遵循教材标准：试管口略向下倾斜（加热固体）、导管只伸到集气瓶口
 *     （排水法）、排空气法导管伸到集气瓶底部、集气瓶正放/倒放与气体密度一致、
 *     排水法集气瓶倒置且装满水、长颈漏斗下端伸入液面以下、管口塞棉花（加热高锰酸钾）；
 *   - 实验操作考试与「必做实验」的具体范围，各年由当地公布的试题与细则确定，
 *     本模块统一表述为「通常包括……，具体以当年公布的试题为准」，
 *     不写任何无法核实的文件号与条款号。
 *
 * 化学式下标用 Unicode 下标字符，相对原子质量取整数（H 1、C 12、N 14、O 16、S 32、
 * Cl 35.5、K 39、Ca 40、Mn 55、Fe 56、Cu 64、Zn 65）。
 */

import type { ChemTopic, SciFigure } from '../../../types';

/* ------------------------------------------------------------------ */
/* 共用装置图                                                          */
/* ------------------------------------------------------------------ */

/** 纸槽（药匙）取粉末状固体：试管先平放，把药品送到管底再竖立 */
const figSolidTrough: SciFigure = {
  id: 'fig-chem-exp-solid-1',
  title: '粉末状固体的取用：纸槽（药匙）送到试管底部',
  caption: '试管先平放，纸槽或药匙伸到管底，再把试管慢慢竖立，让药品落到管底——一斜、二送、三直立',
  view: 'wide',
  alt: '一支平放的试管，纸槽从管口一直伸到试管底部，槽内装着少量黑色粉末，图旁标注一斜二送三直立',
  prims: [
    { t: 'testTube', x: 38, y: 26, h: 32, w: 10, tilt: 90 },
    { t: 'poly', points: [[43, 21.6], [60, 19.6], [60, 26.4], [43, 27.6]], tone: 'muted' },
    { t: 'circle', cx: 46, cy: 24.4, r: 0.9, tone: 'main' },
    { t: 'circle', cx: 48.6, cy: 24.2, r: 0.9, tone: 'main' },
    { t: 'circle', cx: 51.2, cy: 24, r: 0.9, tone: 'main' },
    { t: 'text', x: 63, y: 23, text: '纸槽（药匙）', anchor: 'start', size: 3.6 },
    { t: 'text', x: 28, y: 40, text: '试管先平放', size: 3.6, tone: 'muted' },
    { t: 'text', x: 28, y: 47, text: '一斜、二送、三直立', size: 4, tone: 'accent' },
  ],
};

/** 量筒读数：平视、俯视、仰视 */
const figCylinder: SciFigure = {
  id: 'fig-chem-exp-cylinder-1',
  title: '量筒读数的三种视线',
  caption: '视线要与量筒内液体凹液面的最低处保持水平；俯视读数偏大、仰视读数偏小，量取的液体就少了',
  view: 'wide',
  alt: '一支量筒内有液体，凹液面最低处正对 40 毫升刻度；左上方、左侧、左下方三条视线分别表示俯视、平视与仰视，其中平视读数正确',
  prims: [
    { t: 'rect', x: 62, y: 12, w: 10, h: 40 },
    { t: 'rect', x: 62.8, y: 24, w: 8.4, h: 27, fill: true, tone: 'accent' },
    { t: 'curve', points: [[62.8, 22], [67, 24], [71.2, 22]], tone: 'accent' },
    { t: 'line', x1: 56, y1: 24, x2: 82, y2: 24, dashed: true, tone: 'muted' },
    { t: 'line', x1: 72, y1: 11, x2: 74.6, y2: 11 },
    { t: 'line', x1: 72, y1: 24, x2: 74.6, y2: 24 },
    { t: 'line', x1: 72, y1: 37, x2: 74.6, y2: 37 },
    { t: 'line', x1: 72, y1: 50, x2: 74.6, y2: 50 },
    { t: 'text', x: 76, y: 11, text: '50', anchor: 'start', size: 3.4 },
    { t: 'text', x: 76, y: 24, text: '40', anchor: 'start', size: 3.4 },
    { t: 'text', x: 76, y: 37, text: '30', anchor: 'start', size: 3.4 },
    { t: 'text', x: 76, y: 50, text: '20', anchor: 'start', size: 3.4 },
    { t: 'arrow', x1: 18, y1: 8, x2: 54, y2: 22, tone: 'danger' },
    { t: 'arrow', x1: 16, y1: 24, x2: 54, y2: 24, tone: 'ok' },
    { t: 'arrow', x1: 18, y1: 44, x2: 54, y2: 26.5, tone: 'accent' },
    { t: 'circle', cx: 16, cy: 8, r: 1.6, fill: true, tone: 'danger' },
    { t: 'circle', cx: 14, cy: 24, r: 1.6, fill: true, tone: 'ok' },
    { t: 'circle', cx: 16, cy: 44, r: 1.6, fill: true, tone: 'accent' },
    { t: 'text', x: 32, y: 16, text: '俯视 → 读数偏大', size: 3.6, tone: 'danger' },
    { t: 'text', x: 32, y: 31, text: '平视 → 读数正确', size: 3.6, tone: 'ok' },
    { t: 'text', x: 32, y: 41, text: '仰视 → 读数偏小', size: 3.6, tone: 'accent' },
    { t: 'text', x: 67, y: 57, text: '量筒（50 mL）', size: 3.6 },
  ],
};

/** 闻气味：错误做法与正确做法 */
const figSmell: SciFigure = {
  id: 'fig-chem-exp-smell-1',
  title: '闻气味的错误做法与正确做法',
  caption: '左：把鼻孔凑到容器口去闻，可能被刺激性气体伤害——错误；右：用手在瓶口轻轻扇动，让少量气体飘入鼻孔——正确',
  view: 'wide',
  alt: '左边一个鼻子紧贴试剂瓶口并打叉，右边试剂瓶口有两条弧线表示用手轻轻扇动，气体飘向较远的鼻子并打勾',
  prims: [
    { t: 'text', x: 22, y: 8, text: '错误', size: 4, tone: 'danger' },
    { t: 'rect', x: 15, y: 20, w: 14, h: 14 },
    { t: 'rect', x: 19, y: 16, w: 6, h: 4 },
    { t: 'circle', cx: 22, cy: 10, r: 4.6 },
    { t: 'text', x: 22, y: 10, text: '鼻', size: 3.2 },
    { t: 'text', x: 36, y: 14, text: '×', size: 7, tone: 'danger' },
    { t: 'text', x: 22, y: 44, text: '把鼻子凑到瓶口', size: 3.4, tone: 'danger' },
    { t: 'text', x: 78, y: 8, text: '正确', size: 4, tone: 'ok' },
    { t: 'rect', x: 71, y: 20, w: 14, h: 14 },
    { t: 'rect', x: 75, y: 16, w: 6, h: 4 },
    { t: 'circle', cx: 58, cy: 40, r: 4.6 },
    { t: 'text', x: 58, y: 40, text: '鼻', size: 3.2 },
    { t: 'curve', points: [[72, 17], [66, 25], [62, 33]], tone: 'ok', arrow: true },
    { t: 'curve', points: [[79, 14], [70, 20], [64, 31]], tone: 'ok', arrow: true },
    { t: 'text', x: 92, y: 34, text: '√', size: 7, tone: 'ok' },
    { t: 'text', x: 78, y: 48, text: '用手轻轻扇动', size: 3.4, tone: 'ok' },
  ],
};

/** 加热试管中的液体 */
const figHeatLiquid: SciFigure = {
  id: 'fig-chem-exp-heat-liquid-1',
  title: '给试管里的液体加热',
  caption: '试管与桌面约成 45° 角、管口向上，液体不超过试管容积的 1/3，先预热再对准药品部位用外焰加热',
  view: 'wide',
  alt: '一支倾斜约 45 度、管口朝右上方的试管，管内液体约占三分之一，试管夹夹在靠近管口处，下方酒精灯用外焰加热',
  prims: [
    { t: 'testTube', x: 34, y: 22, h: 30, w: 9, tilt: 45, liquid: 0.3, color: 'colorless' },
    { t: 'line', x1: 46.5, y1: 8.5, x2: 56, y2: 12.5, width: 1.6 },
    { t: 'alcoholLamp', x: 27, y: 50, lit: true },
    { t: 'text', x: 16, y: 22, text: '约 45°', size: 3.6, tone: 'muted' },
    { t: 'text', x: 70, y: 12, text: '试管夹夹在距管口约 1/3 处', size: 3.4 },
    { t: 'text', x: 70, y: 24, text: '液体不超过试管容积的 1/3', size: 3.4 },
    { t: 'text', x: 70, y: 36, text: '管口不能对着自己或他人', size: 3.4, tone: 'danger' },
    { t: 'text', x: 30, y: 59, text: '用酒精灯外焰加热', size: 3.4 },
  ],
};

/** 过滤装置 */
const figFilter: SciFigure = {
  id: 'fig-chem-exp-filter-1',
  title: '过滤：一贴二低三靠',
  caption: '滤纸紧贴漏斗内壁；滤纸边缘低于漏斗口、液面低于滤纸边缘；烧杯口靠玻璃棒、玻璃棒靠三层滤纸、漏斗下端管口靠烧杯内壁',
  view: 'wide',
  alt: '铁架台的铁圈上放着漏斗，漏斗内壁贴着滤纸、滤纸内有待过滤的液体，玻璃棒斜插在漏斗中引流，漏斗下端管口靠在下方烧杯的内壁上',
  prims: [
    { t: 'stand', x: 16, y: 52, h: 40, w: 18, clamps: [0.62], label: '铁架台' },
    { t: 'beaker', x: 25, y: 40, w: 18, h: 14, fill: 0.35 },
    { t: 'poly', points: [[20.9, 28.5], [33.1, 28.5], [31, 34.5], [23, 34.5]], fill: true, tone: 'accent' },
    { t: 'line', x1: 19.6, y1: 26, x2: 25.8, y2: 36.4, dashed: true, tone: 'muted' },
    { t: 'line', x1: 34.4, y1: 26, x2: 28.2, y2: 36.4, dashed: true, tone: 'muted' },
    { t: 'funnel', x: 27, y: 35, h: 20 },
    { t: 'line', x1: 37, y1: 8, x2: 29.4, y2: 26.6, width: 1.5 },
    { t: 'text', x: 40, y: 8, text: '玻璃棒', anchor: 'start', size: 3.6 },
    { t: 'text', x: 30, y: 58, text: '滤纸（紧贴内壁）', size: 3.4, tone: 'muted' },
    { t: 'text', x: 72, y: 12, text: '一贴：滤纸紧贴漏斗内壁', size: 3.4 },
    { t: 'text', x: 72, y: 20, text: '二低：滤纸边缘低于漏斗口', size: 3.4 },
    { t: 'text', x: 72, y: 28, text: '　　　液面低于滤纸边缘', size: 3.4 },
    { t: 'text', x: 72, y: 36, text: '三靠：漏斗下端管口靠烧杯内壁', size: 3.4 },
    { t: 'text', x: 72, y: 44, text: '　　　玻璃棒轻靠三层滤纸处', size: 3.4 },
    { t: 'text', x: 72, y: 52, text: '　　　烧杯口紧靠玻璃棒', size: 3.4 },
  ],
};

/** 蒸发 */
const figEvaporate: SciFigure = {
  id: 'fig-chem-exp-evaporate-1',
  title: '蒸发：蒸发皿、玻璃棒与酒精灯',
  caption: '蒸发皿放在铁圈上直接用酒精灯加热，边加热边用玻璃棒搅拌；出现较多固体时就停止加热，用余热把剩余水分蒸干',
  view: 'wide',
  alt: '铁架台的铁圈上放着盛有液体的蒸发皿，玻璃棒插在皿中搅拌，蒸发皿下方酒精灯加热，右侧标注搅拌与停止加热的时机',
  prims: [
    { t: 'stand', x: 26, y: 52, h: 42, w: 18, clamps: [0.6], label: '铁架台' },
    { t: 'poly', points: [[32.5, 28], [49.5, 28], [45, 34], [36, 34]], fill: true, tone: 'accent' },
    { t: 'curve', points: [[30, 27], [36, 35], [46, 35], [52, 27]], width: 0.7 },
    { t: 'line', x1: 44, y1: 10, x2: 43, y2: 30, width: 1.5 },
    { t: 'alcoholLamp', x: 41, y: 50, lit: true },
    { t: 'text', x: 41, y: 41, text: '蒸发皿', size: 3.6 },
    { t: 'text', x: 70, y: 12, text: '玻璃棒不断搅拌，防止局部过热', size: 3.4 },
    { t: 'text', x: 70, y: 20, text: '造成液滴飞溅', size: 3.4 },
    { t: 'text', x: 70, y: 32, text: '出现较多固体时停止加热，', size: 3.4, tone: 'accent' },
    { t: 'text', x: 70, y: 40, text: '用余热把剩余水分蒸干', size: 3.4, tone: 'accent' },
    { t: 'text', x: 70, y: 52, text: '蒸发皿可直接加热，不必垫石棉网', size: 3.4 },
  ],
};

/** 稀释浓硫酸 */
const figDilute: SciFigure = {
  id: 'fig-chem-exp-dilute-1',
  title: '稀释浓硫酸：酸入水，边倒边搅拌',
  caption: '把浓硫酸沿器壁慢慢倒入水中，并用玻璃棒不断搅拌散热；绝不能把水倒入浓硫酸中',
  view: 'wide',
  alt: '浓硫酸试剂瓶在烧杯上方，一股液体沿烧杯内壁缓缓流下与杯中的水混合，玻璃棒斜插在烧杯中不断搅拌，右侧标注不能把水倒入浓硫酸中',
  prims: [
    { t: 'beaker', x: 30, y: 26, w: 26, h: 26, fill: 0.55 },
    { t: 'rect', x: 20, y: 8, w: 9, h: 11 },
    { t: 'rect', x: 22.5, y: 5, w: 4, h: 3 },
    { t: 'curve', points: [[24.5, 19], [29, 24], [31, 30], [31, 45]], tone: 'accent' },
    { t: 'line', x1: 56, y1: 16, x2: 46, y2: 42, width: 1.5 },
    { t: 'text', x: 22, y: 24, text: '浓硫酸', size: 3.6 },
    { t: 'text', x: 58, y: 10, text: '浓硫酸沿器壁慢慢倒入水中', anchor: 'start', size: 3.4, tone: 'accent' },
    { t: 'text', x: 58, y: 20, text: '边倒边用玻璃棒搅拌', anchor: 'start', size: 3.4, tone: 'accent' },
    { t: 'text', x: 30, y: 60, text: '绝不能把水倒入浓硫酸中', size: 3.6, tone: 'danger' },
  ],
};

/** 装置气密性检查（手捂法与长颈漏斗液面差法） */
const figAirTight: SciFigure = {
  id: 'fig-chem-exp-airtight-1',
  title: '检查装置的气密性：手捂法与液面差法',
  caption: 'A：把导管末端浸入水中，用手紧握试管外壁，导管口有气泡冒出、松手后导管内形成一段水柱，说明气密性良好；B：夹紧导管，从长颈漏斗加水，静置后漏斗内水柱高度不变，说明气密性良好',
  view: 'wide',
  alt: '左图试管口塞着带导管的塞子，导管另一端浸在烧杯的水中并有气泡冒出；右图锥形瓶上插着长颈漏斗，漏斗内有水柱，导管被止水夹夹紧',
  prims: [
    { t: 'rect', x: 13, y: 16, w: 5, h: 16, rx: 2.5, fill: true, tone: 'muted' },
    { t: 'rect', x: 26, y: 16, w: 5, h: 16, rx: 2.5, fill: true, tone: 'muted' },
    { t: 'testTube', x: 22, y: 20, h: 24, w: 9 },
    { t: 'rect', x: 17, y: 4.6, w: 10, h: 3.4, fill: true },
    { t: 'curve', points: [[22, 6], [22, 2], [36, 2], [44, 6], [52, 14], [52, 34]] },
    { t: 'beaker', x: 44, y: 24, w: 18, h: 14, fill: 0.6 },
    { t: 'circle', cx: 53, cy: 31, r: 0.9, tone: 'ok' },
    { t: 'circle', cx: 52, cy: 32.6, r: 0.8, tone: 'ok' },
    { t: 'circle', cx: 53.6, cy: 33.6, r: 0.7, tone: 'ok' },
    { t: 'text', x: 30, y: 46, text: 'A 用手紧握试管外壁', size: 3.6 },
    { t: 'text', x: 32, y: 54, text: '导管口有气泡冒出，松手后导管内形成一段水柱', size: 3.2 },
    { t: 'poly', points: [[65, 55], [87, 55], [79, 36], [79, 22], [73, 22], [73, 36]], closed: true },
    { t: 'poly', points: [[68.8, 46], [83.2, 46], [86.5, 54], [67.5, 54]], closed: true, fill: true, tone: 'accent' },
    { t: 'funnel', x: 76, y: 32, h: 20, kind: 'long' },
    { t: 'rect', x: 74.6, y: 36, w: 2.8, h: 10, fill: true, tone: 'accent' },
    { t: 'rect', x: 72, y: 19.5, w: 8, h: 3.4, fill: true },
    { t: 'curve', points: [[80, 21], [86, 16], [94, 16]] },
    { t: 'poly', points: [[89, 13.6], [93, 13.6], [93, 18.4], [89, 18.4]], closed: true, tone: 'danger' },
    { t: 'text', x: 80, y: 8, text: 'B 夹紧导管后加水', size: 3.6 },
    { t: 'text', x: 74, y: 60, text: '静置后水柱高度不变→气密性良好', size: 3, tone: 'ok' },
  ],
};

/** 两类发生装置：固固加热型与固液常温型 */
const figDeviceTypes: SciFigure = {
  id: 'fig-chem-exp-device-1',
  title: '气体发生装置的两大类型',
  caption: '左：反应物是固体且需要加热——固固加热型（试管 + 酒精灯）；右：固体与液体在常温下反应——固液常温型（锥形瓶 + 长颈漏斗）',
  view: 'wide',
  alt: '左边是铁架台夹住的试管，管口略向下倾斜、下方酒精灯加热，属于固固加热型发生装置；右边是锥形瓶，瓶塞上插着长颈漏斗与导管，长颈漏斗下端伸入液面以下，属于固液常温型发生装置',
  prims: [
    { t: 'stand', x: 13, y: 50, h: 40, w: 18, clamps: [0.75] },
    { t: 'testTube', x: 32, y: 22, h: 34, w: 10, tilt: 102 },
    { t: 'alcoholLamp', x: 26, y: 42, lit: true },
    { t: 'text', x: 32, y: 8, text: '固固加热型', size: 4, tone: 'accent' },
    { t: 'text', x: 32, y: 60, text: '试管口略向下倾斜', size: 3.2, tone: 'muted' },
    { t: 'poly', points: [[57, 55], [79, 55], [71, 36], [71, 22], [65, 22], [65, 36]], closed: true },
    { t: 'poly', points: [[60.8, 46], [75.2, 46], [78.5, 54], [59.5, 54]], closed: true, fill: true, tone: 'accent' },
    { t: 'funnel', x: 68, y: 32, h: 20, kind: 'long' },
    { t: 'rect', x: 64, y: 19.5, w: 8, h: 3.4, fill: true },
    { t: 'curve', points: [[72, 21], [78, 16], [86, 16]] },
    { t: 'text', x: 72, y: 8, text: '固液常温型', size: 4, tone: 'accent' },
    { t: 'text', x: 72, y: 60, text: '长颈漏斗下端伸入液面以下', size: 3.2, tone: 'muted' },
    { t: 'text', x: 92, y: 40, text: '固体+液体', size: 3.4, tone: 'muted' },
  ],
};

/** 三种收集方法对比 */
const figCollect3: SciFigure = {
  id: 'fig-chem-exp-collect-3',
  title: '三种收集方法：排水法、向上排空气法、向下排空气法',
  caption: '排水法：集气瓶倒置、装满水，导管只伸到瓶口；向上排空气法：集气瓶正放（瓶口向上），导管伸到瓶底，适合密度比空气大的气体；向下排空气法：集气瓶倒放（瓶口向下），导管伸到瓶的深处，适合密度比空气小的气体',
  view: 'wide',
  alt: '左边水槽里倒置的集气瓶装满水，导管口伸到瓶口处；中间正放的集气瓶口向上，导管伸到接近瓶底；右边倒放的集气瓶口向下，导管从下方伸到瓶的深处',
  prims: [
    { t: 'text', x: 18, y: 6, text: '排水法', size: 4, tone: 'accent' },
    { t: 'beaker', x: 2, y: 34, w: 32, h: 18, fill: 0.85 },
    { t: 'poly', points: [[14, 42], [14, 20], [30, 20], [30, 42]], tone: 'main' },
    { t: 'rect', x: 14.6, y: 21, w: 14.8, h: 20, fill: true, tone: 'accent' },
    { t: 'curve', points: [[0, 30], [6, 32], [9, 38], [9, 48], [17, 48], [17, 41]], width: 0.7 },
    { t: 'text', x: 16, y: 58, text: '倒置、装满水，导管到瓶口', size: 2.9, tone: 'muted' },
    { t: 'text', x: 50, y: 6, text: '向上排空气法', size: 4, tone: 'accent' },
    { t: 'rect', x: 42, y: 20, w: 17, h: 24 },
    { t: 'curve', points: [[42, 12], [50, 10], [50, 40]], width: 0.7 },
    { t: 'text', x: 50, y: 50, text: '正放（瓶口向上）', size: 3.2 },
    { t: 'text', x: 50, y: 57, text: '导管伸到接近瓶底', size: 3.2, tone: 'muted' },
    { t: 'text', x: 83, y: 6, text: '向下排空气法', size: 4, tone: 'accent' },
    { t: 'poly', points: [[74, 46], [74, 20], [93, 20], [93, 46]], tone: 'main' },
    { t: 'curve', points: [[68, 34], [70, 44], [78, 50], [81, 50], [81, 24]], width: 0.7 },
    { t: 'text', x: 83, y: 52, text: '倒放（瓶口向下）', size: 3.2 },
    { t: 'text', x: 83, y: 58, text: '导管伸到瓶的深处', size: 3.2, tone: 'muted' },
  ],
};

/** 尾气处理 */
const figTailGas: SciFigure = {
  id: 'fig-chem-exp-tailgas-1',
  title: '尾气处理：气球收集与点燃',
  caption: '有毒气体（如一氧化碳）的尾气不能直接排入空气：可以用气球收集起来，也可以点燃使其转化为二氧化碳',
  view: 'wide',
  alt: '一个集气瓶上方接一根导管，导管另一端系着气球把尾气收集起来；旁边标注有毒尾气可用气球收集或点燃处理',
  prims: [
    { t: 'rect', x: 24, y: 26, w: 20, h: 26 },
    { t: 'line', x1: 34, y1: 26, x2: 34, y2: 18 },
    { t: 'line', x1: 34, y1: 18, x2: 46, y2: 18 },
    { t: 'circle', cx: 52, cy: 18, r: 6, fill: true, tone: 'accent' },
    { t: 'text', x: 34, y: 58, text: '集气瓶（收集尾气）', size: 3.4 },
    { t: 'text', x: 52, y: 30, text: '气球', size: 3.6 },
    { t: 'text', x: 78, y: 22, text: '有毒尾气不能直接排入空气', size: 3.4, tone: 'danger' },
    { t: 'text', x: 78, y: 32, text: '用气球收集或点燃处理', size: 3.4, tone: 'ok' },
  ],
};

/** 加热高锰酸钾制氧气（排水法收集）——本模块最重要的一张装置图 */
const figKMnO4O2: SciFigure = {
  id: 'fig-chem-exp-kmno4-1',
  title: '加热高锰酸钾制氧气（排水法收集）',
  caption: '试管口略向下倾斜、管口塞一团棉花，导管只伸到集气瓶口，集气瓶倒置并装满水',
  view: 'wide',
  alt: '铁架台夹住一支口略向下倾斜的试管，管口塞着一团棉花，试管下方酒精灯加热，导管从管口经水槽伸到倒置、装满水的集气瓶口',
  prims: [
    { t: 'stand', x: 12, y: 50, h: 40, w: 18, clamps: [0.75], label: '铁架台' },
    { t: 'testTube', x: 32, y: 22, h: 34, w: 10, tilt: 102 },
    { t: 'hatch', x: 44, y: 22.5, w: 4.4, h: 5.5, gap: 1.1, tone: 'muted' },
    { t: 'alcoholLamp', x: 25, y: 42, lit: true },
    { t: 'beaker', x: 64, y: 40, w: 32, h: 16, fill: 0.8 },
    { t: 'poly', points: [[76, 47], [76, 25], [92, 25], [92, 47]], closed: false },
    { t: 'rect', x: 76.6, y: 26, w: 14.8, h: 20.5, fill: true, tone: 'accent' },
    { t: 'curve', points: [[49, 25.5], [56, 27], [62, 31], [66, 40], [66, 50], [74, 52], [79, 52], [79, 46]], width: 0.7 },
    { t: 'text', x: 52, y: 16, text: '棉花', anchor: 'start', size: 3.2, tone: 'muted' },
    { t: 'text', x: 84, y: 20, text: '集气瓶倒置、装满水', size: 3 },
    { t: 'text', x: 18, y: 60, text: '试管口略向下倾斜', size: 3.2 },
    { t: 'text', x: 64, y: 8, text: '导管只伸到集气瓶口', size: 3.2, tone: 'accent' },
    { t: 'text', x: 98, y: 60, text: '水槽', anchor: 'end', size: 3.2 },
  ],
};

/** 过氧化氢制氧气（固液常温型 + 向上排空气法） */
const figH2O2O2: SciFigure = {
  id: 'fig-chem-exp-h2o2-1',
  title: '过氧化氢溶液制氧气（向上排空气法收集）',
  caption: '锥形瓶里放二氧化锰，从长颈漏斗加入过氧化氢溶液；长颈漏斗下端要伸入液面以下，导管伸到集气瓶底部',
  view: 'wide',
  alt: '锥形瓶塞着双孔塞，一孔插长颈漏斗且下端伸入液面以下，另一孔插导管，导管通到正放的集气瓶里并接近瓶底',
  prims: [
    { t: 'poly', points: [[17, 53], [39, 53], [31, 34], [31, 20], [25, 20], [25, 34]], closed: true },
    { t: 'poly', points: [[20.8, 44], [35.2, 44], [38.5, 52], [17.5, 52]], closed: true, fill: true, tone: 'accent' },
    { t: 'circle', cx: 22, cy: 50, r: 1, fill: true, tone: 'main' },
    { t: 'circle', cx: 27, cy: 51, r: 1, fill: true, tone: 'main' },
    { t: 'circle', cx: 31, cy: 50, r: 1, fill: true, tone: 'main' },
    { t: 'rect', x: 24, y: 17.5, w: 8, h: 3.4, fill: true },
    { t: 'funnel', x: 28, y: 30, h: 20, kind: 'long' },
    { t: 'gasJar', x: 74, y: 32, w: 20, h: 26 },
    { t: 'curve', points: [[32, 19], [40, 15], [50, 14], [58, 13], [64, 14], [66, 20], [66, 40]], width: 0.7 },
    { t: 'text', x: 27, y: 12, text: '长颈漏斗下端伸入液面以下', size: 3 },
    { t: 'text', x: 26, y: 59, text: '锥形瓶：过氧化氢溶液 + 二氧化锰', size: 3 },
    { t: 'text', x: 74, y: 51, text: '集气瓶正放（瓶口向上）', size: 3 },
    { t: 'text', x: 74, y: 57, text: '导管伸到接近瓶底', size: 3, tone: 'accent' },
  ],
};

/** 氧气的验满与检验 */
const figO2Verify: SciFigure = {
  id: 'fig-chem-exp-o2-verify-1',
  title: '氧气的验满与检验',
  caption: '验满：把带火星的木条放在集气瓶口，木条复燃说明已收集满；检验：把带火星的木条伸入集气瓶中，木条复燃说明瓶中是氧气',
  view: 'wide',
  alt: '左图一支带火星的木条放在正放集气瓶的瓶口处，木条复燃；右图一支带火星的木条伸入集气瓶内部，木条复燃',
  prims: [
    { t: 'text', x: 20, y: 10, text: '验满', size: 4, tone: 'accent' },
    { t: 'gasJar', x: 20, y: 32, w: 20, h: 26 },
    { t: 'line', x1: 13, y1: 4, x2: 17.4, y2: 15, width: 1.4 },
    { t: 'circle', cx: 18, cy: 16.4, r: 1.2, fill: true, tone: 'danger' },
    { t: 'text', x: 20, y: 52, text: '带火星的木条放在集气瓶口', size: 3.2 },
    { t: 'text', x: 20, y: 58, text: '木条复燃 → 已收集满', size: 3.2, tone: 'ok' },
    { t: 'line', x1: 50, y1: 4, x2: 50, y2: 56, dashed: true, tone: 'muted' },
    { t: 'text', x: 72, y: 10, text: '检验', size: 4, tone: 'accent' },
    { t: 'gasJar', x: 74, y: 32, w: 20, h: 26 },
    { t: 'line', x1: 64, y1: 2, x2: 68.4, y2: 13, width: 1.4 },
    { t: 'circle', cx: 69, cy: 14.4, r: 1.2, fill: true, tone: 'danger' },
    { t: 'line', x1: 68.4, y1: 13, x2: 71, y2: 24, width: 1.4 },
    { t: 'circle', cx: 71.4, cy: 25.4, r: 1.2, fill: true, tone: 'danger' },
    { t: 'text', x: 74, y: 52, text: '带火星的木条伸入集气瓶中', size: 3.2 },
    { t: 'text', x: 74, y: 58, text: '木条复燃 → 是氧气', size: 3.2, tone: 'ok' },
  ],
};

/** 铁丝在氧气中燃烧 */
const figFeBurn: SciFigure = {
  id: 'fig-chem-exp-fe-1',
  title: '铁丝在氧气中燃烧',
  caption: '铁丝在氧气中剧烈燃烧、火星四射，生成黑色固体四氧化三铁；瓶底预先放少量水或细沙，防止熔化物溅落炸裂瓶底',
  view: 'wide',
  alt: '集气瓶里一段绕成螺旋状的铁丝正在剧烈燃烧、火星四射，瓶底预先放有少量水',
  prims: [
    { t: 'gasJar', x: 40, y: 32, w: 24, h: 30 },
    { t: 'rect', x: 28.8, y: 41, w: 22.4, h: 5.5, fill: true, tone: 'accent' },
    { t: 'line', x1: 40, y1: 4, x2: 40, y2: 22, width: 0.9 },
    { t: 'curve', points: [[40, 23], [36, 25], [44, 27], [36, 29], [44, 31], [40, 33]], width: 0.8 },
    { t: 'dot', x: 33, y: 22 },
    { t: 'dot', x: 47, y: 24 },
    { t: 'dot', x: 35, y: 33 },
    { t: 'dot', x: 46, y: 30 },
    { t: 'dot', x: 41, y: 18 },
    { t: 'text', x: 40, y: 57, text: '铁丝在氧气中剧烈燃烧', size: 3.4 },
    { t: 'text', x: 78, y: 20, text: '现象：剧烈燃烧、火星四射', size: 3.2, tone: 'accent' },
    { t: 'text', x: 78, y: 28, text: '生成黑色固体 Fe₃O₄', size: 3.2 },
    { t: 'text', x: 78, y: 36, text: '瓶底放少量水或细沙', size: 3.2, tone: 'danger' },
    { t: 'text', x: 78, y: 44, text: '铁丝绕成螺旋状增大受热面积', size: 3.2, tone: 'muted' },
  ],
};

/** 二氧化碳的实验室制取（向上排空气法） */
const figCO2Prepare: SciFigure = {
  id: 'fig-chem-exp-co2-1',
  title: '实验室制取二氧化碳（向上排空气法收集）',
  caption: '锥形瓶里放大理石（石灰石），从长颈漏斗加入稀盐酸；二氧化碳密度比空气大，用向上排空气法收集，导管伸到接近瓶底',
  view: 'wide',
  alt: '锥形瓶内有大理石块和稀盐酸，长颈漏斗下端伸入液面以下，导管通到正放的集气瓶里接近瓶底，旁边放着玻璃片',
  prims: [
    { t: 'poly', points: [[15, 55], [37, 55], [29, 36], [29, 22], [23, 22], [23, 36]], closed: true },
    { t: 'poly', points: [[18.8, 46], [33.2, 46], [36.5, 54], [15.5, 54]], closed: true, fill: true, tone: 'accent' },
    { t: 'circle', cx: 20, cy: 52, r: 1.2, fill: true, tone: 'muted' },
    { t: 'circle', cx: 25, cy: 53, r: 1.2, fill: true, tone: 'muted' },
    { t: 'circle', cx: 30, cy: 52, r: 1.2, fill: true, tone: 'muted' },
    { t: 'rect', x: 22, y: 19.5, w: 8, h: 3.4, fill: true },
    { t: 'funnel', x: 26, y: 32, h: 20, kind: 'long' },
    { t: 'gasJar', x: 74, y: 34, w: 20, h: 26 },
    { t: 'curve', points: [[30, 21], [38, 17], [48, 15], [58, 14], [64, 16], [66, 22], [66, 42]], width: 0.7 },
    { t: 'rect', x: 86, y: 26, w: 12, h: 2 },
    { t: 'text', x: 26, y: 14, text: '长颈漏斗下端伸入液面以下', size: 2.9 },
    { t: 'text', x: 26, y: 60, text: '锥形瓶：大理石（石灰石）+ 稀盐酸', size: 3 },
    { t: 'text', x: 74, y: 52, text: '集气瓶正放、导管伸到接近瓶底', size: 3 },
    { t: 'text', x: 92, y: 32, text: '玻璃片', size: 3 },
  ],
};

/** 二氧化碳的检验与验满 */
const figCO2Verify: SciFigure = {
  id: 'fig-chem-exp-co2-verify-1',
  title: '二氧化碳的检验与验满',
  caption: '检验：把气体通入澄清石灰水，石灰水变浑浊；验满：把燃着的木条放在集气瓶口，木条熄灭说明已收集满',
  view: 'wide',
  alt: '左图导管把气体通入盛有澄清石灰水的试管，试管内液体变浑浊；右图一支燃着的木条放在正放集气瓶的瓶口，火焰熄灭',
  prims: [
    { t: 'text', x: 24, y: 8, text: '检验', size: 4, tone: 'accent' },
    { t: 'testTube', x: 24, y: 30, h: 26, w: 10 },
    { t: 'poly', points: [[19.6, 31], [28.4, 31], [28.4, 38], [26.8, 41.6], [21.2, 41.6], [19.6, 38]], closed: true, fill: true, tone: 'accent' },
    { t: 'circle', cx: 22, cy: 35, r: 0.6, fill: true, tone: 'main' },
    { t: 'circle', cx: 26, cy: 37, r: 0.6, fill: true, tone: 'main' },
    { t: 'circle', cx: 24, cy: 39.5, r: 0.6, fill: true, tone: 'main' },
    { t: 'circle', cx: 26.6, cy: 34, r: 0.6, fill: true, tone: 'main' },
    { t: 'curve', points: [[42, 6], [30, 8], [24, 13], [24, 34]], width: 0.7 },
    { t: 'text', x: 24, y: 52, text: '澄清石灰水变浑浊', size: 3.2, tone: 'ok' },
    { t: 'text', x: 24, y: 58, text: 'CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O', size: 3 },
    { t: 'line', x1: 52, y1: 4, x2: 52, y2: 56, dashed: true, tone: 'muted' },
    { t: 'text', x: 74, y: 8, text: '验满', size: 4, tone: 'accent' },
    { t: 'gasJar', x: 74, y: 34, w: 20, h: 26 },
    { t: 'line', x1: 67, y1: 8, x2: 71.4, y2: 19, width: 1.4 },
    { t: 'circle', cx: 72, cy: 20.4, r: 1.1, fill: true, tone: 'muted' },
    { t: 'text', x: 74, y: 52, text: '燃着的木条放在集气瓶口', size: 3.2 },
    { t: 'text', x: 74, y: 58, text: '木条熄灭 → 已收集满', size: 3.2, tone: 'ok' },
  ],
};

/** 控制变量：探究二氧化锰对过氧化氢分解速率的影响 */
const figControlVar: SciFigure = {
  id: 'fig-chem-exp-control-1',
  title: '控制变量：其他条件相同，只改变一个变量',
  caption: '两支试管都取等体积、等浓度的过氧化氢溶液，只有一支加入二氧化锰——加二氧化锰的那支产生气泡明显快得多',
  view: 'wide',
  alt: '左右两支试管盛有等量的过氧化氢溶液，左管几乎不冒气泡，右管加入了少量二氧化锰并产生大量气泡',
  prims: [
    { t: 'testTube', x: 26, y: 30, h: 26, w: 10 },
    { t: 'poly', points: [[21.6, 32], [30.4, 32], [30.4, 38], [29, 41.6], [23, 41.6], [21.6, 38]], closed: true, fill: true, tone: 'accent' },
    { t: 'circle', cx: 25, cy: 35, r: 0.7, tone: 'ok' },
    { t: 'circle', cx: 28, cy: 32, r: 0.6, tone: 'ok' },
    { t: 'text', x: 26, y: 52, text: '5% 过氧化氢溶液', size: 3.2 },
    { t: 'text', x: 26, y: 58, text: '气泡很少、反应很慢', size: 3, tone: 'muted' },
    { t: 'line', x1: 50, y1: 4, x2: 50, y2: 52, dashed: true, tone: 'muted' },
    { t: 'testTube', x: 74, y: 30, h: 26, w: 10 },
    { t: 'poly', points: [[69.6, 32], [78.4, 32], [78.4, 38], [77, 41.6], [71, 41.6], [69.6, 38]], closed: true, fill: true, tone: 'accent' },
    { t: 'circle', cx: 72, cy: 40, r: 0.7, fill: true, tone: 'main' },
    { t: 'circle', cx: 76, cy: 40.6, r: 0.7, fill: true, tone: 'main' },
    { t: 'circle', cx: 71, cy: 30, r: 0.9, tone: 'ok' },
    { t: 'circle', cx: 77, cy: 27, r: 0.9, tone: 'ok' },
    { t: 'circle', cx: 73.6, cy: 24, r: 0.9, tone: 'ok' },
    { t: 'circle', cx: 78, cy: 34, r: 0.8, tone: 'ok' },
    { t: 'circle', cx: 70, cy: 36, r: 0.8, tone: 'ok' },
    { t: 'text', x: 74, y: 52, text: '5% 过氧化氢溶液 + 少量 MnO₂', size: 3.2 },
    { t: 'text', x: 74, y: 58, text: '气泡多、反应快得多', size: 3, tone: 'ok' },
    { t: 'text', x: 50, y: 10, text: '只有二氧化锰这一个变量不同', size: 3.2, tone: 'accent' },
  ],
};

/** 测定空气中氧气的含量（误差分析） */
const figRedP: SciFigure = {
  id: 'fig-chem-exp-redp-1',
  title: '测定空气中氧气的含量：现象、结论与误差',
  caption: '红磷足量、装置不漏气、冷却后再打开止水夹，水倒流约集气瓶容积的 1/5，说明氧气约占空气体积的 1/5',
  view: 'wide',
  alt: '集气瓶内燃烧匙中放有足量红磷，瓶口塞紧带导管的塞子，导管经止水夹通到烧杯的水中，图旁列出结果偏小的三种常见原因',
  prims: [
    { t: 'gasJar', x: 30, y: 32, w: 22, h: 28 },
    { t: 'rect', x: 19.8, y: 41, w: 20.4, h: 4.5, fill: true, tone: 'accent' },
    { t: 'rect', x: 26, y: 14.5, w: 8, h: 3.5, fill: true },
    { t: 'line', x1: 30, y1: 16, x2: 30, y2: 26, width: 0.8 },
    { t: 'circle', cx: 30, cy: 27, r: 1.6, fill: true, tone: 'danger' },
    { t: 'line', x1: 33, y1: 27, x2: 42, y2: 26, dashed: true, tone: 'muted' },
    { t: 'curve', points: [[35, 15], [44, 13], [54, 13], [60, 17], [60, 40]], width: 0.7 },
    { t: 'poly', points: [[45, 11], [49, 11], [49, 15], [45, 15]], closed: true, tone: 'danger' },
    { t: 'beaker', x: 52, y: 28, w: 20, h: 16, fill: 0.6 },
    { t: 'text', x: 43, y: 26, text: '红磷（足量）', anchor: 'start', size: 3 },
    { t: 'text', x: 47, y: 8, text: '止水夹', size: 3, tone: 'danger' },
    { t: 'text', x: 62, y: 48, text: '烧杯中的水', size: 3 },
    { t: 'text', x: 30, y: 54, text: '红磷燃烧产生大量白烟', size: 3 },
    { t: 'text', x: 30, y: 60, text: '冷却后打开止水夹，水倒流约 1/5 体积', size: 3 },
    { t: 'text', x: 86, y: 14, text: '结果偏小的常见原因', size: 3.2, tone: 'danger' },
    { t: 'text', x: 86, y: 22, text: '红磷的量不足', size: 3 },
    { t: 'text', x: 86, y: 29, text: '装置漏气', size: 3 },
    { t: 'text', x: 86, y: 36, text: '未冷却就打开止水夹', size: 3 },
  ],
};

/** 实验操作考试的一般流程 */
const figOpFlow: SciFigure = {
  id: 'fig-chem-exp-flow-1',
  title: '实验操作考试的一般流程',
  caption: '进场先清点检查器材与药品，再按题目要求取用药品、规范操作、记录数据，最后整理器材并做好安全处理',
  view: 'wide',
  alt: '五个方框依次用箭头连接，分别写着清点器材、取用药品、规范操作、记录数据、整理器材',
  prims: [
    { t: 'text', x: 50, y: 10, text: '实验操作考试的一般流程', size: 4, tone: 'accent' },
    { t: 'rect', x: 1.5, y: 22, w: 17, h: 14 },
    { t: 'rect', x: 21.5, y: 22, w: 17, h: 14 },
    { t: 'rect', x: 41.5, y: 22, w: 17, h: 14 },
    { t: 'rect', x: 61.5, y: 22, w: 17, h: 14 },
    { t: 'rect', x: 81.5, y: 22, w: 17, h: 14 },
    { t: 'text', x: 10, y: 29, text: '清点器材', size: 2.9 },
    { t: 'text', x: 30, y: 29, text: '取用药品', size: 2.9 },
    { t: 'text', x: 50, y: 29, text: '规范操作', size: 2.9 },
    { t: 'text', x: 70, y: 29, text: '记录数据', size: 2.9 },
    { t: 'text', x: 90, y: 29, text: '整理器材', size: 2.9 },
    { t: 'arrow', x1: 18.5, y1: 29, x2: 21.5, y2: 29 },
    { t: 'arrow', x1: 38.5, y1: 29, x2: 41.5, y2: 29 },
    { t: 'arrow', x1: 58.5, y1: 29, x2: 61.5, y2: 29 },
    { t: 'arrow', x1: 78.5, y1: 29, x2: 81.5, y2: 29 },
    { t: 'text', x: 50, y: 46, text: '评委主要看：器材检查 → 药品取用 → 操作顺序 → 读数与记录', size: 3.2 },
    { t: 'text', x: 50, y: 54, text: '现象描述 → 整理器材与安全处理', size: 3.2 },
  ],
};

/** 先撤导管还是先熄灯 */
const figOrderError: SciFigure = {
  id: 'fig-chem-exp-order-1',
  title: '加热高锰酸钾制氧气：先撤导管，后熄灯',
  caption: '左：先熄灭酒精灯、导管还留在水里——水会倒吸进试管，使试管炸裂；右：先把导管移出水面，再熄灭酒精灯——正确',
  view: 'wide',
  alt: '左图酒精灯已经熄灭而导管仍插在烧杯的水中，标注水倒吸并打叉；右图先把导管移出水面、酒精灯仍在燃烧，打勾表示正确',
  prims: [
    { t: 'testTube', x: 12, y: 16, h: 20, w: 7, tilt: 100 },
    { t: 'alcoholLamp', x: 9, y: 34, lit: false },
    { t: 'beaker', x: 30, y: 30, w: 17, h: 15, fill: 0.6 },
    { t: 'curve', points: [[22, 18], [27, 19], [31, 24], [31, 33], [37, 35], [40, 35], [40, 37]], width: 0.6 },
    { t: 'arrow', x1: 46, y1: 33, x2: 36, y2: 26, tone: 'danger' },
    { t: 'text', x: 40, y: 24, text: '水倒吸', size: 3, tone: 'danger' },
    { t: 'text', x: 22, y: 44, text: '×', size: 6, tone: 'danger' },
    { t: 'text', x: 24, y: 52, text: '错误：先熄灯，后撤导管', size: 3.2, tone: 'danger' },
    { t: 'text', x: 24, y: 58, text: '冷水倒吸使试管炸裂', size: 3, tone: 'danger' },
    { t: 'testTube', x: 62, y: 16, h: 20, w: 7, tilt: 100 },
    { t: 'alcoholLamp', x: 59, y: 34, lit: true },
    { t: 'beaker', x: 80, y: 30, w: 17, h: 15, fill: 0.6 },
    { t: 'curve', points: [[72, 18], [77, 19], [81, 26], [81, 30], [86, 31], [89, 31]], width: 0.6 },
    { t: 'arrow', x1: 89, y1: 30, x2: 89, y2: 22, tone: 'ok' },
    { t: 'text', x: 92, y: 19, text: '① 先撤导管', anchor: 'end', size: 3, tone: 'ok' },
    { t: 'text', x: 62, y: 44, text: '√', size: 6, tone: 'ok' },
    { t: 'text', x: 74, y: 52, text: '正确：先撤导管，后熄灯', size: 3.2, tone: 'ok' },
    { t: 'text', x: 74, y: 58, text: '② 再熄灭酒精灯', size: 3, tone: 'ok' },
  ],
};

/** 判断题用图：用胶头滴管向试管中滴加液体 */
const figQDrop: SciFigure = {
  id: 'fig-chem-exp-q-drop-1',
  title: '用胶头滴管向试管中滴加液体',
  view: 'wide',
  alt: '一支竖直的试管，胶头滴管的尖嘴已经伸入试管内部',
  prims: [
    { t: 'testTube', x: 50, y: 38, h: 26, w: 10 },
    { t: 'line', x1: 50, y1: 10, x2: 50, y2: 34, width: 0.8 },
    { t: 'circle', cx: 50, cy: 7, r: 2.6, fill: true, tone: 'muted' },
    { t: 'text', x: 56, y: 10, text: '胶头滴管', anchor: 'start', size: 3.4 },
    { t: 'text', x: 60, y: 40, text: '试管', anchor: 'start', size: 3.4 },
  ],
};

/** 判断题用图：加热试管中的固体（管口向上倾斜） */
const figQHeatUp: SciFigure = {
  id: 'fig-chem-exp-q-heatup-1',
  title: '加热试管中的固体',
  view: 'wide',
  alt: '铁架台夹住一支试管，试管管口向上倾斜、管底有固体，试管下方用酒精灯加热',
  prims: [
    { t: 'stand', x: 14, y: 50, h: 40, w: 18, clamps: [0.6] },
    { t: 'testTube', x: 34, y: 24, h: 34, w: 10, tilt: 78 },
    { t: 'circle', cx: 22, cy: 29, r: 1, fill: true, tone: 'muted' },
    { t: 'circle', cx: 25, cy: 29.6, r: 1, fill: true, tone: 'muted' },
    { t: 'circle', cx: 28, cy: 30.2, r: 1, fill: true, tone: 'muted' },
    { t: 'alcoholLamp', x: 27, y: 44, lit: true },
  ],
};

/** 判断题用图：三种气体收集装置（甲、乙、丙） */
const figQCollect: SciFigure = {
  id: 'fig-chem-exp-q-collect-1',
  title: '甲、乙、丙三种气体收集装置',
  view: 'wide',
  alt: '甲装置是水槽中倒置且装满水的集气瓶，导管口伸到瓶口；乙装置是瓶口向上的集气瓶，导管伸到接近瓶底；丙装置是瓶口向下的集气瓶，导管从下方伸到瓶的深处',
  prims: [
    { t: 'text', x: 18, y: 6, text: '甲', size: 4 },
    { t: 'beaker', x: 2, y: 34, w: 32, h: 18, fill: 0.85 },
    { t: 'poly', points: [[14, 42], [14, 20], [30, 20], [30, 42]], tone: 'main' },
    { t: 'rect', x: 14.6, y: 21, w: 14.8, h: 20, fill: true, tone: 'accent' },
    { t: 'curve', points: [[0, 30], [6, 32], [9, 38], [9, 48], [17, 48], [17, 41]], width: 0.7 },
    { t: 'text', x: 50, y: 6, text: '乙', size: 4 },
    { t: 'rect', x: 42, y: 20, w: 17, h: 24 },
    { t: 'curve', points: [[42, 12], [50, 10], [50, 40]], width: 0.7 },
    { t: 'text', x: 83, y: 6, text: '丙', size: 4 },
    { t: 'poly', points: [[74, 46], [74, 20], [93, 20], [93, 46]], tone: 'main' },
    { t: 'curve', points: [[68, 34], [70, 44], [78, 50], [81, 50], [81, 24]], width: 0.7 },
  ],
};

/** 判断题用图：实验室制取氧气的装置（不标注结论） */
const figQKMnO4: SciFigure = {
  id: 'fig-chem-exp-q-kmno4-1',
  title: '实验室制取氧气的装置',
  view: 'wide',
  alt: '铁架台夹住一支口略向下倾斜的试管，管口塞着棉花，试管下方酒精灯加热，导管从管口经水槽伸到倒置的集气瓶口',
  prims: [
    { t: 'stand', x: 12, y: 50, h: 40, w: 18, clamps: [0.75] },
    { t: 'testTube', x: 32, y: 22, h: 34, w: 10, tilt: 102 },
    { t: 'hatch', x: 44, y: 22.5, w: 4.4, h: 5.5, gap: 1.1, tone: 'muted' },
    { t: 'alcoholLamp', x: 25, y: 42, lit: true },
    { t: 'beaker', x: 64, y: 40, w: 32, h: 16, fill: 0.8 },
    { t: 'poly', points: [[76, 47], [76, 25], [92, 25], [92, 47]], closed: false },
    { t: 'rect', x: 76.6, y: 26, w: 14.8, h: 20.5, fill: true, tone: 'accent' },
    { t: 'curve', points: [[49, 25.5], [56, 27], [62, 31], [66, 40], [66, 50], [74, 52], [79, 52], [79, 46]], width: 0.7 },
  ],
};

/** 判断题用图：实验室制取二氧化碳的装置（不标注结论） */
const figQCO2: SciFigure = {
  id: 'fig-chem-exp-q-co2-1',
  title: '实验室制取二氧化碳的装置',
  view: 'wide',
  alt: '锥形瓶内有大理石块和稀盐酸，瓶塞上插着长颈漏斗与导管，长颈漏斗下端伸入液面以下，导管通到正放的集气瓶里接近瓶底',
  prims: [
    { t: 'poly', points: [[15, 55], [37, 55], [29, 36], [29, 22], [23, 22], [23, 36]], closed: true },
    { t: 'poly', points: [[18.8, 46], [33.2, 46], [36.5, 54], [15.5, 54]], closed: true, fill: true, tone: 'accent' },
    { t: 'circle', cx: 20, cy: 52, r: 1.2, fill: true, tone: 'muted' },
    { t: 'circle', cx: 25, cy: 53, r: 1.2, fill: true, tone: 'muted' },
    { t: 'circle', cx: 30, cy: 52, r: 1.2, fill: true, tone: 'muted' },
    { t: 'rect', x: 22, y: 19.5, w: 8, h: 3.4, fill: true },
    { t: 'funnel', x: 26, y: 32, h: 20, kind: 'long' },
    { t: 'gasJar', x: 74, y: 34, w: 20, h: 26 },
    { t: 'curve', points: [[30, 21], [38, 17], [48, 15], [58, 14], [64, 16], [66, 22], [66, 42]], width: 0.7 },
  ],
};

export const topics: ChemTopic[] = [
  /* ================================================================ */
  /* 1 · 化学实验基本操作（一）                                        */
  /* ================================================================ */
  {
    id: 'chem-experiment-1',
    unit: '人教版九年级 · 实验基本操作与气体制备',
    grade: 'all',
    title: '化学实验基本操作（一）：药品的取用与仪器的洗涤',
    question: '固体、液体药品各该怎样取？没有说明用量时取多少？闻气味、洗仪器这些「小动作」为什么会扣分？',
    keyIdea: '取用药品守三条底线：不接触、不回放、不超量；没有说明用量时液体取 1—2 mL、固体只需盖满试管底部；闻气味只能用手扇闻，绝不能把鼻子凑到瓶口。',
    steps: [
      {
        heading: '进实验室的第一课：三不原则与「不回放」',
        representation: '宏观',
        body:
          '实验室里的药品很多有腐蚀性、毒性或刺激性。取用药品首先要守住「三不」：不能用手接触药品，不要把鼻孔凑到容器口去闻气味，不得尝任何药品的味道。其次是「不回放」：实验里用剩的药品不要放回原试剂瓶，也不要随意丢弃，要放入指定的容器内。最后是按需取用、节约药品：没有说明用量时，液体取 1—2 mL，固体只需盖满试管底部。',
        note: '「不回放」不是怕浪费，而是怕污染：倒回去的药品哪怕只混入一点杂质，整瓶试剂都可能报废，后面的实验结论就不可靠了。',
      },
      {
        heading: '固体药品的取用：粉末用纸槽，块状用镊子',
        representation: '宏观',
        body:
          '粉末或小颗粒状的药品用药匙（或纸槽）取用：先把试管平放，把盛有药品的药匙或纸槽送到试管底部，再把试管慢慢竖立起来，让药品落到管底，口诀是「一斜、二送、三直立」。块状药品（如石灰石、锌粒）用镊子夹取：先把试管横放，把药品放在管口，再把试管慢慢竖起来，让药品沿着管壁滑到管底，口诀是「一横、二放、三慢竖」。',
        figure: figSolidTrough,
        note: '把块状固体直接丢进竖直的试管，很容易砸破试管底——这是实验操作考试里最常见的扣分动作之一。',
      },
      {
        heading: '液体药品的取用：倾倒、滴管、量筒各管一段',
        representation: '宏观',
        body:
          '取用较多液体时直接倾倒：瓶塞倒放在桌面上（防止沾污），标签向着手心（防止残液流下腐蚀标签），瓶口紧挨试管口，试管稍倾斜。取用少量液体用胶头滴管：滴管要垂直悬空在试管口上方，不能伸入试管内，不能接触试管内壁，也不能平放或倒置。取用一定体积的液体用量筒：量筒要放平，视线与量筒内液体凹液面的最低处保持水平。',
        figure: figCylinder,
        note: '俯视刻度线时读数偏大，实际量取的液体比读数少；仰视时读数偏小，实际量取的液体比读数多。要量 47 mL 水就选 50 mL 的量筒，一次量取、量程最接近。',
      },
      {
        heading: '闻气味与洗涤仪器：都是「细节分」',
        representation: '应用',
        body:
          '闻气体的气味时，用手在瓶口轻轻扇动，只让极少量的气体飘入鼻孔，绝不能把鼻子凑到容器口去闻。实验结束后要及时洗涤仪器：试管、烧杯内壁用试管刷刷洗，刷洗时转动或上下移动试管刷。仪器洗净的标准是内壁附着的水既不聚成水滴，也不成股流下。洗净的试管要倒放在试管架上晾干。',
        figure: figSmell,
        note: '「内壁的水既不聚成水滴，也不成股流下」这句话要能一字不差地写出来，这是中考填空的原话。',
      },
      {
        heading: '常见仪器的名称、用途与「禁区」',
        representation: '应用',
        body:
          '试管用于少量试剂的反应容器，可直接加热；烧杯用于配制溶液和较大量试剂的反应容器，加热时要垫石棉网；量筒只用于量取液体体积，不能加热，也不能作反应容器；集气瓶用于收集和贮存气体，不能加热；蒸发皿可直接加热；药匙取粉末、镊子取块状；玻璃棒用于搅拌、引流和蘸取。',
        note: '「不能加热」的仪器里，量筒与集气瓶考得最多：量筒受热会变形、刻度失准，集气瓶受热容易炸裂。',
      },
    ],
    equations: [
      {
        equation: 'CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O',
        condition: '常温',
        phenomenon: '澄清石灰水变浑浊，出现白色沉淀',
        note: '取用少量液体药品的规范操作，直接决定检验结论是否可靠：用滴管取石灰水时若把滴管伸入试管内，就可能把待检液沾进试剂瓶，污染整瓶石灰水。',
      },
    ],
    experiments: [
      {
        title: '固体药品的取用：块状石灰石与粉末状二氧化锰',
        purpose: '练习用镊子取块状固体、用药匙（纸槽）取粉末状固体，掌握「一横二放三慢竖」与「一斜二送三直立」。',
        apparatus: ['试管（2 支）', '镊子', '药匙', '纸槽（对折的纸条）', '石灰石（块状）', '二氧化锰（粉末）'],
        figure: figSolidTrough,
        steps: [
          '取一支试管横放，用镊子夹取一块石灰石放在管口，再把试管慢慢竖立，让石灰石沿管壁滑到管底。',
          '取另一支试管平放，用药匙（或纸槽）把少量二氧化锰送到试管底部，再把试管慢慢竖立。',
          '观察两支试管内药品的位置与试管是否完好。',
        ],
        phenomenon: '块状石灰石沿倾斜的管壁滑到管底，试管底没有被砸破；粉末状二氧化锰落到管底，试管内壁没有沾上药品。',
        conclusion: '粉末状或小颗粒状药品用药匙或纸槽取用，块状药品用镊子夹取；没有说明用量时，固体只需盖满试管底部。',
        cautions: [
          '不能用手直接接触药品，更不能尝药品的味道。',
          '块状固体不能从竖直的试管口直接丢入，否则会砸破试管底。',
          '取用药品的药匙、镊子用后要擦拭干净，一种药品专用一把药匙。',
          '实验结束后把用剩的药品放入指定容器，不能放回原试剂瓶。',
        ],
      },
      {
        title: '用量筒量取一定体积的液体',
        purpose: '练习选择量筒量程、平视读数与胶头滴管定容。',
        apparatus: ['量筒（10 mL、50 mL 各一支）', '胶头滴管', '烧杯', '水'],
        figure: figCylinder,
        steps: [
          '根据要量取的体积选择量程最接近的量筒：量 5 mL 水选 10 mL 量筒，量 47 mL 水选 50 mL 量筒。',
          '把量筒放在水平桌面上，沿筒壁慢慢倒入水，接近刻度线时改用胶头滴管逐滴滴加。',
          '视线与量筒内液体凹液面的最低处保持水平，读到刻度线为止。',
          '把量好的水沿玻璃棒倒入烧杯，量筒用后洗净放回。',
        ],
        phenomenon: '平视凹液面最低处读数，读数为 5.0 mL；若俯视刻度线，读数会比实际体积偏大；若仰视，读数偏小。',
        conclusion: '量筒读数必须平视凹液面最低处；俯视读数偏大、实际液体偏少，仰视读数偏小、实际液体偏多。',
        cautions: [
          '量筒不能加热，也不能作反应容器或用来溶解固体、稀释浓硫酸。',
          '量筒不能量取热的液体，读数时量筒要放平。',
          '胶头滴管不能伸入容器内、不能接触容器内壁，也不能平放或倒置。',
          '量筒没有零刻度，读数从下往上读。',
        ],
      },
    ],
    apps: [
      {
        title: '取用少量液体做检验',
        scene: '实验桌上有两瓶无色气体，要用澄清石灰水检验其中一瓶是不是二氧化碳。老师只给了少量澄清石灰水。',
        analysis: '取用少量液体药品用胶头滴管：滴管垂直悬空在容器口上方，不能伸入容器内，也不能接触内壁，防止把待检物质带进试剂瓶污染整瓶石灰水。',
        steps: [
          '取下试剂瓶的瓶塞，把瓶塞倒放在桌面上。',
          '把胶头滴管伸到瓶口上方，挤压胶帽吸取少量澄清石灰水（在瓶外挤压排气后再吸液）。',
          '把石灰水滴入盛有待检气体的容器中，轻轻振荡，观察是否变浑浊。',
          '用后立即把滴管洗净（滴瓶上的滴管不用洗），试剂瓶塞好放回原处。',
        ],
        result: '石灰水变浑浊说明该气体是二氧化碳：CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O；若不变浑浊，说明不是二氧化碳。',
      },
      {
        title: '配制 50 g 质量分数为 6% 的氯化钠溶液',
        scene: '实验操作考试常考「配制一定溶质质量分数的溶液」，需要 50 g 质量分数为 6% 的氯化钠溶液。',
        analysis: '先计算：溶质质量 = 50 g × 6% = 3 g，水的质量 = 50 g − 3 g = 47 g（水的密度按 1 g/mL 计，即 47 mL）。称量固体用托盘天平（精确到 0.1 g），量取水用量筒（选 50 mL），溶解时用玻璃棒搅拌。',
        steps: [
          '计算：需要氯化钠 3.0 g、水 47 g（47 mL）。',
          '称量：用托盘天平称取 3.0 g 氯化钠，倒在纸上（有腐蚀性的氢氧化钠要放在玻璃器皿中称量）。',
          '量取：用 50 mL 量筒量取 47 mL 水，读数时视线与凹液面最低处保持水平。',
          '溶解：把氯化钠加入盛水的烧杯中，用玻璃棒搅拌至完全溶解，装瓶并贴上标签。',
        ],
        result: '得到 50 g 质量分数为 6% 的氯化钠溶液；全过程用到的仪器有托盘天平、药匙、量筒、胶头滴管、烧杯、玻璃棒。',
      },
    ],
    formulas: [
      {
        name: '药品取用量的一般规定',
        text: '没有说明用量时：液体取 1—2 mL，固体只需盖满试管底部',
        usage: '所有未指明用量的取用操作；实验操作考试按这一条判定「取量是否规范」',
      },
      {
        name: '量筒的读数规则',
        text: '视线与量筒内液体凹液面的最低处保持水平',
        usage: '量取一定体积的液体时使用；俯视读数偏大、实际偏少，仰视读数偏小、实际偏多',
      },
      {
        name: '量筒量程的选择',
        text: '所选量筒的量程应接近且大于要量取的液体体积，一次量取',
        usage: '量取液体前选量筒：量 5 mL 选 10 mL，量 47 mL 选 50 mL',
      },
      {
        name: '仪器洗净的标准',
        text: '内壁附着的水既不聚成水滴，也不成股流下',
        usage: '判断玻璃仪器是否洗涤干净；洗净后倒放在试管架上晾干',
      },
    ],
    confusions: [
      {
        wrong: '为了闻清楚气体的气味，把鼻孔凑到容器口用力吸气',
        right: '用手在瓶口轻轻扇动，只让极少量的气体飘入鼻孔',
        why: '有些气体有刺激性甚至毒性，凑近猛吸会伤害呼吸道；扇闻时进入鼻腔的气体量很少，既闻到了气味又保证了安全。',
      },
      {
        wrong: '取出的药品没用完，为了不浪费，放回原试剂瓶',
        right: '放入指定的容器内，不能放回原瓶，也不能随意丢弃',
        why: '取出的药品可能已经混入杂质或水汽，倒回瓶里会污染整瓶试剂，后面的实验就做不准了。',
      },
      {
        wrong: '用量筒量取 8 mL 水时俯视刻度线，认为这样量得更多、更保险',
        right: '平视凹液面最低处读数；俯视读数偏大，按偏大的读数停手，实际量取的液体反而偏少',
        why: '俯视时视线斜向下，看到的刻度值比液面实际高度对应的值大，学生以为已经够了就停手，实际体积不足。',
      },
      {
        wrong: '用胶头滴管滴加液体时，把滴管伸入试管内，以免液体洒到外面',
        right: '滴管垂直悬空在试管口上方滴加，不能伸入试管内，也不能接触试管内壁',
        why: '伸入或接触内壁会把试管里的药品沾到滴管上，再取试剂时就污染了整瓶试剂。',
      },
      {
        wrong: '洗净的试管正放在试管架上晾干',
        right: '倒放在试管架上晾干',
        why: '正放时管内残留的水流不出来，还容易落进灰尘；倒放既利于晾干，也能防止污染。',
      },
    ],
    compares: [
      {
        title: '固体药品与液体药品的取用',
        aspect: '同样是「取用药品」，工具、动作和取量规定完全不同',
        left: '固体药品',
        right: '液体药品',
        rows: [
          { item: '取用工具', left: '粉末用药匙或纸槽，块状用镊子', right: '较多时直接倾倒，少量用胶头滴管，一定体积用量筒' },
          { item: '关键动作', left: '一斜二送三直立；一横二放三慢竖', right: '瓶塞倒放、标签向手心、瓶口紧挨容器口' },
          { item: '未说明用量', left: '只需盖满试管底部', right: '取 1—2 mL' },
          { item: '用剩药品', left: '放入指定容器，不能放回原瓶', right: '不能倒回原瓶，也不能随意倒入水槽' },
        ],
      },
    ],
    examAngles: [
      {
        angle: '操作图判断正误',
        detail: '给一幅取用药品或量取液体的操作图，判断正误并说明理由；高频错误点是胶头滴管伸入试管内、标签没有向着手心、瓶塞正放在桌面上、俯视读数。',
      },
      {
        angle: '仪器名称与用途填空',
        detail: '在非选择题里写仪器名称（药匙、镊子、量筒、胶头滴管、集气瓶），并指出某种仪器不能加热或不能作反应容器。',
      },
      {
        angle: '实验操作考试的评分点',
        detail: '现场操作时按「瓶塞倒放、标签向手心、滴管悬空、平视读数、洗净倒放」逐项计分，动作缺失或不完整都要扣分。',
      },
    ],
    materials: [
      {
        id: 'chem-experiment-1-m1',
        material:
          '【原创仿真】小明第一次进化学实验室，做了下面四件事：① 用手拿起一块石灰石，直接丢进竖直的试管里；② 为了闻清楚一瓶试剂的气味，把鼻孔凑到瓶口用力吸气；③ 用量筒量取 5 mL 水时，俯视凹液面的最低处读数；④ 实验结束后把剩余的锌粒倒回原试剂瓶，并把洗净的试管正放在试管架上。',
        questions: [
          {
            id: 'chem-experiment-1-m1-q1',
            stem: '（4 分）逐条指出小明操作中的错误，并写出正确的做法。',
            answer:
              '① 不能用手接触药品，也不能把块状固体丢进竖直的试管；应用镊子夹取，把试管横放、药品放在管口，再把试管慢慢竖立，让药品沿管壁滑到管底。② 不能把鼻孔凑到容器口闻气味；应用手在瓶口轻轻扇动，让少量气体飘入鼻孔。③ 不能俯视读数；视线要与量筒内液体凹液面的最低处保持水平，否则读数偏大、实际量取的液体偏少。④ 用剩的药品不能放回原试剂瓶，应放入指定容器；洗净的试管应倒放在试管架上晾干。',
            rubric: [
              '指出「用手接触药品、块状固体直接丢入试管」并给出「用镊子、一横二放三慢竖」（1 分）',
              '指出「凑到瓶口闻气味」并给出「用手轻轻扇动扇闻」（1 分）',
              '指出「俯视读数」并说明俯视读数偏大、实际偏少，应平视凹液面最低处（1 分）',
              '指出「药品放回原瓶」与「试管正放」并给出正确做法（1 分）',
            ],
          },
          {
            id: 'chem-experiment-1-m1-q2',
            stem: '（3 分）量取 5 mL 水，应选用哪种量筒（10 mL / 50 mL / 100 mL）？为什么？读数时视线应怎样？',
            answer:
              '选 10 mL 的量筒。因为量筒的量程应接近且大于所要量取的液体体积，一次量取，量程太大时刻度间距小、读数误差大。读数时视线要与量筒内液体凹液面的最低处保持水平。',
            rubric: [
              '选出 10 mL 量筒（1 分）',
              '说出「量程接近、一次量取、减小误差」的理由（1 分）',
              '答出「平视凹液面最低处」（1 分）',
            ],
          },
          {
            id: 'chem-experiment-1-m1-q3',
            stem: '（2 分）判断试管是否洗涤干净的标准是什么？洗净后的试管应怎样放置？',
            answer: '试管内壁附着的水既不聚成水滴，也不成股流下，说明已经洗干净；洗净的试管应倒放在试管架上晾干。',
            rubric: ['答出「既不聚成水滴，也不成股流下」（1 分）', '答出「倒放在试管架上晾干」（1 分）'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'chem-experiment-1-q1',
        type: 'choice',
        stem: '如图，向试管中滴加液体。关于这一操作，下列说法正确的是',
        figure: figQDrop,
        options: [
          '胶头滴管应垂直悬空在试管口上方，不能伸入试管内或接触试管内壁',
          '把滴管伸入试管内可以防止液体洒到试管外，是正确的做法',
          '滴管用完后可以平放在桌面上，方便下次取用',
          '取液时应在试管内挤压胶帽排出空气，再吸取液体',
        ],
        answer: 'A',
        explanation:
          'A 正确：滴管垂直悬空滴加，既不污染试剂也不污染试管内的物质。B 错在把滴管伸入试管内，管壁上的物质会沾到滴管上，再取试剂就污染了整瓶试剂。C 错在滴管不能平放或倒置，否则残液会流入胶帽腐蚀橡胶。D 错在排气应在试剂瓶外挤压胶帽，若在试管内排气，会把试管里的物质吸入滴管。',
        difficulty: 1,
        tags: ['基本操作', '药品取用', '胶头滴管'],
      },
      {
        id: 'chem-experiment-1-q2',
        type: 'choice',
        stem: '做实验时没有说明药品的用量，此时取用液体药品的体积一般是',
        options: ['0.5 mL', '1—2 mL', '3—5 mL', '不超过试管容积的 1/3'],
        answer: 'B',
        explanation:
          'B 正确：未说明用量时液体取 1—2 mL。A 太少，现象不明显，不便观察。C 取用过多既浪费药品，加热时还容易溅出伤人。D 是给试管里的液体加热时的上限要求，不是取用量的规定，两个数字不能混用。',
        difficulty: 1,
        tags: ['基本操作', '药品取用'],
      },
      {
        id: 'chem-experiment-1-q3',
        type: 'choice',
        stem: '用量筒量取 8 mL 水，读数时俯视凹液面的最低处，则实际量取的水',
        options: ['等于 8 mL', '大于 8 mL', '小于 8 mL', '无法判断'],
        answer: 'C',
        explanation:
          'C 正确：俯视时视线斜向下，看到的刻度值比液面实际对应的刻度大，读数偏大；按偏大的读数就停止加水，实际量取的水就少于 8 mL。B 是仰视读数的结果（仰视读数偏小、实际偏多）。A 只有在平视凹液面最低处读数时才能做到。D 错，视线方向一定，结果就能判断。',
        difficulty: 2,
        tags: ['基本操作', '量筒', '读数'],
      },
      {
        id: 'chem-experiment-1-q4',
        type: 'choice',
        stem: '关于闻气体的气味，下列做法正确的是',
        options: [
          '把鼻孔凑到瓶口用力吸气，闻得最清楚',
          '用手在瓶口扇动一下后立即把鼻子贴到瓶口',
          '用嘴向瓶内吹气，再把气体吹向鼻子',
          '用手在瓶口轻轻扇动，仅使极少量的气体飘入鼻孔',
        ],
        answer: 'D',
        explanation:
          'D 正确：扇闻时进入鼻腔的气体量很少，既能闻到气味又不会被伤害。A 错在凑近猛吸，有刺激性或毒性的气体会伤害呼吸道。B 虽然用了手扇，但仍有把鼻子贴到瓶口的动作，同样危险。C 错在用嘴吹气会污染试剂，还可能把药品吹出容器。',
        difficulty: 1,
        tags: ['基本操作', '闻气味', '安全'],
      },
      {
        id: 'chem-experiment-1-q5',
        type: 'choice',
        stem: '下列关于仪器使用与洗涤的说法，正确的是',
        options: [
          '洗净的试管应倒放在试管架上晾干',
          '量筒可以直接放在酒精灯火焰上加热',
          '烧杯加热时不需要垫石棉网',
          '集气瓶可以用来加热固体药品',
        ],
        answer: 'A',
        explanation:
          'A 正确：倒放既利于管内残水流出，也能防止灰尘落入。B 错在量筒不能加热，受热会变形、刻度失准，它只用于量取液体体积。C 错在烧杯底面积大、受热不均，加热时必须垫石棉网。D 错在集气瓶用于收集和贮存气体，不能加热，受热容易炸裂。',
        difficulty: 1,
        tags: ['基本操作', '仪器用途'],
      },
      {
        id: 'chem-experiment-1-q6',
        type: 'fill',
        stem: '用量筒量取液体时，读数时视线要与量筒内液体凹液面的____保持水平。',
        answer: '最低处|最低点|最低处保持水平|最低处相平',
        explanation:
          '凹液面的最低处才是读数标准。若俯视刻度线，读数偏大、实际量取的液体偏少；若仰视刻度线，读数偏小、实际量取的液体偏多。两个方向都会让实验结果出现系统误差。',
        difficulty: 1,
        tags: ['基本操作', '量筒', '读数'],
      },
      {
        id: 'chem-experiment-1-q7',
        type: 'fill',
        stem: '取用块状固体药品（如石灰石）时，不能用手直接拿，应该用____夹取。',
        answer: '镊子',
        explanation:
          '块状固体用镊子夹取：先把试管横放，把药品放在管口，再把试管慢慢竖立，让药品沿管壁滑到管底。用手直接拿既可能被腐蚀、被划伤，也会污染药品。粉末状药品才用药匙或纸槽。',
        difficulty: 1,
        tags: ['基本操作', '药品取用', '仪器名称'],
      },
      {
        id: 'chem-experiment-1-q8',
        type: 'short',
        stem: '实验室要配制 50 g 质量分数为 6% 的氯化钠溶液。请计算需要氯化钠和水的质量各是多少，并说明称量固体、量取水时分别用什么仪器、读数要注意什么。',
        answer:
          '氯化钠的质量 = 50 g × 6% = 3 g；水的质量 = 50 g − 3 g = 47 g，水的密度按 1 g/mL 计算，即量取 47 mL 水。称量氯化钠用托盘天平（精确到 0.1 g），把氯化钠放在纸片上称量；量取水用 50 mL 的量筒，读数时视线与凹液面最低处保持水平；最后把氯化钠加入水中，用玻璃棒搅拌至完全溶解。',
        answerSteps: [
          '溶质质量 = 溶液质量 × 溶质质量分数 = 50 g × 6% = 3 g',
          '溶剂质量 = 溶液质量 − 溶质质量 = 50 g − 3 g = 47 g，即 47 mL 水',
          '称量：托盘天平称 3.0 g 氯化钠，药品放在纸片上（精确到 0.1 g）',
          '量取：选 50 mL 量筒量 47 mL 水，平视凹液面最低处读数',
          '溶解：氯化钠加入水中，用玻璃棒搅拌至完全溶解',
        ],
        explanation:
          '这道题的关键是先用「溶液质量 × 溶质质量分数」算出溶质质量，再用溶液质量减去溶质质量得到水的质量。常见错误有三个：把 50 g 当成水的质量；把 6% 直接当成 6 g；算出 47 g 后忘记水的密度约为 1 g/mL，因而说不清该量多少毫升。仪器与读数也要写全：称量用托盘天平（精确到 0.1 g），量取用 50 mL 量筒，读数时视线与凹液面最低处保持水平。',
        rubric: [
          '算出氯化钠 3 g（1 分）',
          '算出水 47 g / 47 mL（1 分）',
          '答出托盘天平称量并说明精确到 0.1 g（1 分）',
          '答出 50 mL 量筒、平视凹液面最低处读数（1 分）',
          '答出用玻璃棒搅拌溶解（1 分）',
        ],
        difficulty: 2,
        tags: ['基本操作', '溶液配制', '计算'],
      },
      {
        id: 'chem-experiment-1-q9',
        type: 'short',
        stem: '一位同学做完实验后这样整理：① 把用剩的锌粒倒回原试剂瓶；② 把量筒放在酒精灯上烘干；③ 洗净的试管正放在试管架上；④ 用手直接拿起一块石灰石放进试管。请逐条评价并改正；另外写出用澄清石灰水检验二氧化碳的化学方程式。',
        answer:
          '① 错：用剩的药品不能放回原试剂瓶，应放入指定的容器内，防止污染整瓶试剂。② 错：量筒不能加热，受热会变形、刻度失准，量筒洗净后应放在指定位置自然晾干。③ 错：洗净的试管应倒放在试管架上晾干，正放时水排不出去还容易落灰。④ 错：不能用手接触药品，应用镊子夹取，把试管横放、药品放在管口后再慢慢竖立。检验二氧化碳的化学方程式：CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O，现象是澄清石灰水变浑浊。',
        explanation:
          '四条错误分别踩中「不回放」「量筒不能加热」「洗净要倒放」「不用手接触药品」四个考点。评价类题目要先判断对错、再写改正做法，只写「错了」拿不到分；方程式必须配平并标出沉淀符号 ↓，Ca(OH)₂ 的下标不能漏。',
        rubric: [
          '① 指出「药品不能放回原瓶」并说明原因（1 分）',
          '② 指出「量筒不能加热」并说明原因（1 分）',
          '③ 指出「试管应倒放」（1 分）',
          '④ 指出「不能用手接触药品，应用镊子」并写出正确取用动作（1 分）',
          '写出 CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O，反应物、生成物、配平、气体/沉淀符号都对（1 分）',
        ],
        difficulty: 2,
        tags: ['基本操作', '化学用语', '评价'],
      },
      {
        id: 'chem-experiment-1-q10',
        type: 'short',
        stem: '请画出「把粉末状固体装入试管」的操作示意图，标出试管应怎样放置、药匙或纸槽应伸到什么位置（画出主要轮廓与标注即可）。',
        answer:
          '试管先平放（管口略向上），把盛有粉末的药匙或纸槽一直送到试管底部，再把试管慢慢竖立起来，使药品落到管底——一斜、二送、三直立。',
        answerFigure: figSolidTrough,
        explanation:
          '作图题的得分点全在位置关系上：试管必须画成平放（横放）的姿态，纸槽或药匙要一直画到试管底部，只画在管口附近等于没画；还要能看出试管底部是圆弧封闭端、管口敞开朝上。把试管画成竖直的，或把药品画在管口，都是常见的失分画法。',
        rubric: [
          '画出试管平放（横放）的姿态（1 分）',
          '药匙或纸槽伸到试管底部（2 分，画在管口附近不给分）',
          '标注出「一斜、二送、三直立」的取用要点（1 分）',
        ],
        difficulty: 2,
        tags: ['基本操作', '作图', '药品取用'],
      },
    ],
  },

  /* ================================================================ */
  /* 2 · 化学实验基本操作（二）                                        */
  /* ================================================================ */
  {
    id: 'chem-experiment-2',
    unit: '人教版九年级 · 实验基本操作与气体制备',
    grade: 'all',
    title: '化学实验基本操作（二）：加热、连接与气密性检查、过滤与蒸发、溶液配制',
    question: '酒精灯怎样用才安全？试管里的液体能装多少、管口朝哪边？装置漏不漏气怎么查？过滤、蒸发、配溶液各有哪些「不能反」的顺序？',
    keyIdea: '加热用外焰，试管加热液体不超过容积的 1/3 且管口不对着人；装置连接好先查气密性、后装药品；过滤守「一贴二低三靠」，蒸发到出现较多固体就停止加热；稀释浓硫酸只能把酸倒入水中。',
    steps: [
      {
        heading: '酒精灯：外焰加热、灯帽盖灭',
        representation: '宏观',
        body:
          '酒精灯是实验室最常用的加热工具。灯内酒精量不少于容积的 1/4、不超过 2/3；要用火柴点燃，绝不能用一只燃着的酒精灯去点燃另一只；加热时用外焰（外焰温度最高，焰心温度最低）；熄灭时用灯帽盖灭，盖灭后把灯帽提起再盖一次，防止灯内冷却形成负压使灯帽打不开。无论如何都不能用嘴吹灭酒精灯。',
        note: '「用嘴吹灭」是实验操作考试中的典型扣分动作，因为火焰可能被压入灯内，引燃灯内酒精蒸气而发生危险。',
      },
      {
        heading: '给物质加热：固体管口向下、液体不超过 1/3',
        representation: '宏观',
        body:
          '加热固体时，试管口要略向下倾斜，防止药品中的水受热变成水蒸气后在管口冷凝，水珠倒流到灼热的管底使试管炸裂。加热液体时，液体体积不超过试管容积的 1/3，试管与桌面约成 45° 角，管口不能对着自己或他人；先来回移动试管预热，再用外焰对准药品部位加热；试管夹夹在距管口约 1/3 处，加热时不断移动试管使受热均匀。',
        figure: figHeatLiquid,
        note: '给试管里的液体加热的四个得分点：液体量、倾斜角度、管口方向、用外焰加热，缺一个都要扣分。',
      },
      {
        heading: '装置的连接与气密性检查：先查气密性，后装药品',
        representation: '宏观',
        body:
          '仪器连接顺序一般是「先下后上、先左后右」，把玻璃管插入橡胶塞或胶皮管前先用水润湿，再慢慢转动插入。装好装置后的第一件事是检查气密性：把导管末端浸入水中，用手紧握试管（或用热毛巾包住容器）外壁，若导管口有气泡冒出、松手后导管内形成一段水柱，说明气密性良好；带长颈漏斗的装置，则夹紧导管后从长颈漏斗加水至下端管口形成水柱，静置后水柱高度不变，说明气密性良好。',
        figure: figAirTight,
        note: '顺序不能反：先检查气密性、后装药品。若先装药品再查气密性，装置若漏气，药品就白白浪费了，有的实验还可能漏出有毒气体。',
      },
      {
        heading: '过滤与蒸发：两个「分离」操作的关键动作',
        representation: '应用',
        body:
          '过滤用来把不溶性固体与液体分开，要守「一贴二低三靠」：滤纸紧贴漏斗内壁（中间不能有气泡）；滤纸边缘低于漏斗口边缘、液面低于滤纸边缘；烧杯口紧靠玻璃棒、玻璃棒下端轻靠三层滤纸处、漏斗下端管口紧靠烧杯内壁。蒸发用来把溶解在液体中的固体分离出来：用蒸发皿，边加热边用玻璃棒搅拌（防止局部过热造成液滴飞溅），出现较多固体时就停止加热，用余热把剩余水分蒸干。',
        figure: figFilter,
        note: '玻璃棒在两个操作里的作用不同：过滤时是引流，蒸发时是搅拌使受热均匀——这句话是中考填空的常客。',
      },
      {
        heading: '溶液的配制：固体配制与浓溶液稀释',
        representation: '应用',
        body:
          '用固体配制一定溶质质量分数的溶液，步骤是计算 → 称量 → 量取 → 溶解，仪器有托盘天平、药匙、量筒、胶头滴管、烧杯、玻璃棒。用浓溶液稀释，步骤是计算 → 量取 → 稀释，稀释时把浓溶液沿器壁慢慢倒入水中，边倒边用玻璃棒搅拌散热，冷却后再装瓶贴标签。稀释浓硫酸时尤其要记住：只能把浓硫酸倒入水中，绝不能把水倒入浓硫酸中。',
        figure: figDilute,
        note: '浓硫酸溶于水会放出大量的热，把水倒入浓硫酸时，水浮在浓硫酸上面局部受热会沸腾，造成酸液飞溅伤人。',
      },
    ],
    equations: [
      {
        equation: '2KMnO₄ —加热→ K₂MnO₄ + MnO₂ + O₂↑',
        condition: '加热',
        phenomenon: '紫黑色固体逐渐减少，导管口有连续气泡冒出，可用带火星的木条检验生成的气体',
        note: '配平：K、Mn 各 2 个，氧原子左边 8 个、右边 4 + 2 + 2 = 8 个。条件写「加热」，不能写成「点燃」——这是加热固体类反应的条件写法。',
      },
      {
        equation: 'CaCO₃ —高温→ CaO + CO₂↑',
        condition: '高温',
        phenomenon: '高温煅烧石灰石得到生石灰，同时放出二氧化碳',
        note: '条件是「高温」而不是「加热」：加热、高温、点燃是三个不同的条件，写错条件在中考直接不给分。',
      },
    ],
    experiments: [
      {
        title: '给试管里的液体加热',
        purpose: '练习用酒精灯外焰给试管中的液体加热，掌握液体用量、试管倾斜角度与管口方向。',
        apparatus: ['试管', '试管夹', '酒精灯', '水（或硫酸铜溶液）'],
        figure: figHeatLiquid,
        steps: [
          '向试管中加入不超过试管容积 1/3 的液体。',
          '用试管夹从试管底部往上套，夹在距管口约 1/3 处。',
          '点燃酒精灯，先让试管在火焰上方来回移动预热，再用外焰对准液体的中下部加热。',
          '加热时不断移动试管，使液体受热均匀，管口不能对着自己或他人。',
          '加热完毕，用灯帽盖灭酒精灯，把试管放在试管架上冷却。',
        ],
        phenomenon: '液体逐渐变热，若加热时间过长会出现沸腾、产生气泡；试管内壁有水雾出现。',
        conclusion: '给液体加热：液体不超过试管容积的 1/3，试管与桌面约成 45° 角，管口不对着人，先预热后用外焰加热。',
        cautions: [
          '不能用一只燃着的酒精灯去点燃另一只酒精灯，也不能用嘴吹灭酒精灯，要用灯帽盖灭。',
          '试管夹应夹在距管口约 1/3 处，不能夹在管底，也不能用手直接拿试管加热。',
          '加热时不要固定加热一处，否则液体局部沸腾会溅出伤人。',
          '刚加热完的试管不能立即用冷水冲洗，防止炸裂。',
        ],
      },
      {
        title: '过滤粗盐水',
        purpose: '用过滤的方法除去粗盐水中不溶性的泥沙，掌握「一贴二低三靠」。',
        apparatus: ['铁架台（带铁圈）', '漏斗', '滤纸', '玻璃棒', '烧杯', '粗盐水'],
        figure: figFilter,
        steps: [
          '把滤纸对折两次，展开成圆锥形，放入漏斗并使滤纸紧贴漏斗内壁（可用少量水润湿赶走气泡）。',
          '把漏斗放在铁圈上，调整高度使漏斗下端管口紧靠烧杯内壁。',
          '把粗盐水沿玻璃棒缓缓倒入漏斗，玻璃棒下端轻靠三层滤纸处，液面始终低于滤纸边缘。',
          '过滤完毕后，观察滤液是否澄清。',
        ],
        phenomenon: '泥沙留在滤纸上，流入烧杯中的滤液是无色澄清的液体。',
        conclusion: '过滤能除去液体中不溶性的固体杂质；操作要点是一贴（滤纸紧贴漏斗内壁）、二低（滤纸边缘低于漏斗口、液面低于滤纸边缘）、三靠（烧杯口靠玻璃棒、玻璃棒靠三层滤纸、漏斗下端管口靠烧杯内壁）。',
        cautions: [
          '不能用玻璃棒在漏斗内搅拌来加快过滤，那样会捅破滤纸，使滤液重新变浑浊。',
          '液面若高于滤纸边缘，液体会从滤纸与漏斗壁之间流下，杂质进入滤液。',
          '若滤液仍然浑浊，要检查滤纸是否破损、液面是否过高，然后重新过滤。',
        ],
      },
      {
        title: '蒸发滤液得到食盐',
        purpose: '用蒸发的方法从滤液中得到食盐固体，掌握搅拌与停止加热的时机。',
        apparatus: ['铁架台（带铁圈）', '蒸发皿', '玻璃棒', '酒精灯', '滤液'],
        figure: figEvaporate,
        steps: [
          '把滤液倒入蒸发皿（不超过蒸发皿容积的 2/3），把蒸发皿放在铁圈上。',
          '点燃酒精灯，用外焰加热，同时用玻璃棒不断搅拌液体。',
          '当蒸发皿中出现较多固体时，停止加热。',
          '利用蒸发皿的余热把剩余水分蒸干，把食盐转移到指定容器中。',
        ],
        phenomenon: '液体逐渐减少，蒸发皿中先出现少量晶体，继续加热晶体增多；停止加热后，余热把剩余水分蒸干，得到白色食盐固体。',
        conclusion: '蒸发可以把溶解在液体中的固体分离出来；出现较多固体时停止加热、用余热蒸干，可以避免固体飞溅。',
        cautions: [
          '蒸发皿可以直接加热，不必垫石棉网；加热时用玻璃棒搅拌，防止局部过热造成液滴飞溅。',
          '不能把滤液蒸干后才停止加热，否则固体容易飞溅出来造成损失。',
          '刚加热完的蒸发皿要用坩埚钳夹取，不能用手拿。',
        ],
      },
    ],
    apps: [
      {
        title: '粗盐提纯的三步',
        scene: '实验桌上有混有泥沙的粗盐，要求得到较纯净的食盐固体。',
        analysis: '不溶性杂质用过滤除去，溶解在液体中的食盐用蒸发得到。三步顺序不能颠倒：先溶解（把食盐溶进水里），再过滤（把泥沙留在滤纸上），最后蒸发（把食盐从滤液中结晶出来）。',
        steps: [
          '溶解：把粗盐放入烧杯，加水并用玻璃棒搅拌，加快溶解。',
          '过滤：按「一贴二低三靠」过滤，得到澄清滤液。',
          '蒸发：把滤液倒入蒸发皿，用玻璃棒搅拌并加热，出现较多固体时停止加热，用余热蒸干。',
        ],
        result: '得到较纯净的食盐固体。整个过程中玻璃棒的作用依次是搅拌加快溶解、过滤时引流、蒸发时搅拌防止液滴飞溅。',
      },
      {
        title: '把浓硫酸稀释成稀硫酸',
        scene: '实验室需要稀硫酸，用浓硫酸与水配制。',
        analysis: '稀释前后溶质的质量不变，可用「浓溶液质量 × 浓溶液质量分数 = 稀溶液质量 × 稀溶液质量分数」计算。浓硫酸溶于水放出大量的热，所以必须把浓硫酸沿器壁慢慢倒入水中，并用玻璃棒不断搅拌散热。',
        steps: [
          '计算所需浓硫酸与水的质量（或体积）。',
          '用量筒分别量取浓硫酸和水。',
          '把浓硫酸沿烧杯内壁慢慢倒入水中，边倒边用玻璃棒不断搅拌。',
          '冷却到室温后装入试剂瓶，贴好标签。',
        ],
        result: '得到稀硫酸；若把水倒入浓硫酸中，水浮在酸面上局部受热会沸腾，造成酸液飞溅伤人，所以顺序绝不能反。',
      },
    ],
    formulas: [
      {
        name: '溶质质量分数',
        text: '溶质质量分数 = 溶质质量 ÷ 溶液质量 × 100%',
        usage: '配制溶液时计算所需溶质与溶剂的质量；溶液质量 = 溶质质量 + 溶剂质量',
      },
      {
        name: '稀释前后溶质质量不变',
        text: '浓溶液质量 × 浓溶液质量分数 = 稀溶液质量 × 稀溶液质量分数',
        usage: '把浓溶液加水稀释时计算加水量，如把浓硫酸稀释成稀硫酸',
      },
      {
        name: '托盘天平的精确度',
        text: '托盘天平只能称准到 0.1 g',
        usage: '称量固体药品时质量取到 0.1 g；易潮解、有腐蚀性的药品（如氢氧化钠）要放在玻璃器皿中称量',
      },
      {
        name: '加热条件的书写',
        text: '加热、高温、点燃是三个不同的反应条件，不能混用',
        usage: '书写化学方程式时标明反应条件；不写条件或写错条件在考试中都不给分',
      },
    ],
    confusions: [
      {
        wrong: '用嘴吹灭酒精灯，又快又安全',
        right: '用灯帽盖灭，盖灭后把灯帽提起再盖一次',
        why: '用嘴吹时火焰可能被压入灯内，引燃灯内的酒精蒸气，造成失火甚至爆炸；盖灭后再盖一次是为了防止灯内冷却形成负压、灯帽打不开。',
      },
      {
        wrong: '加热固体时试管口向上倾斜，这样药品不容易掉出来',
        right: '试管口略向下倾斜',
        why: '药品中往往含有少量水分，受热变成水蒸气后在管口冷凝成水珠；管口向上时水珠会倒流到灼热的管底，使试管炸裂。',
      },
      {
        wrong: '给试管里的液体加热时，液体装得越多越好，管口对着自己便于观察',
        right: '液体不超过试管容积的 1/3，试管与桌面约成 45° 角，管口对着无人的方向',
        why: '液体过多、受热时容易沸腾溅出伤人；管口对着人时溅出的热液体会烫伤自己或他人。',
      },
      {
        wrong: '把仪器连接好就直接加入药品做实验',
        right: '先把装置连接好并检查气密性，确认不漏气后再加入药品',
        why: '先加药品后查气密性，一旦装置漏气药品就浪费了；制取有毒气体的实验还可能造成危险。',
      },
      {
        wrong: '蒸发时一直加热到把水完全蒸干，这样得到的食盐最多',
        right: '出现较多固体时就停止加热，用余热把剩余水分蒸干',
        why: '继续加热会使已析出的固体随液滴飞溅出来，既损失了食盐，也可能烫伤人。',
      },
      {
        wrong: '稀释浓硫酸时把水沿器壁慢慢倒入浓硫酸中',
        right: '把浓硫酸沿器壁慢慢倒入水中，并不断搅拌',
        why: '浓硫酸溶于水放出大量的热，水的密度比浓硫酸小，会浮在上面局部沸腾，造成酸液飞溅伤人。',
      },
    ],
    compares: [
      {
        title: '过滤与蒸发',
        aspect: '都是分离混合物的操作，目的、仪器与关键动作都不同',
        left: '过滤',
        right: '蒸发',
        rows: [
          { item: '目的', left: '把不溶性固体与液体分开', right: '把溶解在液体中的固体分离出来' },
          { item: '主要仪器', left: '漏斗、滤纸、玻璃棒、烧杯、铁架台（铁圈）', right: '蒸发皿、玻璃棒、酒精灯、铁架台（铁圈）' },
          { item: '关键要点', left: '一贴二低三靠', right: '不断搅拌；出现较多固体时停止加热' },
          { item: '玻璃棒的作用', left: '引流，防止液体溅出', right: '搅拌，使受热均匀、防止液滴飞溅' },
          { item: '能否直接加热', left: '不需要加热', right: '蒸发皿可直接用酒精灯加热，不必垫石棉网' },
        ],
      },
      {
        title: '配制溶液：用固体配制与用浓溶液稀释',
        aspect: '都要经过计算与量取，但取用方式和混合时的注意事项不同',
        left: '用固体配制',
        right: '用浓溶液稀释',
        rows: [
          { item: '第一步计算', left: '算所需溶质的质量', right: '算所需浓溶液的体积' },
          { item: '取用药品', left: '托盘天平称固体（精确到 0.1 g）', right: '量筒量取浓溶液的体积' },
          { item: '混合操作', left: '固体加入水中，用玻璃棒搅拌至完全溶解', right: '浓溶液沿器壁慢慢倒入水中，边倒边搅拌' },
          { item: '特别提醒', left: '有腐蚀性的氢氧化钠要放在玻璃器皿中称量', right: '绝不能把水倒入浓硫酸中' },
        ],
      },
    ],
    examAngles: [
      {
        angle: '操作图判断正误',
        detail: '给加热、过滤、蒸发、稀释浓硫酸的装置图，判断正误并说明理由；高频错误点是试管口向上、液体超过 1/3、把水倒入浓硫酸、蒸发时不用玻璃棒搅拌。',
      },
      {
        angle: '仪器名称与操作目的填空',
        detail: '写出蒸发皿、铁圈、玻璃棒、量筒等仪器名称，并说明玻璃棒在溶解、过滤、蒸发三个操作中各自的作用。',
      },
      {
        angle: '溶液的配制计算',
        detail: '结合溶质质量分数计算所需溶质质量与水的体积，再说明称量、量取的仪器与读数方法，是「计算 + 操作」的复合题。',
      },
      {
        angle: '实验操作考试的操作顺序',
        detail: '操作考试按顺序计分：查气密性在前、装药品在后；加热结束先撤导管再熄灯；蒸发时先停止加热再用余热蒸干。',
      },
    ],
    materials: [
      {
        id: 'chem-experiment-2-m1',
        material:
          '【原创仿真】某小组用混有泥沙的粗盐进行提纯，操作如下：① 把粗盐放入烧杯，加水后用玻璃棒搅拌，加快溶解；② 把粗盐水直接倒入漏斗过滤，液面高过滤纸边缘；③ 把滤液倒入蒸发皿，加热时没有用玻璃棒搅拌；④ 一直加热到水分完全蒸干后才停止加热。',
        questions: [
          {
            id: 'chem-experiment-2-m1-q1',
            stem: '（3 分）写出过滤操作中「三靠」的具体内容，并说明玻璃棒在过滤中的作用。',
            answer:
              '三靠：烧杯口紧靠玻璃棒、玻璃棒下端轻靠三层滤纸处、漏斗下端管口紧靠烧杯内壁。玻璃棒在过滤中的作用是引流，使液体沿着玻璃棒缓缓流入漏斗，防止液体溅出。',
            rubric: ['答出「烧杯口靠玻璃棒」（1 分）', '答出「玻璃棒靠三层滤纸」（1 分）', '答出「漏斗下端管口靠烧杯内壁」并说明玻璃棒的作用是引流（1 分）'],
          },
          {
            id: 'chem-experiment-2-m1-q2',
            stem: '（3 分）指出②③④三处操作中的错误并改正。',
            answer:
              '② 错在液面高于滤纸边缘，液体会从滤纸与漏斗壁之间流下，杂质进入滤液；应控制液面始终低于滤纸边缘。③ 错在蒸发时没有用玻璃棒搅拌，会造成局部过热、液滴飞溅；应边加热边用玻璃棒不断搅拌。④ 错在把水完全蒸干后才停止加热，固体容易随液滴飞溅出来造成损失；应在出现较多固体时就停止加热，用余热把剩余水分蒸干。',
            rubric: ['指出液面高于滤纸边缘并说明后果（1 分）', '指出蒸发时未搅拌并说明要不断搅拌（1 分）', '指出应「出现较多固体时停止加热、用余热蒸干」（1 分）'],
          },
          {
            id: 'chem-experiment-2-m1-q3',
            stem: '（2 分）若过滤后得到的滤液仍然浑浊，可能的原因有哪些？写出两条。',
            answer: '滤纸破损（或有气泡没有贴紧）；液面高于滤纸边缘；承接滤液的烧杯不干净。（写出两条即可）',
            rubric: ['答出「滤纸破损」或「滤纸没有紧贴漏斗内壁」（1 分）', '答出「液面高于滤纸边缘」或「仪器不干净」（1 分）'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'chem-experiment-2-q1',
        type: 'choice',
        stem: '关于酒精灯的使用，下列说法正确的是',
        options: [
          '用一只燃着的酒精灯去点燃另一只酒精灯，可以节省火柴',
          '灯内酒精的量不少于容积的 1/4、不超过 2/3',
          '实验结束后用嘴吹灭酒精灯，熄灭得更快',
          '用焰心加热，因为焰心温度最高',
        ],
        answer: 'B',
        explanation:
          'B 正确：酒精太少灯内酒精蒸气多、容易发生危险，太多则受热膨胀会溢出酒精。A 错在两灯靠近时酒精可能外溢引起失火，应该用火柴点燃。C 错在用嘴吹可能把火焰压入灯内引燃酒精蒸气，应该用灯帽盖灭。D 错在温度最高的是外焰，焰心温度最低，加热应该用外焰。',
        difficulty: 1,
        tags: ['基本操作', '加热', '酒精灯'],
      },
      {
        id: 'chem-experiment-2-q2',
        type: 'choice',
        stem: '给试管里的液体加热，下列做法正确的是',
        options: [
          '液体装满试管，这样受热更均匀',
          '试管竖直向上加热，便于观察现象',
          '液体不超过试管容积的 1/3，试管与桌面约成 45° 角，管口不对着人',
          '试管夹夹在试管底部，方便随时移动',
        ],
        answer: 'C',
        explanation:
          'C 正确：这三条正是给液体加热的核心要求。A 错在液体过多时受热容易沸腾溅出伤人。B 错在竖直加热时液体受热不均、容易溅出，应倾斜约 45°。D 错在试管夹要夹在距管口约 1/3 处，夹在底部既挡住火焰又不好握持。',
        difficulty: 1,
        tags: ['基本操作', '加热'],
      },
      {
        id: 'chem-experiment-2-q3',
        type: 'choice',
        stem: '检查装置气密性时，把导管末端浸入水中，用手紧握试管外壁，下列现象能说明装置气密性良好的是',
        options: [
          '试管外壁变热',
          '导管口一直不停地冒气泡',
          '烧杯中的水被吸入试管',
          '导管口有气泡冒出，松手后导管内形成一段水柱',
        ],
        answer: 'D',
        explanation:
          'D 正确：手握试管使管内气体受热膨胀，气体从导管口逸出形成气泡；松手后管内气体冷却收缩、压强减小，水被吸进导管形成一段水柱，这两点同时出现才说明装置不漏气。A 只说明试管被握热了，与气密性无关。B 错在「一直不停」，气体膨胀逸出后不会再持续冒泡，若一直冒泡反而说明有别的气体源。C 错在水被吸入试管是加热结束时的倒吸现象，不能说明气密性良好。',
        difficulty: 2,
        tags: ['气密性', '装置连接'],
      },
      {
        id: 'chem-experiment-2-q4',
        type: 'choice',
        stem: '关于过滤操作，下列说法错误的是',
        options: [
          '为了加快过滤速度，可以用玻璃棒在漏斗内不断搅拌',
          '滤纸要紧贴漏斗内壁，中间不能留有气泡',
          '液面要始终低于滤纸边缘',
          '漏斗下端管口要紧靠烧杯内壁',
        ],
        answer: 'A',
        explanation:
          '本题选错误的说法。A 错误：用玻璃棒在漏斗内搅拌容易捅破滤纸，滤液会变浑浊，过滤失败。B 正确：滤纸与漏斗内壁之间有气泡会减慢过滤速度。C 正确：液面高于滤纸边缘时液体会从缝隙流下，杂质进入滤液。D 正确：漏斗下端管口紧靠烧杯内壁可以防止滤液溅出。',
        difficulty: 2,
        tags: ['过滤', '基本操作'],
      },
      {
        id: 'chem-experiment-2-q5',
        type: 'choice',
        stem: '蒸发食盐水得到食盐，下列做法正确的是',
        options: [
          '把水完全蒸干后再停止加热，这样得到的食盐最多',
          '用玻璃棒不断搅拌，出现较多固体时停止加热，用余热蒸干',
          '蒸发皿必须垫上石棉网才能加热',
          '蒸发时不需要玻璃棒，只要不停加热就行',
        ],
        answer: 'B',
        explanation:
          'B 正确：搅拌使受热均匀、防止液滴飞溅，出现较多固体时停止加热、用余热蒸干可避免固体飞溅损失。A 错在蒸干后再停手会使固体随液滴飞溅出来。C 错在蒸发皿能直接加热，不必垫石棉网（烧杯才需要垫）。D 错在不搅拌会造成局部过热、液滴飞溅。',
        difficulty: 1,
        tags: ['蒸发', '基本操作'],
      },
      {
        id: 'chem-experiment-2-q6',
        type: 'fill',
        stem: '稀释浓硫酸时，要把____沿烧杯内壁慢慢倒入水中，并用玻璃棒不断搅拌。',
        answer: '浓硫酸|硫酸|浓H₂SO₄',
        explanation:
          '浓硫酸溶于水会放出大量的热。把浓硫酸沿器壁慢慢倒入水中，酸会沉到水下方并迅速分散，热量能被水吸收；若把水倒入浓硫酸中，水浮在酸面上局部沸腾，会造成酸液飞溅伤人。',
        difficulty: 1,
        tags: ['基本操作', '浓硫酸', '安全'],
      },
      {
        id: 'chem-experiment-2-q7',
        type: 'fill',
        stem: '要量取 47 mL 水，应选用____mL 的量筒（从 10、50、100 中选择一个）。',
        answer: '50|50 mL|50mL',
        explanation:
          '量筒的量程应接近且大于要量取的液体体积，一次量取完。47 mL 用 50 mL 的量筒最合适：量程太大时刻度间距小、读数误差大；量程太小则要分两次量取，误差更大。',
        difficulty: 1,
        tags: ['量筒', '基本操作'],
      },
      {
        id: 'chem-experiment-2-q8',
        type: 'short',
        stem: '要配制 50 g 质量分数为 6% 的氯化钠溶液，请计算所需氯化钠与水的质量，并写出配制的主要步骤与所用仪器。',
        answer:
          '氯化钠质量 = 50 g × 6% = 3 g；水的质量 = 50 g − 3 g = 47 g，即 47 mL。步骤：计算 → 称量（托盘天平称 3.0 g 氯化钠）→ 量取（50 mL 量筒量 47 mL 水）→ 溶解（把氯化钠加入水中，用玻璃棒搅拌至完全溶解），最后装瓶贴标签。主要仪器：托盘天平、药匙、量筒、胶头滴管、烧杯、玻璃棒。',
        answerSteps: [
          '溶质质量 = 50 g × 6% = 3 g',
          '溶剂质量 = 50 g − 3 g = 47 g（47 mL 水）',
          '称量：托盘天平称 3.0 g 氯化钠，放在纸片上称',
          '量取：50 mL 量筒量 47 mL 水，平视凹液面最低处',
          '溶解：固体加入水中，玻璃棒搅拌至完全溶解，装瓶贴标签',
        ],
        explanation:
          '先算溶质再算溶剂：50 g × 6% = 3 g，水 = 50 g − 3 g = 47 g。易错点有三个：把 6% 直接当成 6 g；算出 47 g 后不换算成体积（需按密度 1 g/mL 折成 47 mL）；步骤里漏掉最后一步装瓶贴标签。仪器要按「称量—量取—溶解」三类写全，顺序不能颠倒成先量水再称固体。',
        rubric: [
          '算出氯化钠 3 g（1 分）',
          '算出水 47 g 或 47 mL（1 分）',
          '步骤顺序「计算—称量—量取—溶解」完整（1 分）',
          '仪器答出托盘天平、量筒、烧杯、玻璃棒（1 分）',
        ],
        difficulty: 2,
        tags: ['溶液配制', '计算', '基本操作'],
      },
      {
        id: 'chem-experiment-2-q9',
        type: 'short',
        stem: '一位同学为除去粗盐中的泥沙设计了如下方案：① 把粗盐放入烧杯加水并搅拌溶解；② 直接对粗盐水加热蒸发；③ 把蒸发得到的固体再溶解后过滤。请评价该方案，指出不合理的步骤并写出正确的操作顺序。',
        answer:
          '方案不合理。②把粗盐水直接加热蒸发不合理：泥沙是不溶性杂质，必须先过滤除去，否则泥沙会混在食盐固体里，蒸发还会把大量水分无谓蒸掉。③「蒸发后再溶解过滤」更不合理：既浪费药品和时间，又引入了多余的步骤。正确的顺序是：溶解 → 过滤 → 蒸发。即先加水溶解粗盐，再过滤除去泥沙，最后把澄清滤液蒸发结晶得到食盐。',
        explanation:
          '方案的毛病在顺序：泥沙是不溶性杂质，必须先过滤除去，再蒸发结晶；把「先蒸发、再溶解过滤」颠倒过来，既多做了无用功，又让泥沙混进了食盐。评价题的规范答法是三步：指出错误在哪、说明这样做的后果、给出正确顺序，只说「不合理」不给分。',
        rubric: [
          '指出②直接蒸发不合理：应先过滤除去不溶性杂质（1 分）',
          '指出③多此一举、顺序颠倒（1 分）',
          '写出正确顺序「溶解 → 过滤 → 蒸发」并说明每一步的目的（2 分）',
          '说明玻璃棒在三个步骤中的作用（搅拌加快溶解、引流、搅拌防止液滴飞溅）（1 分）',
        ],
        difficulty: 2,
        tags: ['实验设计', '过滤', '蒸发', '评价'],
      },
      {
        id: 'chem-experiment-2-q10',
        type: 'short',
        stem: '请画出「过滤」的装置示意图，标出玻璃棒的位置、液面与滤纸边缘的高低关系，以及漏斗下端管口与烧杯内壁的关系。',
        answer:
          '漏斗放在铁架台的铁圈上，滤纸紧贴漏斗内壁并低于漏斗口边缘；液面低于滤纸边缘；玻璃棒斜靠在三层滤纸处引流，烧杯口紧靠玻璃棒；漏斗下端管口紧靠烧杯内壁。',
        answerFigure: figFilter,
        explanation:
          '过滤装置图有四个必画点：滤纸紧贴漏斗内壁、滤纸边缘低于漏斗口边缘、液面低于滤纸边缘、漏斗下端管口紧靠烧杯内壁，再加一根斜靠三层滤纸的玻璃棒。只画出漏斗和烧杯的轮廓而没有这些位置关系，得分点一个也拿不到；把液面画得高过滤纸边缘是最常见的错误。',
        rubric: [
          '画出铁架台、漏斗、烧杯的相对位置（1 分）',
          '滤纸贴在漏斗内壁、滤纸边缘低于漏斗口（1 分）',
          '标出液面低于滤纸边缘（1 分）',
          '标出玻璃棒的位置与漏斗下端管口紧靠烧杯内壁（1 分）',
        ],
        difficulty: 2,
        tags: ['过滤', '作图', '基本操作'],
      },
      {
        id: 'chem-experiment-2-q11',
        type: 'choice',
        stem: '如图为加热试管中固体的装置。关于该装置与操作，下列说法正确的是',
        figure: figQHeatUp,
        options: [
          '试管口向上倾斜可以防止药品滑出，是正确的做法',
          '加热固体时不需要预热，可以直接对准药品加热',
          '试管口应略向下倾斜，防止冷凝水倒流到灼热的管底使试管炸裂',
          '试管加热固体时必须垫上石棉网',
        ],
        answer: 'C',
        explanation:
          'C 正确：加热固体时试管口必须略向下倾斜。A 错在图中的管口向上，药品中的水受热变成水蒸气，会在管口冷凝成水珠并倒流到灼热的管底，使试管炸裂。B 错在加热前必须预热（先来回移动试管或酒精灯），否则试管受热不均也容易炸裂。D 错在试管可以直接加热，需要垫石棉网的是烧杯、烧瓶这类底面积大的仪器。',
        difficulty: 2,
        tags: ['加热', '装置图', '基本操作'],
      },
    ],
  },
  /* ================================================================ */
  /* 3 · 气体的制取思路                                                */
  /* ================================================================ */
  {
    id: 'chem-experiment-3',
    unit: '人教版九年级 · 实验基本操作与气体制备',
    grade: 'all',
    title: '气体的制取思路：发生装置、收集装置、检验验满与尾气处理',
    question: '拿到一种气体，怎么决定用什么发生装置、用什么方法收集？装置漏不漏气怎么查？怎么证明收集到的就是这种气体、瓶子已经满了？有毒尾气怎么办？',
    keyIdea: '发生装置看反应物状态和反应条件（固固加热型 / 固液常温型）；收集装置看气体的密度和溶解性（向上排空气法 / 向下排空气法 / 排水法）；检验看气体的特性、验满看瓶口。',
    steps: [
      {
        heading: '发生装置的选择依据：反应物状态与反应条件',
        representation: '宏观',
        body:
          '发生装置由反应物状态和反应条件决定，只有两种基本类型。反应物都是固体、反应需要加热的，用固固加热型：试管（管口略向下倾斜）+ 酒精灯，如加热高锰酸钾或氯酸钾制氧气。反应物是固体与液体、在常温下就能反应的，用固液常温型：锥形瓶（或试管）+ 长颈漏斗（或分液漏斗），如大理石与稀盐酸制二氧化碳、锌与稀硫酸制氢气、过氧化氢溶液与二氧化锰制氧气。',
        figure: figDeviceTypes,
        note: '固液常温型装置里，长颈漏斗的下端必须伸入液面以下形成「液封」，否则生成的气体会从长颈漏斗口逸出，收集不到气体。这一点也常被改成「用普通漏斗代替长颈漏斗」的错误选项。',
      },
      {
        heading: '收集装置的选择依据：气体的密度与溶解性',
        representation: '宏观',
        body:
          '收集装置由气体的密度和溶解性决定。密度比空气大的气体（氧气、二氧化碳）用向上排空气法：集气瓶正放（瓶口向上），导管伸到接近瓶底，把瓶内空气从瓶口排尽。密度比空气小的气体（氢气、甲烷）用向下排空气法：集气瓶倒放（瓶口向下），导管伸到瓶的深处。不易溶于水且不与水反应的气体（氧气、氢气）可以用排水法：集气瓶倒置、装满水，导管只伸到集气瓶口，等气泡连续均匀冒出时开始收集，收集到的气体更纯净。',
        figure: figCollect3,
        note: '二氧化碳能溶于水并与水反应，所以不能用排水法；氧气密度比空气略大，所以向上排空气法与排水法都可以用，其中排水法收集到的气体更纯净。',
      },
      {
        heading: '装置气密性检查：装药品之前的必修课',
        representation: '宏观',
        body:
          '装置连接好以后，第一件事是检查气密性。固固加热型（试管 + 单孔塞 + 导管）用「手捂法」：把导管末端浸入水中，用手紧握试管外壁，若导管口有气泡冒出、松手后导管内形成一段水柱，说明气密性良好。固液常温型（带长颈漏斗的装置）用「液面差法」：用止水夹夹紧导管（或用手指堵住导管口），从长颈漏斗中加水至下端管口形成一段水柱，静置片刻，若水柱高度不变，说明气密性良好。',
        figure: figAirTight,
        note: '顺序不能反：先检查气密性、再装入药品。若装置漏气，药品就白白浪费；制取有毒气体时漏气还会造成危险。',
      },
      {
        heading: '检验与验满：一个是「是不是」，一个是「满没满」',
        representation: '符号',
        body:
          '检验是把气体通入（或伸入）试剂中，看是否出现该气体特有的现象：氧气能使带火星的木条复燃，二氧化碳能使澄清石灰水变浑浊，氢气点燃时产生淡蓝色火焰。验满是在集气瓶口看现象：氧气用带火星的木条放在瓶口，木条复燃说明已收集满；二氧化碳用燃着的木条放在瓶口，木条熄灭说明已收集满；用排水法收集时，看到集气瓶口有大气泡向外冒出，就说明水已经排尽、气体收集满了。检验与验满所用的试剂常常相同，但位置不同，这是最容易混的一处。',
        figure: figO2Verify,
        note: '写方程式时条件与符号都要有：CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O 中的沉淀符号 ↓ 不能漏；2H₂ + O₂ —点燃→ 2H₂O 的条件是「点燃」而不是「加热」。',
      },
      {
        heading: '尾气处理：有毒气体不能直接排入空气',
        representation: '应用',
        body:
          '制取或使用有毒气体（如一氧化碳、二氧化硫）时，尾气必须处理后再排放：可以用气球把尾气收集起来，可以把尾气通入能吸收它的溶液（如氢氧化钠溶液吸收二氧化硫），也可以把可燃的有毒气体点燃转化为无毒物质（如一氧化碳点燃生成二氧化碳）。',
        figure: figTailGas,
        note: '一氧化碳有毒，因为它与血液中的血红蛋白结合，使血红蛋白不能很好地与氧结合，造成人体缺氧。尾气处理既考环保意识，也考具体做法，不能只写「处理尾气」四个字。',
      },
    ],
    equations: [
      {
        equation: 'CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O',
        condition: '常温',
        phenomenon: '澄清石灰水变浑浊，出现白色沉淀',
        note: '这是二氧化碳的检验反应，也是检验二氧化碳唯一要会写的方程式；Ca(OH)₂ 的下标与 CaCO₃ 的沉淀符号都不能漏。',
      },
      {
        equation: '2H₂ + O₂ —点燃→ 2H₂O',
        condition: '点燃',
        phenomenon: '产生淡蓝色火焰，放出大量的热，干冷的烧杯内壁出现水雾',
        note: '配平：氢原子左边 4 个、右边 4 个，氧原子左右各 2 个。点燃氢气前必须检验氢气的纯度，否则可能发生爆炸。',
      },
      {
        equation: '2CO + O₂ —点燃→ 2CO₂',
        condition: '点燃',
        phenomenon: '一氧化碳燃烧产生蓝色火焰，放出热量',
        note: '这是尾气处理中「点燃法」的依据：把有毒的一氧化碳转化为无毒的二氧化碳。配平后碳、氧原子数左右相等。',
      },
      {
        equation: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑',
        condition: '常温',
        phenomenon: '锌粒表面产生大量气泡，锌粒逐渐溶解，试管壁发热',
        note: '实验室制取氢气用锌粒与稀硫酸（或稀盐酸），属于固液常温型装置；若用浓硫酸或硝酸，得不到氢气。',
      },
    ],
    experiments: [
      {
        title: '检查装置的气密性',
        purpose: '练习用「手捂法」检查固固加热型装置、用「液面差法」检查带长颈漏斗的固液常温型装置。',
        apparatus: ['试管', '单孔橡胶塞', '导管', '烧杯', '锥形瓶', '长颈漏斗', '止水夹'],
        figure: figAirTight,
        steps: [
          '把试管口用带导管的单孔塞塞紧，把导管的另一端浸入烧杯的水中。',
          '用手紧握试管外壁，观察导管口是否有气泡冒出。',
          '松开手，观察导管内是否形成一段水柱。',
          '对锥形瓶装置：用止水夹夹紧导管，从长颈漏斗中加水至下端管口形成水柱，静置观察水柱高度是否变化。',
        ],
        phenomenon: '手捂时导管口有气泡冒出，松手后导管内形成一段水柱；夹紧导管后长颈漏斗内的水柱高度保持不变。',
        conclusion: '导管口有气泡冒出、松手后导管内形成一段水柱，说明气密性良好；长颈漏斗内水柱高度不变，同样说明气密性良好。',
        cautions: [
          '检查气密性必须在装入药品之前进行。',
          '手捂法不宜用手掌长时间捂住不动，要能看出「冒气泡」与「水柱」两个现象。',
          '液面差法中一定要夹紧导管或堵住导管口，否则气体从导管逸出，形不成水柱。',
          '若装置漏气，要检查塞子是否塞紧、导管连接处是否漏气，处理好再重新检查。',
        ],
      },
      {
        title: '用排水法与向上排空气法收集氧气',
        purpose: '对比两种收集方法，理解收集装置的选择依据与「导管伸到哪里」的差别。',
        apparatus: ['集气瓶', '玻璃片', '水槽', '导管', '氧气源（已连接好的发生装置）'],
        figure: figCollect3,
        steps: [
          '排水法：把集气瓶倒置、装满水（瓶口不能有气泡），放入水槽中，把导管口伸到集气瓶口。',
          '等气泡连续均匀冒出时开始收集，看到集气瓶口有大气泡向外冒出，说明已收集满。',
          '在水中用玻璃片盖住瓶口，把集气瓶取出正放在桌面上（氧气密度比空气大）。',
          '向上排空气法：把集气瓶正放，导管伸到接近瓶底，收集一段时间后用带火星的木条放在瓶口验满。',
        ],
        phenomenon: '排水法收集时瓶内水面不断下降，收集满时瓶口有大气泡冒出；排空气法收集满时，带火星的木条在瓶口复燃。',
        conclusion: '不易溶于水的气体可用排水法（气体更纯净，导管只伸到瓶口）；密度比空气大的气体可用向上排空气法（导管伸到接近瓶底）；两种方法都要验满。',
        cautions: [
          '排水法收集时集气瓶必须倒置并装满水，否则瓶内残留空气会使气体不纯。',
          '排水法收集时导管只伸到集气瓶口，伸入瓶内太长会使水排不尽、气体不易进入。',
          '向上排空气法收集时导管要伸到接近瓶底，否则瓶底的空气排不尽。',
          '用排水法收集满后，要在水下盖好玻璃片再取出，防止空气进入。',
        ],
      },
    ],
    apps: [
      {
        title: '为一种气体选择制取与收集装置',
        scene: '实验室要制取一瓶氧气、一瓶二氧化碳和一瓶氢气，桌上备有固固加热型装置、固液常温型装置、排水法装置与向上、向下排空气法装置。',
        analysis: '发生装置由反应物状态和反应条件决定，收集装置由气体的密度和溶解性决定：氧气可用加热高锰酸钾（固固加热型）或过氧化氢与二氧化锰（固液常温型）；二氧化碳用大理石与稀盐酸（固液常温型），只能用向上排空气法；氢气用锌与稀硫酸（固液常温型），可用向下排空气法或排水法。',
        steps: [
          '氧气：选固固加热型制取，收集可用排水法（更纯净）或向上排空气法。',
          '二氧化碳：选固液常温型制取，只能用向上排空气法（能溶于水且与水反应，密度比空气大）。',
          '氢气：选固液常温型制取，可用向下排空气法（密度比空气小）或排水法（不易溶于水）。',
        ],
        result: '三种气体的装置选择都能落到「反应物状态与条件」「密度与溶解性」两条依据上，不需要死记硬背。',
      },
      {
        title: '鉴别两瓶无色气体：氧气与二氧化碳',
        scene: '桌上有两瓶无色气体，一瓶是氧气，一瓶是二氧化碳，请设计实验把它们区分开。',
        analysis: '鉴别要抓住两种气体性质上的差别：氧气能支持燃烧（使带火星的木条复燃），二氧化碳不燃烧也不支持燃烧（使燃着的木条熄灭），还能使澄清石灰水变浑浊。',
        steps: [
          '方案一：把燃着的木条分别伸入两瓶气体中，木条燃烧更旺的是氧气，木条熄灭的是二氧化碳。',
          '方案二：分别加入少量澄清石灰水并振荡，石灰水变浑浊的是二氧化碳，没有变化的是氧气。',
        ],
        result: '两种方案都能一次区分开；用燃着的木条最简便，用澄清石灰水现象最可靠。',
      },
    ],
    formulas: [
      {
        name: '收集方法的选择依据',
        text: '密度比空气大 → 向上排空气法；密度比空气小 → 向下排空气法；不易溶于水且不与水反应 → 排水法',
        usage: '为一种气体选择收集装置时使用，两条依据（密度、溶解性）缺一不可',
      },
      {
        name: '发生装置的选择依据',
        text: '固体 + 固体、需要加热 → 固固加热型；固体 + 液体、常温反应 → 固液常温型',
        usage: '根据反应物状态与反应条件选择发生装置，不看气体的性质',
      },
      {
        name: '气密性检查的两套方法',
        text: '手捂法：导管口有气泡冒出、松手后形成一段水柱；液面差法：静置后长颈漏斗内水柱高度不变',
        usage: '装药品之前检查装置气密性；试管类装置用手捂法，带长颈漏斗的装置用液面差法',
      },
      {
        name: '检验与验满的区别',
        text: '检验是「是不是这种气体」，把气体通入或伸入试剂中；验满是「有没有收集满」，在集气瓶口观察现象',
        usage: '回答「如何检验」「如何验满」两类问题时要分别写清操作、现象与结论',
      },
    ],
    confusions: [
      {
        wrong: '用排水法收集气体时，把导管伸入集气瓶内直到瓶底',
        right: '导管只伸到集气瓶口（略伸入瓶口即可）',
        why: '排水法收集时瓶内充满水，导管伸得太长会把瓶内的水堵住、气体不易进入，水也排不尽；伸到瓶口就够了。',
      },
      {
        wrong: '用向上排空气法收集二氧化碳时，导管只伸到瓶口附近',
        right: '导管要伸到接近瓶底',
        why: '排空气法靠气体把瓶内原有空气「挤」出去，导管伸到瓶底才能把瓶底部的空气排尽；导管太短时瓶底会残留空气，气体不纯。',
      },
      {
        wrong: '看到导管口一开始冒气泡就马上收集',
        right: '等气泡连续均匀冒出时再开始收集',
        why: '刚开始排出的是装置内原有的空气，这时收集会把空气收进瓶中，气体不纯。',
      },
      {
        wrong: '把燃着的木条伸入集气瓶内检验二氧化碳是否收集满',
        right: '把燃着的木条放在集气瓶口验满',
        why: '伸入瓶中时，即使气体没有收集满，瓶内下部已充满二氧化碳，木条也会熄灭，得到错误结论；验满必须在瓶口进行。',
      },
      {
        wrong: '有毒气体量少，直接排入空气没有关系',
        right: '用气球收集、用吸收液吸收或点燃转化为无毒物质后再排放',
        why: '一氧化碳等气体有毒，即使量少也会污染空气、危害健康，尾气必须处理后排放。',
      },
    ],
    compares: [
      {
        title: '向上排空气法与向下排空气法',
        aspect: '都由气体的密度决定，但集气瓶的正放/倒放与适用气体刚好相反',
        left: '向上排空气法',
        right: '向下排空气法',
        rows: [
          { item: '集气瓶放置', left: '正放，瓶口向上', right: '倒放，瓶口向下' },
          { item: '适用气体', left: '密度比空气大的气体（氧气、二氧化碳）', right: '密度比空气小的气体（氢气、甲烷）' },
          { item: '导管位置', left: '伸到接近瓶底', right: '伸到瓶的深处（倒放瓶的上部）' },
          { item: '验满方法', left: '氧气用带火星木条放瓶口；二氧化碳用燃着木条放瓶口', right: '氢气用燃着的木条放在瓶口，听到爆鸣声说明没满' },
        ],
      },
      {
        title: '排水法与排空气法',
        aspect: '两种收集思路，一个看溶解性、一个看密度，收集到的气体纯度也不同',
        left: '排水法',
        right: '排空气法',
        rows: [
          { item: '选择依据', left: '气体不易溶于水且不与水反应', right: '气体的密度与空气比较' },
          { item: '集气瓶状态', left: '倒置、装满水', right: '正放或倒放，瓶内是空气' },
          { item: '导管位置', left: '只伸到集气瓶口', right: '伸到瓶底或瓶的深处' },
          { item: '气体纯度', left: '较纯净（瓶内没有空气）', right: '可能混有少量空气，纯度稍差' },
        ],
      },
    ],
    examAngles: [
      {
        angle: '装置选择与导管长短',
        detail: '给出气体的制备反应与性质，要求选择发生装置与收集装置，并说明导管伸到哪里、集气瓶怎样放置，是实验题中最常见的设问。',
      },
      {
        angle: '检验与验满的区别',
        detail: '把「如何检验」与「如何验满」并列设问，考查学生是否分清「伸入瓶中」与「放在瓶口」这两个不同位置。',
      },
      {
        angle: '气密性检查的操作与现象描述',
        detail: '要求写出检查气密性的操作步骤与观察到的现象，并说明「先查气密性、后装药品」的原因。',
      },
      {
        angle: '尾气处理与环保意识',
        detail: '结合一氧化碳等有毒气体，要求写出尾气处理的具体做法，并说明该气体有毒的原因。',
      },
    ],
    materials: [
      {
        id: 'chem-experiment-3-m1',
        material:
          '【原创仿真】某小组用锌粒与稀硫酸制取一瓶氢气。操作如下：① 向锥形瓶中加入几粒锌粒，再加入稀硫酸，塞紧带导管和长颈漏斗的双孔塞；② 用排水法收集一试管氢气，用拇指堵住管口移近酒精灯火焰，听到尖锐的爆鸣声；③ 再收集一试管氢气验纯，声音很小；④ 然后把氢气通入装有氧化铜的试管中加热。',
        questions: [
          {
            id: 'chem-experiment-3-m1-q1',
            stem: '（4 分）指出上述操作中的不妥之处并改正；写出锌与稀硫酸反应的化学方程式。',
            answer:
              '① 不妥：应先检查装置的气密性，再加入药品；改正为连接好装置后先检查气密性，确认不漏气再装药品。另外长颈漏斗下端必须伸入液面以下形成液封，否则气体会从长颈漏斗口逸出。化学方程式：Zn + H₂SO₄ → ZnSO₄ + H₂↑。',
            rubric: [
              '指出应先检查气密性、后装药品（1 分）',
              '说明长颈漏斗下端要伸入液面以下（1 分）',
              '写出 Zn + H₂SO₄ → ZnSO₄ + H₂↑，化学式正确（1 分）',
              '方程式配平并标出气体符号 ↑（1 分）',
            ],
          },
          {
            id: 'chem-experiment-3-m1-q2',
            stem: '（3 分）听到尖锐的爆鸣声说明什么？为什么要验纯？',
            answer:
              '听到尖锐的爆鸣声说明收集到的氢气不纯，混有空气（氢气与空气的混合气体点燃会发生爆炸）。点燃（或加热）氢气前必须检验氢气的纯度，否则可能发生爆炸事故。声音很小说明氢气比较纯净，可以点燃使用。',
            rubric: [
              '答出「氢气不纯（混有空气）」（1 分）',
              '答出「氢气与空气混合点燃会发生爆炸」（1 分）',
              '说明点燃前必须验纯这一安全要求（1 分）',
            ],
          },
          {
            id: 'chem-experiment-3-m1-q3',
            stem: '（2 分）为什么可以用排水法收集氢气？还可以用什么方法收集？说明依据。',
            answer:
              '氢气不易溶于水且不与水反应，所以可以用排水法收集。氢气密度比空气小，还可以用向下排空气法收集（集气瓶倒放、瓶口向下，导管伸到瓶的深处）。',
            rubric: ['答出氢气不易溶于水且不与水反应（1 分）', '答出向下排空气法并说明密度比空气小（1 分）'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'chem-experiment-3-q1',
        type: 'choice',
        stem: '如图为实验室常用的两套气体发生装置。关于它们，下列说法正确的是',
        figure: figDeviceTypes,
        options: [
          '左边的装置既能用于加热高锰酸钾制氧气，也能用于过氧化氢溶液制氧气',
          '右边装置里的长颈漏斗可以用普通漏斗代替',
          '左边装置适用于反应物都是固体且需要加热的反应，右边装置适用于固体与液体在常温下的反应',
          '两套装置都必须先装入药品，再检查气密性',
        ],
        answer: 'C',
        explanation:
          'C 正确：发生装置由反应物状态和反应条件决定，固固加热型配试管和酒精灯，固液常温型配锥形瓶和长颈漏斗。A 错在过氧化氢制氧气是固液常温型反应，不需要加热，应该用右边的装置。B 错在普通漏斗下端太短，无法伸入液面以下形成液封，生成的气体会从漏斗口逸出。D 错在顺序反了：必须先检查气密性，确认不漏气后再装药品。',
        difficulty: 2,
        tags: ['气体制取', '发生装置', '装置图'],
      },
      {
        id: 'chem-experiment-3-q2',
        type: 'choice',
        stem: '如图，甲、乙、丙是三种气体收集装置（甲为排水法）。关于用甲装置（排水法）收集一瓶氧气，下列操作正确的是',
        figure: figQCollect,
        options: [
          '集气瓶正放在桌面上，瓶内装满水',
          '把导管伸入集气瓶内一直到瓶底',
          '一看到导管口有气泡冒出就立即开始收集',
          '集气瓶倒置并装满水，等气泡连续均匀冒出时开始收集，导管只伸到瓶口',
        ],
        answer: 'D',
        explanation:
          'D 正确：倒置、装满水才能保证瓶内没有空气，气泡连续均匀冒出说明装置内原有的空气已经排完。A 错在正放时水会流出、瓶内会混入空气。B 错在导管伸到瓶底会把瓶内的水堵住，气体不易进入、水也排不尽。C 错在刚开始冒出的是装置内原有的空气，此时收集会使气体不纯。',
        difficulty: 2,
        tags: ['气体制取', '排水法', '收集装置'],
      },
      {
        id: 'chem-experiment-3-q3',
        type: 'choice',
        stem: '关于气体的检验与验满，下列说法正确的是',
        options: [
          '检验氧气时把带火星的木条伸入集气瓶中；验满时把带火星的木条放在集气瓶口',
          '检验二氧化碳时把燃着的木条伸入瓶中；验满时用澄清石灰水',
          '验满氧气时把带火星的木条伸入集气瓶中部',
          '检验和验满都要在集气瓶口进行',
        ],
        answer: 'A',
        explanation:
          'A 正确：检验要伸入瓶中（或把气体通入试剂），验满只能在瓶口。B 把两者弄反了：检验二氧化碳用澄清石灰水，验满用燃着的木条放在瓶口。C 错在把木条伸入瓶中是检验的操作，验满必须放在瓶口。D 错在检验需要把木条伸入瓶内或把气体通入试剂，只有在瓶口操作无法证明「瓶里就是这种气体」。',
        difficulty: 2,
        tags: ['气体检验', '验满'],
      },
      {
        id: 'chem-experiment-3-q4',
        type: 'choice',
        stem: '关于检查装置气密性，下列说法错误的是',
        options: [
          '必须先把装置连接好，再检查气密性',
          '带长颈漏斗的装置检查气密性时不必夹紧导管，直接加水看液面变化就可以',
          '用手紧握试管外壁，导管口有气泡冒出、松手后导管内形成一段水柱，说明气密性良好',
          '装置漏气时可以塞紧塞子或更换导管后再重新检查',
        ],
        answer: 'B',
        explanation:
          '本题选错误的说法。B 错误：带长颈漏斗的装置必须先用止水夹夹紧导管（或用手堵住导管口），再从长颈漏斗加水，才能在漏斗下端形成水柱；不夹紧导管时气体会从导管口逸出，容器内压强上不去，水柱会一直下降，无法判断气密性。A、C、D 都是正确的做法。',
        difficulty: 2,
        tags: ['气密性', '装置连接'],
      },
      {
        id: 'chem-experiment-3-q5',
        type: 'choice',
        stem: '关于气体的收集方法，下列说法正确的是',
        options: [
          '二氧化碳密度比空气大，所以可以用排水法收集',
          '氧气不易溶于水，所以只能用排水法收集',
          '氢气密度比空气小，可以用向下排空气法，也可以用排水法',
          '有毒气体只要量少，可以直接排入空气',
        ],
        answer: 'C',
        explanation:
          'C 正确：氢气密度比空气小，可以用向下排空气法；氢气又不易溶于水，所以排水法也可以用。A 错在二氧化碳能溶于水并与水反应，不能用排水法，只能用向上排空气法。B 错在氧气密度比空气略大，向上排空气法也能用，只是排水法收集到的更纯净。D 错在有毒气体必须处理尾气，可以用气球收集、用吸收液吸收或点燃转化。',
        difficulty: 1,
        tags: ['气体制取', '收集方法'],
      },
      {
        id: 'chem-experiment-3-q6',
        type: 'fill',
        stem: '用向上排空气法收集气体时，导管要伸到集气瓶的____，这样才能把瓶内的空气排尽。',
        answer: '底部|底|接近瓶底|下部',
        explanation:
          '排空气法收集靠的是气体把瓶内的空气挤出去。导管伸到接近瓶底，气体才能从瓶底往上充满整个瓶子、把空气从瓶口排出；导管只伸到瓶口附近时，瓶底会残留空气，收集到的气体不纯。',
        difficulty: 1,
        tags: ['气体制取', '排空气法'],
      },
      {
        id: 'chem-experiment-3-q7',
        type: 'fill',
        stem: '检验氧气是否收集满的方法是：把带火星的木条放在____，若木条复燃，说明已收集满。',
        answer: '集气瓶口|瓶口|集气瓶口处',
        explanation:
          '验满必须在集气瓶口进行。若把木条伸入瓶中，即使瓶内只有一部分氧气，木条也可能复燃，就会误判为已经收集满。注意与检验区分：检验氧气是把带火星的木条伸入集气瓶中。',
        difficulty: 1,
        tags: ['验满', '气体检验'],
      },
      {
        id: 'chem-experiment-3-q8',
        type: 'short',
        stem: '写出实验室用大理石（主要成分 CaCO₃）与稀盐酸制取二氧化碳的化学方程式；并计算 100 g 碳酸钙完全反应最多能生成多少克二氧化碳（相对原子质量：C 12、O 16、Ca 40）。',
        answer:
          '化学方程式：CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑。计算：CaCO₃ 的相对分子质量 = 40 + 12 + 16×3 = 100，CO₂ 的相对分子质量 = 12 + 16×2 = 44。设生成二氧化碳的质量为 x，由方程式可得 100 : 44 = 100 g : x，解得 x = 44 g。答：最多能生成 44 g 二氧化碳。',
        answerSteps: [
          '写出并配平方程式：CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑',
          '算出 CaCO₃ 的相对分子质量 100、CO₂ 的相对分子质量 44',
          '设未知数 x 表示二氧化碳的质量，列出比例式 100 : 44 = 100 g : x',
          '解得 x = 44 g，写出答语',
        ],
        explanation:
          '这道题把化学用语与计算绑在一起：方程式不配平、漏掉 CO₂ 后的 ↑ 都要扣分；计算时要先用相对原子质量算出 CaCO₃（100）与 CO₂（44）的相对分子质量，再列比例式，最后写清单位与答语。常见错误有两个：把 100 g 直接当成生成二氧化碳的质量；算 CaCO₃ 的相对分子质量时漏掉 3 个氧原子，算成 68 或 84。',
        rubric: [
          '方程式书写正确、配平并标出气体符号 ↑（1 分）',
          '算出 CaCO₃ 与 CO₂ 的相对分子质量（1 分）',
          '比例式列对（1 分）',
          '结果 44 g 并写出答语（1 分）',
        ],
        difficulty: 2,
        tags: ['化学用语', '计算', '二氧化碳制取'],
      },
      {
        id: 'chem-experiment-3-q9',
        type: 'short',
        stem: '要收集一瓶较纯净的氧气，应选用排水法还是向上排空气法？请说明理由；并指出「用排水法收集时，导管要伸入集气瓶内直至接近瓶底」这句话是否正确。',
        answer:
          '应选用排水法。氧气不易溶于水且不与水反应，用排水法收集时集气瓶内装满水，收集过程中瓶内的水被排尽，气体中几乎不混入空气，所以更纯净；向上排空气法收集时瓶内原有空气不易排净，纯度稍差。题中说法不正确：排水法收集时导管只伸到集气瓶口即可，伸入瓶内太长会使瓶内的水不易排尽、气体不易进入。',
        explanation:
          '这类题要按「选方法 → 讲依据 → 判断给出的说法」三步作答。选排水法的依据是氧气不易溶于水且不与水反应，答出这一点才拿到依据分；判断「导管要伸入瓶内接近瓶底」时要注意：伸到瓶底是向上排空气法的规则，排水法恰恰相反，导管只伸到瓶口。把两种收集方法的导管位置记混，是本题最常见的失分点。',
        rubric: [
          '选排水法（1 分）',
          '说明氧气不易溶于水且不与水反应（1 分）',
          '说明排水法收集的气体更纯净、不混空气（1 分）',
          '判断说法错误并说明导管只伸到瓶口（1 分）',
        ],
        difficulty: 2,
        tags: ['气体制取', '收集方法', '评价'],
      },
      {
        id: 'chem-experiment-3-q10',
        type: 'short',
        stem: '请画出甲、乙、丙三种收集气体的装置示意图：甲为排水法、乙为向上排空气法、丙为向下排空气法，并标出集气瓶的正放或倒放、导管伸入的位置。',
        answer:
          '甲：集气瓶倒置、装满水，放在水槽中，导管只伸到集气瓶口；乙：集气瓶正放（瓶口向上），导管伸到接近瓶底；丙：集气瓶倒放（瓶口向下），导管从瓶口伸到瓶的深处。',
        answerFigure: figCollect3,
        explanation:
          '作图题的评分点全在位置关系上：甲图必须画出倒置且装满水的集气瓶、导管只到瓶口；乙图瓶口向上、导管伸到接近瓶底；丙图瓶口向下、导管伸到瓶的深处。只要把任何一种画法弄反（例如把甲画成正放，或把乙的导管画到瓶口），对应的分就全部丢掉。',
        rubric: [
          '甲图画成倒置、装满水，导管只到瓶口（2 分，画成正放或导管伸入瓶内不给分）',
          '乙图画成正放，导管伸到接近瓶底（2 分）',
          '丙图画成倒放，导管伸到瓶的深处（2 分）',
          '三幅图都标出集气瓶的正倒与导管位置（1 分）',
        ],
        difficulty: 3,
        tags: ['作图', '收集装置', '气体制取'],
      },
    ],
  },

  /* ================================================================ */
  /* 4 · 氧气的实验室制取与性质                                        */
  /* ================================================================ */
  {
    id: 'chem-experiment-4',
    unit: '人教版九年级 · 实验基本操作与气体制备',
    grade: 'all',
    title: '氧气的实验室制取与性质',
    question: '实验室有哪三种制氧气的方法？为什么结束时要「先撤导管、后熄灯」？氧气有哪些性质实验，现象该怎么准确描述？',
    keyIdea: '三种制法：加热高锰酸钾、加热氯酸钾（二氧化锰作催化剂）、常温分解过氧化氢溶液；操作顺序是查、装、定、点、收、离、熄，结束时先撤导管后熄灯，否则水会倒吸使试管炸裂。',
    steps: [
      {
        heading: '三种制法的对比与选择',
        representation: '宏观',
        body:
          '加热高锰酸钾：紫黑色固体，加热后分解出氧气，装置是固固加热型，试管口要略向下倾斜并在管口塞一团棉花。加热氯酸钾：白色固体与二氧化锰混合共热，二氧化锰作催化剂，能加快反应速率。过氧化氢溶液与二氧化锰：常温下就能反应，装置是固液常温型，操作最简便、不需要加热，适合课堂随用随取。',
        note: '三种方法里，催化剂（二氧化锰）只改变反应速率，本身的质量和化学性质在反应前后都没有改变，也不会增加生成氧气的总量。',
      },
      {
        heading: '符号：三个方程式怎么写、怎么配平',
        representation: '符号',
        body:
          '2KMnO₄ —加热→ K₂MnO₄ + MnO₂ + O₂↑；2KClO₃ —MnO₂、加热→ 2KCl + 3O₂↑；2H₂O₂ —MnO₂→ 2H₂O + O₂↑。写方程式要注意三点：化学式不能写错（K₂MnO₄ 与 KMnO₄ 是两种物质）；必须配平；条件要写对（加热与催化剂都要标出，过氧化氢分解的条件是二氧化锰作催化剂，不需要加热）。',
        note: '最容易错的是 2KClO₃ 的配平：氧原子左边 6 个，右边 3O₂ 共 6 个，所以 KCl 前的系数是 2；漏写二氧化锰这个催化剂条件也会被扣分。',
      },
      {
        heading: '装置与操作顺序：查、装、定、点、收、离、熄',
        representation: '宏观',
        body:
          '查：连接好装置先检查气密性。装：把高锰酸钾平铺在试管底部，管口塞一团棉花（防止粉末随气流进入导管）。定：把试管固定在铁架台上，管口略向下倾斜（防止冷凝水倒流炸裂试管）。点：点燃酒精灯，先预热再对准药品部位用外焰加热。收：用排水法收集，等气泡连续均匀冒出时开始收集。离：实验结束时先把导管移出水面。熄：最后熄灭酒精灯。',
        figure: figKMnO4O2,
        note: '「离」在「熄」之前，是这一节最重要的顺序。若先熄灯，试管内气体冷却收缩、压强减小，水槽里的水就会倒吸进灼热的试管，使试管炸裂。',
      },
      {
        heading: '验满与检验：位置不同，结论不同',
        representation: '应用',
        body:
          '检验氧气：把带火星的木条伸入集气瓶中，木条复燃，说明瓶中是氧气。验满：把带火星的木条放在集气瓶口，木条复燃，说明已经收集满。用排水法收集时，看到集气瓶口有大气泡向外冒出，就说明水已经排尽，氧气收集满了。',
        figure: figO2Verify,
        note: '木条的位置是唯一的得分点：伸入瓶中叫检验，放在瓶口叫验满，写反了就是零分。',
      },
      {
        heading: '氧气的性质实验与现象描述',
        representation: '宏观',
        body:
          '木炭在氧气中燃烧：发出白光，放出热量，生成能使澄清石灰水变浑浊的气体。硫在氧气中燃烧：发出明亮的蓝紫色火焰，放出热量，生成有刺激性气味的气体（在空气中燃烧是淡蓝色火焰）。铁丝在氧气中燃烧：剧烈燃烧、火星四射，放出大量的热，生成黑色固体四氧化三铁。蜡烛在氧气中燃烧：发出白光，集气瓶内壁出现水雾，生成能使澄清石灰水变浑浊的气体。',
        figure: figFeBurn,
        note: '现象描述要区分「在空气中」与「在氧气中」：硫在空气中是淡蓝色火焰、在氧气中是明亮的蓝紫色火焰；铁丝在氧气中才火星四射。把四氧化三铁说成气体，是最常见的表述错误。',
      },
      {
        heading: '微观：为什么在氧气中燃烧更剧烈',
        representation: '微观',
        body:
          '燃烧是物质与氧气发生的剧烈氧化反应。在纯氧中，单位体积内氧分子的数目比空气中多得多，可燃物的分子（或原子）与氧分子碰撞、结合的机会大大增加，反应因此更剧烈、放热更快、发光更亮。铁与氧气反应生成的四氧化三铁里，铁原子与氧原子的个数比是 3 : 4，这正是 Fe₃O₄ 这个化学式的含义。',
        note: '用微观解释「更剧烈」时，要说清「氧分子浓度大、碰撞机会多」这一层，只写「氧气浓度大」还不够。',
      },
    ],
    equations: [
      {
        equation: '2KMnO₄ —加热→ K₂MnO₄ + MnO₂ + O₂↑',
        condition: '加热',
        phenomenon: '紫黑色固体逐渐减少，导管口有连续气泡冒出，带火星的木条复燃',
        note: '配平：K、Mn 各 2 个；氧原子左边 8 个，右边 4 + 2 + 2 = 8 个。生成物是锰酸钾（K₂MnO₄）与二氧化锰（MnO₂），两者不能混写。',
      },
      {
        equation: '2KClO₃ —MnO₂、加热→ 2KCl + 3O₂↑',
        condition: '二氧化锰作催化剂并加热',
        phenomenon: '白色固体逐渐减少，产生使带火星木条复燃的气体',
        note: '配平：氧原子左边 6 个，右边 3O₂ 共 6 个，所以 KCl 前要写 2。条件是「二氧化锰、加热」，两个条件都要标出。',
      },
      {
        equation: '2H₂O₂ —MnO₂→ 2H₂O + O₂↑',
        condition: '二氧化锰作催化剂（常温）',
        phenomenon: '溶液中产生大量气泡，带火星的木条复燃；反应后二氧化锰的质量不变',
        note: '配平：氧原子左边 4 个，右边 2 + 2 = 4 个。这个反应在常温下进行，不需要加热，所以也可以用固液常温型装置。',
      },
      {
        equation: '3Fe + 2O₂ —点燃→ Fe₃O₄',
        condition: '点燃',
        phenomenon: '剧烈燃烧、火星四射，放出大量的热，生成黑色固体四氧化三铁',
        note: '配平：铁原子左右各 3 个，氧原子左右各 4 个。铁在氧气中燃烧的产物是 Fe₃O₄，不是 Fe₂O₃，也不是 FeO。',
      },
      {
        equation: 'S + O₂ —点燃→ SO₂',
        condition: '点燃',
        phenomenon: '在氧气中发出明亮的蓝紫色火焰（在空气中是淡蓝色火焰），生成有刺激性气味的气体',
        note: '配平：硫、氧原子数左右都是 1 个和 2 个，系数为 1 时不写。二氧化硫有刺激性气味，实验时要在通风处进行。',
      },
      {
        equation: 'C + O₂ —点燃→ CO₂',
        condition: '点燃',
        phenomenon: '木炭在氧气中剧烈燃烧、发出白光，生成能使澄清石灰水变浑浊的气体',
        note: '碳在氧气充足时生成二氧化碳；氧气不足时生成一氧化碳（2C + O₂ —点燃→ 2CO），两个方程式不能混用。',
      },
    ],
    experiments: [
      {
        title: '加热高锰酸钾制取氧气',
        purpose: '练习固固加热型装置制取气体，掌握操作顺序与「先撤导管、后熄灯」。',
        apparatus: ['铁架台', '试管', '单孔橡胶塞', '导管', '酒精灯', '水槽', '集气瓶', '玻璃片', '棉花', '高锰酸钾'],
        figure: figKMnO4O2,
        steps: [
          '连接装置并检查气密性（手捂法）。',
          '把高锰酸钾平铺在试管底部，在管口塞一团棉花，塞紧带导管的单孔塞。',
          '把试管固定在铁架台上，管口略向下倾斜；把集气瓶倒置、装满水放入水槽，把导管伸到集气瓶口。',
          '点燃酒精灯，先预热再对准药品部位用外焰加热。',
          '等气泡连续均匀冒出时开始收集，看到瓶口有大气泡向外冒出即已收集满，在水下用玻璃片盖住瓶口取出，正放在桌面上。',
          '实验结束时，先把导管移出水面，再熄灭酒精灯。',
        ],
        phenomenon: '紫黑色固体逐渐减少，导管口有连续均匀的气泡冒出，集气瓶内水面不断下降；用带火星的木条放在瓶口，木条复燃。',
        conclusion: '加热高锰酸钾可以制得氧气：2KMnO₄ —加热→ K₂MnO₄ + MnO₂ + O₂↑；排水法收集到的氧气较纯净。',
        cautions: [
          '试管口要略向下倾斜，防止冷凝水倒流到灼热的管底使试管炸裂。',
          '管口要塞一团棉花，防止高锰酸钾粉末随气流进入导管。',
          '实验结束必须先撤导管、后熄灯，否则水会倒吸使试管炸裂。',
          '不能用嘴吹灭酒精灯，要用灯帽盖灭；导管伸入集气瓶只到瓶口，不要伸到瓶内。',
        ],
      },
      {
        title: '用过氧化氢溶液制取氧气',
        purpose: '用固液常温型装置制取氧气，理解催化剂的作用与装置的优点。',
        apparatus: ['锥形瓶', '双孔橡胶塞', '长颈漏斗', '导管', '集气瓶', '玻璃片', '二氧化锰', '过氧化氢溶液'],
        figure: figH2O2O2,
        steps: [
          '在锥形瓶中加入少量二氧化锰，塞紧带长颈漏斗和导管的双孔塞，检查装置气密性。',
          '从长颈漏斗中慢慢加入过氧化氢溶液，使长颈漏斗下端伸入液面以下。',
          '把导管伸到集气瓶底部，用向上排空气法收集，用带火星的木条放在瓶口验满。',
          '收集满后用玻璃片盖住瓶口，正放在桌面上。',
        ],
        phenomenon: '锥形瓶内产生大量气泡，溶液中出现连续上升的气泡；反应结束后二氧化锰仍然存在，质量没有变化。',
        conclusion: '过氧化氢在二氧化锰的催化作用下分解生成水和氧气：2H₂O₂ —MnO₂→ 2H₂O + O₂↑；二氧化锰是催化剂，反应前后质量和化学性质都不变。',
        cautions: [
          '长颈漏斗下端必须伸入液面以下，防止生成的气体从长颈漏斗口逸出。',
          '加入过氧化氢溶液不能太快，否则气体产生过快、不易收集。',
          '该装置不需要加热，操作简便，但要注意不能把导管伸到集气瓶口就当作已伸到瓶底。',
          '实验结束后先撤导管再整理仪器，剩余药品按老师要求处理。',
        ],
      },
      {
        title: '铁丝在氧气中燃烧',
        purpose: '验证氧气的助燃性，学会准确描述燃烧现象并注意实验安全。',
        apparatus: ['集气瓶（内盛少量水或细沙）', '铁丝（绕成螺旋状）', '火柴', '坩埚钳', '氧气'],
        figure: figFeBurn,
        steps: [
          '在集气瓶底部预先放入少量水或铺一层细沙。',
          '把铁丝绕成螺旋状，一端系上一根火柴，用坩埚钳夹住另一端。',
          '点燃火柴，等火柴快燃尽时把铁丝伸入盛有氧气的集气瓶中。',
          '观察现象，反应结束后取出铁丝，观察瓶内的固体。',
        ],
        phenomenon: '铁丝在氧气中剧烈燃烧、火星四射，放出大量的热，生成黑色固体。',
        conclusion: '铁能在氧气中燃烧生成四氧化三铁：3Fe + 2O₂ —点燃→ Fe₃O₄；氧气能支持燃烧，氧气浓度越大燃烧越剧烈。',
        cautions: [
          '瓶底必须预先放少量水或细沙，防止熔化物溅落使瓶底炸裂。',
          '铁丝要绕成螺旋状，增大与氧气的接触面积、提高局部温度。',
          '等火柴快燃尽时再伸入瓶中，避免火柴燃烧消耗过多氧气。',
          '铁丝不能接触瓶壁，燃烧时不要俯视瓶口，防止火星溅出伤人。',
        ],
      },
    ],
    apps: [
      {
        title: '用排水法收集一瓶氧气并检验',
        scene: '实验室用加热高锰酸钾的方法制取一瓶氧气，要求用排水法收集并检验。',
        analysis: '装置属于固固加热型，收集用排水法（氧气不易溶于水且不与水反应，收集到的气体更纯净）。检验与验满的木条位置不同：检验伸入瓶中，验满放在瓶口。',
        steps: [
          '连接装置、检查气密性，装好药品并把试管固定在铁架台上（管口略向下倾斜、管口塞棉花）。',
          '集气瓶倒置装满水放入水槽，导管伸到瓶口，加热，等气泡连续均匀冒出时收集。',
          '集满后在水下盖好玻璃片，取出正放，用带火星的木条放在瓶口验满。',
          '实验结束先撤导管，再熄灭酒精灯。',
        ],
        result: '得到一瓶较纯净的氧气；带火星的木条在瓶口复燃说明已收集满，伸入瓶中复燃说明瓶中是氧气。',
      },
      {
        title: '比较木炭、硫、铁丝在氧气中燃烧的现象',
        scene: '课堂演示中分别把木炭、硫、铁丝放在氧气中燃烧，要求记录现象并写出方程式。',
        analysis: '三种物质在氧气中燃烧都比在空气中剧烈，但现象各不相同：木炭发白光、生成使石灰水变浑浊的气体；硫发明亮的蓝紫色火焰、生成有刺激性气味的气体；铁丝火星四射、生成黑色固体。',
        steps: [
          '木炭：在空气中加热到发红后伸入氧气中，观察现象并加入澄清石灰水检验产物。',
          '硫：在氧气中燃烧，观察火焰颜色与气味（实验在通风处进行）。',
          '铁丝：绕成螺旋状、系上火柴，燃着后伸入盛有少量水的氧气瓶中，观察现象。',
        ],
        result: '现象依次为发白光、明亮的蓝紫色火焰、火星四射生成黑色固体；反应的化学方程式依次是 C + O₂ —点燃→ CO₂、S + O₂ —点燃→ SO₂、3Fe + 2O₂ —点燃→ Fe₃O₄。',
      },
    ],
    formulas: [
      {
        name: '相对分子质量的计算',
        text: '相对分子质量 = 化学式中各原子的相对原子质量之和',
        usage: '计算 O₂（32）、KMnO₄（158）、KClO₃（122.5）等的相对分子质量，是方程式计算的中间步骤',
      },
      {
        name: '化学方程式计算的规范步骤',
        text: '设未知数 → 写方程式 → 找相关物质的相对分子质量与系数乘积 → 列比例式 → 求解 → 答',
        usage: '由一种物质的质量求另一种物质的质量；只有纯净物的质量才能代入方程式计算',
      },
      {
        name: '催化剂的「一变两不变」',
        text: '催化剂能改变反应速率；反应前后本身的质量和化学性质都不变',
        usage: '判断某物质是不是催化剂；催化剂不能改变生成物的质量，也不是反应物或生成物',
      },
      {
        name: '气体体积与集气瓶容积',
        text: '集气瓶的容积就是收集满时气体的体积（在相同条件下）',
        usage: '用排水法收集气体时，瓶内被排出的水的体积等于收集到的气体的体积',
      },
    ],
    confusions: [
      {
        wrong: '加热高锰酸钾制氧气结束时，先熄灭酒精灯，再把导管移出水面',
        right: '先把导管移出水面，再熄灭酒精灯',
        why: '先熄灯后试管内气体冷却收缩、压强减小，水槽里的水会沿着导管倒吸进灼热的试管，使试管炸裂。',
      },
      {
        wrong: '把高锰酸钾堆在试管口附近，方便加热',
        right: '把药品平铺在试管底部，并在管口塞一团棉花',
        why: '药品堆在管口会使受热不均、反应不完全；管口的棉花能防止粉末随气流进入导管造成堵塞。',
      },
      {
        wrong: '验满氧气时把带火星的木条伸入集气瓶中',
        right: '把带火星的木条放在集气瓶口，木条复燃说明已收集满',
        why: '木条伸入瓶中是「检验是不是氧气」的操作；验满只能在瓶口，否则瓶内只要有一部分氧气木条就会复燃，会误判。',
      },
      {
        wrong: '铁丝在氧气中燃烧生成黑色气体',
        right: '剧烈燃烧、火星四射，生成黑色固体四氧化三铁',
        why: '四氧化三铁是固体不是气体；把「固体」说成「气体」是现象描述中最常见的错误，也不能把产物写成 Fe₂O₃。',
      },
      {
        wrong: '硫在氧气中燃烧发出淡蓝色火焰',
        right: '硫在氧气中燃烧发出明亮的蓝紫色火焰，在空气中燃烧才是淡蓝色火焰',
        why: '氧气浓度越大，燃烧越剧烈、火焰越明亮；把空气中的现象写到氧气中，是典型的「现象描述不准确」。',
      },
    ],
    compares: [
      {
        title: '实验室制取氧气的三种方法',
        aspect: '都能得到氧气，但药品、条件、装置与操作难度各不相同',
        left: '加热高锰酸钾（或氯酸钾）',
        right: '过氧化氢溶液与二氧化锰',
        rows: [
          { item: '反应物状态', left: '固体（氯酸钾还要加二氧化锰作催化剂）', right: '液体与固体催化剂' },
          { item: '反应条件', left: '加热', right: '常温，不需要加热' },
          { item: '发生装置', left: '固固加热型（试管 + 酒精灯）', right: '固液常温型（锥形瓶 + 长颈漏斗）' },
          { item: '操作关键', left: '管口略向下倾斜、管口塞棉花、先撤导管后熄灯', right: '长颈漏斗下端伸入液面以下、控制加液速度' },
          { item: '优点', left: '药品易得、适合课堂演示', right: '操作简便、不需要加热、可随用随取' },
        ],
      },
      {
        title: '同一物质在空气与在氧气中燃烧',
        aspect: '反应的化学方程式相同，但现象的剧烈程度与描述用词不同',
        left: '在空气中',
        right: '在氧气中',
        rows: [
          { item: '硫', left: '发出淡蓝色火焰', right: '发出明亮的蓝紫色火焰' },
          { item: '木炭', left: '持续红热，没有火焰', right: '剧烈燃烧、发出白光' },
          { item: '铁丝', left: '只能加热到红热，不能燃烧', right: '剧烈燃烧、火星四射，生成黑色固体' },
          { item: '原因', left: '氧气体积分数约为 21%，氧分子浓度较小', right: '几乎全是氧气，氧分子浓度大，与可燃物碰撞机会多' },
        ],
      },
    ],
    examAngles: [
      {
        angle: '制取氧气的装置与操作顺序',
        detail: '判断装置图中管口倾斜方向、棉花、导管长短，并回答实验结束时「先撤导管还是先熄灯」，几乎年年出现。',
      },
      {
        angle: '氧气性质实验的现象描述',
        detail: '要求区别硫、木炭、铁丝在空气与氧气中燃烧的不同现象，并把现象写成规范的化学语言。',
      },
      {
        angle: '化学方程式书写与计算',
        detail: '由反应物质量求生成氧气的质量，考查方程式配平、相对分子质量计算与规范解题步骤。',
      },
      {
        angle: '催化剂概念的理解',
        detail: '判断二氧化锰是不是催化剂、它改变了什么、没有改变什么，考查「一变两不变」。',
      },
    ],
    materials: [
      {
        id: 'chem-experiment-4-m1',
        material:
          '【原创仿真】某同学制取氧气的过程如下：① 把高锰酸钾装入试管，试管口向上倾斜固定在铁架台上；② 加热后用排水法收集，把导管伸入集气瓶内直到接近瓶底；③ 收集满后用带火星的木条伸入集气瓶中，木条复燃，他判断氧气已收集满；④ 实验结束时先熄灭酒精灯，再把导管移出水面；⑤ 剩余的高锰酸钾倒回原试剂瓶。',
        questions: [
          {
            id: 'chem-experiment-4-m1-q1',
            stem: '（4 分）逐条指出上述操作中的错误并改正。',
            answer:
              '① 试管口应略向下倾斜，防止冷凝水倒流使试管炸裂；同时管口要塞一团棉花。② 用排水法收集时导管只伸到集气瓶口，不能伸入瓶内，否则瓶内的水不易排尽、气体不易进入。③ 验满应把带火星的木条放在集气瓶口，不能伸入瓶中（伸入瓶中是检验的操作）。④ 应先撤导管、后熄灭酒精灯，否则水会倒吸使试管炸裂。⑤ 用剩的药品不能倒回原试剂瓶，应放入指定容器。',
            rubric: [
              '指出管口倾斜方向错误并说明原因（1 分）',
              '指出导管伸入集气瓶内过长（1 分）',
              '指出验满操作错误并给出正确做法（1 分）',
              '指出操作顺序错误（先撤导管后熄灯）并说明水倒吸的后果（1 分）',
            ],
          },
          {
            id: 'chem-experiment-4-m1-q2',
            stem: '（3 分）写出加热高锰酸钾制取氧气的化学方程式，并计算加热 31.6 g 高锰酸钾理论上最多能生成多少克氧气（相对原子质量：K 39、Mn 55、O 16）。',
            answer:
              '2KMnO₄ —加热→ K₂MnO₄ + MnO₂ + O₂↑。KMnO₄ 的相对分子质量 = 39 + 55 + 16×4 = 158，方程式中 2KMnO₄ 与 O₂ 的质量比为 316 : 32。设生成氧气的质量为 x，则 316 : 32 = 31.6 g : x，解得 x = 3.2 g。答：最多能生成 3.2 g 氧气。',
            answerSteps: [
              '写出方程式 2KMnO₄ —加热→ K₂MnO₄ + MnO₂ + O₂↑ 并配平',
              '算出 KMnO₄ 的相对分子质量 158，注意系数 2',
              '列比例式 316 : 32 = 31.6 g : x',
              '解得 x = 3.2 g，写出答语',
            ],
            rubric: [
              '方程式正确、配平、条件写「加热」（1 分）',
              '算出 KMnO₄ 相对分子质量 158（1 分）',
              '比例式列对（1 分）',
              '结果 3.2 g 并写出答语（1 分，只写数值不写单位扣分）',
            ],
          },
          {
            id: 'chem-experiment-4-m1-q3',
            stem: '（2 分）收集满氧气后应怎样放置集气瓶？为什么？',
            answer: '应把集气瓶正放在桌面上（用玻璃片盖住瓶口）。因为氧气的密度比空气略大，正放时氧气沉在瓶内不易逸出；若倒放，氧气会较快散失。',
            rubric: ['答出「正放、盖玻璃片」（1 分）', '答出「氧气密度比空气略大」（1 分）'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'chem-experiment-4-q1',
        type: 'choice',
        stem: '如图为实验室制取并收集氧气的装置。关于该装置，下列说法正确的是',
        figure: figQKMnO4,
        options: [
          '试管口向上倾斜，便于药品滑入管底',
          '管口的一团棉花可以用橡胶塞代替，防止药品漏出',
          '导管应伸入集气瓶内直到接近瓶底',
          '试管口略向下倾斜、管口塞一团棉花，导管只伸到集气瓶口',
        ],
        answer: 'D',
        explanation:
          'D 正确：管口略向下倾斜防止冷凝水倒流炸裂试管，棉花防止粉末进入导管，排水法收集时导管只伸到瓶口。A 错在管口向上时冷凝水会倒流到灼热的管底，使试管炸裂。B 错在棉花的作用是阻挡粉末，塞住管口会使产生的气体无法排出。C 错在排水法收集时导管伸入瓶内太长，瓶内的水排不尽、气体不易进入。',
        difficulty: 2,
        tags: ['氧气制取', '装置图'],
      },
      {
        id: 'chem-experiment-4-q2',
        type: 'choice',
        stem: '用排水法收集氧气，实验结束时正确的操作顺序是',
        options: [
          '先把导管移出水面，再熄灭酒精灯',
          '先熄灭酒精灯，再把导管移出水面',
          '先把水槽撤走，再熄灭酒精灯',
          '先把集气瓶从水槽中取出，再熄灭酒精灯',
        ],
        answer: 'A',
        explanation:
          'A 正确：先撤导管，试管内气体仍与空气相通，不会倒吸。B 错在先熄灯会使管内气体冷却收缩、压强减小，水会倒吸进灼热的试管使其炸裂。C 错在撤水槽时导管还插在水里，水会顺着导管流进试管。D 错在取出集气瓶时导管仍在水中，倒吸照样发生，正确的做法是先撤导管再熄灯。',
        difficulty: 1,
        tags: ['氧气制取', '操作顺序'],
      },
      {
        id: 'chem-experiment-4-q3',
        type: 'choice',
        stem: '关于氧气的检验与验满，下列说法正确的是',
        options: [
          '检验氧气时把带火星的木条放在集气瓶口',
          '检验氧气时把带火星的木条伸入集气瓶中；验满时把带火星的木条放在集气瓶口',
          '验满时把带火星的木条伸入集气瓶中部',
          '用燃着的木条检验氧气，木条熄灭说明是氧气',
        ],
        answer: 'B',
        explanation:
          'B 正确：检验要伸入瓶中，验满只在瓶口。A 把两者弄反了，木条放在瓶口只能判断是否收集满。C 错在把木条伸入瓶中是检验的操作，无法判断「满没满」。D 错在氧气能支持燃烧，木条会燃烧得更旺而不是熄灭；木条熄灭是二氧化碳的特征。',
        difficulty: 1,
        tags: ['氧气', '检验', '验满'],
      },
      {
        id: 'chem-experiment-4-q4',
        type: 'choice',
        stem: '关于铁丝在氧气中燃烧的实验，下列说法正确的是',
        options: [
          '铁丝在氧气中燃烧发出明亮的蓝紫色火焰',
          '集气瓶底部不需要放水或细沙，直接燃烧即可',
          '剧烈燃烧、火星四射，生成黑色固体，瓶底要预先放少量水或细沙',
          '燃烧的产物是黑色气体三氧化二铁',
        ],
        answer: 'C',
        explanation:
          'C 正确：铁丝在氧气中剧烈燃烧、火星四射，生成黑色固体四氧化三铁；瓶底放水或细沙是为了防止熔化物溅落使瓶底炸裂。A 错在铁丝燃烧是火星四射而不是火焰，明亮蓝紫色火焰是硫燃烧的现象。B 错在瓶底不放水或细沙，高温熔化物落下会使瓶底炸裂。D 错在产物是固体 Fe₃O₄，不是气体，也不是 Fe₂O₃。',
        difficulty: 1,
        tags: ['氧气性质', '现象描述'],
      },
      {
        id: 'chem-experiment-4-q5',
        type: 'choice',
        stem: '硫在氧气中燃烧的现象是',
        options: [
          '发出淡蓝色火焰，生成无色无味的气体',
          '发出白光，生成黑色固体',
          '产生大量白烟，生成白色固体',
          '发出明亮的蓝紫色火焰，生成有刺激性气味的气体',
        ],
        answer: 'D',
        explanation:
          'D 正确：硫在氧气中燃烧发出明亮的蓝紫色火焰，生成有刺激性气味的二氧化硫。A 描述的是硫在空气中燃烧的现象，而且二氧化硫有刺激性气味，不是无色无味。B 是木炭在氧气中燃烧（发白光）与铁丝燃烧（生成黑色固体）的现象混搭。C 是红磷燃烧的现象，与硫无关。',
        difficulty: 1,
        tags: ['氧气性质', '现象描述'],
      },
      {
        id: 'chem-experiment-4-q6',
        type: 'fill',
        stem: '加热高锰酸钾制取氧气时，要在试管口塞一团____，防止粉末随气流进入导管。',
        answer: '棉花|棉花团|脱脂棉',
        explanation:
          '高锰酸钾是粉末状固体，加热时粉末容易随气流进入导管造成堵塞。在管口塞一团棉花就能挡住粉末，同时不妨碍气体通过；不能用橡胶塞或纸团代替，那样会堵住气体通道。',
        difficulty: 1,
        tags: ['氧气制取', '基本操作'],
      },
      {
        id: 'chem-experiment-4-q7',
        type: 'fill',
        stem: '用过氧化氢溶液制取氧气时，二氧化锰起____作用（填「催化」或「反应物」）。',
        answer: '催化|催化剂',
        explanation:
          '二氧化锰是这个反应的催化剂，能改变反应速率，但本身的质量和化学性质在反应前后都没有改变，也不是反应物或生成物，不会增加生成氧气的总量。过氧化氢分解生成水和氧气：2H₂O₂ —MnO₂→ 2H₂O + O₂↑。',
        difficulty: 1,
        tags: ['氧气制取', '催化剂'],
      },
      {
        id: 'chem-experiment-4-q8',
        type: 'short',
        stem: '实验室加热 31.6 g 高锰酸钾制取氧气，理论上最多能生成多少克氧气？（相对原子质量：K 39、Mn 55、O 16）请写出规范解题步骤。',
        answer:
          '2KMnO₄ —加热→ K₂MnO₄ + MnO₂ + O₂↑。KMnO₄ 的相对分子质量 = 39 + 55 + 16×4 = 158，方程式中 2KMnO₄ 与 O₂ 的质量比为 (2×158) : 32 = 316 : 32。设生成氧气的质量为 x，则 316 : 32 = 31.6 g : x，解得 x = 3.2 g。答：最多能生成 3.2 g 氧气。',
        answerSteps: [
          '写出并配平方程式：2KMnO₄ —加热→ K₂MnO₄ + MnO₂ + O₂↑',
          '算相对分子质量：KMnO₄ 为 158，2KMnO₄ 为 316，O₂ 为 32',
          '设生成氧气质量为 x，列比例式 316 : 32 = 31.6 g : x',
          '解得 x = 3.2 g，写出答语',
        ],
        explanation:
          '解题格式比结果更值分：先写并配平方程式（条件写「加热」），再算 KMnO₄ 的相对分子质量 158 并注意它前面的系数 2，然后列比例式 316 : 32 = 31.6 g : x。常见错误有三个：算出 158 却忘了乘系数 2；把 31.6 g 直接当成氧气的质量；只写「3.2」不写单位与答语。',
        rubric: [
          '方程式书写正确并配平、条件写「加热」（1 分）',
          '相对分子质量计算正确（1 分）',
          '比例式列对（1 分）',
          '解得 3.2 g 并写单位与答语（1 分）',
        ],
        difficulty: 2,
        tags: ['化学计算', '氧气制取'],
      },
      {
        id: 'chem-experiment-4-q9',
        type: 'short',
        stem: '有同学认为：用过氧化氢溶液制氧气比加热高锰酸钾更好，因为它不需要加热。请评价这一说法，并比较两种方法的优点与需要注意的地方。',
        answer:
          '这种说法有道理但不全面。用过氧化氢溶液制氧气的优点是不需要加热、操作简便、可以随用随取，反应速率可以通过加液速度控制；要注意长颈漏斗下端必须伸入液面以下形成液封，加入溶液不能太快。加热高锰酸钾的优点是不需要液体药品、药品易得、适合演示实验，而且生成物中还有二氧化锰生成；缺点是必须加热、操作步骤多，管口要略向下倾斜并塞棉花，结束时必须先撤导管后熄灯。所以两种方法各有适用范围，要根据实验条件与需要选择，不能说其中一种绝对更好。',
        explanation:
          '评价类题目不能只说「对」或「不对」，要分三层写：这种方法有什么优点、有哪些必须注意的操作要求、结论要留有余地。只答「过氧化氢法更好」拿不到高分，因为它忽略了长颈漏斗下端要伸入液面以下、加液速度不能太快这些要求，也忽略了加热高锰酸钾法在课堂演示中的优势。',
        rubric: [
          '承认过氧化氢法不需加热、操作简便的优点（1 分）',
          '指出过氧化氢法的注意点：长颈漏斗下端伸入液面以下、控制加液速度（1 分）',
          '指出高锰酸钾法的优点与注意点：管口向下倾斜、塞棉花、先撤导管后熄灯（1 分）',
          '给出「各有适用范围、按条件选择」的结论，语气不绝对（1 分）',
        ],
        difficulty: 2,
        tags: ['实验评价', '氧气制取'],
      },
      {
        id: 'chem-experiment-4-q10',
        type: 'short',
        stem: '请画出用高锰酸钾制取氧气并用排水法收集的装置连接图，标出试管口的倾斜方向、棉花的位置、导管的长短与集气瓶的正倒。',
        answer:
          '铁架台夹住试管，管口略向下倾斜，管口塞一团棉花，塞紧带导管的单孔塞；导管从管口弯向水槽，伸到倒置、装满水的集气瓶口；试管下方用酒精灯外焰加热。',
        answerFigure: figKMnO4O2,
        explanation:
          '这道作图题有四个得分点：试管口略向下倾斜、管口画出棉花、集气瓶倒置并装满水、导管只伸到瓶口。最容易丢分的是把试管画成管口向上（那是给液体加热的画法），以及把导管画进集气瓶里（那是排空气法收集的画法）。',
        rubric: [
          '画出铁架台、试管、酒精灯的位置关系（1 分）',
          '试管口略向下倾斜（2 分，画成管口向上不给分）',
          '管口画出棉花（1 分）',
          '集气瓶倒置并装满水、导管只伸到瓶口（2 分）',
        ],
        difficulty: 3,
        tags: ['作图', '氧气制取', '装置图'],
      },
    ],
  },
  /* ================================================================ */
  /* 5 · 二氧化碳的实验室制取与检验                                    */
  /* ================================================================ */
  {
    id: 'chem-experiment-5',
    unit: '人教版九年级 · 实验基本操作与气体制备',
    grade: 'all',
    title: '二氧化碳的实验室制取与检验',
    question: '制二氧化碳为什么用大理石和稀盐酸，而不用稀硫酸、不用浓盐酸、不用碳酸钠粉末？装置与制氧气有什么不同？怎样检验与验满？',
    keyIdea: '药品用大理石（石灰石）与稀盐酸：稀硫酸会生成微溶的硫酸钙覆盖在大理石表面使反应停止，浓盐酸易挥发使气体不纯，碳酸钠粉末反应太快不便控制；二氧化碳密度比空气大且能溶于水，只能用向上排空气法收集。',
    steps: [
      {
        heading: '药品的选择：三个「不用」都有化学原因',
        representation: '宏观',
        body:
          '实验室用大理石（或石灰石，主要成分 CaCO₃）与稀盐酸反应制取二氧化碳。不用稀硫酸：生成的硫酸钙微溶于水，会覆盖在大理石表面，阻止反应继续进行；不用浓盐酸：浓盐酸易挥发出氯化氢气体，使收集到的二氧化碳不纯；不用碳酸钠粉末或碳酸钙粉末：粉末与酸接触面积大、反应太快，不便于收集和控制。',
        note: '三个「不用」的理由要分清楚：稀硫酸是「反应停下来」，浓盐酸是「气体不纯」，粉末是「反应太快」，答题时不能互换。',
      },
      {
        heading: '符号：方程式与配平要点',
        representation: '符号',
        body:
          '制取：CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑；检验：CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O；与水反应：CO₂ + H₂O → H₂CO₃（使紫色石蕊溶液变红）。写第一个方程式时有三个易错点：CaCl₂ 中氯的角标是 2；反应物里有两个 HCl；生成物中既有水又有二氧化碳，两者都不能漏，CO₂ 后面要标 ↑。',
        note: '工业上高温煅烧石灰石也能得到二氧化碳：CaCO₃ —高温→ CaO + CO₂↑，但这是工业制法，条件写「高温」，不能与实验室制法混为一谈。',
      },
      {
        heading: '装置与操作：固液常温型 + 向上排空气法',
        representation: '宏观',
        body:
          '发生装置用固液常温型：锥形瓶里放大理石，双孔塞上插长颈漏斗和导管，长颈漏斗下端必须伸入液面以下形成液封。收集装置用向上排空气法：二氧化碳的密度比空气大，集气瓶正放（瓶口向上），导管伸到接近瓶底，把瓶内空气从瓶口排尽。收集满后用玻璃片盖住瓶口，正放在桌面上。',
        figure: figCO2Prepare,
        note: '长颈漏斗下端不伸入液面以下，生成的气体会从长颈漏斗口逸出，这是气体制取实验中最常见的一处装置错误。',
      },
      {
        heading: '检验与验满：试剂不同、位置也不同',
        representation: '应用',
        body:
          '检验二氧化碳：把气体通入澄清石灰水，若石灰水变浑浊，说明气体是二氧化碳。验满：把燃着的木条放在集气瓶口，若木条熄灭，说明二氧化碳已收集满。检验必须让气体与试剂接触（通入或加入），验满只在瓶口进行；两者用到的试剂不同，不能混用。',
        figure: figCO2Verify,
        note: '把燃着的木条伸入瓶中验满是错的：即使没有收集满，瓶内下部已充满二氧化碳，木条也会熄灭，会得出错误结论。',
      },
      {
        heading: '与氧气制取装置的比较：两处关键差别',
        representation: '应用',
        body:
          '发生装置不同：制氧气常用加热高锰酸钾或氯酸钾（固固加热型，需要酒精灯），也可以用过氧化氢溶液（固液常温型）；制二氧化碳只能用固液常温型。收集装置不同：氧气不易溶于水，可以用排水法收集到更纯净的气体，也可以用向上排空气法；二氧化碳能溶于水并与水反应，只能用向上排空气法。此外两者的验满方法也不同：氧气用带火星的木条放在瓶口，二氧化碳用燃着的木条放在瓶口。',
        figure: figDeviceTypes,
        note: '比较类问题要写清「依据」：发生装置看反应物状态与条件，收集装置看密度与溶解性，把依据写出来才能拿满分。',
      },
    ],
    equations: [
      {
        equation: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑',
        condition: '常温',
        phenomenon: '大理石表面产生大量气泡，石块逐渐变小，生成的气体能使澄清石灰水变浑浊',
        note: '配平要点：钙、碳原子左右各 1 个，氯原子左边 2 个（两个 HCl）、右边 CaCl₂ 中 2 个；氢原子左边 2 个、右边 H₂O 中 2 个；氧原子左边 3 个、右边 H₂O 1 个加 CO₂ 2 个共 3 个。',
      },
      {
        equation: 'CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O',
        condition: '常温',
        phenomenon: '澄清石灰水变浑浊，出现白色沉淀',
        note: '这是二氧化碳的检验反应。Ca(OH)₂ 的下标 2 与 CaCO₃ 后的沉淀符号 ↓ 都不能漏，两边各原子数已配平。',
      },
      {
        equation: 'CO₂ + H₂O → H₂CO₃',
        condition: '常温',
        phenomenon: '二氧化碳通入水中，紫色石蕊溶液变红；加热后红色又变回紫色',
        note: '使石蕊变红的是生成的碳酸，不是二氧化碳本身；碳酸不稳定，受热又分解成水和二氧化碳。',
      },
      {
        equation: 'CaCO₃ —高温→ CaO + CO₂↑',
        condition: '高温',
        phenomenon: '石灰石在高温下分解，得到生石灰并放出二氧化碳',
        note: '这是工业制取二氧化碳（和生石灰）的方法，条件是「高温」；实验室制取用的是大理石与稀盐酸，条件写「常温」，两者不能混淆。',
      },
    ],
    experiments: [
      {
        title: '实验室制取二氧化碳',
        purpose: '用大理石与稀盐酸制取并收集一瓶二氧化碳，掌握固液常温型装置与向上排空气法。',
        apparatus: ['锥形瓶', '双孔橡胶塞', '长颈漏斗', '导管', '集气瓶', '玻璃片', '大理石（石灰石）', '稀盐酸'],
        figure: figCO2Prepare,
        steps: [
          '按图连接装置，检查气密性（夹紧导管，从长颈漏斗加水至下端管口形成水柱，静置观察水柱高度是否变化）。',
          '把几块大理石放入锥形瓶，塞紧双孔塞，从长颈漏斗加入稀盐酸，使长颈漏斗下端伸入液面以下。',
          '把导管伸到集气瓶底部，用向上排空气法收集。',
          '把燃着的木条放在集气瓶口，木条熄灭说明已收集满；盖上玻璃片，正放在桌面上。',
        ],
        phenomenon: '大理石表面产生大量气泡，锥形瓶内液面有气泡不断上升，集气瓶内气体逐渐增多；收集满时瓶口的木条熄灭。',
        conclusion: '实验室用大理石与稀盐酸反应制取二氧化碳：CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑；用向上排空气法收集。',
        cautions: [
          '不能用稀硫酸代替稀盐酸：生成的硫酸钙微溶，会覆盖在大理石表面使反应停止。',
          '不能用浓盐酸：浓盐酸易挥发，会使收集到的二氧化碳中混有氯化氢气体。',
          '长颈漏斗下端必须伸入液面以下，否则气体会从漏斗口逸出。',
          '导管要伸到接近瓶底；收集满后立即盖上玻璃片并正放，防止气体逸出和空气进入。',
        ],
      },
      {
        title: '检验与验满二氧化碳',
        purpose: '练习用澄清石灰水检验二氧化碳、用燃着的木条验满。',
        apparatus: ['集气瓶（盛有待检气体）', '试管', '导管', '澄清石灰水', '燃着的木条'],
        figure: figCO2Verify,
        steps: [
          '取一支试管，加入约 2 mL 澄清石灰水。',
          '把待检气体通过导管通入澄清石灰水中，观察现象（导管口伸入液面以下）。',
          '另取一瓶正在收集的二氧化碳，把燃着的木条放在集气瓶口，观察木条是否熄灭。',
        ],
        phenomenon: '澄清石灰水变浑浊，出现白色沉淀；放在瓶口的燃着的木条熄灭。',
        conclusion: '使澄清石灰水变浑浊的气体是二氧化碳：CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O；燃着的木条在瓶口熄灭说明二氧化碳已收集满。',
        cautions: [
          '检验时要让气体真正通入石灰水中，不能只是把石灰水倒在瓶口。',
          '验满时木条要放在瓶口，不能伸入瓶中。',
          '不能用带火星的木条验满二氧化碳，那是验满氧气的方法。',
          '二氧化碳不能供给呼吸，实验时不要在密闭空间内大量收集，注意通风。',
        ],
      },
    ],
    apps: [
      {
        title: '制取一瓶二氧化碳并检验',
        scene: '实验室要用大理石和稀盐酸制取一瓶二氧化碳，并证明收集到的气体确实是二氧化碳。',
        analysis: '发生装置选固液常温型（长颈漏斗下端伸入液面以下），收集装置选向上排空气法（密度比空气大、能溶于水）。检验用澄清石灰水，验满用燃着的木条放在瓶口。',
        steps: [
          '连接装置并检查气密性，装入大理石，从长颈漏斗加入稀盐酸。',
          '用向上排空气法收集，导管伸到接近瓶底，用燃着的木条放在瓶口验满。',
          '收集满后盖上玻璃片正放，另取少量气体通入澄清石灰水检验。',
          '写出制取与检验的两个化学方程式。',
        ],
        result: '石灰水变浑浊证明气体是二氧化碳：CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑、CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O。',
      },
      {
        title: '选择装置：制二氧化碳与制氧气有什么不同',
        scene: '桌上有两套发生装置和三套收集装置，要求分别为制取氧气和制取二氧化碳各选一套并说明依据。',
        analysis: '发生装置看反应物状态与反应条件：制氧气用加热高锰酸钾（固固加热型）或过氧化氢溶液（固液常温型）；制二氧化碳用大理石与稀盐酸（固液常温型）。收集装置看密度与溶解性：氧气不易溶于水，可用排水法或向上排空气法；二氧化碳能溶于水且密度比空气大，只能用向上排空气法。',
        steps: [
          '制氧气：选固固加热型或固液常温型；收集优先选排水法（更纯净）。',
          '制二氧化碳：选固液常温型；收集只能选向上排空气法。',
          '分别说明选择依据，并写出验满方法（氧气用带火星木条，二氧化碳用燃着木条，都放在瓶口）。',
        ],
        result: '两套装置的选择都能由「反应物状态与条件」「密度与溶解性」推出，注意二氧化碳不能用排水法。',
      },
    ],
    formulas: [
      {
        name: '相对分子质量',
        text: 'CaCO₃ 的相对分子质量 = 40 + 12 + 16×3 = 100；CO₂ 的相对分子质量 = 12 + 16×2 = 44',
        usage: '由碳酸钙的质量计算生成二氧化碳的质量；混合物的质量要先乘以质量分数换算成纯净物的质量',
      },
      {
        name: '气体能否用排水法收集',
        text: '能溶于水或能与水反应的气体不能用排水法',
        usage: '判断收集方法：二氧化碳能溶于水并与水反应，只能用向上排空气法；氧气不易溶于水，可以用排水法',
      },
      {
        name: '排空气法的方向',
        text: '密度比空气大用向上排空气法（集气瓶正放）；密度比空气小用向下排空气法（集气瓶倒放）',
        usage: '选择集气瓶的正放或倒放；二氧化碳与氧气都正放，氢气倒放',
      },
      {
        name: '检验与验满的试剂选择',
        text: '二氧化碳：检验用澄清石灰水，验满用燃着的木条放在瓶口',
        usage: '回答「如何检验」「如何验满」时分别写清试剂与位置，不能把两者混用',
      },
    ],
    confusions: [
      {
        wrong: '用稀硫酸与大理石反应制取二氧化碳，因为硫酸便宜',
        right: '用稀盐酸与大理石反应',
        why: '稀硫酸与碳酸钙反应生成的硫酸钙微溶于水，会覆盖在大理石表面，阻止反应继续进行，反应很快就会停下来。',
      },
      {
        wrong: '用碳酸钠粉末与稀盐酸反应，反应快、效率高',
        right: '用块状的大理石（石灰石）与稀盐酸反应',
        why: '粉末与酸的接触面积太大，反应太快，气体来不及收集，也无法控制反应速率，不便于操作。',
      },
      {
        wrong: '验满二氧化碳时把燃着的木条伸入集气瓶中',
        right: '把燃着的木条放在集气瓶口，木条熄灭说明已收集满',
        why: '把木条伸入瓶中时，即使没有收集满，瓶内下部已充满二氧化碳，木条也会熄灭，会误判为已经收集满。',
      },
      {
        wrong: '二氧化碳能溶于水，但仍然可以用排水法收集',
        right: '二氧化碳只能用向上排空气法收集',
        why: '二氧化碳不仅能溶于水，还能与水反应生成碳酸，用排水法收集既收集不到、也会损失，所以不能用排水法。',
      },
    ],
    compares: [
      {
        title: '实验室制取氧气与制取二氧化碳',
        aspect: '两条制备路线在药品、发生装置、收集装置与检验方法上都不相同',
        left: '制取氧气',
        right: '制取二氧化碳',
        rows: [
          { item: '药品', left: '高锰酸钾（或氯酸钾与二氧化锰），也可用过氧化氢溶液', right: '大理石（石灰石）与稀盐酸' },
          { item: '反应物状态与条件', left: '固体加热，或固体与液体常温反应', right: '固体与液体常温反应' },
          { item: '发生装置', left: '固固加热型（也可用固液常温型）', right: '固液常温型' },
          { item: '收集装置', left: '排水法（更纯净）或向上排空气法', right: '只能用向上排空气法' },
          { item: '验满方法', left: '带火星的木条放在集气瓶口，木条复燃', right: '燃着的木条放在集气瓶口，木条熄灭' },
          { item: '检验方法', left: '带火星的木条伸入集气瓶，木条复燃', right: '通入澄清石灰水，石灰水变浑浊' },
          { item: '装置特别要求', left: '管口略向下倾斜、管口塞棉花、先撤导管后熄灯', right: '长颈漏斗下端伸入液面以下' },
        ],
      },
      {
        title: '制二氧化碳为什么不用稀硫酸、不用浓盐酸',
        aspect: '同样是酸，替换之后出现的问题各不相同',
        left: '用稀硫酸',
        right: '用浓盐酸',
        rows: [
          { item: '发生的变化', left: '生成的硫酸钙微溶于水，覆盖在大理石表面', right: '浓盐酸易挥发出氯化氢气体' },
          { item: '后果', left: '反应很快停止，收集不到足量的气体', right: '收集到的气体中混有氯化氢，不纯' },
          { item: '正确做法', left: '改用稀盐酸', right: '改用稀盐酸' },
        ],
      },
    ],
    examAngles: [
      {
        angle: '药品选择与理由',
        detail: '以「为什么不用稀硫酸、不用浓盐酸、不用碳酸钠粉末」的方式设问，考查对反应现象与气体纯度的理解，是实验题的高频设问。',
      },
      {
        angle: '装置图与导管位置',
        detail: '给装置图判断正误，错误点常是长颈漏斗下端没有伸入液面以下、导管只伸到瓶口、集气瓶倒放。',
      },
      {
        angle: '检验与验满的区分',
        detail: '并列设问「如何检验」「如何验满」，考查试剂与位置是否写对，混淆两者就要丢分。',
      },
      {
        angle: '含杂质的方程式计算',
        detail: '给出大理石的质量与碳酸钙的质量分数，要求先换算成纯净物质量，再用化学方程式计算生成二氧化碳的质量。',
      },
    ],
    materials: [
      {
        id: 'chem-experiment-5-m1',
        material:
          '【原创仿真】某同学制取二氧化碳的步骤如下：① 在锥形瓶中加入几块大理石，再加入稀硫酸；② 长颈漏斗的下端管口位于液面以上；③ 把导管伸到集气瓶口处收集；④ 收集一段时间后，把燃着的木条伸入集气瓶中，木条熄灭，他判断二氧化碳已收集满；⑤ 收集满后把集气瓶倒放在桌面上。',
        questions: [
          {
            id: 'chem-experiment-5-m1-q1',
            stem: '（4 分）逐条指出上述操作中的错误并改正，并说明第①处错误的化学原因。',
            answer:
              '① 错：不能用稀硫酸，因为碳酸钙与稀硫酸反应生成微溶于水的硫酸钙，会覆盖在大理石表面使反应停止；应改用稀盐酸。② 错：长颈漏斗下端管口必须伸入液面以下形成液封，否则生成的气体会从长颈漏斗口逸出。③ 错：导管应伸到接近集气瓶底部，把瓶内的空气排尽。④ 错：验满应把燃着的木条放在集气瓶口，不能伸入瓶中。⑤ 错：二氧化碳密度比空气大，集气瓶应正放（瓶口向上）并用玻璃片盖住。',
            rubric: [
              '指出不能用稀硫酸并说明硫酸钙微溶、覆盖表面（1 分）',
              '指出长颈漏斗下端要伸入液面以下（1 分）',
              '指出导管要伸到接近瓶底（1 分）',
              '指出验满时木条要放在瓶口、集气瓶应正放（1 分）',
            ],
          },
          {
            id: 'chem-experiment-5-m1-q2',
            stem: '（3 分）写出实验室制取二氧化碳的化学方程式；并计算 25 g 大理石（碳酸钙的质量分数为 80%）与足量稀盐酸反应，最多能生成多少克二氧化碳（相对原子质量：C 12、O 16、Ca 40）。',
            answer:
              '化学方程式：CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑。大理石中碳酸钙的质量 = 25 g × 80% = 20 g。CaCO₃ 的相对分子质量为 100，CO₂ 的相对分子质量为 44。设生成二氧化碳的质量为 x，则 100 : 44 = 20 g : x，解得 x = 8.8 g。答：最多能生成 8.8 g 二氧化碳。',
            answerSteps: [
              '写出方程式 CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑',
              '把混合物质量换算成纯净物质量：25 g × 80% = 20 g',
              '列出比例式 100 : 44 = 20 g : x',
              '解得 x = 8.8 g，写出答语',
            ],
            rubric: [
              '方程式正确、配平并标出气体符号（1 分）',
              '先把 25 g 换算成碳酸钙 20 g（1 分）',
              '比例式列对、结果 8.8 g（1 分）',
            ],
          },
          {
            id: 'chem-experiment-5-m1-q3',
            stem: '（2 分）怎样检验收集到的气体是二氧化碳？写出操作、现象与反应的化学方程式。',
            answer:
              '把气体通入澄清石灰水中，若澄清石灰水变浑浊，说明该气体是二氧化碳。化学方程式：CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O。',
            rubric: ['写出「通入澄清石灰水」（1 分）', '写出现象「变浑浊」并写出正确方程式（1 分）'],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'chem-experiment-5-q1',
        type: 'choice',
        stem: '如图为实验室制取二氧化碳的装置。关于该装置，下列说法错误的是',
        figure: figQCO2,
        options: [
          '长颈漏斗下端伸入液面以下，是为了便于添加液体药品',
          '导管伸到接近集气瓶底部，是为了把瓶内的空气排尽',
          '集气瓶正放（瓶口向上），是因为二氧化碳的密度比空气大',
          '收集满后应盖上玻璃片，把集气瓶正放在桌面上',
        ],
        answer: 'A',
        explanation:
          '本题选错误的说法。A 错误：长颈漏斗下端伸入液面以下形成液封，目的是防止生成的二氧化碳从长颈漏斗口逸出；「便于添加液体药品」是长颈漏斗本身的作用，与「伸入液面以下」无关。B、C、D 都正确：排空气法要伸到瓶底才能排尽空气，正放与盖玻璃片都是由二氧化碳密度比空气大决定的。',
        difficulty: 2,
        tags: ['二氧化碳制取', '装置图'],
      },
      {
        id: 'chem-experiment-5-q2',
        type: 'choice',
        stem: '实验室制取二氧化碳，下列药品组合最合适的是',
        options: [
          '大理石与稀硫酸',
          '碳酸钠粉末与稀盐酸',
          '大理石（石灰石）与稀盐酸',
          '大理石与浓盐酸',
        ],
        answer: 'C',
        explanation:
          'C 正确：大理石与稀盐酸反应速率适中、便于收集，是最合适的组合。A 错在碳酸钙与稀硫酸反应生成微溶的硫酸钙，覆盖在大理石表面使反应很快停止。B 错在碳酸钠粉末与酸接触面积大、反应太快，气体来不及收集，也无法控制反应速率。D 错在浓盐酸易挥发出氯化氢气体，使收集到的二氧化碳不纯。',
        difficulty: 1,
        tags: ['二氧化碳制取', '药品选择'],
      },
      {
        id: 'chem-experiment-5-q3',
        type: 'choice',
        stem: '检验二氧化碳是否收集满的方法是',
        options: [
          '把澄清石灰水倒入集气瓶中',
          '把燃着的木条伸入集气瓶中部',
          '把带火星的木条放在集气瓶口',
          '把燃着的木条放在集气瓶口，木条熄灭说明已收集满',
        ],
        answer: 'D',
        explanation:
          'D 正确：验满要在瓶口观察现象，燃着的木条熄灭说明瓶内二氧化碳已满。A 错在倒入石灰水是「检验是不是二氧化碳」的操作，而且会把气体污染、无法再收集使用。B 错在把木条伸入瓶内时，即使没有收集满，瓶内下部也已充满二氧化碳，木条照样熄灭，结论不可靠。C 错在带火星的木条是检验氧气、验满氧气的方法，二氧化碳会使木条熄灭而不是复燃。',
        difficulty: 1,
        tags: ['二氧化碳', '验满'],
      },
      {
        id: 'chem-experiment-5-q4',
        type: 'choice',
        stem: '下列关于二氧化碳性质与收集方法的说法，正确的是',
        options: [
          '二氧化碳能溶于水，所以可以用排水法收集',
          '二氧化碳的密度比空气大，只能用向上排空气法收集',
          '二氧化碳不溶于水，可以用排水法收集',
          '二氧化碳的密度比空气小，应该用向下排空气法收集',
        ],
        answer: 'B',
        explanation:
          'B 正确：二氧化碳密度比空气大，所以集气瓶正放、用向上排空气法收集。A 错在「能溶于水」恰恰是不能用排水法的原因，而且二氧化碳还能与水反应生成碳酸。C 错在二氧化碳能溶于水且能与水反应，说法本身就不对。D 错在二氧化碳密度比空气大，用向下排空气法会收集不到。',
        difficulty: 1,
        tags: ['二氧化碳', '收集方法'],
      },
      {
        id: 'chem-experiment-5-q5',
        type: 'choice',
        stem: '若用稀硫酸代替稀盐酸与大理石反应制取二氧化碳，会出现的情况是',
        options: [
          '反应一会儿就停止，因为生成的硫酸钙微溶于水，覆盖在大理石表面阻止了反应的进行',
          '反应更快，能收集到更多的二氧化碳',
          '与用稀盐酸完全相同，没有区别',
          '生成的气体更纯净，不需要检验',
        ],
        answer: 'A',
        explanation:
          'A 正确：碳酸钙与稀硫酸反应生成硫酸钙，硫酸钙微溶于水，会覆盖在大理石表面，使酸无法继续与碳酸钙接触，反应很快停止。B、C 都错在忽略了硫酸钙的微溶性，把两种酸等同看待。D 错在气体是否纯净与用哪种酸无关（用浓盐酸反而会因挥发而不纯），而且任何气体都必须检验。',
        difficulty: 2,
        tags: ['二氧化碳制取', '药品选择'],
      },
      {
        id: 'chem-experiment-5-q6',
        type: 'fill',
        stem: '制取二氧化碳时，为防止生成的气体从长颈漏斗口逸出，长颈漏斗的下端管口必须伸入____以下。',
        answer: '液面|液面以下|液面下',
        explanation:
          '长颈漏斗下端伸入液面以下就形成了「液封」：瓶内气体要逸出必须先克服这段液柱的压强，因此只能从导管排出。如果下端在液面以上，气体就会直接从漏斗口跑掉，收集不到气体。',
        difficulty: 1,
        tags: ['二氧化碳制取', '装置'],
      },
      {
        id: 'chem-experiment-5-q7',
        type: 'fill',
        stem: '检验二氧化碳时，把气体通入澄清石灰水，石灰水变浑浊，反应的化学方程式是 CO₂ + Ca(OH)₂ → ____↓ + H₂O。',
        answer: 'CaCO₃|碳酸钙',
        explanation:
          '二氧化碳与氢氧化钙反应生成难溶于水的碳酸钙，所以石灰水变浑浊。钙的角标是 1，碳酸根的写法是 CO₃，不能写成 CaCO₂ 或 Ca(CO₃)₂；沉淀符号 ↓ 也不能漏。',
        difficulty: 1,
        tags: ['二氧化碳', '化学用语', '检验'],
      },
      {
        id: 'chem-experiment-5-q8',
        type: 'short',
        stem: '取 25 g 大理石（其中碳酸钙的质量分数为 80%）与足量稀盐酸充分反应，最多能生成多少克二氧化碳？（相对原子质量：C 12、O 16、Ca 40）请写出规范解题步骤。',
        answer:
          '大理石中碳酸钙的质量 = 25 g × 80% = 20 g。设生成二氧化碳的质量为 x。CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑，CaCO₃ 的相对分子质量为 100，CO₂ 的相对分子质量为 44，则 100 : 44 = 20 g : x，解得 x = 8.8 g。答：最多能生成 8.8 g 二氧化碳。',
        answerSteps: [
          '写出并配平方程式：CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑',
          '把混合物质量换算为纯净物质量：25 g × 80% = 20 g',
          '列比例式 100 : 44 = 20 g : x',
          '解得 x = 8.8 g，写出答语',
        ],
        explanation:
          '这道题的「坑」在于 25 g 大理石不是纯净物：只有纯净物的质量才能代入方程式，所以要先换算成碳酸钙的质量（25 g × 80% = 20 g），再列比例式 100 : 44 = 20 g : x。常见错误有三个：直接用 25 g 列比例式；把 80% 理解成「杂质占 80%」而算出 5 g；算出结果不写单位与答语。',
        rubric: [
          '方程式书写正确并配平（1 分）',
          '先把 25 g 换算成碳酸钙 20 g（1 分，直接用 25 g 列式不给分）',
          '比例式与相对分子质量正确（1 分）',
          '结果 8.8 g 并写出答语（1 分）',
        ],
        difficulty: 2,
        tags: ['化学计算', '二氧化碳制取'],
      },
      {
        id: 'chem-experiment-5-q9',
        type: 'short',
        stem: '小明要用图所示装置制取二氧化碳，但实验台上只有稀硫酸和碳酸钠粉末。请评价他能否用这些药品制取二氧化碳，说明理由，并给出建议。',
        answer:
          '不能。用稀硫酸与大理石反应会生成微溶于水的硫酸钙，覆盖在大理石表面，反应很快停止，收集不到足量的二氧化碳；用碳酸钠粉末与酸反应太快，气体来不及收集，也无法控制反应速率，而且粉末容易随气流进入导管。建议改用大理石（石灰石）与稀盐酸：反应速率适中、便于控制，收集到的气体也比较纯净。',
        explanation:
          '评价题要把「为什么不行」说透：稀硫酸失败的原因是生成微溶的硫酸钙覆盖在大理石表面（反应停下来），碳酸钠粉末失败的原因是接触面积太大、反应太快（来不及收集、无法控制），两者的道理完全不同，不能都笼统写成「反应不好」。最后一定要给出可行的替代药品，只批评不建议拿不到末档分。',
        rubric: [
          '作出「不能用这些药品」的判断（1 分）',
          '说明稀硫酸的问题：生成微溶的硫酸钙覆盖表面使反应停止（1 分）',
          '说明碳酸钠粉末的问题：反应太快、不便收集与控制（1 分）',
          '给出建议：改用大理石与稀盐酸（1 分）',
        ],
        difficulty: 2,
        tags: ['实验评价', '药品选择', '二氧化碳制取'],
      },
      {
        id: 'chem-experiment-5-q10',
        type: 'short',
        stem: '请画出实验室制取并收集二氧化碳的装置图，标出长颈漏斗下端管口的位置、导管伸入集气瓶的位置，以及集气瓶的正放或倒放。',
        answer:
          '锥形瓶里放大理石，双孔塞上插长颈漏斗与导管，长颈漏斗下端管口伸入液面以下；导管伸到集气瓶内接近瓶底；集气瓶正放（瓶口向上）。',
        answerFigure: figCO2Prepare,
        explanation:
          '这幅装置图有三个必须画准的位置关系：长颈漏斗下端管口在液面以下（画在液面以上就等于装置漏气）、导管伸到集气瓶内接近瓶底（画在瓶口是排水法的画法）、集气瓶正放（画成倒放就变成收集氢气的方法了）。把这三处画对，图的分基本就拿满了。',
        rubric: [
          '画出锥形瓶、双孔塞、长颈漏斗与导管的连接（1 分）',
          '长颈漏斗下端管口画在液面以下（2 分，画在液面以上不给分）',
          '导管伸到集气瓶内接近瓶底（2 分）',
          '集气瓶正放（瓶口向上）（1 分，画成倒放不给分）',
        ],
        difficulty: 3,
        tags: ['作图', '二氧化碳制取', '装置图'],
      },
    ],
  },

  /* ================================================================ */
  /* 6 · 实验方案的设计与评价                                          */
  /* ================================================================ */
  {
    id: 'chem-experiment-6',
    unit: '人教版九年级 · 实验基本操作与气体制备',
    grade: 'all',
    title: '实验方案的设计与评价：控制变量、对照实验与误差分析',
    question: '一个可靠的实验方案要满足什么条件？控制变量法是「控制什么、改变什么」？现象描述到什么程度才算准确？结果异常时该从哪里找原因？',
    keyIdea: '对照实验只改变一个变量，其余条件必须完全相同；现象描述要写清「什么物质在什么条件下出现了什么」，不能把结论当现象；结果异常按「药品、装置、操作」三条线索逐一排查。',
    steps: [
      {
        heading: '控制变量与对照实验：只让一个因素变',
        representation: '宏观',
        body:
          '要研究某个因素的影响，就必须把其他条件全部固定下来。具体做法是设置两组（或更多组）实验：除了要研究的那个变量不同，其他条件（药品的量、溶液的浓度、温度、反应时间等）都相同，其中一组作为对照。例如探究二氧化锰对过氧化氢分解速率的影响：两支试管都取等体积、等浓度的过氧化氢溶液，只有一支加入二氧化锰，比较产生气泡的快慢。',
        figure: figControlVar,
        note: '答题时的规范表述是「其他条件相同，只改变……」，把「控制相同的条件」一条条写出来，比只写「控制变量」得分高得多。',
      },
      {
        heading: '实验现象的准确描述：写看到的，不写想到的',
        representation: '宏观',
        body:
          '现象描述要包含三件事：什么物质、在什么条件下、出现了什么（颜色变化、状态变化、发光放热、气泡、沉淀、气味）。现象必须是能观察到的：检验二氧化碳时应写「生成能使澄清石灰水变浑浊的气体」，不能写「生成了二氧化碳」——那是结论，不是现象。还要分清「在空气中」与「在氧气中」：硫在空气中是淡蓝色火焰，在氧气中是明亮的蓝紫色火焰。',
        note: '把结论当现象写是失分最多的一类错误；把「白色固体」写成「白烟」、把「气体」写成「固体」同样不给分。',
      },
      {
        heading: '实验方案的优缺点评价与改进',
        representation: '应用',
        body:
          '评价一个方案通常从五个角度入手：可行性（药品是否易得、条件实验室能否满足）、安全性（是否加热、是否有毒或腐蚀性）、环保性（尾气、废液如何处理）、简便性（步骤是否繁琐）、准确性（现象是否明显、能否排除干扰）。改进的思路也在这五个角度里：换药品、加对照、补尾气处理、改变量取方法、简化步骤。',
        note: '评价题要「先说优点、再说不足、最后给改进」，只写「这个方案不好」是拿不到分的，必须写出「不好在哪里」。',
      },
      {
        heading: '误差与异常现象分析：按三条线索排查',
        representation: '应用',
        body:
          '实验结果与预期不符时，先判断是「偏大」还是「偏小」，再按线索排查。药品方面：用量不足、变质、混有杂质；装置方面：漏气、导管位置不对；操作方面：顺序有误、没有冷却就读数、读数时俯视或仰视。例如测定空气中氧气含量时结果偏小，常见原因就是红磷不足、装置漏气、没有等装置冷却就打开止水夹。',
        figure: figRedP,
        note: '排查时要一条条说清「这个原因为什么会造成这个结果」，只罗列原因不给分。',
      },
      {
        heading: '符号：用方程式把现象和结论连起来',
        representation: '符号',
        body:
          '现象之所以出现，背后都有化学反应。测定空气中氧气含量时，红磷燃烧的方程式是 4P + 5O₂ —点燃→ 2P₂O₅，生成的五氧化二磷是固体，所以瓶内气体减少、压强减小，打开止水夹后水被压入瓶中，进入的水的体积就是被消耗的氧气的体积。同理，检验二氧化碳时用 CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O 解释「变浑浊」，探究过氧化氢分解速率时用 2H₂O₂ —MnO₂→ 2H₂O + O₂↑ 解释「气泡」。',
        note: '写方程式时条件与配平都要正确：4P + 5O₂ 的系数 4 和 5 不能少，2P₂O₅ 的下标也不能写成 P₂O₅ 以外的形式。',
      },
    ],
    equations: [
      {
        equation: '4P + 5O₂ —点燃→ 2P₂O₅',
        condition: '点燃',
        phenomenon: '红磷燃烧产生大量白烟，放出热量，生成白色固体',
        note: '配平：磷原子左边 4 个、右边 2P₂O₅ 中也是 4 个；氧原子左边 10 个、右边 2×5 = 10 个。注意 P₂O₅ 的下标，不能写成 PO₅ 或 P₂O₃。',
      },
      {
        equation: '2H₂O₂ —MnO₂→ 2H₂O + O₂↑',
        condition: '二氧化锰作催化剂（常温）',
        phenomenon: '溶液中产生大量气泡，带火星的木条复燃；反应前后二氧化锰的质量不变',
        note: '这个方程式是探究实验的「主角」：比较两支试管中产生气泡的快慢，就能看出二氧化锰对分解速率的影响。',
      },
      {
        equation: 'CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O',
        condition: '常温',
        phenomenon: '澄清石灰水变浑浊',
        note: '用现象反推物质时，这个方程式是「变浑浊」的唯一解释，CaCO₃ 后的 ↓ 不能漏。',
      },
    ],
    experiments: [
      {
        title: '探究二氧化锰对过氧化氢分解速率的影响',
        purpose: '用控制变量法设计对照实验，判断二氧化锰对过氧化氢分解速率的影响。',
        apparatus: ['试管（2 支）', '胶头滴管', '药匙', '5% 过氧化氢溶液', '二氧化锰', '带火星的木条'],
        figure: figControlVar,
        steps: [
          '取两支规格相同的试管，分别加入等体积（如各 5 mL）的 5% 过氧化氢溶液。',
          '在其中一支试管中加入少量二氧化锰，另一支不加，作为对照。',
          '观察并比较两支试管中产生气泡的快慢与多少。',
          '分别用带火星的木条放在试管口，比较木条复燃的情况。',
        ],
        phenomenon: '加入二氧化锰的试管中立即产生大量气泡，气泡产生快而多；不加二氧化锰的试管中只有极少量气泡，反应很慢。',
        conclusion: '在其他条件相同的情况下，加入二氧化锰能明显加快过氧化氢的分解速率：2H₂O₂ —MnO₂→ 2H₂O + O₂↑。若要证明二氧化锰是催化剂，还必须证明反应前后它的质量和化学性质都没有改变。',
        cautions: [
          '两支试管中过氧化氢溶液的浓度、体积和温度必须相同，只有「是否加二氧化锰」不同。',
          '两支试管要选规格相同的，观察时间也要相同。',
          '二氧化锰的用量要相同或只有一支加入，不能用不同质量的两份二氧化锰作比较。',
          '本实验只能说明二氧化锰能加快反应速率，不能直接得出「它是催化剂」的结论，还要检验反应前后它的质量和化学性质。',
        ],
      },
      {
        title: '测定空气中氧气的含量',
        purpose: '用红磷燃烧的方法测定空气中氧气的体积分数，并分析误差产生的原因。',
        apparatus: ['集气瓶（内加少量水）', '燃烧匙', '双孔橡胶塞', '导管', '止水夹', '烧杯', '红磷'],
        figure: figRedP,
        steps: [
          '在集气瓶内加入少量水，把集气瓶容积分成五等份并做好标记；把导管与烧杯中的水连接，夹紧止水夹。',
          '在燃烧匙中放入足量的红磷，点燃后立即伸入集气瓶并塞紧塞子。',
          '等红磷燃烧停止、集气瓶冷却到室温后，打开止水夹，观察并记录进入瓶中水的体积。',
          '计算进入瓶内水的体积占瓶内空气体积的比例。',
        ],
        phenomenon: '红磷燃烧产生大量白烟，放出热量；冷却后打开止水夹，水被压入集气瓶中，进入的水的体积约占瓶内空气体积的 1/5。',
        conclusion: '氧气约占空气体积的 1/5。红磷燃烧消耗了瓶内的氧气：4P + 5O₂ —点燃→ 2P₂O₅，生成的五氧化二磷是固体，瓶内气体减少、压强减小，水就被压入瓶中。',
        cautions: [
          '红磷必须足量，否则氧气不能完全消耗，结果偏小。',
          '装置不能漏气，否则外界空气进入，结果偏小。',
          '必须等集气瓶冷却到室温后再打开止水夹，否则瓶内气体受热膨胀，进入的水偏少、结果偏小。',
          '不能用木炭、硫代替红磷，因为它们燃烧的产物是气体，瓶内压强变化不明显。',
        ],
      },
    ],
    apps: [
      {
        title: '设计对照实验：比较两种催化剂的效率',
        scene: '实验室有两种物质都可以加快过氧化氢分解，要求设计实验比较它们的效率高低。',
        analysis: '这是一个控制变量问题：要比较催化剂的种类对速率的影响，就必须让过氧化氢溶液的浓度、体积、温度以及催化剂的用量都相同，只改变催化剂的种类，并比较相同时间内产生气体的多少。',
        steps: [
          '取三支规格相同的试管，各加入 5 mL 5% 的过氧化氢溶液（另一支不加催化剂作对照）。',
          '分别加入等质量的两种催化剂，第三支不加。',
          '同时开始计时，比较相同时间内产生气泡的多少（或用带火星木条复燃的快慢判断）。',
          '控制温度、溶液浓度与体积都相同，重复实验确认结论可靠。',
        ],
        result: '相同条件下产生气泡最快的那一组所用催化剂效率最高；不加催化剂的一组作为对照，说明催化剂确实加快了反应速率。',
      },
      {
        title: '分析「测定空气中氧气含量」结果偏小的原因',
        scene: '某同学按教材实验测定空气中氧气的含量，结果进入瓶内的水明显少于瓶内空气体积的 1/5。',
        analysis: '结果偏小说明「被消耗的氧气少了」或「水进不来」。按线索排查：药品（红磷不足、红磷受潮变质）、装置（塞子没塞紧、导管漏气）、操作（没等冷却就打开止水夹、点燃后伸入太慢）。',
        steps: [
          '检查红磷的量是否足量、是否变质。',
          '检查装置是否漏气：塞子、导管连接处逐一排查。',
          '检查是否等装置完全冷却后才打开止水夹。',
          '逐条说明每个原因为什么会使结果偏小。',
        ],
        result: '把原因与后果一一对应起来：红磷不足→氧气没消耗完；装置漏气→外界空气进入；未冷却就打开止水夹→瓶内气体受热膨胀，这三种情况都会使进入的水偏少、结果偏小。',
      },
    ],
    formulas: [
      {
        name: '控制变量法的表述',
        text: '其他条件相同，只改变要研究的那个变量，并设置对照实验',
        usage: '设计探究实验与回答「需要控制哪些条件」时使用；要逐条写出必须相同的量',
      },
      {
        name: '现象描述的三要素',
        text: '什么物质 + 在什么条件下 + 出现了什么（颜色、状态、光、热、气泡、沉淀、气味）',
        usage: '描述实验现象时使用；不能把结论（生成二氧化碳）当作现象写',
      },
      {
        name: '实验评价的五个角度',
        text: '可行性、安全性、环保性、简便性、准确性',
        usage: '评价或改进实验方案时逐个角度检查，评价题要先说优点再说不足与改进',
      },
      {
        name: '误差分析的三条线索',
        text: '药品（不足、变质、含杂质）、装置（漏气、位置不对）、操作（顺序、读数、时间）',
        usage: '结果偏大或偏小时逐条排查，并说明每个原因为什么造成这个结果',
      },
    ],
    confusions: [
      {
        wrong: '要证明二氧化锰能加快过氧化氢分解，只做一次「加二氧化锰」的实验就够了',
        right: '必须做对照实验：一支只加过氧化氢溶液，另一支加等体积同浓度的过氧化氢溶液和二氧化锰，其他条件相同',
        why: '没有对照就无法判断气泡变快是二氧化锰引起的，还是溶液本身、温度等其他因素造成的，结论不可靠。',
      },
      {
        wrong: '检验二氧化碳时写「生成了二氧化碳」',
        right: '写「生成能使澄清石灰水变浑浊的气体」',
        why: '现象必须是能直接观察到的；「生成了二氧化碳」要通过检验才能确定，属于结论而不是现象。',
      },
      {
        wrong: '测定空气中氧气含量结果偏小，一定是红磷的量不足',
        right: '要逐条排查：红磷不足、装置漏气、未冷却就打开止水夹都可能使结果偏小',
        why: '同一个结果可能由多个原因造成，答题时要把可能的原因都写出来，并说明各自的道理。',
      },
      {
        wrong: '只要把方案做出来、能看到现象，就是一个好方案',
        right: '好方案还要考虑安全性、环保性、操作是否简便、现象是否可靠',
        why: '实验评价不只评价「能不能做」，还评价「做得安不安全、环不环保、结论可不可靠」。',
      },
    ],
    compares: [
      {
        title: '现象与结论',
        aspect: '一个写在卷面上的现象、一个推理出来的结论，两者的表达方式完全不同',
        left: '现象（能观察到的）',
        right: '结论（推理得出的）',
        rows: [
          { item: '二氧化碳检验', left: '澄清石灰水变浑浊', right: '该气体是二氧化碳' },
          { item: '红磷在空气中燃烧', left: '产生大量白烟，放出热量', right: '红磷燃烧生成五氧化二磷（4P + 5O₂ —点燃→ 2P₂O₅）' },
          { item: '铁丝在氧气中燃烧', left: '剧烈燃烧、火星四射，生成黑色固体', right: '铁与氧气反应生成四氧化三铁（3Fe + 2O₂ —点燃→ Fe₃O₄）' },
          { item: '书写要求', left: '只写看到、听到、闻到的，不写物质名称的推断', right: '要有依据，常需写出化学方程式', },
        ],
      },
      {
        title: '对照实验中的「相同」与「不同」',
        aspect: '探究某因素的影响时，哪些量必须相同、哪个量必须不同',
        left: '必须相同的条件',
        right: '必须不同的条件',
        rows: [
          { item: '探究二氧化锰的影响', left: '过氧化氢溶液的浓度、体积、温度；试管规格；观察时间', right: '是否加入二氧化锰' },
          { item: '探究浓度的影响', left: '溶液体积、温度、是否加催化剂、催化剂的量', right: '过氧化氢溶液的浓度' },
          { item: '探究温度的影响', left: '溶液浓度、体积、是否加催化剂', right: '温度（如冷水浴与热水浴）' },
          { item: '答题要求', left: '要逐条写出控制相同的量，写成「其他条件相同」太笼统', right: '要明确指出「唯一的变量是什么」' },
        ],
      },
    ],
    examAngles: [
      {
        angle: '控制变量与对照实验的设计',
        detail: '要求补全实验步骤、指出需要控制相同的条件或变量，是探究题的核心设问，答案必须写到具体的量。',
      },
      {
        angle: '现象的准确描述',
        detail: '给出实验操作要求写现象，考查是否区分「空气中与氧气中」「固体与气体」「烟与雾」，把结论当现象写要扣分。',
      },
      {
        angle: '方案的优缺点评价与改进',
        detail: '给出一个方案要求评价并改进，答题要按可行性、安全性、环保性、简便性、准确性几个角度展开。',
      },
      {
        angle: '误差与异常现象分析',
        detail: '给出偏大或偏小的结果，要求写出可能原因并说明道理，常见背景是测定空气中氧气的含量、溶质质量分数的测定。',
      },
    ],
    materials: [
      {
        id: 'chem-experiment-6-m1',
        material:
          '【原创仿真】为探究影响过氧化氢分解速率的因素，某小组设计了三组实验：甲组取 5 mL 5% 过氧化氢溶液，不加其他物质；乙组取 5 mL 5% 过氧化氢溶液，加入 0.5 g 二氧化锰；丙组取 5 mL 10% 过氧化氢溶液，加入 0.5 g 二氧化锰。三组实验都在同一室温下进行，记录相同时间内收集到的气体体积。',
        questions: [
          {
            id: 'chem-experiment-6-m1-q1',
            stem: '（4 分）甲组在实验中起什么作用？由甲组与乙组的对比可以得出什么结论？',
            answer:
              '甲组起对照作用：它不加二氧化锰，其他条件与乙组相同，用来排除「过氧化氢溶液本身就会很快分解」这一可能，使「二氧化锰能加快分解速率」的结论可靠。由甲组与乙组的对比可知：在其他条件相同的情况下，加入二氧化锰能明显加快过氧化氢的分解速率（乙组相同时间内产生气泡更多、收集到的气体体积更大）。',
            rubric: [
              '答出甲组是对照组（1 分）',
              '说明对照的目的：排除其他因素的干扰，使结论可靠（1 分）',
              '得出「二氧化锰能加快过氧化氢分解速率」的结论（1 分）',
              '指出比较的前提是其他条件相同（1 分）',
            ],
          },
          {
            id: 'chem-experiment-6-m1-q2',
            stem: '（3 分）由乙组与丙组的对比，可以研究什么问题？要得出可靠结论，这两组中还必须保持相同的条件有哪些？',
            answer:
              '乙组与丙组中二氧化锰的用量相同、过氧化氢溶液的体积相同，只有溶液的浓度不同（5% 与 10%），所以研究的是过氧化氢溶液的浓度对分解速率的影响。要得出可靠结论，还必须保持温度相同、二氧化锰的质量与状态相同、过氧化氢溶液的体积相同、测量时间相同，且使用规格相同的容器。',
            rubric: [
              '答出研究的是「过氧化氢溶液的浓度对分解速率的影响」（1 分）',
              '写出至少两项必须相同的条件（1 分）',
              '指出唯一的变量是溶液的浓度（1 分）',
            ],
          },
          {
            id: 'chem-experiment-6-m1-q3',
            stem: '（3 分）若想证明二氧化锰是过氧化氢分解的催化剂，还需要补充什么实验？请写出你的思路。',
            answer:
              '还需要证明反应前后二氧化锰的质量和化学性质都没有改变：① 称量反应前加入的二氧化锰质量，反应结束后把二氧化锰过滤、洗涤、干燥后再次称量，比较两次质量是否相等；② 把回收得到的二氧化锰再加入新的过氧化氢溶液中，观察它是否仍能加快反应速率，以此证明它的化学性质没有改变。只有质量与化学性质都不变，才能说它是催化剂。',
            rubric: [
              '答出要检验反应前后二氧化锰的质量是否改变（1 分）',
              '答出要检验反应前后二氧化锰的化学性质是否改变（再催化一次）（1 分）',
              '说明「质量与化学性质都不变」才是催化剂（1 分）',
            ],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'chem-experiment-6-q1',
        type: 'choice',
        stem: '如图为探究二氧化锰对过氧化氢分解速率影响的实验。关于该对照实验，下列说法正确的是',
        figure: figControlVar,
        options: [
          '两支试管中二氧化锰的用量可以不同，反正研究的就是二氧化锰',
          '两支试管中过氧化氢溶液的浓度、体积和温度都必须相同，只有是否加入二氧化锰不同',
          '该实验的变量是过氧化氢溶液的浓度',
          '只要加入二氧化锰的试管中气泡多，就能说明二氧化锰是过氧化氢分解的催化剂',
        ],
        answer: 'B',
        explanation:
          'B 正确：对照实验只允许一个变量不同，其余条件都要相同。A 错在加入量不同就成了「二氧化锰用量」这个新变量，无法判断速率变化由什么引起。C 错在该实验的变量是「是否加入二氧化锰」，浓度是三组实验里才需要变化的条件。D 错在只能说明二氧化锰能加快反应速率；要证明它是催化剂，还必须证明反应前后它的质量和化学性质都没有改变。',
        difficulty: 2,
        tags: ['控制变量', '对照实验'],
      },
      {
        id: 'chem-experiment-6-q2',
        type: 'choice',
        stem: '下列实验现象的描述，正确的是',
        options: [
          '硫在氧气中燃烧发出淡蓝色火焰',
          '铁丝在氧气中燃烧生成黑色气体',
          '木炭在氧气中燃烧发出明亮的蓝紫色火焰',
          '红磷在空气中燃烧产生大量白烟，生成白色固体',
        ],
        answer: 'D',
        explanation:
          'D 正确：红磷燃烧产生大量白烟（五氧化二磷固体小颗粒），生成白色固体。A 错在硫在氧气中是明亮的蓝紫色火焰，淡蓝色火焰是它在空气中的现象。B 错在铁丝燃烧生成的是黑色固体四氧化三铁，不是气体。C 错在木炭在氧气中剧烈燃烧、发出白光，没有火焰，蓝紫色火焰是硫的现象。',
        difficulty: 2,
        tags: ['现象描述'],
      },
      {
        id: 'chem-experiment-6-q3',
        type: 'choice',
        stem: '测定空气中氧气的含量时，若测得结果明显小于 1/5，下列原因中不可能的是',
        options: ['红磷的量不足', '装置漏气', '红磷的量过多', '没有等装置冷却就打开止水夹'],
        answer: 'C',
        explanation:
          '本题选「不可能」的一项。C 正确：红磷足量或过量才能把瓶内的氧气消耗完，过量不会使结果偏小（过量只是浪费药品）。A 会使氧气没有消耗完，结果偏小。B 会使外界空气进入瓶内，结果偏小。D 会使瓶内气体受热膨胀、压强偏大，进入的水偏少，结果偏小。',
        difficulty: 2,
        tags: ['误差分析', '实验探究'],
      },
      {
        id: 'chem-experiment-6-q4',
        type: 'choice',
        stem: '下列关于对照实验的说法，正确的是',
        options: [
          '对照实验中除了要研究的变量外，其他条件都应相同',
          '对照实验只能设置两组，不能设置三组',
          '只要现象明显，不设对照也能得出可靠的结论',
          '对照实验中可以同时改变两个变量，这样效率更高',
        ],
        answer: 'A',
        explanation:
          'A 正确：这就是控制变量法的核心。B 错在对照实验可以设置多组，如探究浓度与温度的影响可以设三组甚至更多。C 错在没有对照就无法排除其他因素的影响，现象再明显也得不出可靠结论。D 错在同时改变两个变量时，无法判断结果到底由哪个变量造成。',
        difficulty: 1,
        tags: ['对照实验', '控制变量'],
      },
      {
        id: 'chem-experiment-6-q5',
        type: 'choice',
        stem: '要证明二氧化锰是过氧化氢分解的催化剂，下列实验必须做的是',
        options: [
          '只做过氧化氢溶液不加二氧化锰的实验',
          '比较加入二氧化锰前后反应速率的变化，并检验反应前后二氧化锰的质量和化学性质是否改变',
          '只把二氧化锰单独加热，看能否产生氧气',
          '比较不同品牌的过氧化氢溶液哪个更好',
        ],
        answer: 'B',
        explanation:
          'B 正确：催化剂要满足「一变两不变」——改变反应速率，本身的质量和化学性质在反应前后都不变，因此这三件事都要检验。A 只做了对照，只能说明不加二氧化锰时反应慢，不能说明二氧化锰的作用。C 只能说明二氧化锰受热的变化，与它在过氧化氢分解中的作用无关。D 比较的是药品品牌，与本实验要证明的问题无关。',
        difficulty: 2,
        tags: ['催化剂', '实验设计'],
      },
      {
        id: 'chem-experiment-6-q6',
        type: 'fill',
        stem: '探究温度对过氧化氢分解速率的影响时，两组实验中过氧化氢溶液的浓度和体积必须____。',
        answer: '相同|一样|相等|保持一致',
        explanation:
          '研究温度的影响，唯一的变量只能是温度，浓度、体积、是否加催化剂、催化剂的量都必须相同，否则无法判断速率的差别是温度造成的还是浓度造成的。答题时要逐条写出这些必须相同的条件，而不是笼统地写「其他条件相同」。',
        difficulty: 1,
        tags: ['控制变量', '实验设计'],
      },
      {
        id: 'chem-experiment-6-q7',
        type: 'fill',
        stem: '测定空气中氧气含量时，若红磷的量不足，测得的氧气体积分数会偏____。',
        answer: '小|低|少',
        explanation:
          '红磷不足时，瓶内的氧气不能被完全消耗，被消耗的氧气体积比实际的小，压入瓶内的水也就偏少，所以测得的氧气体积分数偏小。除此以外，装置漏气、未冷却就打开止水夹同样会使结果偏小。',
        difficulty: 1,
        tags: ['误差分析', '实验探究'],
      },
      {
        id: 'chem-experiment-6-q8',
        type: 'short',
        stem: '某同学测定空气中氧气的含量：集气瓶的容积为 150 mL，实验前在瓶内预先加入 20 mL 水，其余空间是空气。红磷燃烧并冷却后打开止水夹，有 25 mL 水进入集气瓶。请计算测得的氧气体积分数（结果精确到 0.1%），并说明这个结果比 21% 偏小还是偏大。',
        answer:
          '瓶内空气的体积 = 150 mL − 20 mL = 130 mL。进入瓶内的水的体积等于被消耗的氧气的体积，即 25 mL。氧气的体积分数 = 25 mL ÷ 130 mL × 100% ≈ 19.2%。19.2% 小于空气中氧气约占 21% 的实际值，所以这个结果偏小。',
        answerSteps: [
          '先算出瓶内空气的体积：150 mL − 20 mL = 130 mL',
          '进入瓶内的水的体积就是被消耗的氧气体积：25 mL',
          '计算体积分数：25 ÷ 130 × 100% ≈ 19.2%',
          '与 21% 比较，判断结果偏小，并写出答语',
        ],
        explanation:
          '计算的关键是「瓶内空气只有 130 mL」：预先加入的 20 mL 水占了容积，不能算作空气，所以要用 150 mL − 20 mL。进入瓶内的水的体积等于被消耗的氧气的体积，这是本题的原理分。算得 19.2% 小于 21%，说明实验存在误差，可能的原因是红磷不足、装置漏气或没有冷却就打开止水夹。',
        rubric: [
          '正确算出瓶内空气体积 130 mL（1 分，直接用 150 mL 计算不给分）',
          '明确「进入的水的体积等于被消耗氧气的体积」（1 分）',
          '算出 19.2% 并写出单位（1 分）',
          '判断结果偏小并给出理由（1 分）',
        ],
        difficulty: 3,
        tags: ['化学计算', '误差分析'],
      },
      {
        id: 'chem-experiment-6-q9',
        type: 'short',
        stem: '请设计实验探究「过氧化氢溶液的浓度对分解速率的影响」，写出实验步骤、必须控制相同的条件、观察的现象与结论。',
        answer:
          '实验步骤：取三支规格相同的试管，分别加入 5 mL 5%、10%、15% 的过氧化氢溶液，再各加入 0.5 g 二氧化锰，同时开始计时，记录相同时间内收集到的气体体积（或比较产生气泡的快慢）。必须控制相同的条件：溶液的体积、温度、二氧化锰的质量与状态、试管规格、观察（计时）的时间。现象：浓度越大的试管中产生气泡越快越多，相同时间内收集到的气体体积越大。结论：在其他条件相同的情况下，过氧化氢溶液的浓度越大，分解速率越快。',
        explanation:
          '设计实验要写全四部分：操作、控制相同的条件、观察的现象、得出的结论。本题的变量是过氧化氢溶液的浓度，那么体积、温度、催化剂的种类与用量、试管规格、计时时间都必须相同；只写「其他条件相同」会被扣分。现象要写成可比较的量（相同时间内收集到的气体体积、产生气泡的快慢），不能只写「反应更快」。',
        rubric: [
          '写出「取不同浓度的过氧化氢溶液、体积相同」的操作（1 分）',
          '写明加入等量同种催化剂或都不加催化剂（1 分）',
          '逐条写出必须控制相同的条件（体积、温度、催化剂的量与种类、时间）（2 分）',
          '写出观察的现象与结论，并点出「唯一的变量是浓度」（1 分）',
        ],
        difficulty: 3,
        tags: ['实验设计', '控制变量'],
      },
      {
        id: 'chem-experiment-6-q10',
        type: 'short',
        stem: '请画出探究「二氧化锰对过氧化氢分解速率的影响」的对照实验装置简图（两支试管），标出哪一支加入了二氧化锰、哪一支没有加入，并画出产生气泡多少的差别。',
        answer:
          '两支规格相同的试管中各加入等体积、等浓度的过氧化氢溶液；左管不加二氧化锰，只有极少量气泡；右管加入少量二氧化锰，产生大量气泡。',
        answerFigure: figControlVar,
        explanation:
          '作图题的得分点是「一眼看得出这是对照实验」：两支试管规格相同、液面相同，只有一支标出加入二氧化锰，并用气泡多少表现快慢差别。只画两支试管而没有任何标注，或者两支都标了二氧化锰，就等于没有对照，分就丢了。',
        rubric: [
          '画出两支规格相同的试管，液面高度相同（1 分）',
          '标出其中一支加入二氧化锰、另一支不加（2 分）',
          '用气泡多少表现出反应快慢的差别（2 分）',
          '标注「其他条件相同」（1 分）',
        ],
        difficulty: 2,
        tags: ['作图', '对照实验'],
      },
    ],
  },
  /* ================================================================ */
  /* 7 · 化学实验操作考试                                              */
  /* ================================================================ */
  {
    id: 'chem-experiment-7',
    unit: '化学实验操作考试 · 评分与失分',
    grade: 'all',
    title: '化学实验操作考试：评分要点与常见失分',
    question: '实验操作考试（10 分，另场进行）评委看什么？哪些动作最容易扣分？怎样把该拿的分稳稳拿到手？',
    keyIdea: '评分通常按「器材检查 → 药品取用 → 操作顺序 → 读数与记录 → 现象描述 → 整理与安全」分项进行；失分往往不是「不会做」，而是动作不完整、顺序颠倒、做了却不说、做完不整理。',
    steps: [
      {
        heading: '进场第一步：清点检查器材与药品',
        representation: '宏观',
        body:
          '拿到试题后不要急着动手。先清点台上的仪器是否齐全、是否完好（试管有没有裂纹、量筒刻度是否清晰、胶头滴管胶帽是否老化），再核对药品与试题要求是否一致、量筒量程是否合适、仪器是否干净。发现器材破损、药品标签与要求不符或缺少器材时，要举手报告请评委处理，不能自己到别的台子上拿或者凑合着做。',
        figure: figOpFlow,
        note: '很多评分表的第一项就是「器材检查与报告」。这一步不花多少时间，却是白送的分；跳过它，后面做得再漂亮也可能先丢一档。',
      },
      {
        heading: '药品取用：评分点最密集的一段',
        representation: '宏观',
        body:
          '取用药品的动作要点要成串地做出来：取下瓶塞倒放在桌面上，标签向着手心，瓶口紧靠容器口慢慢倾倒；取粉末用药匙或纸槽、取块状用镊子；用胶头滴管时垂直悬空滴加，不伸入、不接触内壁；取量按规定（未说明用量时液体取 1—2 mL、固体盖满试管底部）；用剩的药品放入指定容器，不倒回原瓶。',
        note: '这几个动作都是「看得见的分」：瓶塞怎么放、标签朝哪边、滴管离试管口多远，评委一眼就能看出。动作要做完整、做慢一点，不要为了快而含糊。',
      },
      {
        heading: '操作顺序与关键细节：评委看的是「顺序对不对」',
        representation: '宏观',
        body:
          '装置连接好以后先检查气密性，再装入药品。加热时用外焰、先预热再集中加热，试管口方向要正确（加热固体管口略向下倾斜、加热液体管口不对着人、液体不超过试管容积的 1/3）。用排水法收集气体时，等气泡连续均匀冒出再收集，结束时先把导管移出水面、再熄灭酒精灯。过滤守「一贴二低三靠」，蒸发到出现较多固体时就停止加热。',
        figure: figOrderError,
        note: '顺序错误常常是「一步扣两项」：既扣操作顺序分，又因为现象异常再扣现象分。先撤导管后熄灯这一条几乎年年出现在评分细则里。',
      },
      {
        heading: '读数与数据记录：如实、平视、带单位',
        representation: '应用',
        body:
          '量取液体时把量筒放在水平桌面上，视线与凹液面最低处保持水平读数；托盘天平称量时左物右码、精确到 0.1 g；读数与计算的数据要如实填在记录表上并带上单位，写错了可以在规定范围内划改，但不要涂成一团，更不能为了「好看」把数据改成整数。',
        figure: figCylinder,
        note: '俯视读数偏大、仰视读数偏小，操作考试中评委能看到视线角度，笔试中则会追问「这样读数对结果有什么影响」。',
      },
      {
        heading: '现象观察与描述：边做边说，说规范的话',
        representation: '应用',
        body:
          '操作考试常常要求「边操作边说明现象」。现象要说到点子上：什么物质、在什么条件下、出现了什么（颜色变化、气泡、沉淀、发光放热、气味）。例如把气体验满时说「木条在瓶口熄灭，说明二氧化碳已收集满」，比只说「有现象」得分高得多。做完不说不描述，会直接丢掉现象描述这一项的分。',
        figure: figSmell,
        note: '描述要准确：澄清石灰水是「变浑浊」（生成白色沉淀），木条是「复燃」还是「熄灭」要按气体说清楚，不能混用。',
      },
      {
        heading: '符号：把现象写成化学语言',
        representation: '符号',
        body:
          '实验报告或记录表里常常要写化学方程式。训练时要把常用方程式写熟：2KMnO₄ —加热→ K₂MnO₄ + MnO₂ + O₂↑、CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑、CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O。书写要点是三点：化学式角标正确、方程式配平、反应条件与气体沉淀符号齐全。',
        note: '操作考试以动手为主，但很多试题要求填写实验报告，方程式写错同样扣分；条件（加热、点燃、催化剂）漏写是最常见的失分。',
      },
    ],
    equations: [
      {
        equation: '2KMnO₄ —加热→ K₂MnO₄ + MnO₂ + O₂↑',
        condition: '加热',
        phenomenon: '导管口有连续气泡冒出，用带火星的木条检验能使木条复燃',
        note: '记录表里最容易漏的是条件「加热」与气体符号 ↑；K₂MnO₄（锰酸钾）与 MnO₂（二氧化锰）不能混写。',
      },
      {
        equation: 'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑',
        condition: '常温',
        phenomenon: '大理石表面产生大量气泡',
        note: '两个 HCl 不能写成 HCl 前面漏系数；生成物中水和二氧化碳都要写，CO₂ 后的 ↑ 不能漏。',
      },
      {
        equation: '3Fe + 2O₂ —点燃→ Fe₃O₄',
        condition: '点燃',
        phenomenon: '剧烈燃烧、火星四射，生成黑色固体',
        note: '铁在氧气中燃烧的产物是 Fe₃O₄，不是 Fe₂O₃；条件是「点燃」而不是「加热」。',
      },
      {
        equation: '2H₂O₂ —MnO₂→ 2H₂O + O₂↑',
        condition: '二氧化锰作催化剂',
        phenomenon: '溶液中产生大量气泡',
        note: '条件只写催化剂即可，不要写成「加热」——这个反应在常温下进行，写成加热不符合事实。',
      },
    ],
    experiments: [
      {
        title: '必做实验演练：氧气的实验室制取与性质',
        purpose: '按操作考试的评分点完整演练一遍：器材检查、药品取用、装置连接、气密性检查、加热、收集、验满、性质实验与整理。',
        apparatus: ['铁架台', '试管', '单孔橡胶塞', '导管', '酒精灯', '水槽', '集气瓶', '玻璃片', '棉花', '高锰酸钾', '木条'],
        figure: figKMnO4O2,
        steps: [
          '清点器材与药品：检查试管有无裂纹、量筒（若用到）刻度是否清晰，核对药品是否为高锰酸钾。',
          '连接装置并检查气密性（手捂法），确认不漏气后再装入药品：把高锰酸钾平铺在管底，管口塞一团棉花。',
          '把试管固定在铁架台上并使其管口略向下倾斜；集气瓶倒置、装满水放入水槽，导管伸到瓶口。',
          '点燃酒精灯，先预热再对准药品部位用外焰加热，等气泡连续均匀冒出时开始收集。',
          '收集满后在水下盖好玻璃片取出正放，用带火星的木条放在瓶口验满并说明现象。',
          '实验结束先撤导管、后熄灭酒精灯；洗净仪器并倒放，药品归位，废液倒入指定容器，擦净桌面。',
        ],
        phenomenon: '导管口有连续均匀的气泡冒出，集气瓶内水面下降；瓶口处的带火星木条复燃，说明氧气已收集满。',
        conclusion: '按顺序完成实验能得到一瓶较纯净的氧气；操作顺序、导管位置与试管口方向是评分中的关键点。',
        cautions: [
          '顺序类失分：先查气密性后装药品；先撤导管后熄灯。',
          '细节类失分：试管口略向下倾斜、管口塞棉花、导管只伸到集气瓶口、集气瓶倒置装满水。',
          '描述类失分：验满时要说出「木条在瓶口复燃，说明已收集满」，不能只说「有现象」。',
          '整理类失分：仪器洗净倒放、药品归位、桌面擦净、废液入指定容器。',
        ],
      },
      {
        title: '必做实验演练：配制一定溶质质量分数的溶液',
        purpose: '演练「计算—称量—量取—溶解—装瓶贴标签」全流程，重点考查天平与量筒的使用和读数记录。',
        apparatus: ['托盘天平', '药匙', '量筒', '胶头滴管', '烧杯', '玻璃棒', '氯化钠', '水'],
        figure: figCylinder,
        steps: [
          '清点器材并核对药品；计算所需氯化钠与水的质量（按溶质质量分数计算）。',
          '用托盘天平称取固体：左物右码，药品放在纸片上，精确到 0.1 g，记录数据。',
          '用量筒量取水：选择量程接近的量筒，接近刻度时用胶头滴管定容，平视凹液面最低处读数。',
          '把固体加入水中，用玻璃棒搅拌至完全溶解。',
          '把配好的溶液装入试剂瓶，贴上标签（写清名称与质量分数）。',
          '洗净仪器、归位药品、擦净桌面并洗手。',
        ],
        phenomenon: '固体逐渐溶解，溶液变澄清；搅拌时固体不再减少说明已经完全溶解。',
        conclusion: '得到指定溶质质量分数的溶液；操作与记录的得分点集中在称量精度、量筒读数（平视）、搅拌溶解与贴标签。',
        cautions: [
          '读数时俯视会使实际量取的水偏少，配出的溶液浓度偏大；仰视则偏小。',
          '天平称量易潮解或有腐蚀性的药品（如氢氧化钠）要放在玻璃器皿中。',
          '量筒不能用来溶解固体，溶解必须在烧杯中进行。',
          '标签要写清溶液名称与溶质质量分数，不能只写「溶液」两个字。',
        ],
      },
      {
        title: '必做实验演练：粗盐中难溶性杂质的去除',
        purpose: '按操作考试要求完成溶解、过滤、蒸发三步，重点考查过滤的「一贴二低三靠」与蒸发时停止加热的时机。',
        apparatus: ['烧杯', '玻璃棒', '铁架台（带铁圈）', '漏斗', '滤纸', '蒸发皿', '酒精灯', '坩埚钳', '粗盐'],
        figure: figFilter,
        steps: [
          '清点器材，检查漏斗是否完好、滤纸是否配套。',
          '溶解：把粗盐放入烧杯，加水并用玻璃棒搅拌，加快溶解。',
          '过滤：按「一贴二低三靠」操作，得到澄清滤液。',
          '蒸发：把滤液倒入蒸发皿，边加热边用玻璃棒搅拌，出现较多固体时停止加热，用余热蒸干。',
          '用坩埚钳夹取蒸发皿，把食盐转移到指定容器；洗净仪器、整理桌面。',
        ],
        phenomenon: '滤纸上留下泥沙，滤液澄清；蒸发时先出现少量晶体，继续加热晶体增多，停止加热后余热把水分蒸干。',
        conclusion: '粗盐中的难溶性杂质可以用「溶解 → 过滤 → 蒸发」的方法除去；每一步的关键操作都是评分点。',
        cautions: [
          '过滤时不能用玻璃棒在漏斗内搅拌，否则会捅破滤纸。',
          '液面必须低于滤纸边缘，漏斗下端管口要紧靠烧杯内壁。',
          '蒸发时玻璃棒要不停搅拌；出现较多固体就停止加热，不能蒸干后再停。',
          '刚加热完的蒸发皿温度很高，必须用坩埚钳夹取。',
        ],
      },
    ],
    apps: [
      {
        title: '抽到「气体的制取与检验」试题的完整流程',
        scene: '操作考试抽到的试题要求在 10 分钟内制取并检验一瓶气体。',
        analysis: '评委按「器材检查 → 药品取用 → 操作顺序 → 读数记录 → 现象描述 → 整理安全」分项打分。必做实验通常包括氧气的实验室制取与性质、二氧化碳的实验室制取与检验、配制一定溶质质量分数的溶液、粗盐中难溶性杂质的去除等，具体以当年公布的试题为准。',
        steps: [
          '器材检查与药品核对，发现问题举手报告。',
          '连接装置、检查气密性，然后按规定取用药品（固体用镊子或药匙，液体瓶塞倒放、标签向手心）。',
          '按顺序操作：加热用外焰、管口方向正确、收集时导管位置正确。',
          '收集满后验满并说明现象；按要求写实验报告与方程式。',
          '整理器材：洗净倒放、药品归位、废液倒入指定容器、擦净桌面、洗手。',
        ],
        result: '整场考试的关键是「顺序清楚、动作完整、边做边说、做完就整理」，每一项都能对应到评分表上的一格。',
      },
      {
        title: '常见失分自查清单',
        scene: '练习结束后对照评分表自查，找出自己最容易丢的分。',
        analysis: '失分通常集中在四类：动作不完整（瓶塞没倒放、滴管伸入试管）、顺序颠倒（先熄灯后撤导管、先装药品后查气密性）、读数与记录不规范（俯视读数、数据不带单位）、整理与安全遗漏（仪器没洗、废液乱倒、用嘴吹灭酒精灯）。',
        steps: [
          '把每一条失分点写成一句「我应该这样做」，贴在实验台上练习。',
          '练习时口述关键动作与现象，请同学或老师当「评委」打分。',
          '把容易漏的整理动作固定成一个顺序：洗仪器 → 倒放 → 药品归位 → 废液入容器 → 擦桌面 → 洗手。',
        ],
        result: '把「会做」变成「做得规范、说得清楚」，操作考试的 10 分才拿得稳。',
      },
    ],
    formulas: [
      {
        name: '未说明用量时的取用量',
        text: '液体取 1—2 mL；固体只需盖满试管底部',
        usage: '操作考试中所有未指明用量的取用操作，取多取少都会被扣分',
      },
      {
        name: '称量与量取的精度规定',
        text: '托盘天平称准到 0.1 g；量筒按「量程接近且大于所量体积」选择',
        usage: '配制溶液时称量与量取；数据要如实记录并带单位',
      },
      {
        name: '化学用语书写规范',
        text: '化学式角标正确、方程式配平、反应条件与气体（↑）沉淀（↓）符号齐全',
        usage: '填写实验报告与记录表时；条件漏写、方程式没配平都要扣分',
      },
      {
        name: '安全操作的三条底线',
        text: '不能用嘴吹灭酒精灯；不能把水倒入浓硫酸；加热时管口不能对着人',
        usage: '整个操作过程的安全项评分；违反任意一条都可能被判为操作失误',
      },
    ],
    confusions: [
      {
        wrong: '拿到试题后赶紧先取药品开始做，抓紧时间',
        right: '先清点检查器材与药品，核对规格与量程，发现问题举手报告后按规定操作',
        why: '器材破损或药品不对会让整个实验做不下去，还可能在加热或倾倒时发生危险；检查本身就是评分表中的一项。',
      },
      {
        wrong: '实验做完了但一句话不说，觉得评委看得见我在做什么',
        right: '边操作边说明关键动作与观察到的现象（如「木条在瓶口熄灭，说明已收集满」）',
        why: '现象描述与操作说明是要单独计分的项目，不说就等于放弃这部分分数。',
      },
      {
        wrong: '用剩的药品倒回原试剂瓶，桌面更整洁',
        right: '倒入指定容器，不放回原瓶也不随意丢弃',
        why: '倒回去会污染整瓶试剂；整理分看的是仪器洗净归位、废液入指定容器，而不是「瓶子回收」。',
      },
      {
        wrong: '读数时俯视凹液面，只要把读到的数值记下来就行',
        right: '视线与凹液面最低处保持水平，如实记录并带单位',
        why: '俯视读数偏大、实际量取的液体偏少，配出的溶液浓度会偏大；读数角度在操作考试中是能直接看到的评分点。',
      },
      {
        wrong: '实验做完就把仪器堆在台面上离开',
        right: '洗净仪器并倒放、药品归位、废液倒入指定容器、擦净桌面、洗手',
        why: '整理器材是评分表上的独立一项，做了实验却不整理，等于把这一项的分白白丢掉。',
      },
    ],
    compares: [
      {
        title: '笔试实验题与实验操作考试',
        aspect: '同样考实验，一个考「写得对不对」，一个考「做得规不规范」',
        left: '笔试（60 分）中的实验题',
        right: '实验操作考试（10 分，另场进行）',
        rows: [
          { item: '考查形式', left: '读装置图、写方程式、分析方案与误差', right: '现场动手操作，评委按细则分项打分' },
          { item: '评分方式', left: '按答案要点与踩分点给分', right: '按操作规范、顺序、读数、描述、整理逐项给分' },
          { item: '最容易失分', left: '方程式没配平、条件写错、现象描述不准', right: '动作不完整、顺序颠倒、做了不说、做完不整理' },
          { item: '备考方法', left: '把常用方程式与装置图练熟，整理错题', right: '把每个实验按评分要点完整演练并口述' },
        ],
      },
      {
        title: '「会做」与「得满分」之间的差距',
        aspect: '同一个实验，两种做法在评分表上得分完全不同',
        left: '会做但容易失分的做法',
        right: '规范得分做法',
        rows: [
          { item: '取用液体', left: '瓶塞随手放在桌上，标签朝外，倒完就走', right: '瓶塞倒放、标签向手心、瓶口紧靠、倒完立即塞好放回' },
          { item: '装置气密性', left: '装好药品后才想起来查气密性', right: '连接好装置先查气密性，确认不漏气再装药品' },
          { item: '加热结束', left: '先熄灭酒精灯，再收拾导管', right: '先把导管移出水面，再熄灭酒精灯' },
          { item: '数据记录', left: '读数凭估计，数据不写单位', right: '平视读数、如实记录、数据带单位' },
          { item: '实验结束', left: '仪器堆在台面上离开', right: '洗净倒放、药品归位、废液入指定容器、擦净桌面' },
        ],
      },
    ],
    examAngles: [
      {
        angle: '操作规范的现场分项计分',
        detail: '通常按「器材检查、药品取用、操作顺序、读数与记录、现象描述、整理与安全」逐项计分，动作不完整即扣分；必做实验通常包括氧气的实验室制取与性质、二氧化碳的实验室制取与检验、配制一定溶质质量分数的溶液、粗盐中难溶性杂质的去除等，具体以当年公布的试题为准。',
      },
      {
        angle: '边操作边口述现象与结论',
        detail: '评委常要求说明观察到的现象与得出的结论，只说「做完了」拿不到现象描述与结论分。',
      },
      {
        angle: '安全与意外处理',
        detail: '酒精灯打翻着火、浓硫酸沾到皮肤、热的蒸发皿烫伤等情况的处理方法属于安全项，也是笔试中的常见设问。',
      },
      {
        angle: '与笔试装置图题互相印证',
        detail: '操作考试中练熟的导管位置、集气瓶正倒、试管口方向，直接对应笔试装置图判断题的得分点，两者一起练效率最高。',
      },
    ],
    materials: [
      {
        id: 'chem-experiment-7-m1',
        material:
          '【原创仿真】操作考试的一道试题要求：用大理石和稀盐酸制取一瓶二氧化碳并检验。评分表上列出的项目有：器材检查与报告、药品取用规范、装置连接与气密性检查、操作顺序、现象观察与描述、数据记录、整理器材与安全。某同学的现场表现是：拿到试题就开始取药品；瓶塞正放在桌面上，标签朝外倒酸；没有检查气密性；收集时把导管伸到瓶口；验满时把燃着的木条伸入瓶中；实验结束把仪器堆在台面上就离场。',
        questions: [
          {
            id: 'chem-experiment-7-m1-q1',
            stem: '（4 分）指出该同学可能被扣分的操作，并写出正确的做法。',
            answer:
              '① 应先清点检查器材与药品、核对规格，发现问题举手报告，再按要求取药品。② 瓶塞应倒放在桌面上，标签要向着手心，瓶口紧靠容器口倾倒。③ 连接好装置后应先检查气密性，确认不漏气再装入药品。④ 收集时导管应伸到接近集气瓶底部，把瓶内的空气排尽。⑤ 验满时燃着的木条应放在集气瓶口，不能伸入瓶中。⑥ 实验结束要洗净仪器并倒放、药品归位、废液倒入指定容器、擦净桌面。',
            rubric: [
              '指出应先检查器材与药品（1 分）',
              '指出瓶塞应倒放、标签向手心（1 分）',
              '指出应先查气密性后装药品（1 分）',
              '指出导管伸到接近瓶底、验满时木条放在瓶口（1 分）',
            ],
          },
          {
            id: 'chem-experiment-7-m1-q2',
            stem: '（3 分）写出制取二氧化碳的化学方程式；并说明怎样检验收集到的气体是二氧化碳（写出操作、现象与结论）。',
            answer:
              '化学方程式：CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂↑。检验：把气体通入澄清石灰水中，若澄清石灰水变浑浊，说明该气体是二氧化碳。',
            rubric: ['方程式正确、配平并标出气体符号（1 分）', '写出「通入澄清石灰水」的操作（1 分）', '写出现象「变浑浊」并得出「是二氧化碳」的结论（1 分）'],
          },
          {
            id: 'chem-experiment-7-m1-q3',
            stem: '（3 分）实验结束后整理器材要做哪些事？至少写出四项，并说明为什么整理也计分。',
            answer:
              '要做的有：把用过的仪器洗净并倒放在试管架上；把药品放回原处、瓶塞塞紧；把废液倒入指定的容器（不能倒入水槽）；用抹布擦净实验台；洗手。整理计分是因为实验习惯与安全意识本身就是实验能力的一部分，仪器不洗、废液乱倒不仅影响下一次实验，还可能造成污染或安全事故。',
            rubric: [
              '写出洗净仪器并倒放（1 分）',
              '写出药品归位、废液倒入指定容器（1 分）',
              '写出擦净桌面、洗手等收尾动作并说明整理计分的道理（1 分）',
            ],
          },
        ],
      },
    ],
    questions: [
      {
        id: 'chem-experiment-7-q1',
        type: 'choice',
        stem: '在操作考试中加热试管里的固体，装置如图。评委最可能指出的扣分点是',
        figure: figQHeatUp,
        options: [
          '没有用酒精灯的焰心加热，应该改用焰心',
          '应该用手直接拿着试管加热，不需要铁架台',
          '试管口向上倾斜，应该略向下倾斜，否则冷凝水会倒流使试管炸裂',
          '试管下面应该垫上石棉网',
        ],
        answer: 'C',
        explanation:
          'C 正确：加热固体时试管口必须略向下倾斜，图中的管口向上，药品中的水受热变成水蒸气后会在管口冷凝，水珠倒流到灼热的管底就会使试管炸裂。A 错在温度最高的是外焰，应该用外焰加热，焰心温度最低。B 错在加热试管要用试管夹或铁架台固定，不能用手直接拿。D 错在试管可以直接加热，不需要垫石棉网，需要垫石棉网的是烧杯。',
        difficulty: 2,
        tags: ['实验操作考试', '加热', '装置图'],
      },
      {
        id: 'chem-experiment-7-q2',
        type: 'choice',
        stem: '在实验操作考试中取用液体药品，下列做法正确的是',
        options: [
          '取下瓶塞倒放在桌面上，标签向着手心，瓶口紧靠容器口倾倒',
          '用剩的药品倒回原试剂瓶，既节约又整洁',
          '用胶头滴管滴加液体时把滴管伸入试管内，防止液体洒到外面',
          '没有说明用量时，固体取到半试管',
        ],
        answer: 'A',
        explanation:
          'A 正确：瓶塞倒放可以防止沾污，标签向手心可以防止残液流下腐蚀标签，瓶口紧靠容器口可以防止液体外洒。B 错在用剩药品不能放回原瓶，应放入指定容器，否则会污染整瓶试剂。C 错在滴管要垂直悬空滴加，伸入试管内会把试管内的物质沾到滴管上，再取试剂就污染了整瓶。D 错在没有说明用量时固体只需盖满试管底部，取半试管属于取用过量。',
        difficulty: 1,
        tags: ['实验操作考试', '药品取用'],
      },
      {
        id: 'chem-experiment-7-q3',
        type: 'choice',
        stem: '操作考试结束后整理器材，下列做法正确的是',
        options: [
          '把洗净的试管正放在试管架上',
          '把废液直接倒入水槽，用水冲走',
          '把用过的仪器整齐地堆在实验台上',
          '洗净仪器并倒放、药品归位、废液倒入指定容器、擦净桌面',
        ],
        answer: 'D',
        explanation:
          'D 正确：整理器材是评分表中的独立一项，仪器洗净倒放、药品归位、废液入指定容器、擦净桌面、洗手都要做到。A 错在洗净的试管应倒放，正放时残水排不出去、还容易落灰。B 错在废液可能腐蚀管道或污染水体，必须倒入指定容器。C 错在仪器要洗净归位而不是堆在台面上。',
        difficulty: 1,
        tags: ['实验操作考试', '整理器材'],
      },
      {
        id: 'chem-experiment-7-q4',
        type: 'choice',
        stem: '关于量取液体时的读数与数据记录，下列做法正确的是',
        options: [
          '俯视读数也可以，只要把看到的数值记下来就行',
          '视线与凹液面最低处保持水平，记录数据时带上单位',
          '为了与参考答案一致，把测得的数据改成整数',
          '量筒量程选得越大，读数越精确',
        ],
        answer: 'B',
        explanation:
          'B 正确：平视凹液面最低处读数才准确，数据必须如实记录并带单位。A 错在俯视读数偏大、实际量取的液体偏少，会造成实验误差。C 错在数据要如实记录，改动数据属于弄虚作假，也掩盖了操作中的问题。D 错在量筒量程越大刻度间距越小、相对误差越大，应该选量程接近且大于所量体积的量筒。',
        difficulty: 2,
        tags: ['实验操作考试', '读数', '数据记录'],
      },
      {
        id: 'chem-experiment-7-q5',
        type: 'choice',
        stem: '用加热高锰酸钾的方法制取氧气，下列操作顺序正确的是',
        options: [
          '先装入药品，再检查装置的气密性',
          '先熄灭酒精灯，再把导管移出水面',
          '先把导管移出水面，再熄灭酒精灯',
          '先把集气瓶从水槽中取出，再熄灭酒精灯',
        ],
        answer: 'C',
        explanation:
          'C 正确：先撤导管再熄灯，试管内的气体仍与空气相通，不会发生倒吸。A 错在顺序颠倒：必须先检查气密性、后装药品，否则装置漏气时药品就白费了。B 错在先熄灯会使管内气体冷却收缩、压强减小，水槽里的水倒吸进灼热的试管使其炸裂。D 错在取出集气瓶时导管仍插在水中，倒吸照样发生。',
        difficulty: 1,
        tags: ['实验操作考试', '操作顺序', '氧气制取'],
      },
      {
        id: 'chem-experiment-7-q6',
        type: 'fill',
        stem: '加热高锰酸钾制取氧气，实验结束时应该先____，再熄灭酒精灯。',
        answer: '把导管移出水面|移出导管|撤导管|撤出导管|把导管拿出水面',
        explanation:
          '若先熄灭酒精灯，试管内气体冷却收缩、压强减小，水槽里的水会沿着导管倒吸进灼热的试管，使试管炸裂。所以必须先撤导管、后熄灯，这一条几乎是所有操作考试评分细则里的必查项。',
        difficulty: 1,
        tags: ['实验操作考试', '操作顺序'],
      },
      {
        id: 'chem-experiment-7-q7',
        type: 'fill',
        stem: '实验操作考试中，连接好装置后应该在装入药品之____检查装置的气密性（填「前」或「后」）。',
        answer: '前',
        explanation:
          '必须先检查气密性、后装药品。如果先装药品再查气密性，一旦装置漏气，药品就白白浪费了；制取有毒气体的实验还可能漏出有毒气体造成危险。',
        difficulty: 1,
        tags: ['实验操作考试', '气密性', '操作顺序'],
      },
      {
        id: 'chem-experiment-7-q8',
        type: 'short',
        stem: '要配制 100 g 质量分数为 5% 的氯化钠溶液。请计算所需氯化钠和水的质量，写出主要操作步骤与所用仪器。',
        answer:
          '氯化钠的质量 = 100 g × 5% = 5 g；水的质量 = 100 g − 5 g = 95 g，即量取 95 mL 水。步骤：计算 → 用托盘天平称取 5.0 g 氯化钠（放在纸片上）→ 用 100 mL 量筒量取 95 mL 水（平视凹液面最低处读数）→ 把氯化钠加入水中，用玻璃棒搅拌至完全溶解 → 装瓶贴标签（写清名称与质量分数）。仪器：托盘天平、药匙、量筒、胶头滴管、烧杯、玻璃棒。',
        answerSteps: [
          '溶质质量 = 100 g × 5% = 5 g',
          '溶剂质量 = 100 g − 5 g = 95 g，即 95 mL 水',
          '称量：托盘天平称 5.0 g 氯化钠，药品放纸片上',
          '量取：100 mL 量筒量 95 mL 水，平视凹液面最低处',
          '溶解：玻璃棒搅拌至完全溶解，装瓶贴标签',
        ],
        explanation:
          '配制溶液的题要「先算、后取、再溶、末贴标签」，五步都不能少，漏掉贴标签是最常见的失分。计算上先由溶液质量乘质量分数得到溶质 5 g，再用水 = 100 g − 5 g = 95 g 换算成 95 mL；量取时选 100 mL 量筒并平视凹液面最低处。仪器按「称量—量取—溶解」三类写全，别漏玻璃棒与胶头滴管。',
        rubric: [
          '算出氯化钠 5 g、水 95 g（或 95 mL）（2 分）',
          '步骤完整：计算、称量、量取、溶解、贴标签（2 分）',
          '仪器写全（托盘天平、药匙、量筒、胶头滴管、烧杯、玻璃棒）（1 分）',
        ],
        difficulty: 2,
        tags: ['实验操作考试', '溶液配制', '计算'],
      },
      {
        id: 'chem-experiment-7-q9',
        type: 'short',
        stem: '请你为「用高锰酸钾制取一瓶氧气」写一份操作自查清单，至少写出六条现场必须做到的动作或顺序，并说明每条为什么重要。',
        answer:
          '① 先清点检查器材与药品，发现问题举手报告——器材破损或药品不对会让实验做不下去，还可能出现危险。② 连接装置后先检查气密性，确认不漏气再装药品——漏气会浪费药品，也可能漏出气体。③ 高锰酸钾平铺在管底，管口塞一团棉花——防止粉末随气流进入导管造成堵塞。④ 试管口略向下倾斜——防止冷凝水倒流到灼热的管底使试管炸裂。⑤ 用外焰加热、先预热再集中加热——外焰温度最高，预热可防止试管受热不均炸裂。⑥ 排水法收集时集气瓶倒置装满水、导管只伸到瓶口，等气泡连续均匀冒出再收集——保证气体纯净。⑦ 实验结束先撤导管、后熄灭酒精灯——防止水倒吸使试管炸裂。⑧ 实验后洗净仪器倒放、药品归位、废液倒入指定容器、擦净桌面——整理器材是评分项，也关系到实验习惯与安全。',
        explanation:
          '这份清单本身就是评分表的缩影：每一条都要写清「做什么」和「为什么」。最容易漏的是第一项器材检查与最后一项整理收尾——它们不涉及化学原理，却是白送的分。写「为什么」时要落到后果上（漏气浪费药品、倒吸炸裂试管、粉末堵塞导管），只写动作不写理由拿不到说明分。',
        rubric: [
          '写出器材检查与药品核对（1 分）',
          '写出「先查气密性、后装药品」（1 分）',
          '写出管口倾斜方向、棉花、外焰加热等装置细节中的两条以上（1 分）',
          '写出「先撤导管、后熄灯」并说明水倒吸的后果（1 分）',
          '写出整理器材与安全收尾（1 分）',
        ],
        difficulty: 2,
        tags: ['实验操作考试', '操作顺序', '评价'],
      },
      {
        id: 'chem-experiment-7-q10',
        type: 'short',
        stem: '请画出一支量筒内有液体时的读数示意图，标出凹液面最低处、平视时的视线方向，并用虚线画出俯视与仰视时的视线方向，注明读数偏大还是偏小。',
        answer:
          '量筒放平，视线与凹液面最低处保持水平，此时读数正确；俯视时视线斜向下，看到的刻度值比液面实际对应的大，读数偏大、实际量取的液体偏少；仰视时视线斜向上，读数偏小、实际量取的液体偏多。',
        answerFigure: figCylinder,
        explanation:
          '作图要点是三条视线的方向与结论：平视的箭头必须水平地指向凹液面最低处；俯视的箭头从斜上方指向液面，读数偏大；仰视的箭头从斜下方指向液面，读数偏小。只画出量筒和液面而没有标出三条视线与「偏大、偏小」的结论，得分点就丢掉一半。',
        rubric: [
          '画出量筒与凹液面，标出凹液面最低处（1 分）',
          '画出平视视线并与凹液面最低处水平（2 分）',
          '画出俯视、仰视两条视线（2 分）',
          '注明「俯视读数偏大、仰视读数偏小」（1 分）',
        ],
        difficulty: 2,
        tags: ['作图', '读数', '实验操作考试'],
      },
    ],
  },
];

