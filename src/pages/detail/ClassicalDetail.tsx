/** 文言文详情：原文、注释、语法归类、翻译、主旨、朗读、逐词释义 */

import { useMemo } from 'react';
import type { ClassicalEntry } from '../../types';
import { Accordion, NoteGrid, Tag } from '../../components/common';
import { SpeakButton } from '../../components/SpeechBar';
import { AnnotatedText } from '../../components/WordTip';
import { ReciteTrainer } from '../../components/ReciteTrainer';
import { glossaryOf } from '../../lib/glossary';
import { DetailShell, Section } from './DetailShell';

export function ClassicalDetail({
  entry,
  moduleName,
}: {
  entry: ClassicalEntry;
  moduleName: string;
}) {
  const c = entry.data;

  /** 需要翻译的字词：注释 + 语法归类里的词条，正文里出现即加 tooltip */
  const glossary = useMemo(() => glossaryOf(entry), [entry]);

  /**
   * 遮罩训练用的正文：一句一行。
   * `ClassicalText` 只有 `paragraphs`，所以按句末标点切句——文言文的一句就是朗读与
   * 默写的自然单位，切完就能复用古诗词那套四级遮罩，不必再给文言文单独做一套。
   */
  const reciteLines = useMemo(
    () =>
      c.paragraphs
        .flatMap((p) => p.split(/(?<=[。！？；])/))
        .map((s) => s.trim())
        .filter(Boolean),
    [c.paragraphs],
  );

  return (
    <DetailShell
      entry={entry}
      moduleName={moduleName}
      backTo="/s/chinese/classical"
      subtitle={
        <span>
          {c.dynasty}·{c.author}
          {c.source ? ` · 出自《${c.source}》` : ''}
        </span>
      }
    >
      <Section title="原文" icon="📜" extra={<Tag tone="jade">虚线字词可悬停看释义</Tag>}>
        <div className="prose prose--classical">
          {c.paragraphs.map((p, i) => (
            <p key={i} style={{ textIndent: '2em' }}>
              <AnnotatedText text={p} words={glossary} />
            </p>
          ))}
        </div>
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          {c.paragraphs.map((p, i) => (
            <SpeakButton key={i} text={p} label={`第 ${i + 1} 段`} />
          ))}
          <span className="small muted">← 逐段朗读</span>
        </div>
      </Section>

      {/* 整篇遮罩训练：与古诗词同一套四级提示，逐句遮、逐句查 */}
      <ReciteTrainer lines={reciteLines} entryId={entry.id} links={false} />

      <Section title={`重点注释（${c.annotations.length} 条）`} icon="🔖">
        <NoteGrid items={c.annotations} />
      </Section>

      {c.grammar.length ? (
        <Section title="语法归类" icon="🧩">
          <div>
            {c.grammar.map((g, i) => (
              <Accordion
                key={i}
                title={`${g.type}（${g.items.length}）`}
                icon="▪"
                defaultOpen={i === 0}
              >
                <NoteGrid items={g.items} />
              </Accordion>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="全文翻译" icon="📝">
        <div className="prose">
          {c.translation
            .split(/\n+/)
            .filter((s) => s.trim())
            .map((s, i) => (
              <p key={i}>{s}</p>
            ))}
        </div>
      </Section>

      <Section title="主旨与写作特色" icon="🎯">
        <div className="prose">
          {c.theme
            .split(/\n+/)
            .filter((s) => s.trim())
            .map((s, i) => (
              <p key={i}>{s}</p>
            ))}
        </div>
      </Section>
    </DetailShell>
  );
}
