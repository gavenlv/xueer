const ACRONYMS = new Set(['SSS', 'SAS', 'ASA', 'AAS', 'SSA', 'AAA', 'HL', 'Rt']);
function pointLetters(text, raw) {
  const out = new Set();
  for (const m of text.match(/\$[^$]*\$/g) || []) {
    let body = m.slice(1, -1);
    body = raw ? body.replace(/\\\\[a-zA-Z]+/g, ' ').replace(/\\[a-zA-Z]+/g, ' ') : body.replace(/\\[a-zA-Z]+/g, ' ');
    for (const run of body.match(/[A-Z]{1,4}/g) || []) {
      if (ACRONYMS.has(run)) continue;
      for (const ch of run) out.add(ch);
    }
  }
  return out;
}
const raw = `'在 $\\\\mathrm{Rt}\\\\triangle ABC$ 中，$\\\\angle C=90^\\\\circ$，设 $\\\\angle A$ 的对边为 $a$、邻边为 $b$、斜边为 $c$。'`;
const rt = `'在 $\\mathrm{Rt}\\triangle ABC$ 中，$\\angle C=90^\\circ$，设 $\\angle A$ 的对边为 $a$、邻边为 $b$、斜边为 $c$。'`;
console.log('raw :', [...pointLetters(raw, true)]);
console.log('rt  :', [...pointLetters(rt, false)]);
