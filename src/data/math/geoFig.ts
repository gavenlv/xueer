/**
 * 几何图元的公共构件。
 *
 * ## 为什么要有这个文件
 *
 * 几何内容「不配图就等于没写」：文字说「在 $\triangle ABC$ 中，$D$ 是 $AB$ 的中点」，
 * 学生第一件事是问**哪个顶点是 $A$**——图上有字母才答得上来。
 * 但每张图都手写「三个顶点坐标 + 三个带字母的点」既啰嗦又容易漏：漏标一个字母，
 * 整张图就从「图形结合」退化成「看不懂的线团」，而且**校验收不出来**。
 *
 * 所以图元一律走这里：
 *
 *   - `tags()` 只接受「点名字 → 坐标」，字母自动朝**背离这批点重心**的一侧放，
 *     不会压在图形内部或边上；因此只要用 `tags()`，就不可能出现「有顶点没字母」。
 *   - `equalTicks()`／`rightAngle()`／`angleArc()`／`parallelMark()` 把教材的记号画法
 *     （等长短线、直角方框、角的弧线、平行箭头）**算好方向**，作者只需要给点，
 *     不必自己推垂线方向与角度——手推正是标错、画反的来源。
 *
 * 坐标仍是 0—100 的画布单位（左上角原点、y 向下），渲染见 `components/PhysicsFigure.tsx`。
 *
 * ## 一条硬规矩
 *
 * 几何图里只要画了图形（`path`），就必须用 `tags()` 把**每个顶点**都标上字母；
 * 图形内部出现的点（交点、垂足、中点、动点）也一律标号。
 * `scripts/validate-entry.ts` 会逐张图核对这条。
 */

import type { FigurePrim, FigureTone, PhysicsFigure } from '../../types';

/** 画布上的一个点（0—100 单位） */
export type P = [number, number];

/** 点名字 → 坐标（名字就是图上要标的字母，如 A、B、O、P） */
export type NodeMap = Record<string, P>;

/** 线段 AB 上按比例取点：`t = 0` 在 A，`t = 1` 在 B，`t = 0.5` 是中点 */
export function on(a: P, b: P, t: number): P {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** 中点 */
export function mid(a: P, b: P): P {
  return on(a, b, 0.5);
}

/** 一组点的重心：字母标签一律朝背离它的方向放 */
function centroid(nodes: NodeMap): P {
  const xs = Object.values(nodes);
  if (!xs.length) return [50, 50];
  const sx = xs.reduce((n, p) => n + p[0], 0) / xs.length;
  const sy = xs.reduce((n, p) => n + p[1], 0) / xs.length;
  return [sx, sy];
}

/** 单位向量 */
function unit(a: P, b: P): P {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

/** 方向 → 角度（度，0 = 正右，逆时针为正；与渲染器 `angle` 图元同一套约定） */
function degOf(v: P, to: P): number {
  const d = unit(v, to);
  return (Math.atan2(-d[1], d[0]) * 180) / Math.PI;
}

/**
 * 一个点 + 它的字母。
 *
 * 字母默认朝**背离 `ref`**（一般是图形重心）的一侧放：图靠左的点，字母往左；
 * 靠下的点，字母往下——这样字母永远落在图形外面，不会压住边或遮盖别的标注。
 */
export function tag(
  name: string,
  p: P,
  ref?: P,
  opts: { hollow?: boolean; size?: number; dx?: number; dy?: number } = {},
): FigurePrim {
  let dx = opts.dx ?? 2.2;
  let dy = opts.dy ?? -2.6;
  if (ref && opts.dx === undefined && opts.dy === undefined) {
    const d = unit(ref, p);
    // 文字锚点固定为 start（渲染器如此），所以「往左」要给足负偏移，否则字母会压住点
    dx = d[0] < -0.25 ? -5.4 : d[0] > 0.25 ? 2.2 : -1.2;
    dy = d[1] > 0 ? 2.4 : -2.8;
  }
  return { t: 'dot', x: p[0], y: p[1], label: name, labelDx: dx, labelDy: dy, hollow: opts.hollow, r: opts.size };
}

/** 一批点 + 全部字母（字母朝背离这批点重心的一侧） */
export function tags(nodes: NodeMap, names?: string[]): FigurePrim[] {
  const c = centroid(nodes);
  return (names ?? Object.keys(nodes)).map((n) => tag(n, nodes[n], c));
}

/** 折线／多边形 */
export function path(
  nodes: NodeMap,
  order: string[],
  opts: { closed?: boolean; tone?: FigureTone; fill?: boolean; dashed?: boolean } = {},
): FigurePrim {
  return {
    t: 'poly',
    points: order.map((n) => nodes[n]),
    closed: opts.closed,
    tone: opts.tone,
    fill: opts.fill,
    dashed: opts.dashed,
  };
}

/** 一条线段（不参与封闭图形的构边，如辅助线、高、连线） */
export function seg(
  a: P,
  b: P,
  opts: { tone?: FigureTone; dashed?: boolean; width?: number } = {},
): FigurePrim {
  return {
    t: 'line',
    x1: a[0],
    y1: a[1],
    x2: b[0],
    y2: b[1],
    tone: opts.tone,
    dashed: opts.dashed,
    width: opts.width,
  };
}

/**
 * 等长记号：在线段 AB 的中点处画 `count` 道垂直于 AB 的短线。
 *
 * 一道＝第一组对应边，两道＝第二组，三道＝第三组（教材的通行写法）。
 * 垂线方向由 AB 现算，作者不必自己推——手推正是「记号画到边外面去」的原因。
 */
export function equalTicks(a: P, b: P, count = 1, tone: FigureTone = 'ok'): FigurePrim[] {
  const m = mid(a, b);
  const u = unit(a, b);
  const n: P = [-u[1], u[0]];
  const offsets = count <= 1 ? [0] : count === 2 ? [-1.2, 1.2] : [-2.2, 0, 2.2];
  return offsets.map((o) => {
    const c: P = [m[0] + u[0] * o, m[1] + u[1] * o];
    return seg([c[0] - n[0] * 1.5, c[1] - n[1] * 1.5], [c[0] + n[0] * 1.5, c[1] + n[1] * 1.5], { tone });
  });
}

/** 直角方框：顶点 V，两条边分别指向 P1、P2 */
export function rightAngle(v: P, p1: P, p2: P, r = 3.6, tone: FigureTone = 'muted'): FigurePrim[] {
  const d1 = unit(v, p1);
  const d2 = unit(v, p2);
  const a: P = [v[0] + d1[0] * r, v[1] + d1[1] * r];
  const b: P = [v[0] + d2[0] * r, v[1] + d2[1] * r];
  const c: P = [a[0] + d2[0] * r, a[1] + d2[1] * r];
  return [seg(a, c, { tone }), seg(c, b, { tone })];
}

/**
 * 角的弧线：顶点 V，两条边分别指向 P1、P2。
 *
 * 自动取**小于 180° 的那段弧**（几何里的角都是这个），label 写在弧的外侧。
 */
export function angleArc(
  v: P,
  p1: P,
  p2: P,
  opts: { r?: number; tone?: FigureTone; label?: string } = {},
): FigurePrim {
  const d1 = degOf(v, p1);
  const d2 = degOf(v, p2);
  const delta = ((d2 - d1 + 540) % 360) - 180;
  return { t: 'angle', x: v[0], y: v[1], from: d1, to: d1 + delta, r: opts.r ?? 6.5, tone: opts.tone, label: opts.label };
}

/**
 * 平行记号：在线段 AB 上画 `count` 个「>」箭头（教材用法，与等长记号的「道数」同一逻辑）。
 */
export function parallelMark(a: P, b: P, count = 1, tone: FigureTone = 'accent'): FigurePrim[] {
  const m = mid(a, b);
  const u = unit(a, b);
  const n: P = [-u[1], u[0]];
  const offs = count <= 1 ? [0] : count === 2 ? [-1.6, 1.6] : [-3.2, 0, 3.2];
  return offs.map((o) => {
    const base: P = [m[0] + u[0] * o, m[1] + u[1] * o];
    const tail1: P = [base[0] - u[0] * 1.9 + n[0] * 1.5, base[1] - u[1] * 1.9 + n[1] * 1.5];
    const tail2: P = [base[0] - u[0] * 1.9 - n[0] * 1.5, base[1] - u[1] * 1.9 - n[1] * 1.5];
    const apex: P = [base[0] + u[0] * 0.5, base[1] + u[1] * 0.5];
    return { t: 'poly' as const, points: [tail1, apex, tail2], tone };
  });
}

/** 图上的说明文字（不参与朗读，靠 `alt` 读） */
export function note(
  x: number,
  y: number,
  text: string,
  opts: { anchor?: 'start' | 'middle' | 'end'; size?: number; tone?: FigureTone } = {},
): FigurePrim {
  return { t: 'text', x, y, text, anchor: opts.anchor, size: opts.size ?? 3.6, tone: opts.tone ?? 'muted' };
}

/* ------------------------------------------------------------------ */
/* 标准图形模板                                                        */
/* ------------------------------------------------------------------ */

/**
 * 直角三角形的直角在 C：底边 AB 水平，直角边 AC 竖直。
 *
 * 坐标统一取「底边在下、顶点在上」，全模块的三角形长得一样，
 * 学生看第二张图就不必重新认一遍谁在哪儿。
 */
export function rtABC(): NodeMap {
  return { A: [12, 52], B: [88, 52], C: [12, 14] };
}

/**
 * 一般三角形（不等边，三角都不特殊）。
 *
 * 刻意**不画成等腰**：等腰会把「哪两条边相等」这类条件画得含糊，
 * 学生反而看不出题目给的是哪一组等长记号。
 */
export function triABC(): NodeMap {
  return { A: [10, 52], B: [90, 52], C: [30, 12] };
}

/** 等腰三角形（$AB=AC$，顶角在 A） */
export function isoABC(): NodeMap {
  return { A: [50, 10], B: [14, 52], C: [86, 52] };
}

/** 平行四边形 ABCD（按逆时针 A→B→C→D） */
export function paraABCD(): NodeMap {
  return { A: [18, 52], B: [82, 52], C: [70, 16], D: [6, 16] };
}

/** 正方形 ABCD */
export function squareABCD(): NodeMap {
  return { A: [24, 54], B: [74, 54], C: [74, 11], D: [24, 11] };
}

/** 矩形 ABCD（长边在下） */
export function rectABCD(): NodeMap {
  return { A: [10, 52], B: [90, 52], C: [90, 18], D: [10, 18] };
}

/** 梯形 ABCD（AD∥BC，AD 短） */
export function trapezoidABCD(): NodeMap {
  return { A: [30, 16], B: [90, 16], C: [74, 52], D: [10, 52] };
}

/** 圆心 O 与半径 r（画布单位）；配合 `onCircle` 取圆上的点 */
export function centerO(r = 24): { O: P; r: number } {
  return { O: [50, 32], r };
}

/** 圆上一点：从圆心出发、按角度（度，0 = 正右、逆时针为正）取点 */
export function onCircle(o: P, r: number, deg: number): P {
  const rad = (-deg * Math.PI) / 180;
  return [o[0] + r * Math.cos(rad), o[1] + r * Math.sin(rad)];
}

/**
 * 组装一张几何图。
 *
 * `alt` 必填且必须把**图上的字母与关系读得出来**（如「三角形 ABC，D 是 AB 的中点」）：
 * 它既是屏幕阅读器与整页朗读的唯一来源，也是检索文本的一部分。
 */
export function geoFigure(f: {
  id: string;
  title: string;
  caption?: string;
  alt: string;
  view?: PhysicsFigure['view'];
  prims: FigurePrim[];
}): PhysicsFigure {
  return { view: 'wide', ...f };
}
