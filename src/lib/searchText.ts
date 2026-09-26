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
