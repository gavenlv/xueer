/**
 * 生成「轻量清单」`src/data/summary.ts`。
 *
 * ## 为什么需要它
 *
 * 内容数据是按模块按需加载的（见 `src/data/chinese/index.ts`），但**首页与学科页**
 * 这两张「总览页」需要的是跨模块的汇总信息：每个模块有多少条、多少题，
 * 我学了多少，以及「每日一句」要用的名句。如果为了这点汇总信息把全部内容都下载下来，
 * 按需加载就白做了。
 *
 * 所以把这份**汇总信息单独生成一个文件**：它只含 id / 标题 / 模块 / 学段 / 题量这类
 * 骨架字段（约 20 kB gzip），首屏只加载它。
 *
 * ## 一致性
 *
 * 这是**派生数据**，内容一改就可能过期。`pnpm validate` 会逐项比对清单与真实数据
 * （条数、题量、条目 id 集合），一旦不一致直接报错，并在提示里写明跑 `pnpm gen` 重新生成。
 *
 * 运行：`pnpm gen`
 */

declare const process: { exitCode: number };

import { writeFileSync } from 'node:fs';
import {
  allEntries,
  mindMaps,
  extensions,
  poemExamPoints,
  moduleIdsOfSubject,
  ensureAll,
} from '../src/data';
import { allPoems, CONTENT_STATS } from '../src/data/chinese';
import { imageryOfLines, relOfEntryFull } from '../src/lib/relNode';
import { litMatchIndex } from '../src/lib/relations';
import { SUBJECTS } from '../src/data/subjects';
import type { ModuleId } from '../src/types';

const q = (s: string) => JSON.stringify(s);

async function main(): Promise<void> {
  await ensureAll();

  /**
   * 关联索引用的「作者」：古诗词与文言文的 author（以书名作作者的去掉书名号）。
   * 有了它，「学一补多」的**同作者**分组不必加载其它模块就能跨模块成组。
   */
  const authorsOf = (e: (typeof allEntries)[number]): string[] => {
    if (e.moduleId !== 'poems' && e.moduleId !== 'classical') return [];
    const raw = (e.data as { author?: string }).author ?? '';
    const a = raw.replace(/[《》]/g, '').trim();
    return a.length >= 2 && !['佚名', '无名氏', '不详'].includes(a) ? [raw] : [];
  };

  /**
   * 文学常识的**命中表**：哪些条目命中了哪条文学常识、命中多强。
   *
   * 「相关文学常识」这一组必须靠**全库的作者名与篇名表**才能算准
   * （「咏雪」这样的篇名不带书名号，「李煜」这样的作者名也可能只在要点里出现一次），
   * 浏览器端只加载一个模块，算不全；因此这里拿全量数据一次算好存进清单。
   * 打分规则仍然是 `lib/relations.ts` 的 `litScoreFor`（生成与校验共用同一份规则）。
   */
  const fullPool = allEntries.map((e) => relOfEntryFull(e));
  const matchFromOf = (e: (typeof allEntries)[number]) => {
    if (e.moduleId !== 'literature') return [];
    const lit = fullPool.find((x) => x.id === e.id);
    return lit ? litMatchIndex(lit, fullPool) : [];
  };

  /** 古诗词的意象名（`lib/relNode.ts` 的表）：存名字不存诗句，121 首只要两 KB */
  const imageryOf = (e: (typeof allEntries)[number]): string[] =>
    e.moduleId === 'poems' ? imageryOfLines((e.data as { lines?: string[] }).lines ?? []) : [];

  /** 词语模块的词条名（「本篇涉及的字词」分组要在未加载词语模块时也能匹配） */
  const termOf = (e: (typeof allEntries)[number]): string =>
    e.moduleId === 'vocab' ? ((e.data as { term?: string }).term ?? '') : '';


  const entryMeta = allEntries.map((e) => ({
    id: e.id,
    moduleId: e.moduleId,
    title: e.title,
    subtitle: e.subtitle,
    grade: e.grade,
    questions: e.questions.length,
    /** 主题标签（关联「同类作品」用） */
    tags: e.tags,
    /** 作者（古诗词/文言文才有） */
    authors: authorsOf(e),
    /** 文学常识的命中表（哪些条目命中了它；只有文学常识条目非空） */
    matchFrom: matchFromOf(e),
    /** 意象名（只有古诗词非空） */
    imagery: imageryOf(e),
    /** 词条名（只有词语模块非空） */
    term: termOf(e),
    /** 该条目题目上的知识点标签（关联「同一考点」用） */
    qTags: [...new Set(e.questions.flatMap((q2) => q2.tags ?? []))],
  }));

  const moduleTotals = SUBJECTS.flatMap((s) =>
    s.modules.map((m) => {
      const list = allEntries.filter((e) => e.moduleId === m.id);
      return {
        id: m.id as ModuleId,
        entries: list.length,
        questions: list.reduce((n, e) => n + e.questions.length, 0),
        mindMaps: mindMaps.filter((x) => x.moduleId === m.id).length,
        extensions: extensions.filter((x) => x.moduleId === m.id).length,
      };
    }),
  );

  /** 每日一句：取所有篇目的千古名句，首页按日期轮换，不必加载整本诗词 */
  const dailyLines = allPoems.flatMap((p) =>
    (p.famousLines ?? []).map((text) => ({
      text,
      from: `${p.dynasty}·${p.author}《${p.title}》`,
      entryId: p.id,
    })),
  );

  const lines: string[] = [];
  lines.push('/**');
  lines.push(' * 轻量清单：只含首页与学科页需要的**骨架信息**（不含任何正文）。');
  lines.push(' *');
  lines.push(' * ⚠️ 本文件由 `pnpm gen` 自动生成，**不要手改**。');
  lines.push(' * 内容改动后请重新运行 `pnpm gen`；`pnpm validate` 会校验它与真实数据是否一致，');
  lines.push(' * 不一致会直接报错，因此不存在「清单悄悄过期、页面数字全是错的」这种情况。');
  lines.push(' */');
  lines.push('');
  lines.push("import type { GradeOrAll, ModuleId } from '../types';");
  lines.push('');
  lines.push('export interface EntryMeta {');
  lines.push('  id: string;');
  lines.push('  moduleId: ModuleId;');
  lines.push('  title: string;');
  lines.push('  subtitle: string;');
  lines.push('  grade: GradeOrAll;');
  lines.push('  /** 该条目的题目数（不含古诗词现场生成的默写题） */');
  lines.push('  questions: number;');
  lines.push('  /** 条目标签（「学一补多」的同类作品分组会用到） */');
  lines.push('  tags: string[];');
  lines.push('  /** 作者（仅古诗词/文言文非空；用于跨模块的「同作者」分组） */');
  lines.push('  authors: string[];');
  lines.push('  /** 文学常识的命中表：哪些条目命中了它、命中多强（仅文学常识条目非空） */');
  lines.push('  matchFrom: { id: string; score: number }[];');
  lines.push('  /** 意象名（仅古诗词非空；用于「同类作品」的同意象比较） */');
  lines.push('  imagery: string[];');
  lines.push('  /** 词条名（仅词语模块非空；用于「本篇涉及的字词」分组） */');
  lines.push('  term: string;');
  lines.push('  /** 该条目题目上的知识点标签（用于跨模块的「同一考点」分组） */');
  lines.push('  qTags: string[];');
  lines.push('}');
  lines.push('');
  lines.push('/**');
  lines.push(' * 解析紧凑写的命中表（`"id:score"` 空格分隔，见 `scripts/gen-summary.ts`）。');
  lines.push(' * 只有文学常识条目的命中表非空，其余传空串直接返回空数组。');
  lines.push(' */');
  lines.push('export function parseMatchFrom(raw: string): { id: string; score: number }[] {');
  lines.push('  if (!raw) return [];');
  lines.push('  return raw.split(\' \').map((s) => {');
  lines.push('    const i = s.lastIndexOf(\':\');');
  lines.push('    return { id: s.slice(0, i), score: Number(s.slice(i + 1)) };');
  lines.push('  });');
  lines.push('}');
  lines.push('');
  lines.push('export interface ModuleTotals {');
  lines.push('  id: ModuleId;');
  lines.push('  entries: number;');
  lines.push('  questions: number;');
  lines.push('  mindMaps: number;');
  lines.push('  extensions: number;');
  lines.push('}');
  lines.push('');
  lines.push('/** 每条内容的骨架信息（全部条目，含数学） */');
  lines.push('export const ENTRY_META: EntryMeta[] = [');
  for (const e of entryMeta) {
    /**
     * 命中表用紧凑写法 `"id:score"`：它有条目 id 那么长，写成对象会把清单撑大一倍。
     * 解析在 `lib/relNode.ts` 的 `parseMatchFrom` 里，只有文学常识条目非空。
     */
    const mf = e.matchFrom.map((x) => `${x.id}:${x.score}`).join(' ');
    lines.push(
      `  { id: ${q(e.id)}, moduleId: ${q(e.moduleId)}, title: ${q(e.title)}, subtitle: ${q(
        e.subtitle,
      )}, grade: ${q(e.grade)}, questions: ${e.questions}, tags: ${JSON.stringify(e.tags)}, authors: ${JSON.stringify(
        e.authors,
      )}, matchFrom: parseMatchFrom(${q(mf)}), imagery: ${JSON.stringify(e.imagery)}, term: ${q(
        e.term,
      )}, qTags: ${JSON.stringify(e.qTags)} },`,
    );
  }
  lines.push('];');
  lines.push('');
  lines.push('/** 每个模块的条目数、题量、导图数与拓展数 */');
  lines.push('export const MODULE_TOTALS: ModuleTotals[] = [');
  for (const m of moduleTotals) {
    lines.push(
      `  { id: ${q(m.id)}, entries: ${m.entries}, questions: ${m.questions}, mindMaps: ${m.mindMaps}, extensions: ${m.extensions} },`,
    );
  }
  lines.push('];');
  lines.push('');
  lines.push('/** 每日一句用的名句池（首页按日期轮换） */');
  lines.push(
    'export const DAILY_LINES: { text: string; from: string; entryId: string }[] = [',
  );
  for (const d of dailyLines) {
    lines.push(`  { text: ${q(d.text)}, from: ${q(d.from)}, entryId: ${q(d.entryId)} },`);
  }
  lines.push('];');
  lines.push('');
  lines.push('/** 语文各模块的原始条目数（校验用） */');
  lines.push('export const CHINESE_COUNTS = {');
  lines.push(`  poems: ${CONTENT_STATS.poems},`);
  lines.push(`  vocab: ${CONTENT_STATS.vocab},`);
  lines.push(`  classical: ${CONTENT_STATS.classical},`);
  lines.push(`  reading: ${CONTENT_STATS.reading},`);
  lines.push(`  writing: ${CONTENT_STATS.writing},`);
  lines.push(`  literature: ${CONTENT_STATS.literature},`);
  lines.push('};');
  lines.push('');
  lines.push(`/** 语文模块 id（与 data/chinese 的 MODULE_IDS 对应） */`);
  lines.push(
    `export const CHINESE_MODULE_IDS: ModuleId[] = ${JSON.stringify(
      moduleIdsOfSubject('chinese').filter((m) => allEntries.some((e) => e.moduleId === m)),
    )};`,
  );
  lines.push('');

  writeFileSync('src/data/summary.ts', lines.join('\n'), 'utf8');

  console.log('\n================ 轻量清单已生成 ================');
  console.log(`  条目骨架      ${entryMeta.length} 条`);
  console.log(`  模块汇总      ${moduleTotals.length} 个模块`);
  console.log(`  每日一句池     ${dailyLines.length} 句`);
  console.log(`  文件          src/data/summary.ts`);
  console.log(`  考点（校验用）${poemExamPoints().length} 个古诗词聚类考点`);
  console.log('');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
