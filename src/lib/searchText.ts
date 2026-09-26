/**
 * 检索文本：`Entry.searchText` 的**推导**实现。
 *
 * 为什么不在装配时把它存进每条 Entry：检索文本几乎是把标题、作者、正文段落、
 * 译文、赏析、易错点等**原样再拼一遍**，于是同一段文字在包里出现两次——
 * 语文内容约 4.5 MB 源码里，光这份重复就有 1 MB 以上，全部要下载解析。
 * 而它只在「搜索」和「知识联动」时用得到，属于**派生索引**而不是内容本身。
 *
 * 因此改为按需推导：每个条目算一次、记忆一次（WeakMap，条目被回收即释放），
 * 搜索或联动真的触碰到哪个条目才算哪个。行为与原先装配时算好的完全一致
 * （同样把各部分用空格连接、统一转小写）。
 */

import type { Entry } from '../types';

const cache = new WeakMap<Entry, string>();

function join(parts: (string | string[] | undefined)[]): string {
  const buf: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (Array.isArray(p)) buf.push(p.join(''));
    else buf.push(p);
  }
  return buf.join(' ').toLowerCase();
}

/** 取一条内容的检索文本（含标题、作者、正文、要点等），结果会被记忆 */
export function searchTextOf(entry: Entry): string {
  const hit = cache.get(entry);
  if (hit !== undefined) return hit;

  let text = '';
  switch (entry.moduleId) {
    case 'poems': {
      const p = entry.data;
      text = join([p.title, p.author, p.dynasty, p.lines, p.tags, p.famousLines, p.pitfalls]);
      break;
    }
    case 'vocab': {
      const v = entry.data;
      text = join([
        v.term,
        v.pinyin,
        v.meaning,
        v.pitfall,
        v.example,
        v.confusable?.map((c) => `${c.term}${c.meaning}`),
      ]);
      break;
    }
    case 'classical': {
      const c = entry.data;
      text = join([
        c.title,
        c.author,
        c.source,
        c.paragraphs,
        c.annotations.map((a) => a.word),
        c.grammar.map((g) => `${g.type}${g.items.map((i) => i.word).join('')}`),
      ]);
      break;
    }
    case 'reading': {
      const r = entry.data;
      text = join([r.title, r.genre, r.author, r.paragraphs]);
      break;
    }
    case 'writing': {
      const w = entry.data;
      text = join([w.title, w.summary, w.category, w.content]);
      break;
    }
    case 'literature': {
      const l = entry.data;
      text = join([
        l.title,
        l.category,
        l.book?.name,
        l.book?.author,
        l.keyPoints,
        l.content,
        l.book?.chapters?.map((c) => `${c.name}${c.summary}`),
        l.book?.plotChain,
      ]);
      break;
    }
    /**
     * 历史：检索文本要把「备考要用的东西」全放进来——
     * 时间轴、分层考点、必背结论、易错、对比表、材料与设问都进索引，
     * 学生才能按「推恩令」「经济重心南移」「罗斯福新政」这类关键词直接搜到对应的单元。
     */
    case 'hist-7a':
    case 'hist-7b':
    case 'hist-8a':
    case 'hist-8b':
    case 'hist-9a':
    case 'hist-9b':
    case 'hist-topics': {
      const h = entry.data;
      text = join([
        h.title,
        h.period,
        h.unit,
        h.mainline,
        h.timeline.map((p) => `${p.time}${p.event}${p.note ?? ''}`),
        h.points.map((p) => `${p.level}${p.text}${p.explain ?? ''}`),
        h.conclusions,
        h.confusions?.map((c) => `${c.wrong}${c.right}${c.why}`),
        h.compares?.map((c) => `${c.title}${c.aspect}${c.rows.map((r) => `${r.item}${r.left}${r.right}`).join('')}`),
        h.examAngles?.map((a) => `${a.angle}${a.detail}`),
        h.materials?.map((m) => `${m.material}${m.questions.map((q) => q.stem).join('')}`),
      ]);
      break;
    }
    case 'hist-exam': {
      const p = entry.data;
      text = join([
        p.title,
        p.basis,
        p.questions.map((q) => `${q.stem}${(q.options ?? []).join('')}`),
        p.materials.map((m) => `${m.material}${m.questions.map((q) => q.stem).join('')}`),
      ]);
      break;
    }
    /**
     * 英语：把「学生可能拿来搜的东西」全放进索引——中英标题、词根词缀与例词、
     * 近义词两边、搭配短语、语法规则与例句、语篇正文、听说脚本、范文与句型。
     * 学生往往只记得一个英文单词或一句句型，得能直接搜到对应知识点。
     */
    case 'eng-vocab':
    case 'eng-grammar':
    case 'eng-reading':
    case 'eng-listening':
    case 'eng-writing':
    case 'eng-topics': {
      const e = entry.data;
      text = join([
        e.title,
        e.enTitle,
        e.unit,
        e.summary,
        e.points.map((p) => `${p.text}${p.explain ?? ''}`),
        // 分类词表：上千个词全进检索（学生只记得一个词或一句中文释义也要能搜到）
        e.wordList?.map((g) => `${g.group}${g.words.map((w) => `${w.word}${w.pos ?? ''}${w.cn}${w.note ?? ''}`).join('')}`),
        e.affixes?.map((a) => `${a.affix}${a.meaning}${a.examples.map((x) => `${x.word}${x.cn}`).join('')}`),
        e.confusables?.map((c) => `${c.a}${c.b}${c.diff}${c.exampleA ?? ''}${c.exampleB ?? ''}`),
        e.collocations?.map((c) => `${c.phrase}${c.cn}`),
        e.rules?.map((r) => `${r.rule}${r.form ?? ''}${r.example}${r.cn ?? ''}`),
        e.mistakes?.map((m) => `${m.wrong}${m.right}${m.why}`),
        e.passages?.map((p) => `${p.title}${p.text}${p.cn ?? ''}`),
        e.scripts?.map((s) => `${s.title}${s.text}${s.cn ?? ''}`),
        e.writing ? [e.writing.topic, ...e.writing.requirements, ...(e.writing.usefulExpressions ?? [])] : undefined,
        e.writing?.samples?.map((s) => `${s.level}${s.text}${s.comment}`),
        e.examTips,
      ]);
      break;
    }
    case 'eng-exam': {
      const p = entry.data;
      text = join([
        p.title,
        p.basis,
        p.questions.map((q) => `${q.stem}${(q.options ?? []).join('')}`),
        p.writing ? `${p.writing.topic}${p.writing.requirements.join('')}` : undefined,
        p.listening?.map((s) => `${s.title}${s.text}`),
      ]);
      break;
    }
    default: {
      // 数学：${...}$ 公式源码也进检索文本，学生可以按符号找知识点
      const m = entry.data as {
        title: string;
        chapter: string;
        summary: string;
        concepts: { term: string; explain: string }[];
        formulas?: { name: string; text?: string; tex?: string }[];
        pitfalls?: string[];
        methods?: string[];
      };
      text = join([
        m.title,
        m.chapter,
        m.summary,
        m.concepts.map((c) => `${c.term}${c.explain}`),
        m.formulas?.map((f) => `${f.name}${f.text ?? ''}${f.tex ?? ''}`),
        m.pitfalls,
        m.methods,
      ]);
      break;
    }
  }

  cache.set(entry, text);
  return text;
}

/** 这条内容是否命中关键词（关键词应已 trim 并转小写） */
export function matchesKeyword(entry: Entry, kw: string): boolean {
  if (!kw) return true;
  return searchTextOf(entry).includes(kw) || entry.title.toLowerCase().includes(kw);
}
