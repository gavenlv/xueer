/**
 * 「图文配套」的判据（数学／物理／化学共用一套实现）。
 *
 * ## 为什么要单独成一个模块
 *
 * 这条红线原来在 `validate-entry.ts`、`validate-physics.ts`、`validate-chemistry.ts`
 * 里各写了一遍：规则一旦分叉，就会出现「数学拦得住、物理悄悄放过」这种不一致，
 * 而这类不一致在几百条内容里靠人眼是发现不了的。
 *
 * 抽出来还有第二个好处：**规则本身可以被自测**（见 `validate-entry.ts` 的
 * 「图文配套规则自测」）。判据全是正则与阈值，改一个字符就可能从「不误报」
 * 滑到「满屏误报」，或者反过来把整条红线悄悄放宽——用真实写法做用例钉住它。
 *
 * ## 这里只放纯函数
 *
 * 输入「文字 + 图」，输出「该不该有图」「图上标了哪些字母」这类判断；
 * **报错文案与严重级别仍由各科校验器决定**（数学对漏标字母只警告，
 * 物理化学对「写了如图却没有图」直接报错）。
 */
import type { PhysicsFigure } from '../src/types';

/* ------------------------------------------------------------------ */
/* 一、数学：正文有没有「用字母指代点」                                  */
/* ------------------------------------------------------------------ */

/** 写法类缩写：`$SSS$`、`$\mathrm{Rt}\triangle ABC$` 里的 Rt 不是点名字母 */
export const ACRONYMS = new Set(['SSS', 'SAS', 'ASA', 'AAS', 'SSA', 'AAA', 'HL', 'Rt', 'Rt△']);

/**
 * 量名字母：`S` 是面积、`V` 是体积、`R` 是半径，几何图上也**不用**这几个字母标点
 * （与量名撞车，教材一律避开），所以不要求它们在图上出现。
 */
export const QUANTITY_NAMES = new Set(['S', 'V', 'R']);

/**
 * 「点 $A$」「交于点 $O$」「延长到 $E$」这类**上下文**——单个大写字母只有在这种
 * 语境里才是「图上的点」；`$A$、$B$ 两种型号`、`$\frac{A}{B}$` 里的 A、B 只是代号。
 */
export const POINT_CONTEXT = '点|顶点|交点|中点|端点|圆心|原点|垂足|交于|延长到|延长|连接|取|记为|记作|设为';

/**
 * 几何／函数／坐标语境的标志词：没有它们，正文里的字母一律按代数变量看待。
 *
 * 两处容易漏掉的写法，都吃过亏：
 *   · 「半径／直径／弦／圆周／圆心」要单独列——圆的内容常常一个「圆」字都不写
 *     （「$\odot O$ 的半径是 5，弦 $AB=8$」），少了这几个词，圆这一章整章漏检；
 *   · **几何 LaTeX 记号本身也是语境**——「在 $\triangle ABC$ 中，$\angle BAC=90^\circ$」
 *     整句可能一个中文几何名词都没有，只认中文词就会把这句判成代数。
 */
export const GEOM_CONTEXT =
  /点|线段|直线|射线|数轴|角|边|三角形|四边形|圆|弧|切线|垂直|垂足|平行|中点|交于|相交|延长|连接|坐标|图象|图像|对称|旋转|平移|全等|相似|勾股|原点|半径|直径|弦|圆周|圆心|\\triangle|\\angle|\\odot|\\parallel|\\perp|\\cong|\\sim/;

/**
 * 正文是否在**用字母指代点／线段**（「$D$ 是 $AB$ 的中点」）。
 *
 * 这是数学「图文配套」的判据：文字用字母说话，图上就必须有这些字母。
 * 只认三种写法，避免把变量、代号、量名当成点：
 *
 *   ① 几何记号：`$\triangle ABC$`、`$\angle ACD$`、`$\odot O$`；
 *   ② 连写的大写字母串：`$AB$`、`$ABCD$`（单字母不算，`$A$` 可能是型号或变量）；
 *   ③ 点相关上下文里的单字母：`点 $P$`、`交于点 $O$`、`延长到 $E$`。
 *
 * 走这三条的代价是可能漏掉极少数写法（如「以 $A$ 为圆心」），但换来的是不误报——
 * 误报会逼着作者给「事件 $A$」也画一张图，红线就没人看了。
 */
export function pointLetters(text: string): Set<string> {
  const out = new Set<string>();
  if (!text) return out;
  // 先过一道语境闸门：只有几何／函数／坐标类条目才可能「用字母指代点」。
  // 代数里的连写字母是真的式子——`$A^{3}+B^{3}$` 的 A、B 是表达式，`$AB=0$` 的 AB 是两个因式的积，
  // 给它们要求图上标点纯属误报，而误报会让这条红线失去约束力。
  if (!GEOM_CONTEXT.test(text)) return out;
  for (const m of text.match(/\$[^$]*\$/g) ?? []) {
    const raw = m.slice(1, -1);
    for (const x of raw.matchAll(/\\triangle\s*([A-Z]+)/g)) for (const ch of x[1]) out.add(ch);
    for (const x of raw.matchAll(/\\angle\s*([A-Z]+)/g)) for (const ch of x[1]) out.add(ch);
    for (const x of raw.matchAll(/\\odot\s*([A-Z])/g)) out.add(x[1]);
    // 去掉 LaTeX 命令后剩下的连写大写字母（`\mathrm{Rt}` 残渣、`\frac` 之类都不是）
    const body = raw.replace(/\\[a-zA-Z]+/g, ' ');
    for (const m2 of body.matchAll(/([A-Z]{2,4})(\s*=\s*0)?/g)) {
      const run = m2[1];
      if (ACRONYMS.has(run)) continue;
      // `$AB=0$ 得 $A=0$ 或 $B=0$`：这里的 AB 是两个因式的积，是代数写法而不是线段
      if (m2[2]) continue;
      for (const ch of run) out.add(ch);
    }
  }
  const ctx = new RegExp(`(?:${POINT_CONTEXT})\\s*\\$\\s*([A-Z])\\s*\\$`, 'g');
  for (const m of text.matchAll(ctx)) out.add(m[1]);
  for (const ch of [...out]) if (QUANTITY_NAMES.has(ch)) out.delete(ch);
  return out;
}

/**
 * 数学图里已经标出的字母。
 *
 * 名字可能挂在三种地方，漏掉任何一种都会误报「一个字母都没标」：
 *   · **任何图元的 `label`**——点写「A」，正方体展开图的**面**也写「A」，圆、扇形、容器同理；
 *   · `text` 图元的文字：只认「A」「A′」「A(2,3)」这种纯点名写法，
 *     不认「AB = 4」这类说明文字（否则每张图上随便一句说明都能冒充点名）；
 *   · 坐标系图元自带原点字母 O（渲染器画出来的），不能因为作者没再写一个 dot 就判「没标」。
 */
export function figureLetters(fig: PhysicsFigure): Set<string> {
  const out = new Set<string>();
  const take = (s?: string) => {
    if (!s) return;
    const m = /^([A-Z])/.exec(s.trim());
    if (m) out.add(m[1]);
  };
  for (const p of fig.prims) {
    if ('label' in p) take((p as { label?: string }).label);
    if (p.t === 'text') {
      // 「A」与「A(2,3)」「A(0, 3)」都算标了 A：坐标标注里点名字母在最前面
      if (/^[A-Z][′']?\s*(?:[（(]|$)/.test(p.text.trim())) take(p.text.trim());
    } else if (p.t === 'plane') take('O');
    else if (p.t === 'axis' && p.origin) take('O');
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 二、物理／化学：正文有没有「指着图说话」                              */
/* ------------------------------------------------------------------ */

/** 「如图」类：写了它就必须有图，否则题面自相矛盾（学生对着空气读题） */
export const SAY_FIG = /如图|图中|下图|见图|图甲|图乙|图丙|图\s*[0-9]/;

/**
 * 「成图说法」：正文提到这些，没有图就落不下去。
 *
 * 两科各有一份，因为「非图说不清的东西」不一样：
 *   · 物理是**读数**（表盘、天平、量筒、刻度尺）与装置、图像；
 *   · 化学是**装置、结构示意、流程图**与图像；化学的「读数」多是物理测量的事，
 *     放进来只会把大量文字题误判成缺图。
 */
export const SAY_CHART: Record<'physics' | 'chemistry', RegExp> = {
  physics:
    /电路图|光路图|受力示意图|受力分析|装置图|示意图|图象|图像|坐标图|表盘|读数示意|(?:电流表|电压表|温度计|体温计|天平|量筒|弹簧测力计|停表|刻度尺)的?读数/,
  chemistry: /装置图|结构示意图|示意图|流程图|模型图|图象|图像|坐标图|原子结构|粒子模型|微观示意/,
};

export type FigureSubject = keyof typeof SAY_CHART;

/** 这段正文「需不需要图」：'say' 硬需求（如图）、'chart' 成图说法、null 不需要 */
export type FigureNeed = 'say' | 'chart' | null;

export function figureNeed(text: string, subject: FigureSubject): FigureNeed {
  if (!text) return null;
  if (SAY_FIG.test(text)) return 'say';
  if (SAY_CHART[subject].test(text)) return 'chart';
  return null;
}

/**
 * 卷面策略类条目（`phy-exam-strategy-*`、`chem-exam-strategy-*`）不参与这条检查。
 *
 * 它们说「先读实验题的装置图，再写步骤」是在讲答题方法，不是在给自己的正文配图；
 * 对它们报错只会逼作者删掉有用的表述。
 */
export function isStrategyTopic(at: string): boolean {
  return /strategy/.test(at);
}

/** 这一组图里有没有**真的能画出来**的图（有图元才算，空 prims 等于没画） */
export function hasDrawableFigure(figs: (PhysicsFigure | undefined)[]): boolean {
  return figs.some((f) => Boolean(f && Array.isArray(f.prims) && f.prims.length));
}
