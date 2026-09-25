/** 文言文详情：原文、注释、语法归类、翻译、主旨 */

import type { ClassicalEntry } from '../../types';
import { Accordion, NoteGrid } from '../../components/common';
import { DetailShell, Section } from './DetailShell';

export function ClassicalDetail({
  entry,
  moduleName,
}: {
  entry: ClassicalEntry;
  moduleName: string;
}) {
  const c = entry.data;
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
      <Section title="原文" icon="📜">
        <div className="prose prose--classical">
          {c.paragraphs.map((p, i) => (
            <p key={i} style={{ textIndent: '2em' }}>
              {p}
            </p>
          ))}
        </div>
      </Section>

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
