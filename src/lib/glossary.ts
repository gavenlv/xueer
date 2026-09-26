/**
 * 「要翻译的词」表：把一篇古诗文里需要解释的字词整理成 `词 → 释义`，
 * 供正文渲染时加 tooltip（鼠标悬停 / 手机点按即显示）。
 *
 * 数据来源：
 * - **文言文**：`annotations` 本来就是结构化的「词 → 释义」，另把语法归类
 *   （通假字、古今异义、词类活用、一词多义、特殊句式）里的词条也纳入，
 *   同一词以注释里的解释优先（更贴原句）。
 * - **古诗词**：`lineNotes` 是「整句译文 + 字词解释」的写法，字词解释都用
 *   `词：释义` 的形式缀在后面（如「临：登上；碣石：山名，在今河北昌黎西北。」），
 *   也夹着少量「「式」是语气助词」这样的叙述式。这里把两种都抽出来。
 *
 * 只在词确实出现在正文里时才用得上（渲染时会做最长匹配），
 * 因此这里多抽一些没有副作用。
 */

import type { Entry } from '../types';

export interface GlossaryWord {
  word: string;
  explain: string;
}

/** 释义里不该出现的字符（说明左边不是词条而是半句话） */
const BAD_WORD = /[，。；：？！、（）「」“”《》\s]/;

/** 从一段文字里抽出「词：释义」型条目 */
function fromColonStyle(text: string, out: Map<string, string>): void {
  // 先按句末与分号切开，再逐段匹配「词：释义」
  for (const seg of text.split(/[。；\n]/)) {
    const m = /^([^：:]{1,8})[：:](.+)$/.exec(seg.trim());
    if (!m) continue;
    const word = m[1].trim();
    const explain = m[2].trim();
    if (!word || word.length > 6 || BAD_WORD.test(word)) continue;
    if (explain.length < 2) continue;
    if (!out.has(word)) out.set(word, explain);
  }
}

/** 在**引号之外**的第一个逗号处截断（引号里的逗号是释义本身，不能切） */
function cutOutsideQuotes(s: string): string {
  let depth = 0;
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (c === '「' || c === '“' || c === '《') depth += 1;
    else if (c === '」' || c === '”' || c === '》') depth = Math.max(0, depth - 1);
    else if ((c === '，' || c === ',') && depth === 0) return s.slice(0, i);
  }
  return s;
}

/**
 * 抽取「「式」是语气助词」「「微」指昏暗」这类叙述式解释。
 *
 * 关键点：释义要**在第一个（引号之外的）逗号处截断**。lineNotes 里常有
 * 「「式」是语气助词，「微」指昏暗」这样把两个词并在一句的写法，
 * 若不截断，「式」的提示会连带说出「微」的解释，看着就是错的。
 * 后半句里的「微」由它自己的匹配负责；而「是「非，不是」」里那个逗号在引号内，
 * 属于释义本身，必须保留。
 */
function fromNarrativeStyle(text: string, out: Map<string, string>): void {
  const re =
    /[「“]([^」”]{1,6})[」”]\s*(是|指|意为|意思是|即|同|通|表示|读作|这里指|这里表示)([^。；\n]{1,50})/g;
  for (const m of text.matchAll(re)) {
    const word = m[1].trim();
    const explain = cutOutsideQuotes(`${m[2]}${m[3]}`).trim();
    if (!word || BAD_WORD.test(word) || explain.length < 2) continue;
    if (!out.has(word)) out.set(word, explain);
  }
}

/**
 * 抽取「易错字词」型条目。
 *
 * 部分篇目（如八上、九上九下那一批）的 `lineNotes` 只写了整句白话译文，没有逐词释义，
 * 直接解析就一个词也标不出来；但它们的 `pitfalls`（默写易错点）里会用「」把常考字词圈出来，
 * 例如「「徙倚」的「徙」读 xǐ，不写作「徒」」。
 *
 * 这类提示标成【易错】，与逐词释义区分开：它讲的是字形与读音而不是意思。
 * 有逐词释义的篇目不受影响——`lineNotes` 先解析，同词不会被这里覆盖。
 */
function fromPitfalls(list: readonly string[] | undefined, out: Map<string, string>): void {
  for (const raw of list ?? []) {
    const text = raw.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    for (const m of text.matchAll(/[「“]([^」”]{1,4})[」”]/g)) {
      const word = m[1].trim();
      if (!word || BAD_WORD.test(word) || out.has(word)) continue;
      out.set(word, `【易错】${text}`);
    }
  }
}

/** 这首诗/这篇文里所有需要解释的字词 */
export function glossaryOf(entry: Entry): GlossaryWord[] {
  const map = new Map<string, string>();

  if (entry.moduleId === 'classical') {
    const c = entry.data;
    // 语法归类里的词条先放进去（如「名」名词作动词），随后注释覆盖同词条目
    for (const g of c.grammar) {
      for (const it of g.items) {
        const word = it.word.split('／')[0].split('/')[0].trim();
        if (word && word.length <= 6 && !BAD_WORD.test(word) && !map.has(word)) {
          map.set(word, `【${g.type}】${it.explain}`);
        }
      }
    }
    for (const a of c.annotations) {
      const word = a.word.trim();
      if (word && word.length <= 6 && !BAD_WORD.test(word)) map.set(word, a.explain);
    }
  } else if (entry.moduleId === 'poems') {
    const p = entry.data;
    for (const note of p.lineNotes ?? []) {
      fromColonStyle(note, map);
      fromNarrativeStyle(note, map);
    }
    // 标题里的词（如「闻王昌龄左迁龙标遥有此寄」的「左迁」）有时只在赏析里解释
    fromNarrativeStyle(p.appreciation ?? '', map);
    // 只有整句译文的篇目：退而求其次，用默写易错点里的「」词条兜底
    fromPitfalls(p.pitfalls, map);
  }

  // 单字词太容易误伤（如「之」「而」），但文言文里它们恰恰是要考的；
  // 这里保留单字，由渲染侧的最长匹配保证不会把「明月」拆成「明」+「月」。
  return [...map].map(([word, explain]) => ({ word, explain })).sort((a, b) => b.word.length - a.word.length);
}

/** 词表里最长的一个词的字符数（用于渲染时的匹配上限） */
export function maxWordLength(words: GlossaryWord[]): number {
  return words.reduce((n, w) => Math.max(n, w.word.length), 0);
}

export interface TextPiece {
  text: string;
  /** 有释义的词 */
  explain?: string;
}

/**
 * 把一段正文切成「普通文字」与「带释义词」交替的片段。
 *
 * 采用**最长优先且不重叠**的匹配：先把词表按长度降序排好，从头扫描，
 * 命中就用掉该词的长度，避免「明月」被拆成「明」与「月」两个提示。
 */
export function splitText(text: string, words: GlossaryWord[]): TextPiece[] {
  if (!words.length) return [{ text }];
  const byLen = [...words].sort((a, b) => b.word.length - a.word.length);
  const maxLen = maxWordLength(byLen);
  const explainOf = new Map(byLen.map((w) => [w.word, w.explain]));

  const out: TextPiece[] = [];
  let buf = '';
  let i = 0;
  while (i < text.length) {
    let hit = '';
    for (let len = Math.min(maxLen, text.length - i); len >= 1; len -= 1) {
      const cand = text.slice(i, i + len);
      if (explainOf.has(cand)) {
        hit = cand;
        break;
      }
    }
    if (hit) {
      if (buf) {
        out.push({ text: buf });
        buf = '';
      }
      out.push({ text: hit, explain: explainOf.get(hit) });
      i += hit.length;
    } else {
      buf += text[i];
      i += 1;
    }
  }
  if (buf) out.push({ text: buf });
  return out;
}
