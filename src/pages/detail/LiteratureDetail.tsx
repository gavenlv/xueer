/** 文学常识与名著导读详情 */

import type { LiteratureEntry } from '../../types';
import { Accordion, Tag } from '../../components/common';
import { DetailShell, Section } from './DetailShell';

export function LiteratureDetail({
  entry,
  moduleName,
}: {
  entry: LiteratureEntry;
  moduleName: string;
}) {
  const l = entry.data;
  const book = l.book;

  return (
    <DetailShell
      entry={entry}
      moduleName={moduleName}
      backTo="/s/chinese/literature"
      subtitle={<span>{l.category}{book ? ` · ${book.author}` : ''}</span>}
      actions={<Tag tone="jade">{l.keyPoints.length} 个必记要点</Tag>}
    >
      {book ? (
        <section className="card card--pad">
          <div className="row row--between row--wrap" style={{ alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                《{book.name}》
              </div>
              <div className="muted" style={{ marginTop: 4 }}>
                {book.dynasty ? `〔${book.dynasty}〕` : ''}
                {book.author}
              </div>
            </div>
            <Tag tone="gold">{l.category}</Tag>
          </div>

          {book.theme ? (
            <>
              <div className="divider" />
              <div className="prose">
                <p>{book.theme}</p>
              </div>
            </>
          ) : null}

          {book.features?.length ? (
            <>
              <div className="divider" />
              <div className="bold" style={{ marginBottom: 8 }}>
                艺术特色
              </div>
              <div className="row row--wrap">
                {book.features.map((f, i) => (
                  <Tag key={i} tone="purple">
                    {f}
                  </Tag>
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      <Section title="内容讲解" icon="📘">
        <div className="prose">
          {l.content.map((p, i) => {
            const text = p.trim();
            if (!text) return null;
            if (text.startsWith('## ')) {
              return (
                <h4 key={i} className="prose__h">
                  {text.slice(3)}
                </h4>
              );
            }
            return <p key={i}>{text}</p>;
          })}
        </div>
      </Section>

      {l.keyPoints.length ? (
        <Section title="必记要点" icon="🔑">
          <div className="stack stack--sm">
            {l.keyPoints.map((k, i) => (
              <div className="note" key={i}>
                <span className="note__word">{i + 1}</span>
                <span className="note__text">{k}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {book?.characters?.length ? (
        <Section title={`主要人物（${book.characters.length}）`} icon="👥">
          <div className="grid grid--2">
            {book.characters.map((c, i) => (
              <div
                className="card card--pad card--flat"
                key={i}
                style={{ background: 'var(--c-surface-2)' }}
              >
                <div
                  className="bold"
                  style={{ fontFamily: 'var(--font-kai)', fontSize: 17, color: 'var(--c-primary-ink)' }}
                >
                  {c.name}
                </div>
                <div className="small" style={{ marginTop: 6, lineHeight: 1.8, color: 'var(--c-ink-2)' }}>
                  {c.desc}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {book?.plots?.length ? (
        <Section title={`经典情节（${book.plots.length}）`} icon="🎬">
          <div>
            {book.plots.map((p, i) => (
              <Accordion key={i} title={p.title} icon="▪" defaultOpen={i === 0}>
                <div className="prose">
                  <p>{p.desc}</p>
                </div>
              </Accordion>
            ))}
          </div>
        </Section>
      ) : null}
    </DetailShell>
  );
}
