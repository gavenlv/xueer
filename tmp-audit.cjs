/* 临时审计：复刻 validate-entry.ts 的 checkMathFigureText，列出几何模块的待办。用完即删。 */
const fs = require('fs');

const ACRONYMS = new Set(['SSS', 'SAS', 'ASA', 'AAS', 'SSA', 'AAA', 'HL', 'Rt']);
const QUANTITY_NAMES = new Set(['S', 'V']);

function pointLetters(text, raw) {
  const out = new Set();
  if (!text) return out;
  for (const m of text.match(/\$[^$]*\$/g) || []) {
    let body = m.slice(1, -1);
    body = raw
      ? body.replace(/\\\\[a-zA-Z]+/g, ' ').replace(/\\[a-zA-Z]+/g, ' ')
      : body.replace(/\\[a-zA-Z]+/g, ' ');
    for (const run of body.match(/[A-Za-z]{1,4}/g) || []) {
      if (!/^[A-Z]+$/.test(run) || ACRONYMS.has(run)) continue;
      for (const ch of run) if (!QUANTITY_NAMES.has(ch)) out.add(ch);
    }
  }
  return out;
}

function figureLetters(figText) {
  const out = new Set();
  const take = (s) => {
    const m = /^([A-Z])/.exec(s.trim());
    if (m) out.add(m[1]);
  };
  for (const m of figText.matchAll(/label: '([^']+)'/g)) take(m[1]);
  for (const m of figText.matchAll(/\{ t: 'text',[^}]*text: '([^']+)'/g)) {
    const t = m[1].trim();
    if (/^[A-Z][′']?$/.test(t)) take(t);
  }
  if (/\{ t: 'plane',/.test(figText)) out.add('O');
  if (/\{ t: 'axis',[^}]*origin: true/.test(figText)) out.add('O');
  return out;
}

/** 取某个字段的字符串（支持跨行的引号拼接） */
function field(item, name) {
  const re = new RegExp(`\\n {8}${name}:\\s*([\\s\\S]*?)(?=\\n {8}[a-zA-Z]+:)`);
  const m = re.exec(item);
  if (!m) return '';
  return (m[1].match(/'([^']*)'/g) || []).join(' ');
}

const KEYS = ['concepts', 'steps', 'formulas', 'examples', 'questions'];
const src = fs.readFileSync('src/data/math/geometry.ts', 'utf8');
const blocks = src.split(/(?=^ {4}id: 'm-geo-)/m).slice(1);

const errs = [];
const warns = [];
const work = [];

for (const b of blocks) {
  const topic = (/^ {4}id: '([a-z0-9-]+)'/.exec(b) || [])[1];
  for (const s of b.split(/(?=^ {4}\w+: )/m).slice(1)) {
    const key = (/^ {4}(\w+): /.exec(s) || [])[1];
    if (!KEYS.includes(key)) continue;
    for (const it of s.split(/(?=^ {6}\{)/m).slice(1)) {
      const figText = (it.match(/\n {8}figure: \{[\s\S]*?\n {8}\},/) || [''])[0];
      const title = ((/(?:stem|term|name|heading): '([^']{0,26})/.exec(it) || [])[1] || '?').replace(/\n/g, ' ');
      const body =
        key === 'concepts'
          ? field(it, 'explain') + field(it, 'insight')
          : key === 'steps'
            ? field(it, 'body') + field(it, 'note')
            : key === 'formulas'
              ? field(it, 'text') + field(it, 'note')
              : key === 'examples'
                ? field(it, 'stem') + field(it, 'tip') + field(it, 'steps')
                : field(it, 'stem');
      const want = pointLetters(body, true);
      if (!want.size && !/如图|图意/.test(body)) continue;
      if (!figText) {
        warns.push(`[${topic}] ${key} ${title}`);
        work.push({ topic, key, title });
        continue;
      }
      const fid = (/id: '([^']+)'/.exec(figText) || [])[1];
      const got = figureLetters(figText);
      if (!got.size) {
        errs.push(`[${topic}] ${key} ${title} → ${fid} 一个字母都没有`);
        continue;
      }
      const missing = [...want].filter((l) => !got.has(l));
      if (missing.length) warns.push(`[${topic}] ${key} ${title} → ${fid} 没标 ${missing.join('、')}`);
    }
  }
}

console.log('=== 报错:', errs.length);
errs.forEach((e) => console.log('  ', e));
console.log('\n=== 告警:', warns.length);
warns.forEach((e) => console.log('  ', e));
const byTopic = {};
for (const w of work) byTopic[w.topic] = (byTopic[w.topic] || 0) + 1;
console.log('\n=== 缺图按知识点:', JSON.stringify(byTopic));
console.log('缺图合计:', work.length);
fs.writeFileSync('tmp-audit.json', JSON.stringify(work, null, 1));
