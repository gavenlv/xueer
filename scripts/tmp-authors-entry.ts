/* 临时：统计古诗文作者，以及哪些作者在「文学常识」模块里有条目 */
import { allEntries } from '../src/data';
import { supplementsOf } from '../src/lib/relations';

const authors = new Map<string, { n: number; ids: string[]; dynasty: string }>();
for (const e of allEntries) {
  if (e.moduleId !== 'poems' && e.moduleId !== 'classical') continue;
  const a = (e.data as { author?: string }).author ?? '';
  if (!a || a === '佚名' || a.startsWith('《')) continue;
  const cur = authors.get(a) ?? { n: 0, ids: [], dynasty: (e.data as { dynasty?: string }).dynasty ?? '' };
  cur.n += 1;
  cur.ids.push(e.id);
  authors.set(a, cur);
}

const litText = allEntries
  .filter((e) => e.moduleId === 'literature')
  .map((e) => {
    const l = e.data;
    return [l.title, l.category, l.book?.name, l.book?.author, l.book?.theme, ...(l.keyPoints ?? [])]
      .filter(Boolean)
      .join(' ');
  })
  .join('\n');

const missing: string[] = [];
const covered: string[] = [];
for (const [a, info] of [...authors].sort((x, y) => y[1].n - x[1].n)) {
  (litText.includes(a) ? covered : missing).push(`${a}(${info.dynasty}·${info.n}篇)`);
}
console.log(`作者总数 ${authors.size}`);
console.log(`\n文学常识已提及（${covered.length}）：\n  ${covered.join('  ')}`);
console.log(`\n文学常识未提及（${missing.length}）：\n  ${missing.join('  ')}`);

/* 学一补多分组命中率 */
let withLit = 0;
let noGroup = 0;
for (const e of allEntries) {
  const gs = supplementsOf(e, allEntries);
  if (gs.some((g) => g.kind === '相关文学常识')) withLit++;
  if (!gs.length) noGroup++;
}
console.log(`\n有条目总数 ${allEntries.length}；命中「相关文学常识」${withLit}；完全没有补充的 ${noGroup}`);
