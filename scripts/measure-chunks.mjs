/**
 * 量一量「改造前 / 改造后」的 chunk 体积（原始字节 + 真实 gzip）。
 *
 * 为什么自己算 gzip：Vite 打印的那两列数字与实际文件字节数对不上（同一份文件
 * 490 kB 却写着 gzip 455 kB），拿它做前后对比不牢靠。这里用 Node 的 zlib
 * 对磁盘上的文件现算一遍，两边口径一致。
 *
 * 运行：node scripts/measure-chunks.mjs <目录> [目录…]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const dirs = process.argv.slice(2);
const rows = [];

for (const dir of dirs) {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const bytes = statSync(join(dir, f)).size;
    const gz = gzipSync(readFileSync(join(dir, f))).length;
    /** 去掉内容哈希，方便前后对比同一个逻辑块 */
    const name = f.replace(/-[\w-]{8}\.js$/, '');
    rows.push({ dir, name, file: f, kb: bytes / 1024, gzKb: gz / 1024 });
  }
}

for (const dir of dirs) {
  const list = rows.filter((r) => r.dir === dir).sort((a, b) => b.gzKb - a.gzKb);
  console.log(`\n===== ${dir}（${list.length} 个 js chunk，按 gzip 降序）=====`);
  for (const r of list) {
    console.log(`  ${r.name.padEnd(26)} ${r.kb.toFixed(2).padStart(9)} kB │ gzip ${r.gzKb.toFixed(2).padStart(8)} kB`);
  }
  console.log(
    `  合计 ${list.reduce((n, r) => n + r.kb, 0).toFixed(1)} kB │ gzip ${list
      .reduce((n, r) => n + r.gzKb, 0)
      .toFixed(1)} kB`,
  );
}

/* 前后对比：同名逻辑块（去哈希）逐个体积变化 */
if (dirs.length === 2) {
  const [before, after] = dirs;
  const key = (r) => r.name;
  const b = new Map(rows.filter((r) => r.dir === before).map((r) => [key(r), r]));
  const a = new Map(rows.filter((r) => r.dir === after).map((r) => [key(r), r]));
  const names = [...new Set([...b.keys(), ...a.keys()])].sort();
  console.log(`\n===== 前后对比（gzip kB）=====`);
  for (const n of names) {
    const x = b.get(n);
    const y = a.get(n);
    if (!x && !y) continue;
    const delta = (y?.gzKb ?? 0) - (x?.gzKb ?? 0);
    const mark = !x ? '＋新增' : !y ? '－移除' : delta > 1 ? '↑' : delta < -1 ? '↓' : '＝';
    console.log(
      `  ${mark.padEnd(4)} ${n.padEnd(26)} ${(x ? x.gzKb.toFixed(2) : '—').padStart(9)} → ${(
        y ? y.gzKb.toFixed(2) : '—'
      ).padStart(9)} kB`,
    );
  }
}
