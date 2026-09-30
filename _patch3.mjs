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
const S = "id: 'm-geo-quandeng',";
const E = "id: 'm-geo-zhouduichen',";
const items = [];