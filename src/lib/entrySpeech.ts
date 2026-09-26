/**
 * 把一条内容拆成「可朗读的段落」。
 *
 * 朗读控制条（`components/SpeechBar.tsx`）接在详情页外壳上，因此六个模块的详情页
 * 都能「整页朗读」，而不必各自写一遍。拆段的原则与「学生拿到纸质材料会怎么读」一致：
 *
 *   1. **正文先读**（古诗逐句、文言文逐段、现代文逐段），段落标签写明是原文第几段；
 *   2. 再读**译文、主旨、赏析**这类讲解；
 *   3. 词条/作文/文学常识类内容没有「原文」，就读它的释义、要点与正文段落。
 *
 * 纯符号或公式（数学）不送进语音引擎——朗读 `$x^2$` 只会念出一串乱码。
 * 每段长度交给 `lib/speech.ts` 的 `chunkText` 去切，这里不做长度处理。
 */

import type { Entry } from '../types';
import type { SpeechSegment } from './speech';

/** 段落文本是否值得朗读（有汉字才算） */
function readable(text: string | undefined): text is string {
  return Boolean(text && /[\u4e00-\u9fa5]/.test(text) && !text.includes('$'));
}

function push(
  out: SpeechSegment[],
  id: string,
  text: string | undefined,
  label: string,
): void {
  if (readable(text)) out.push({ id, text: text.trim(), label });
}

/** 多条同构段落：逐段编号 */
function pushList(
  out: SpeechSegment[],
  prefix: string,
  labelOf: (i: number) => string,
  list: readonly string[] | undefined,
): void {
  (list ?? []).forEach((text, i) => push(out, `${prefix}-${i}`, text, labelOf(i)));
}

export function speechSegmentsOf(entry: Entry): SpeechSegment[] {
  const out: SpeechSegment[] = [];

  switch (entry.moduleId) {
    case 'poems': {
      const p = entry.data;
      pushList(out, 'line', (i) => `原文·第 ${i + 1} 句`, p.lines);
      push(out, 'translation', p.translation, '白话译文');
      push(out, 'appreciation', p.appreciation, '赏析与考点');
      break;
    }

    case 'classical': {
      const c = entry.data;
      pushList(out, 'para', (i) => `原文·第 ${i + 1} 段`, c.paragraphs);
      push(out, 'translation', c.translation, '全文翻译');
      push(out, 'theme', c.theme, '主旨与写作特色');
      break;
    }

    case 'reading': {
      const r = entry.data;
      pushList(out, 'para', (i) => `原文·第 ${i + 1} 段`, r.paragraphs);
      pushList(out, 'tip', (i) => `答题技巧·第 ${i + 1} 条`, r.tips);
      break;
    }

    case 'writing': {
      const w = entry.data;
      push(out, 'summary', w.summary, '本讲要点');
      // 正文首行 `## ` 是小标题，读出来当段落标签更清楚
      (w.content ?? []).forEach((line, i) => {
        const isHead = line.startsWith('## ');
        const text = isHead ? line.slice(3) : line;
        push(out, `content-${i}`, text, isHead ? '小标题' : `正文·第 ${i + 1} 段`);
      });
      (w.examples ?? []).forEach((ex, i) => {
        push(out, `ex-${i}-text`, ex.text, `范例·${ex.title}`);
        push(out, `ex-${i}-comment`, ex.comment, `范例点评·${ex.title}`);
      });
      (w.materials ?? []).forEach((m, i) =>
        pushList(out, `mat-${i}`, (j) => `素材·${m.theme} 第 ${j + 1} 条`, m.items),
      );
      push(out, 'exercise', w.exercise?.prompt, '训练任务');
      pushList(out, 'ex-tip', (i) => `训练提示·第 ${i + 1} 条`, w.exercise?.tips);
      break;
    }

    case 'literature': {
      const l = entry.data;
      pushList(out, 'content', (i) => `正文·第 ${i + 1} 段`, l.content);
      pushList(out, 'key', (i) => `必记要点·第 ${i + 1} 条`, l.keyPoints);
      if (l.book) {
        push(out, 'book-theme', l.book.theme, '主题思想');
        pushList(out, 'book-feature', (i) => `艺术特色·第 ${i + 1} 条`, l.book.features);
        (l.book.chapters ?? []).forEach((c, i) =>
          push(out, `chapter-${i}`, `${c.name}：${c.summary}`, `章节脉络·第 ${i + 1} 章`),
        );
        (l.book.plots ?? []).forEach((p, i) =>
          push(out, `plot-${i}`, `${p.title}：${p.desc}`, `情节主线·第 ${i + 1} 条`),
        );
      }
      break;
    }

    case 'vocab': {
      const v = entry.data;
      push(out, 'meaning', v.meaning, `${v.term} 的释义`);
      push(out, 'pitfall', v.pitfall, '易错点与辨析');
      push(out, 'example', v.example, '例句');
      (v.confusable ?? []).forEach((c, i) =>
        push(out, `conf-${i}`, `${c.term}：${c.meaning}`, '易混词对照'),
      );
      break;
    }

    default: {
      // 数学模块 id 形如 `math-*`，是另一套 `MathModuleId`，只能用前缀判断
      if (!entry.moduleId.startsWith('math-')) break;
      const m = entry.data as {
        summary?: string;
        concepts?: { term: string; explain: string }[];
      };
      (m.concepts ?? []).forEach((c, i) => push(out, `concept-${i}`, c.explain, `概念·${c.term}`));
      push(out, 'summary', m.summary, '本节要点');
      break;
    }
  }

  return out;
}
