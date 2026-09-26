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
import { SUBJECTS } from '../src/data/subjects';
import type { ModuleId } from '../src/types';

const q = (s: string) => JSON.stringify(s);

async function main(): Promise<void> {
  await ensureAll();

  const entryMeta = allEntries.map((e) => ({
    id: e.id,
    moduleId: e.moduleId,
    title: e.title,
    subtitle: e.subtitle,
    grade: e.grade,
    questions: e.questions.length,
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
    lines.push(
      `  { id: ${q(e.id)}, moduleId: ${q(e.moduleId)}, title: ${q(e.title)}, subtitle: ${q(
        e.subtitle,
      )}, grade: ${q(e.grade)}, questions: ${e.questions} },`,
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
