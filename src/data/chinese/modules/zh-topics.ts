/**
 * 「中考专题」模块的原始数据（**一专题一块，按需加载**）。
 *
 * 这是语文唯一**为备考而设**的模块：前六块按教材内容组织（古诗词、字词、文言文、
 * 现代文、作文、名著），这一块按**广州中考语文卷面题型**组织——卷面板块本身就是
 * 命题单位，学生拿到卷子也按这几块分配时间，因此「逐个攻破」的单位定在题型上，
 * 每攻破一个专题就有可验证的终点（专题内每一道题都曾答对）。
 *
 * 七块与卷面的对应关系：
 *
 * | 文件 | 专题 | 卷面位置 |
 * | --- | --- | --- |
 * | `t1-jilei` | 积累与运用 | 第一大题 · 基础积累与语言运用（约 20—24 分） |
 * | `t2-moxie` | 古诗文默写 | 第二大题之一 · 古诗文积累与默写（约 8—10 分） |
 * | `t3-wenyan` | 文言文阅读 | 第二大题之二 · 课内课外文言文阅读（约 12—16 分） |
 * | `t4-gushi` | 古诗词鉴赏 | 第二大题之三 · 古诗词鉴赏（约 4—6 分） |
 * | `t5-xiandai` | 现代文阅读 | 第三大题 · 文学类 + 实用类文本（约 30—40 分） |
 * | `t6-mingzhu` | 名著阅读与整本书阅读 | 第四大题 + 附加题（约 4—8 分） |
 * | `t7-xiezuo` | 写作 | 第五大题 · 写作（60 分） |
 *
 * 顺序即专题页的展示顺序（也等于卷面顺序），因此**不要重排**。
 *
 * ## 为什么这里只有「加载器」而没有内容
 *
 * 七个专题的正文合计约 1.3 MB 源码。**以前**这个文件把七份正文全部静态 import、
 * 拼成一个数组，打包后是**一个 495 kB（gzip 455 kB）的大块**——比首屏 `index`
 * 还大：学生只想看「古诗文默写」，却要先把写作、现代文、名著全部下载下来，
 * 感受就是「每次点开都很慢」。
 *
 * 因此改成：**一个专题一个 `import()`**，`ZH_TOPIC_LOADERS` 只登记「怎么加载」，
 * 真正的字节在 `data/chinese/zh-topics/t*.ts` 各自的 chunk 里，点开哪个专题才下载哪个。
 * 模块页与检索用的骨架（标题、副标题、题量）来自生成好的轻量清单
 * （`data/summary.ts` 的 `ENTRY_META`），因此**列表页一个专题正文都不用下载**。
 *
 * 调用方（`data/chinese/index.ts`）负责把加载回来的正文**原地补进已有条目**，
 * 见那里的 `loadZhTopic` / `loadAllZhTopics`。
 */

import type { ChineseExamTopic } from '../../../types';

/** 七个专题的 id，顺序 = 卷面顺序（也是模块页的展示顺序），不要重排 */
export const ZH_TOPIC_IDS = [
  'zht-jilei',
  'zht-moxie',
  'zht-wenyan',
  'zht-gushi',
  'zht-xiandai',
  'zht-mingzhu',
  'zht-xiezuo',
] as const;

export type ZhTopicId = (typeof ZH_TOPIC_IDS)[number];

/**
 * 一专题一个动态 import。
 *
 * 这里**只允许写 `import()`**：写成 `import { t1Jilei } from '../zh-topics/t1-jilei'`
 * 会让七个专题重新并回同一个 chunk（`pnpm validate` 会直接报错拦住，
 * 见 `scripts/validate-entry.ts` 的「中考专题必须一专题一块」）。
 */
export const ZH_TOPIC_LOADERS: Record<ZhTopicId, () => Promise<ChineseExamTopic>> = {
  'zht-jilei': () => import('../zh-topics/t1-jilei').then((m) => m.t1Jilei),
  'zht-moxie': () => import('../zh-topics/t2-moxie').then((m) => m.t2Moxie),
  'zht-wenyan': () => import('../zh-topics/t3-wenyan').then((m) => m.t3Wenyan),
  'zht-gushi': () => import('../zh-topics/t4-gushi').then((m) => m.t4Gushi),
  'zht-xiandai': () => import('../zh-topics/t5-xiandai').then((m) => m.t5Xiandai),
  'zht-mingzhu': () => import('../zh-topics/t6-mingzhu').then((m) => m.t6Mingzhu),
  'zht-xiezuo': () => import('../zh-topics/t7-xiezuo').then((m) => m.t7Xiezuo),
};

/* ------------------------------ 加载状态 ------------------------------ */

/** 已加载的专题正文；**没加载的专题不在里面**（不要拿它当「全部专题」用） */
const loaded = new Map<ZhTopicId, ChineseExamTopic>();
const pending = new Map<ZhTopicId, Promise<ChineseExamTopic>>();

/** 已加载的专题正文，按卷面顺序（校验脚本与聚合页面用） */
export const zhExamTopics: ChineseExamTopic[] = [];

function syncOrder(): void {
  zhExamTopics.length = 0;
  for (const id of ZH_TOPIC_IDS) {
    const t = loaded.get(id);
    if (t) zhExamTopics.push(t);
  }
}

/** 这一专题的正文是否已在内存里 */
export function isZhTopicDataReady(id: string): boolean {
  return loaded.has(id as ZhTopicId);
}

/** 取已加载的专题正文（未加载返回 undefined） */
export function zhTopicData(id: string): ChineseExamTopic | undefined {
  return loaded.get(id as ZhTopicId);
}

/**
 * 加载一个专题的正文。重复调用安全：已加载的直接返回，正在加载的复用同一个 Promise。
 */
export function loadZhTopicData(id: string): Promise<ChineseExamTopic> {
  const key = id as ZhTopicId;
  const done = loaded.get(key);
  if (done) return Promise.resolve(done);
  const running = pending.get(key);
  if (running) return running;
  const loader = ZH_TOPIC_LOADERS[key];
  // id 来自地址栏，可能是学生手打的：给一个能看懂的拒绝，而不是 TypeError
  if (!loader) return Promise.reject(new Error(`未知的中考专题 id：${id}`));

  const p = loader()
    .then((t) => {
      loaded.set(key, t);
      syncOrder();
      return t;
    })
    .finally(() => {
      // 失败也清掉：否则一次网络抖动会让这一专题在本会话里永远加载不了
      pending.delete(key);
    });
  pending.set(key, p);
  return p;
}

/** 加载全部七个专题 */
export function loadAllZhTopicData(): Promise<ChineseExamTopic[]> {
  return Promise.all(ZH_TOPIC_IDS.map((id) => loadZhTopicData(id)));
}

/**
 * 题目 id → 所属专题 id。
 *
 * 专题的题目 id 一律形如 `zht-<专题>-qNN`（见 `zh-topics/CONTENT-SPEC.md`），
 * 因此可以从题目 id 反推出该加载哪一块——错题重做（`?ids=`）就靠它做到
 * 「只下载错题所属的那一两个专题」。推不出来时返回 `undefined`，调用方据此退回
 * 「全加载」，宁可慢一点也不能少题。
 */
export function zhTopicIdOfQuestion(questionId: string): string | undefined {
  return ZH_TOPIC_IDS.find((id) => questionId.startsWith(`${id}-`));
}
