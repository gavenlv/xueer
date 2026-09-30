import fs from 'fs';
const P = 'd:/workspace/dsh/src/data/math/geometry.ts';
let src = fs.readFileSync(P, 'utf8');
function applyRegion(start, end, items) {
  const s = src.indexOf(start);
  const e = src.indexOf(end, s + start.length);
  if (s < 0 || e < 0) throw new Error('region not found');
  let chunk = src.slice(s, e);
  for (const it of items) {
    const n = chunk.split(it.a).length - 1;
    if (n !== 1) throw new Error('anchor count ' + n + ' :: ' + it.a);
    chunk = chunk.replace(it.a, it.a + it.p);
  }
  src = src.slice(0, s) + chunk + src.slice(e);
}
const S = "id: 'm-geo-sanjiaoxing',";
const E = "id: 'm-geo-quandeng',";
const items = [];
items.push({
  a: "summary: '理解三角形的边角关系与重要线段，掌握内角和定理、外角性质及多边形内角和公式。',",
  p: String.raw`
    steps: [
      {
        heading: '判断三边能否围成三角形',
        body: '三条线段首尾相接要围成三角形，关键是较短的两条边「接起来」能否够到最长边的两端：把较短两边接成一条线段后，它的长度必须大于最长边。图里 $3,4,5$ 满足 $3+4>5$，能围成；而 $3,4,7$ 恰好 $3+4=7$，三条线段只能退化成一条线段。检验时只需比较较短两边之和与最长边，不必把三个不等式都验一遍。',
        figure: {
          id: 'fig-m-geo-sanjiao-s1',
          title: '三边关系：能围成与不能围成',
          caption: '3、4、5 能围成三角形；3、4、7 会退化成一条线段',
          view: 'square',
          alt: '左图是边长分别为 3、4、5 的三角形，顶点 C 处画有直角符号，斜边 AB 标 5、直角边 AC 标 4、直角边 CB 标 3；右图是长 3 与 4 的两条线段首尾相接后总长恰好等于长 7 的线段，三个端点 P、Q、R 落在同一条直线上，两条短线段接不到一起，不能围成三角形。',
          prims: [
            { t: 'poly', points: [[24, 18], [51, 54], [24, 54]], closed: true, fill: true, tone: 'main' },
            { t: 'angle', x: 24, y: 54, from: 0, to: 90, r: 5, right: true },
            { t: 'text', x: 20.5, y: 36, text: '4', size: 3.6, anchor: 'end', tone: 'muted' },
            { t: 'text', x: 37.5, y: 58.5, text: '3', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'text', x: 43, y: 31, text: '5', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'dot', x: 24, y: 18, label: 'A', labelDx: -5.5, labelDy: 0 },
            { t: 'dot', x: 51, y: 54, label: 'B', labelDx: 2.5, labelDy: 1 },
            { t: 'dot', x: 24, y: 54, label: 'C', labelDx: -5.5, labelDy: 3 },
            { t: 'text', x: 37.5, y: 10, text: '能围成', size: 3.6, anchor: 'middle', tone: 'ok' },
            { t: 'text', x: 55, y: 65, text: '不能围成', size: 3.6, anchor: 'middle', tone: 'danger' },
            { t: 'line', x1: 24, y1: 76, x2: 51, y2: 76, tone: 'accent', width: 0.9 },
            { t: 'line', x1: 51, y1: 76, x2: 87, y2: 76, tone: 'danger', width: 0.9 },
            { t: 'text', x: 37.5, y: 71, text: '3', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'text', x: 69, y: 71, text: '4', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'dot', x: 24, y: 76, label: 'P', labelDx: -5.5, labelDy: 0 },
            { t: 'dot', x: 51, y: 76, label: 'Q', labelDx: -2, labelDy: 4.5 },
            { t: 'dot', x: 87, y: 76, label: 'R', labelDx: 2.5, labelDy: 0 },
            { t: 'text', x: 55, y: 86, text: '3+4=7，退化成一条线段', size: 3.4, anchor: 'middle', tone: 'muted' },
          ],
        },
        note: '检验时只看「较短两边之和 > 最长边」；取等号时三条线段只能接成一条线段，不能围成三角形。',
      },
      {
        heading: '画出高、中线与角平分线',
        body: '三条重要线段都是「从顶点连到对边」的线段：高是顶点到对边的垂线段，所以要过顶点向对边作垂线；中线连到对边的中点，关键是先找中点；角平分线把顶角分成两个相等的角，关键是平分那个角。作图时先定出「对边上那个特殊的点」，再与顶点相连，三者就不会画混。',
        figure: {
          id: 'fig-m-geo-sanjiao-s2',
          title: '高、中线与角平分线',
          caption: '高作垂线到垂足，中线连到对边中点，角平分线平分顶角',
          view: 'wide',
          alt: '三个三角形并排：左边三角形从顶点 A 向底边 BC 作垂线段 AH，垂足 H 处画有直角符号；中间三角形从顶点 A 连到底边 BC 的中点 M，BM 与 MC 上画有等长标记；右边三角形从顶点 A 连到底边上的点 D，顶点 A 被分成两个相等的角。',
          prims: [
            { t: 'poly', points: [[17, 14], [8, 48], [26, 48]], closed: true },
            { t: 'line', x1: 17, y1: 14, x2: 17, y2: 48, tone: 'accent' },
            { t: 'angle', x: 17, y: 48, from: 90, to: 180, r: 4, right: true },
            { t: 'dot', x: 17, y: 14, label: 'A', labelDx: -1.5, labelDy: -4 },
            { t: 'dot', x: 8, y: 48, label: 'B', labelDx: -4, labelDy: 4.5 },
            { t: 'dot', x: 26, y: 48, label: 'C', labelDx: 2.5, labelDy: 4.5 },
            { t: 'dot', x: 17, y: 48, label: 'H', labelDx: 2, labelDy: 4 },
            { t: 'text', x: 17, y: 57, text: '高：垂线段', size: 3.4, anchor: 'middle', tone: 'muted' },
            { t: 'poly', points: [[49, 14], [40, 48], [58, 48]], closed: true },
            { t: 'line', x1: 49, y1: 14, x2: 49, y2: 48, tone: 'accent' },
            { t: 'line', x1: 44.5, y1: 46.4, x2: 44.5, y2: 49.6, tone: 'accent' },
            { t: 'line', x1: 53.5, y1: 46.4, x2: 53.5, y2: 49.6, tone: 'accent' },
            { t: 'dot', x: 49, y: 14, label: 'A', labelDx: -1.5, labelDy: -4 },
            { t: 'dot', x: 40, y: 48, label: 'B', labelDx: -4, labelDy: 4.5 },
            { t: 'dot', x: 58, y: 48, label: 'C', labelDx: 2.5, labelDy: 4.5 },
            { t: 'dot', x: 49, y: 48, label: 'M', labelDx: 2, labelDy: 4 },
            { t: 'text', x: 49, y: 57, text: '中线：连中点', size: 3.4, anchor: 'middle', tone: 'muted' },
            { t: 'poly', points: [[79, 14], [72, 48], [90, 48]], closed: true },
            { t: 'line', x1: 79, y1: 14, x2: 80.9, y2: 48, tone: 'accent' },
            { t: 'angle', x: 79, y: 14, from: -101.6, to: -86.9, r: 5, tone: 'ok' },
            { t: 'angle', x: 79, y: 14, from: -86.9, to: -72.1, r: 5, tone: 'ok' },
            { t: 'dot', x: 79, y: 14, label: 'A', labelDx: -1.5, labelDy: -4 },
            { t: 'dot', x: 72, y: 48, label: 'B', labelDx: -4, labelDy: 4.5 },
            { t: 'dot', x: 90, y: 48, label: 'C', labelDx: 2.5, labelDy: 4.5 },
            { t: 'dot', x: 80.9, y: 48, label: 'D', labelDx: 1, labelDy: 4 },
            { t: 'text', x: 79, y: 57, text: '角平分线：平分顶角', size: 3.4, anchor: 'middle', tone: 'muted' },
          ],
        },
        note: '三者都是线段：高必须垂直对边，中线必须过对边中点，角平分线必须把顶角平分；「三角形的角平分线」不是射线。',
      },      {
        heading: '用内角和求未知的角',
        body: '三角形三个内角的和恒等于 $180^\circ$，所以只要知道两个角，第三个角就能用减法求出来。直角三角形的两个锐角一定互余；把某个角用「另一个角的式子」表示后再代入内角和，就能一次解出所有角。图里 $\angle A=65^\circ$、$\angle B=35^\circ$，于是 $\angle C=180^\circ-65^\circ-35^\circ=80^\circ$。',
        figure: {
          id: 'fig-m-geo-sanjiao-s3',
          title: '内角和定理求第三个角',
          caption: '∠A+∠B+∠C=180°，已知两角可求第三角',
          view: 'square',
          alt: '三角形 ABC 中，顶点 A 处的角标为 65 度、顶点 B 处的角标为 35 度、顶点 C 处的角标为 80 度，三个内角之和正好等于 180 度。',
          prims: [
            { t: 'poly', points: [[14, 76], [86, 76], [31.7, 38]], closed: true, fill: true, tone: 'main' },
            { t: 'angle', x: 14, y: 76, from: 0, to: 65, r: 10, label: '65°' },
            { t: 'angle', x: 86, y: 76, from: 145, to: 180, r: 10, label: '35°' },
            { t: 'angle', x: 31.7, y: 38, from: -115, to: -35, r: 10, label: '80°' },
            { t: 'dot', x: 14, y: 76, label: 'A', labelDx: -6.5, labelDy: 1 },
            { t: 'dot', x: 86, y: 76, label: 'B', labelDx: 2.5, labelDy: 1 },
            { t: 'dot', x: 31.7, y: 38, label: 'C', labelDx: -1.5, labelDy: -4 },
            { t: 'text', x: 50, y: 90, text: '∠A + ∠B + ∠C = 180°', size: 3.8, anchor: 'middle', tone: 'muted' },
          ],
        },
        note: '已知两角求第三角，直接用 $180^\circ$ 减去已知两角；求出后可用「外角等于不相邻两内角之和」来检验。',
      },
      {
        heading: '外角与多边形的内角和',
        body: '把三角形的一条边延长，延长线与相邻的边所成的角就是外角；它等于与它不相邻的两个内角之和，因为「外角 + 相邻内角 = $180^\circ$」，而三内角之和也是 $180^\circ$，两式相减就得到这条性质。把多边形从一个顶点出发连对角线，可以把它分成 $(n-2)$ 个三角形，所以内角和是 $(n-2)\times 180^\circ$；而外角和永远等于 $360^\circ$。',
        figure: {
          id: 'fig-m-geo-sanjiao-s4',
          title: '外角与多边形内角和',
          caption: '三角形外角 = 不相邻两内角之和；五边形分成 3 个三角形',
          view: 'wide',
          alt: '左边是三角形 ABC，把边 BC 延长到点 D，顶点 C 处由 CA 与 CD 组成的角是外角，它等于与它不相邻的两个内角 ∠A 与 ∠B 之和；右边是五边形 ABCDE，从顶点 A 向 C、D 连两条虚线对角线，把五边形分成三个三角形，因此五边形的内角和等于 3 个 180 度，即 540 度。',
          prims: [
            { t: 'poly', points: [[12, 56], [38, 56], [26, 26]], closed: true },
            { t: 'line', x1: 26, y1: 26, x2: 21.2, y2: 13.9, tone: 'accent' },
            { t: 'angle', x: 26, y: 26, from: 111.8, to: 245, r: 7, label: '外角', tone: 'accent' },
            { t: 'angle', x: 12, y: 56, from: 0, to: 65, r: 8, label: '∠A' },
            { t: 'angle', x: 38, y: 56, from: 111.8, to: 180, r: 8, label: '∠B' },
            { t: 'dot', x: 12, y: 56, label: 'A', labelDx: -6.5, labelDy: 1 },
            { t: 'dot', x: 38, y: 56, label: 'B', labelDx: 2.5, labelDy: 1 },
            { t: 'dot', x: 26, y: 26, label: 'C', labelDx: -1.5, labelDy: -4 },
            { t: 'dot', x: 21.2, y: 13.9, label: 'D', labelDx: 2.5, labelDy: -1 },
            { t: 'poly', points: [[72, 14], [51.1, 29.2], [59.1, 53.8], [84.9, 53.8], [92.9, 29.2]], closed: true },
            { t: 'line', x1: 72, y1: 14, x2: 59.1, y2: 53.8, dashed: true, tone: 'accent' },
            { t: 'line', x1: 72, y1: 14, x2: 84.9, y2: 53.8, dashed: true, tone: 'accent' },
            { t: 'dot', x: 72, y: 14, label: 'A', labelDx: -1.5, labelDy: -4 },
            { t: 'dot', x: 51.1, y: 29.2, label: 'B', labelDx: -4, labelDy: -2 },
            { t: 'dot', x: 59.1, y: 53.8, label: 'C', labelDx: -1, labelDy: 4 },
            { t: 'dot', x: 84.9, y: 53.8, label: 'D', labelDx: 2, labelDy: 4 },
            { t: 'dot', x: 92.9, y: 29.2, label: 'E', labelDx: 2.5, labelDy: -1 },
          ],
        },
        note: '外角只等于与它不相邻的两个内角之和，不要把相邻内角也算进去；多边形外角和恒为 $360^\circ$，与边数无关。',
      },
    ],`
});
items.push({
  a: "term: '三角形的三边关系',",
  p: String.raw`
        figure: {
          id: 'fig-m-geo-sanjiao-c1',
          title: '三边关系：较短两边之和大于最长边',
          caption: '3+4>5 能围成；2+3<6 接不到一起',
          view: 'square',
          alt: '三角形 ABC 的三条边分别长为 3、4、5，其中 AC 与 CB 互相垂直，顶点 C 处画有直角符号；下方文字说明 3 加 4 大于 5 时能围成三角形，而 2 加 3 小于 6 时两条较短线段接不到一起，不能围成三角形。',
          prims: [
            { t: 'poly', points: [[26, 22], [53, 58], [26, 58]], closed: true, fill: true, tone: 'main' },
            { t: 'angle', x: 26, y: 58, from: 0, to: 90, r: 5, right: true },
            { t: 'text', x: 22.5, y: 40, text: '4', size: 3.6, anchor: 'end', tone: 'muted' },
            { t: 'text', x: 39.5, y: 62.5, text: '3', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'text', x: 45, y: 35, text: '5', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'dot', x: 26, y: 22, label: 'A', labelDx: -5.5, labelDy: 0 },
            { t: 'dot', x: 53, y: 58, label: 'B', labelDx: 2.5, labelDy: 1 },
            { t: 'dot', x: 26, y: 58, label: 'C', labelDx: -5.5, labelDy: 3 },
            { t: 'text', x: 50, y: 78, text: '3 + 4 > 5：能围成', size: 3.8, anchor: 'middle', tone: 'ok' },
            { t: 'text', x: 50, y: 89, text: '2 + 3 < 6：接不到一起，不能围成', size: 3.8, anchor: 'middle', tone: 'danger' },
          ],
        },`,
});
items.push({
  a: "term: '三角形的高、中线与角平分线',",
  p: String.raw`
        figure: {
          id: 'fig-m-geo-sanjiao-c2',
          title: '三条中线交于重心',
          caption: '三角形的三条中线交于一点，这个点叫重心',
          view: 'square',
          alt: '三角形 ABC 中，从顶点 A 连到边 BC 中点、从顶点 B 连到边 AC 中点、从顶点 C 连到边 AB 中点的三条中线相交于三角形内部的点 G；三条边的中点都用空心小圈标出。',
          prims: [
            { t: 'poly', points: [[50, 18], [14, 74], [86, 74]], closed: true },
            { t: 'line', x1: 50, y1: 18, x2: 50, y2: 74, tone: 'accent' },
            { t: 'line', x1: 14, y1: 74, x2: 68, y2: 46, tone: 'accent' },
            { t: 'line', x1: 86, y1: 74, x2: 32, y2: 46, tone: 'accent' },
            { t: 'dot', x: 50, y: 74, hollow: true },
            { t: 'dot', x: 32, y: 46, hollow: true },
            { t: 'dot', x: 68, y: 46, hollow: true },
            { t: 'dot', x: 50, y: 18, label: 'A', labelDx: -1.5, labelDy: -4 },
            { t: 'dot', x: 14, y: 74, label: 'B', labelDx: -6, labelDy: 2 },
            { t: 'dot', x: 86, y: 74, label: 'C', labelDx: 2.5, labelDy: 2 },
            { t: 'dot', x: 50, y: 55.3, label: 'G', labelDx: 2.5, labelDy: -2, tone: 'danger' },
            { t: 'text', x: 50, y: 89, text: 'G 是三条中线的交点——重心', size: 3.6, anchor: 'middle', tone: 'muted' },
          ],
        },`,
});
items.push({
  a: "term: '三角形内角和定理',",
  p: String.raw`
        figure: {
          id: 'fig-m-geo-sanjiao-c3',
          title: '作平行线证明内角和',
          caption: '过 C 作 AB 的平行线，把三个内角拼成一条直线',
          view: 'square',
          alt: '三角形 ABC 的底边 AB 水平放置，过顶点 C 作一条与 AB 平行的直线；由平行线的内错角相等，这条平行线在 C 左侧与 AC 所成的角等于 ∠A、右侧与 BC 所成的角等于 ∠B，三个角 ∠A、∠B、∠C 在 C 处正好拼成一条直线，说明三角形的内角和等于 180 度。',
          prims: [
            { t: 'line', x1: 10, y1: 26, x2: 90, y2: 26, tone: 'accent' },
            { t: 'poly', points: [[20, 72], [80, 72], [46, 26]], closed: true },
            { t: 'angle', x: 46, y: 26, from: 180, to: 240.5, r: 7, label: '∠A', tone: 'accent' },
            { t: 'angle', x: 46, y: 26, from: -53.5, to: 0, r: 7, label: '∠B', tone: 'accent' },
            { t: 'angle', x: 46, y: 26, from: 240.5, to: 306.5, r: 7, label: '∠C' },
            { t: 'angle', x: 20, y: 72, from: 0, to: 60.5, r: 8, label: '∠A' },
            { t: 'angle', x: 80, y: 72, from: 126.5, to: 180, r: 8, label: '∠B' },
            { t: 'dot', x: 20, y: 72, label: 'A', labelDx: -6.5, labelDy: 2 },
            { t: 'dot', x: 80, y: 72, label: 'B', labelDx: 2.5, labelDy: 2 },
            { t: 'dot', x: 46, y: 26, label: 'C', labelDx: -1.5, labelDy: -4 },
            { t: 'text', x: 50, y: 88, text: '∠A + ∠B + ∠C = 180°', size: 3.8, anchor: 'middle', tone: 'muted' },
          ],
        },`,
});
items.push({
  a: "term: '多边形的内角和与外角和',",
  p: String.raw`
        figure: {
          id: 'fig-m-geo-sanjiao-c4',
          title: '三角形三个外角之和为 360°',
          caption: '每个内角与相邻外角互补，三个外角相加正好 360°',
          view: 'square',
          alt: '三角形 ABC 的三条边都向外延长：顶点 A 处由 CA 的延长线与 AB 组成 120 度的外角，顶点 B 处由 AB 的延长线与 BC 组成 130 度的外角，顶点 C 处由 BC 的延长线与 CA 组成 110 度的外角，三个外角之和正好等于 360 度。',
          prims: [
            { t: 'poly', points: [[22, 66], [82, 66], [46.5, 23.7]], closed: true },
            { t: 'line', x1: 22, y1: 66, x2: 15, y2: 78.1, dashed: true, tone: 'accent' },
            { t: 'line', x1: 82, y1: 66, x2: 96, y2: 66, dashed: true, tone: 'accent' },
            { t: 'line', x1: 46.5, y1: 23.7, x2: 37.5, y2: 12.9, dashed: true, tone: 'accent' },
            { t: 'angle', x: 22, y: 66, from: 240, to: 360, r: 8, label: '120°', tone: 'ok' },
            { t: 'angle', x: 82, y: 66, from: 0, to: 130, r: 8, label: '130°', tone: 'ok' },
            { t: 'angle', x: 46.5, y: 23.7, from: 130, to: 240, r: 8, label: '110°', tone: 'ok' },
            { t: 'angle', x: 22, y: 66, from: 0, to: 60, r: 6, label: '60°' },
            { t: 'angle', x: 82, y: 66, from: 130, to: 180, r: 6, label: '50°' },
            { t: 'angle', x: 46.5, y: 23.7, from: 240, to: 310, r: 6, label: '70°' },
            { t: 'dot', x: 22, y: 66, label: 'A', labelDx: -6, labelDy: 2 },
            { t: 'dot', x: 82, y: 66, label: 'B', labelDx: 2.5, labelDy: 2 },
            { t: 'dot', x: 46.5, y: 23.7, label: 'C', labelDx: -1.5, labelDy: -4 },
            { t: 'text', x: 50, y: 90, text: '120° + 130° + 110° = 360°', size: 3.8, anchor: 'middle', tone: 'muted' },
          ],
        },`,
});
items.push({
  a: "求第三边长的所有可能取值。',",
  p: String.raw`
        figure: {
          id: 'fig-m-geo-sanjiao-e1',
          title: '第三边的取值范围',
          caption: '7−3 < x < 7+3，即 4 < x < 10，整数只能取 5 到 9',
          view: 'wide',
          alt: '一条水平数轴上，4 与 10 两个位置各画一个空心圈表示不能取到，中间的 5、6、7、8、9 五个整数各画一个实心点；粗线标出第三边 x 满足 4 小于 x 小于 10 的取值范围，说明第三边只能是 5 到 9 这五个整数。',
          prims: [
            { t: 'arrow', x1: 8, y1: 40, x2: 92, y2: 40, tone: 'muted', width: 0.4 },
            { t: 'line', x1: 12, y1: 40, x2: 88, y2: 40, tone: 'accent', width: 1.2 },
            { t: 'line', x1: 12, y1: 36, x2: 12, y2: 44, tone: 'muted' },
            { t: 'line', x1: 88, y1: 36, x2: 88, y2: 44, tone: 'muted' },
            { t: 'dot', x: 12, y: 40, hollow: true, tone: 'danger' },
            { t: 'dot', x: 88, y: 40, hollow: true, tone: 'danger' },
            { t: 'dot', x: 24.7, y: 40 },
            { t: 'dot', x: 37.3, y: 40 },
            { t: 'dot', x: 50, y: 40 },
            { t: 'dot', x: 62.7, y: 40 },
            { t: 'dot', x: 75.3, y: 40 },
            { t: 'text', x: 12, y: 50, text: '4', size: 3.6, anchor: 'middle', tone: 'danger' },
            { t: 'text', x: 88, y: 50, text: '10', size: 3.6, anchor: 'middle', tone: 'danger' },
            { t: 'text', x: 24.7, y: 50, text: '5', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'text', x: 37.3, y: 50, text: '6', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'text', x: 50, y: 50, text: '7', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'text', x: 62.7, y: 50, text: '8', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'text', x: 75.3, y: 50, text: '9', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'text', x: 50, y: 25, text: '7 − 3 < x < 7 + 3', size: 3.8, anchor: 'middle', tone: 'accent' },
            { t: 'text', x: 50, y: 15, text: '第三边的取值范围', size: 3.6, anchor: 'middle', tone: 'muted' },
          ],
        },`,
});
items.push({
  a: "求三个内角的度数，并判断三角形的形状。',",
  p: String.raw`
        figure: {
          id: 'fig-m-geo-sanjiao-e2',
          title: '内角比为 1:2:3 的直角三角形',
          caption: '三角依次为 30°、60°、90°，是直角三角形',
          view: 'square',
          alt: '直角三角形 ABC，顶点 C 处画有直角符号并标 90 度，顶点 A 处标 30 度，顶点 B 处标 60 度；三个内角中最小角 30 度与 60 度之比为 1 比 2，与 90 度之比为 1 比 3。',
          prims: [
            { t: 'poly', points: [[26, 29], [52, 74], [26, 74]], closed: true },
            { t: 'angle', x: 26, y: 74, from: 0, to: 90, r: 6, right: true },
            { t: 'angle', x: 26, y: 29, from: -90, to: -60, r: 8, label: '30°' },
            { t: 'angle', x: 52, y: 74, from: 120, to: 180, r: 8, label: '60°' },
            { t: 'text', x: 33, y: 67, text: '90°', size: 3.6, anchor: 'middle', tone: 'muted' },
            { t: 'dot', x: 26, y: 29, label: 'A', labelDx: -1.5, labelDy: -4 },
            { t: 'dot', x: 52, y: 74, label: 'B', labelDx: 2.5, labelDy: 2 },
            { t: 'dot', x: 26, y: 74, label: 'C', labelDx: -6, labelDy: 2 },
            { t: 'text', x: 50, y: 90, text: '∠A:∠B:∠C = 1:2:3', size: 3.8, anchor: 'middle', tone: 'muted' },
          ],
        },`,
});
items.push({
  a: "求这个多边形的边数。',",
  p: String.raw`
        figure: {
          id: 'fig-m-geo-sanjiao-e3',
          title: '每个内角 144° 的正十边形',
          caption: '内角 144° → 外角 36°；360°÷36° = 10',
          view: 'square',
          alt: '正十边形的顶点 P 处，两条相邻的边把内角分成 144 度，一条边的延长线与另一条相邻边组成 36 度的外角；每个外角都是 36 度，十个外角相加正好是 360 度，所以这个正多边形是十边形。',
          prims: [
            { t: 'poly', points: [[50, 10], [26.5, 17.6], [12, 37.6], [12, 62.4], [26.5, 82.4], [50, 90], [73.5, 82.4], [88, 62.4], [88, 37.6], [73.5, 17.6]], closed: true },
            { t: 'line', x1: 50, y1: 10, x2: 36.7, y2: 5.7, dashed: true, tone: 'accent' },
            { t: 'angle', x: 50, y: 10, from: 162, to: 198, r: 9, label: '36°', tone: 'accent' },
            { t: 'angle', x: 50, y: 10, from: 198, to: 342, r: 9, label: '144°' },
            { t: 'dot', x: 50, y: 10, label: 'P', labelDx: 3, labelDy: -2 },
          ],
        },`,
});
applyRegion(S, E, items);
fs.writeFileSync(P, src.replace(/\r\n/g, '\n'), 'utf8');
console.log('ok ' + items.length);