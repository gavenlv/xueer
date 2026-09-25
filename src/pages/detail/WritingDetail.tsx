/** 作文训练详情：方法讲解、范例点评、素材积累与训练任务 */

import type { WritingEntry } from '../../types';
import { Accordion, Tag } from '../../components/common';
import { DetailShell, Section } from './DetailShell';

export function WritingDetail({
  entry,
  moduleName,
}: {
  entry: WritingEntry;
  moduleName: string;
}) {
  const w = entry.data;
  return (
    <DetailShell
      entry={entry}
      moduleName={moduleName}
      backTo="/s/chinese/writing"
      subtitle={<span>{w.category}</span>}
    >
      <section className="card card--pad">
        <div className="row row--wrap" style={{ marginBottom: 10 }}>
          <Tag tone="red">{w.category}</Tag>
        </div>
        <div className="prose">
          <p style={{ fontWeight: 600 }}>{w.summary}</p>
        </div>
      </section>

      <Section title="方法讲解" icon="🧠">
        <div className="prose">
          {w.content.map((p, i) => {
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

      {w.examples?.length ? (
        <Section title={`范例与点评（${w.examples.length} 则）`} icon="📄">
          <div>
            {w.examples.map((ex, i) => (
              <Accordion key={i} title={ex.title} icon="▪" defaultOpen={i === 0}>
                <div
                  className="prose"
                  style={{
                    fontFamily: 'var(--font-kai)',
                    fontSize: 16,
                    lineHeight: 2,
                    letterSpacing: '0.02em',
                  }}
                >
                  {ex.text
                    .split(/\n+/)
                    .filter((s) => s.trim())
                    .map((s, j) => (
                      <p key={j} style={{ textIndent: '2em' }}>
                        {s}
                      </p>
                    ))}
                </div>
                <div className="explain" style={{ marginTop: 14 }}>
                  <div className="explain__title">📝 点评</div>
                  <div style={{ lineHeight: 1.85 }}>{ex.comment}</div>
                </div>
              </Accordion>
            ))}
          </div>
        </Section>
      ) : null}

      {w.materials?.length ? (
        <Section title="素材积累" icon="📚">
          <div className="stack stack--sm">
            {w.materials.map((m, i) => (
              <div className="card card--pad card--flat" key={i} style={{ background: 'var(--c-surface-2)' }}>
                <div className="bold" style={{ color: 'var(--c-red)' }}>
                  主题：{m.theme}
                </div>
                <ul style={{ marginTop: 8 }}>
                  {m.items.map((it, j) => (
                    <li
                      key={j}
                      style={{
                        padding: '6px 0 6px 16px',
                        position: 'relative',
                        lineHeight: 1.85,
                        fontSize: 14.5,
                      }}
                    >
                      <span style={{ position: 'absolute', left: 0, color: 'var(--c-gold)' }}>◆</span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {w.exercise ? (
        <Section title="动笔训练" icon="✏️">
          <div className="explain explain--correct" style={{ marginTop: 0 }}>
            <div className="explain__title">写作任务</div>
            <div style={{ lineHeight: 1.9 }}>{w.exercise.prompt}</div>
          </div>
          {w.exercise.tips?.length ? (
            <div className="stack stack--sm" style={{ marginTop: 14 }}>
              {w.exercise.tips.map((t, i) => (
                <div className="note" key={i}>
                  <span className="note__word">{i + 1}</span>
                  <span className="note__text">{t}</span>
                </div>
              ))}
            </div>
          ) : null}
        </Section>
      ) : null}
    </DetailShell>
  );
}
