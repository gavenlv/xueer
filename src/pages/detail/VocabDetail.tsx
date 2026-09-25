/** 字词详情：释义、易错点、例句、易混辨析 */

import type { VocabEntry } from '../../types';
import { DetailShell, Section } from './DetailShell';

export function VocabDetail({ entry, moduleName }: { entry: VocabEntry; moduleName: string }) {
  const v = entry.data;
  return (
    <DetailShell
      entry={entry}
      moduleName={moduleName}
      backTo="/s/chinese/vocab"
      subtitle={
        <span>
          {v.category}
          {v.pinyin ? ` · ${v.pinyin}` : ''}
        </span>
      }
      actions={null}
    >
      <section className="card card--pad">
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: '0.06em',
          }}
        >
          {v.term}
        </div>
        {v.pinyin ? (
          <div className="muted" style={{ marginTop: 4, fontSize: 15, letterSpacing: '0.04em' }}>
            {v.pinyin}
          </div>
        ) : null}
        <div className="divider" />
        <div className="prose">
          <p>{v.meaning}</p>
        </div>
      </section>

      {v.pitfall ? (
        <Section title="易错提示 · 考点" icon="⚠️">
          <div className="explain explain--wrong" style={{ marginTop: 0 }}>
            {v.pitfall}
          </div>
        </Section>
      ) : null}

      {v.example ? (
        <Section title="例句示范" icon="💬">
          <div
            style={{
              fontFamily: 'var(--font-kai)',
              fontSize: 16.5,
              lineHeight: 1.95,
              letterSpacing: '0.03em',
              paddingLeft: 12,
              borderLeft: '3px solid var(--c-primary)',
            }}
          >
            {v.example}
          </div>
        </Section>
      ) : null}

      {v.confusable?.length ? (
        <Section title="易混辨析" icon="⚖️">
          <div className="grid grid--2">
            {v.confusable.map((c, i) => (
              <div className="card card--pad card--flat" key={i} style={{ background: 'var(--c-surface-2)' }}>
                <div className="bold" style={{ fontFamily: 'var(--font-kai)', fontSize: 17 }}>
                  {c.term}
                </div>
                <div className="small" style={{ marginTop: 6, lineHeight: 1.8, color: 'var(--c-ink-2)' }}>
                  {c.meaning}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </DetailShell>
  );
}
