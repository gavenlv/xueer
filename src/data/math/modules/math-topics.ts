/**
 * 数学「中考题型专题」（`math-topics`）的**条目清单 + 按条目懒加载**。
 *
 * ## 这个模块是什么
 *
 * 与语文的「中考专题」同一形态（见 `src/types.ts` 的 `ExamTopic`）：按**卷面板块**
 * 设 5 个专题（数与代数 / 图形与几何 / 统计与概率 / 综合与实践 / 压轴与应试），
 * 每个专题之下按考点与题型拆成若干**章节**，每节都是「讲解 + 要点 + 例题 + 同名专项训练」。
 * 内容规范见 `src/data/math/TOPICS-SPEC.md`（2027 年 150 分卷面、共 35 节）。
 *
 * 与 `math-exam`（策略型专题：试卷结构、时间分配、压轴模型串讲）是**两块不同的模块**：
 * 那一块是「怎么考、怎么分配时间」，这一块是「按题型逐类讲透 + 大量训练」，因此
 * 模块 id 不复用，`math-exam` 一行都不动。
 *
 * ## 为什么这里只有「加载器」而没有内容
 *
 * 5 个专题的正文（考情 + 35 节讲解 + 45+ 题/专题的训练库）合计是几百 KB 源码。
 * 若把它们拼成一个数组打进一个 chunk，就会重演语文改造前那次事故：**一个 495 kB 的
 * 大块**——学生只想看「数与代数」，也得把压轴与应试全部下载完。因此：
 *
 *   - 一个专题一个 `import()`（见下面的 `DATA_FILES`），点开哪个才下载哪个；
 *   - 模块列表页要用的清单（标题、卷面定位、几节、多少题）来自**轻量清单**
 *     `data/summary.ts` 的 `ENTRY_META`（`pnpm gen` 生成，首屏本来就有），
 *     因此打开模块页是**零下载**；
 *   - 正文回来后由 `data/math/index.ts` 的 `installMathTopic` **原地补进骨架条目**。
 *
 * ## 与内容工程师的并发约定（重要）
 *
 * `src/data/math/topics/*.ts` 由另外四位工程师并行撰写，**本文件交付时那些文件可能
 * 一个都还不存在**。所以这里：
 *
 *   1. 用 `import.meta.glob` 在**构建期**发现文件 —— 文件一落地就自动出现在
 *      `DATA_FILES` 里，本文件一行都不用改，也不需要任何人来"接线"；
 *   2. 文件名允许 `mth-algebra.ts` / `algebra.ts` / `t1-algebra.ts` 等写法
 *      （按专题短名匹配，见 `loaderForId`）；导出的变量名也不限，按**数据形状**
 *      识别（见 `topicOfNamespace`，判据是 `lib/examTopic.ts` 的 `isExamTopicData`）；
 *   3. 一个文件都没有时清单为空：模块页渲染空态、详情页渲染「没有找到这条内容」，
 *      **不报错、不白屏**，`pnpm check` 照样全绿。
 *
 * 数据写好之后要跑一次 `pnpm gen` 重新生成轻量清单（与其它任何内容新增一样），
 * 否则 `pnpm validate` 会提示「缺少条目 … → 请运行 pnpm gen」。
 */

import type { ExamTopic } from '../../../types';
import { isExamTopicData } from '../../../lib/examTopic';
import { ENTRY_META } from '../../summary';

/** 一个数学专题的清单项（章节名逐字来自 `TOPICS-SPEC.md` 第二节） */
export interface MathTopicSpec {
  id: string;
  /** 专题短名：数据文件名与题目 id（`mth-<短名>-qNN`）都用它 */
  short: string;
  title: string;
  /** 卷面定位（骨架阶段显示；正文到位后以专题数据里的 `paper` 为准） */
  paper: string;
  /** 一句话说明（骨架阶段显示；正文到位后以专题数据里的 `summary` 为准） */
  summary: string;
  /** 章节清单（`TOPICS-SPEC.md` 第二节，逐字照用；校验脚本据此提示偏差） */
  sections: string[];
}

/**
 * 五个专题（顺序 = 卷面顺序，也是模块页的展示顺序，**不要重排**）。
 *
 * 章节名必须与 `TOPICS-SPEC.md` 逐字一致：章节名同时是训练分组名与题目标签，
 * 改一个字，学生点「刷这一节」就会落到空组（`scripts/validate-exam-topics.ts` 会拦）。
 *
 * `paper` 里的分值一律写「推算」：官方只公布了卷面结构与总分（150 分），
 * **没有逐题公布分值**，编造具体分值比不写更糟。
 */
export const MATH_TOPIC_SPECS: MathTopicSpec[] = [
  {
    id: 'mth-algebra',
    short: 'algebra',
    title: '数与代数',
    paper: '客观题（选择 1—8 题 · 填空 11—14 题）与解答题前半（推算约 70—80 分）',
    summary: '实数与代数式的运算、方程与不等式、三类函数，是整卷的地基：客观题与解答题前半都靠它拿分。',
    sections: [
      '实数与二次根式',
      '整式与因式分解',
      '分式与分式方程',
      '一元一次方程与二元一次方程组',
      '一元二次方程',
      '一元一次不等式（组）',
      '一次函数',
      '反比例函数',
      '二次函数',
    ],
  },
  {
    id: 'mth-geometry',
    short: 'geometry',
    title: '图形与几何',
    paper: '选择与填空的图形题、解答题的证明与计算（推算约 45—55 分）',
    summary: '从平行线到圆与相似，几何的分数落在「识图 + 推理 + 规范书写」三件事上。',
    sections: [
      '相交线与平行线',
      '三角形与全等',
      '等腰与直角三角形',
      '勾股定理',
      '四边形与平行四边形',
      '圆的基本性质',
      '直线与圆的位置关系',
      '相似三角形',
      '锐角三角函数与解直角三角形',
    ],
  },
  {
    id: 'mth-stats',
    short: 'stats',
    title: '统计与概率',
    paper: '选择或填空 1—2 题 + 一道统计解答题（推算约 12—16 分）',
    summary: '这一块是「必须拿满」的题位：算得对、写得全、结论用数据说话。',
    sections: [
      '数据的收集与整理',
      '平均数中位数众数',
      '方差与数据波动',
      '统计图表与图表误读',
      '概率与树状图列举',
    ],
  },
  {
    id: 'mth-model',
    short: 'model',
    title: '综合与实践',
    paper: '解答题中的应用与探究题（推算约 20—26 分）',
    summary: '把一段生活文字翻译成方程、函数或几何关系，是失分最集中的题型，靠建模套路而不是灵感。',
    sections: [
      '方程与不等式建模',
      '函数与最值建模',
      '几何测量与方案设计',
      '规律探究',
      '新定义与阅读理解',
      '开放探究与方案评价',
    ],
  },
  {
    id: 'mth-exam',
    short: 'exam',
    title: '压轴与应试',
    paper: '最后两道压轴题与全卷 120 分钟的时间分配（推算约 20—24 分）',
    summary: '压轴题不是「做不出来」，而是「拿不到该拿的步骤分」；这一块练的是分步得分与取舍。',
    sections: [
      '动点问题',
      '图形变换与存在性',
      '函数与几何综合',
      '最值与取值范围',
      '分类讨论',
      '解答题步骤分与时间分配',
    ],
  },
];

/** 专题 id（顺序 = 卷面顺序） */
const SPEC_IDS: string[] = MATH_TOPIC_SPECS.map((s) => s.id);

/** 轻量清单里已经出现的数学专题（`pnpm gen` 从真实数据生成；数据没写好时为空） */
const META_IDS: string[] = ENTRY_META.filter((m) => m.moduleId === 'math-topics').map((m) => m.id);

/** 正文数据文件所在目录（报错信息与校验脚本提示用） */
export const MATH_TOPIC_CONTENT_DIR = 'src/data/math/topics';

/**
 * 目录下的数据文件表。
 *
 * `import.meta.glob` 是**构建期**展开的：文件在构建时存在就会被收进来，因此内容
 * 工程师把 `mth-algebra.ts` 写进 `src/data/math/topics/` 之后，**不需要改任何加载器**
 * 就自动生效（重新构建即可）。文件不存在时这里就是空对象，一切照旧、不报错。
 *
 * 这里**只允许写 glob / `import()`**：写成 `import { t1 } from '../topics/mth-algebra'`
 * 会把 5 个专题重新并回同一个 chunk（`pnpm validate` 会直接报错拦住）。
 */
const DATA_FILES = import.meta.glob('../topics/*.ts') as Record<
  string,
  () => Promise<Record<string, unknown>>
>;

/** 文件名（去目录、去扩展名）：`../topics/t1-algebra.ts` → `t1-algebra` */
function stemOf(file: string): string {
  return (file.split('/').pop() ?? file).replace(/\.tsx?$/, '');
}

/** 明显不是专题正文的文件（工具函数、索引、说明），不参与按名匹配 */
const NON_TOPIC_STEMS = new Set(['index', 'shared', 'common', 'utils', 'types', 'spec']);

/**
 * 这一专题的数据文件加载器。
 *
 * 命名由四位内容工程师决定，因此按**专题短名**匹配，依次尝试：
 * `mth-algebra.ts` → `algebra.ts` → `t1-algebra.ts` / `m1_algebra.ts` → 含 `algebra` 的文件。
 * 都没命中就返回 `undefined`（当作"这个专题还没写"），而不是抛错——
 * 一个专题缺席不该让整块模块打不开。
 */
function loaderForId(
  id: string,
  allowFuzzy = true,
): (() => Promise<Record<string, unknown>>) | undefined {
  const spec = MATH_TOPIC_SPECS.find((s) => s.id === id);
  const short = spec?.short ?? id.replace(/^mth-/, '');
  const files = Object.entries(DATA_FILES).filter(([f]) => !NON_TOPIC_STEMS.has(stemOf(f)));
  const pick = (pred: (stem: string) => boolean) => files.find(([f]) => pred(stemOf(f)));

  return (
    pick((s) => s === id) ??
    pick((s) => s === short) ??
    pick((s) => s.endsWith(`-${short}`) || s.endsWith(`_${short}`)) ??
    (allowFuzzy ? pick((s) => s.includes(short)) : undefined)
  )?.[1];
}

/**
 * 从数据文件里取出专题对象：**不看导出变量名**，按数据形状认。
 *
 * 判据是 `isExamTopicData`（有 `trends` 与 `drills` 两个必填数组）。这样无论作者写的是
 * `export const mthAlgebra`、`export const topic` 还是 `export default {...}`，
 * 也无论是对象还是「对象数组」，都能取到；取不到时返回 `undefined`，由调用方给出
 * 一句看得懂的报错，而不是 TypeError。
 */
function topicOfNamespace(ns: Record<string, unknown>): ExamTopic | undefined {
  for (const value of Object.values(ns)) {
    if (isExamTopicData(value)) return value;
    if (Array.isArray(value)) {
      const hit = value.find((v) => isExamTopicData(v));
      if (hit) return hit as ExamTopic;
    }
  }
  return undefined;
}

/* ------------------------------ 清单与状态 ------------------------------ */

/**
 * **有内容的**专题 id（清单里只列这些）。
 *
 * 两种来源取并集：
 *   1. 目录下有对应数据文件的专题（构建期 glob 就知道，不需要下载）；
 *   2. 轻量清单 `ENTRY_META` 里已经出现的专题 id（兜住"文件名不在预期命名法之内"的情况）。
 *
 * 这样列表页展示的每一条都**真的能打开**——反过来，若把还没写的专题也列出来，
 * 学生点进去只会看到「没有找到这条内容」，比不列更糟。
 */
export function availableMathTopicIds(): string[] {
  return [
    ...SPEC_IDS.filter((id) => Boolean(loaderForId(id)) || META_IDS.includes(id)),
    ...META_IDS.filter((id) => !SPEC_IDS.includes(id)),
  ];
}

/**
 * 本模块的条目 id（顺序 = 卷面顺序）。
 *
 * 数据文件还没写时是**空数组**：模块列表页渲染空态、`pnpm check` 全绿；文件一落地
 * 就自动出现（见文件头的并发约定）。
 */
export const MATH_TOPIC_IDS: string[] = availableMathTopicIds();

/** 取清单项；清单之外的 id（例如别人另起了一个新专题）返回 undefined */
export function mathTopicSpecOf(id: string): MathTopicSpec | undefined {
  return MATH_TOPIC_SPECS.find((s) => s.id === id);
}

/* ------------------------------ 加载状态 ------------------------------ */

/** 已加载的专题正文；**没加载的不在里面**（不要拿它当「全部专题」用） */
const loaded = new Map<string, ExamTopic>();
const pending = new Map<string, Promise<ExamTopic>>();

/** 已加载的专题正文，按卷面顺序（校验脚本与聚合页面用） */
export const mathExamTopics: ExamTopic[] = [];

function syncOrder(): void {
  mathExamTopics.length = 0;
  for (const id of MATH_TOPIC_IDS) {
    const t = loaded.get(id);
    if (t) mathExamTopics.push(t);
  }
}

/** 这一专题的正文是否已在内存里 */
export function isMathTopicDataReady(id: string): boolean {
  return loaded.has(id);
}

/** 取已加载的专题正文（未加载返回 undefined） */
export function mathTopicData(id: string): ExamTopic | undefined {
  return loaded.get(id);
}

/**
 * 加载一个专题的正文。重复调用安全：已加载的直接返回，正在加载的复用同一个 Promise。
 *
 * 数据文件还没写时给出一句**看得懂**的拒绝（而不是 `undefined is not a function`），
 * 页面的重试出口与 `pnpm validate` 的提示都靠它。
 */
export function loadMathTopicData(id: string): Promise<ExamTopic> {
  const done = loaded.get(id);
  if (done) return Promise.resolve(done);
  const running = pending.get(id);
  if (running) return running;

  const loader = loaderForId(id);
  if (!loader) {
    return Promise.reject(
      new Error(
        `数学专题「${id}」的正文数据还没写好（期望文件 ${MATH_TOPIC_CONTENT_DIR}/${id}.ts，` +
          `文件名含「${mathTopicSpecOf(id)?.short ?? id}」即可被自动识别，见 TOPICS-SPEC.md）`,
      ),
    );
  }

  const p = loader()
    .then((ns) => {
      const topic = topicOfNamespace(ns);
      if (!topic) {
        throw new Error(
          `数学专题「${id}」的数据文件里找不到专题对象：需要导出带 trends / drills 的 ` +
            `ExamTopic（见 TOPICS-SPEC.md 第四节）`,
        );
      }
      if (topic.id !== id) {
        // 不中断加载（学生仍应看得到内容），但这个偏差必须让人知道
        console.warn(
          `[math-topics] ${id} 的数据文件导出的专题 id 是「${topic.id}」，与清单 id 不一致；` +
            `请按 TOPICS-SPEC.md 统一为 ${id}`,
        );
      }
      loaded.set(id, topic);
      syncOrder();
      return topic;
    })
    .finally(() => {
      // 失败也清掉：否则一次网络抖动会让这一专题在本会话里永远加载不了
      pending.delete(id);
    });

  pending.set(id, p);
  return p;
}

/**
 * 加载全部**已写好**的专题（聚合页面与校验脚本用：宁可多下一块，也不能少题）。
 *
 * 还没写的专题**直接跳过**：错题本、学习报告、考点页不该因为某个专题的文件缺席而
 * 整页报错——它们的错题与考点本来就不包含那个专题。
 */
export function loadAllMathTopicData(): Promise<ExamTopic[]> {
  return Promise.all(
    MATH_TOPIC_IDS.filter((id) => Boolean(loaderForId(id))).map((id) => loadMathTopicData(id)),
  );
}

/**
 * 题目 id → 所属专题 id。
 *
 * `TOPICS-SPEC.md` 规定题 id 形如 `mth-<专题短名>-qNN`（如 `mth-algebra-q01`），
 * 而专题 id 是 `mth-algebra`，二者**前缀不同**（题目用短名，条目用全名），
 * 所以两种前缀都要认：错题重做（`?ids=`）靠它做到「只下载错题所属的那一两个专题」。
 * 推不出来时返回 `undefined`，调用方据此退回「全加载」——宁可慢一点也不能少题。
 */
export function mathTopicIdOfQuestion(questionId: string): string | undefined {
  for (const spec of MATH_TOPIC_SPECS) {
    if (questionId.startsWith(`${spec.id}-`) || questionId.startsWith(`mth-${spec.short}-`)) {
      return spec.id;
    }
  }
  return MATH_TOPIC_IDS.find((id) => questionId.startsWith(`${id}-`));
}
