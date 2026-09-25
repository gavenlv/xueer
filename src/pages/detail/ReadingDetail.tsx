/** 现代文阅读详情：原文 + 答题技巧（题目在练习页作答） */

import type { ReadingEntry } from '../../types';
import { Tag } from '../../components/common';
import { DetailShell, Section } from './DetailShell';

export function ReadingDetail({
  entry,
  moduleName,
}: {
  entry: ReadingEntry;
  moduleName: string;
}) {
  const r = entry.data;
  const chars = r.paragraphs.join('').length;
  return (
    <DetailShell
      entry={entry}
      moduleName={moduleName}
      backTo="/s/chinese/reading"
      subtitle={
        <span>
          {r.genre}
          {r.author ? ` · ${r.author}` : ''} · 约 {chars} 字 · {r.questions.length} 道题
        </span>
      }
      actions={
        <Tag tone="purple">建议先读原文，再点「做这部分的练习」</Tag>
      }
    >
      <Section title="阅读原文" icon="📖">
        <div className="prose">
          {r.paragraphs.map((p, i) => (
            <p key={i} style={{ textIndent: '2em' }}>
              {p}
            </p>
          ))}
        </div>
      </Section>

      {r.tips?.length ? (
        <Section title="本篇答题技巧" icon="💡">
          <div className="stack stack--sm">
            {r.tips.map((t, i) => (
              <div className="note" key={i}>
                <span className="note__word">{i + 1}</span>
                <span className="note__text">{t}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </DetailShell>
  );
}
