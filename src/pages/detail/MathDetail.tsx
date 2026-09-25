/** 数学知识点详情：概念、公式定理（KaTeX 渲染）、例题精讲、易错点、解题方法 */

import type { MathEntry } from '../../types';
import { Accordion, Tag } from '../../components/common';
import { RichText, Tex } from '../../components/Tex';
import { DetailShell, Section } from './DetailShell';

export function MathDetail({ entry, moduleName }: { entry: MathEntry; moduleName: string }) {
  const t = entry.data;

  return (
    <DetailShell
      entry={entry}
      moduleName={moduleName}
      backTo={`/s/math/${entry.moduleId}`}
      subtitle={
        <span>
          {t.chapter ? `${t.chapter} · ` : ''}
          <RichText text={t.summary} />
        </span>
      }
      // 标签按纯文本渲染，只能放短标签；解题方法含公式标记，绝不能塞进标签
      tags={['数学']}
    >
      {/* 核心概念 */}
      {t.concepts?.length ? (
        <Section title={`核心概念（${t.concepts.length} 条）`} icon="📘">
          <div className="note-grid">
            {t.concepts.map((c, i) => (
              <div className="note" key={i}>
                <span className="note__word">{c.term}</span>
                <span className="note__text">
                  <RichText text={c.explain} />
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 公式与定理 */}
      {t.formulas?.length ? (
        <Section title={`公式与定理（${t.formulas.length} 条）`} icon="🧮">
          <div>
            {t.formulas.map((f, i) => (
              <div className="formula" key={i}>
                <div className="formula__name">{f.name}</div>
                <div className="formula__body">
                  {f.tex ? <Tex tex={f.tex} block /> : null}
                  {f.text ? (
                    <div
                      className="small"
                      style={{ color: 'var(--c-ink-2)', lineHeight: 1.8, marginTop: f.tex ? 4 : 0 }}
                    >
                      <RichText text={f.text} />
                    </div>
                  ) : null}
                  {f.note ? (
                    <div className="formula__note">
                      ⚠️ <RichText text={f.note} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 例题精讲 */}
      {t.examples?.length ? (
        <Section title={`例题精讲（${t.examples.length} 道）`} icon="✏️">
          <div>
            {t.examples.map((ex, i) => (
              <Accordion
                key={i}
                title={
                  <span>
                    例 {i + 1}
                    <span className="muted" style={{ marginLeft: 8, fontWeight: 400 }}>
                      <RichText text={ex.stem.slice(0, 28) + (ex.stem.length > 28 ? '…' : '')} />
                    </span>
                  </span>
                }
                icon="▪"
                defaultOpen={i === 0}
              >
                <div className="example__stem" style={{ borderRadius: 'var(--r-sm)', border: 'none' }}>
                  <span className="example__label">题目</span>
                  <span style={{ whiteSpace: 'pre-line' }}>
                    <RichText text={ex.stem} />
                  </span>
                </div>

                {ex.steps?.length ? (
                  <div className="example__body" style={{ padding: '12px 0 0' }}>
                    {ex.steps.map((s, j) => (
                      <div className="example__step" key={j}>
                        <span className="example__step-no">{j + 1}</span>
                        <span>
                          <RichText text={s} />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="example__answer">
                  <strong>答案：</strong>
                  <RichText text={ex.answer} />
                </div>

                {ex.tip ? (
                  <div className="example__tip">
                    💡 <RichText text={ex.tip} />
                  </div>
                ) : null}
              </Accordion>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 易错点 */}
      {t.pitfalls?.length ? (
        <Section title={`易错点（${t.pitfalls.length} 条）`} icon="⚠️">
          <div className="stack stack--sm">
            {t.pitfalls.map((p, i) => (
              <div className="explain explain--wrong" style={{ marginTop: 0 }} key={i}>
                <span style={{ lineHeight: 1.8 }}>
                  <RichText text={p} />
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 解题方法 */}
      {t.methods?.length ? (
        <Section title="解题方法与思路" icon="🧠">
          <div className="stack stack--sm">
            {t.methods.map((m, i) => (
              <div className="note" key={i}>
                <span className="note__word">{i + 1}</span>
                <span className="note__text">
                  <RichText text={m} />
                </span>
              </div>
            ))}
          </div>
          <div className="row row--wrap" style={{ marginTop: 12 }}>
            <Tag tone="jade">数学</Tag>
            {t.chapter ? <Tag tone="blue">{t.chapter}</Tag> : null}
          </div>
        </Section>
      ) : null}
    </DetailShell>
  );
}
