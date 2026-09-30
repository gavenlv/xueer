/* 临时：把待补图条目的完整源码按知识点打印出来（只读不写）。用完即删。
   用法：node tmp-dump.cjs [topic1 topic2 ...] 或 node tmp-dump.cjs --list */
const fs = require('fs');

const src = fs.readFileSync('src/data/math/geometry.ts', 'utf8');
const lines = src.split(/\r?\n/);

const ACRONYMS = new Set(['SSS', 'SAS', 'ASA', 'AAS', 'SSA', 'AAA', 'HL', 'Rt']);
const QUANTITY_NAMES = new Set(['S', 'V']);

function pointLetters(text) {
  const out = new Set();
  if (!text) return out;
  for (const m of text.match(/\$[^$]*\$/g) || []) {
    const body = m.slice(1, -1).replace(/\\\\[a-zA-Z]+/g, ' ').replace(/\\[a-zA-Z]+/g, ' ');
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
  // 由 geoFig 的 tag()/tags() 生成的字母（图元函数调用形式）
  for (const m of figText.matchAll(/tag\('([A-Z])'/g)) out.add(m[1]);
  for (const m of figText.matchAll(/tags\(\{([\s\S]*?)\}\)/g)) {
    for (const k of m[1].matchAll(/(?:^|[\s{,])([A-Z]):/g)) out.add(k[1]);
  }
  return out;
}

function field(item, name) {
  // 终止条件要允许「本字段是条目的最后一个字段」（后面紧跟 6 空格的 `},`）
  const re = new RegExp(`\\n {8}${name}:\\s*([\\s\\S]*?)(?=\\n {8}[a-zA-Z]+:|\\n {6}\\},)`);
  const m = re.exec(item);
  if (!m) return '';
  return (m[1].match(/'([^']*)'/g) || []).join(' ');
}

/** 逐行扫描，切出每个知识点、每个板块、每个条目 */
const topics = [];
let topic = null;
let sec = null;
let item = null;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  const tm = /^ {4}id: '([a-z0-9-]+)',/.exec(l);
  if (tm) {
    topic = { id: tm[1], secs: {} };
    topics.push(topic);
    sec = null;
    item = null;
    continue;
  }
  if (!topic) continue;
  const sm = /^ {4}(concepts|steps|formulas|examples|questions): \[/.exec(l);
  if (sm) {
    sec = sm[1];
    topic.secs[sec] = [];
    item = null;
    continue;
  }
  if (/^ {4}\w+: /.test(l) && !sm) {
    sec = null;
    item = null;
  }
  if (!sec) continue;
  if (/^ {6}\{$/.test(l)) {
    item = { line: i + 1, lines: [l] };
    topic.secs[sec].push(item);
    continue;
  }
  if (item) item.lines.push(l);
}

const KEYS = ['concepts', 'steps', 'formulas', 'examples', 'questions'];
const out = {};
for (const t of topics) {
  for (const k of KEYS) {
    for (const it of t.secs[k] || []) {
      const text = it.lines.join('\n');
      const figText = (text.match(/\n {8}figure: [\s\S]*?\n {8}\}(?:,|\))/) || [''])[0];
      // 与 validate-entry.ts 的 checkMathFigureText 取同一批字段
      const body =
        k === 'concepts'
          ? field(text, 'explain') + field(text, 'insight')
          : k === 'steps'
            ? field(text, 'body') + field(text, 'note')
            : k === 'formulas'
              ? field(text, 'text') + field(text, 'note')
              : k === 'examples'
                ? field(text, 'stem') + field(text, 'steps') + field(text, 'tip')
                : field(text, 'stem');
      const want = pointLetters(body);
      if (!want.size && !/如图|图意/.test(body)) continue;
      const title = ((/(?:stem|term|name|heading): '([^']{0,40})/.exec(text) || [])[1] || '?').replace(/\n/g, ' ');
      if (!figText) {
        (out[t.id] = out[t.id] || []).push({ kind: '缺图', key: k, line: it.line, title, want: [...want], text });
      } else {
        const got = figureLetters(figText);
        const missing = [...want].filter((x) => !got.has(x));
        if (!got.size) (out[t.id] = out[t.id] || []).push({ kind: '无字母', key: k, line: it.line, title, want: [...want], text });
        else if (missing.length)
          (out[t.id] = out[t.id] || []).push({ kind: '漏标' + missing.join(''), key: k, line: it.line, title, want: [...want], text });
      }
    }
  }
}

const args = process.argv.slice(2);
if (args[0] === '--list') {
  for (const t of Object.keys(out)) console.log(t, out[t].length, out[t].map((x) => `${x.key}:${x.line}(${x.kind})`).join(' '));
  const tot = Object.values(out).reduce((n, x) => n + x.length, 0);
  console.log('合计', tot);
} else {
  for (const t of args.length ? args : Object.keys(out)) {
    if (!out[t]) continue;
    for (const x of out[t]) {
      console.log(`\n===== [${t}] ${x.key} ${x.kind} line ${x.line} 需要的字母: ${x.want.join(',')} =====`);
      console.log(x.text);
    }
  }
}
