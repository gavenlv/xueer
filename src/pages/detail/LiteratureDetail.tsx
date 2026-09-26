/** 文学常识与名著导读详情 */

import { Link } from 'react-router-dom';
import type { LiteratureEntry } from '../../types';
import { Accordion, Tag } from '../../components/common';
import { BOOK_EXAM_POINTS } from '../../lib/bookExams';
import { DetailShell, Section } from './DetailShell';

/** 情节脉络：把每一环串成一条可见的链，而不是一堆并列的句子 */
function PlotChain({ steps }: { steps: string[] }) {
  return (
    <div className="chain">
      {steps.map((s, i) => (
        <div className="chain__item" key={i}>
          <div className="chain__dot">{i + 1}</div>
          <div className="chain__text">{s}</div>
        </div>
      ))}
    </div>
  );
}

export function LiteratureDetail({
  entry,
  moduleName,
}: {
  entry: LiteratureEntry;
  moduleName: string;
}) {
  const l = entry.data;
  const book = l.book;

  /** 本部名著实际考到的考点（用受控词表过滤，顺序按词表走） */
  const tags = new Set(entry.questions.flatMap((q) => q.tags ?? []));
  const examPoints = BOOK_EXAM_POINTS.filter((p) => tags.has(p.tag));

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

          {/* 整本书的规模一眼可见，学生好安排阅读计划 */}
          {book.chapters?.length ? (
            <>
              <div className="divider" />
              <div className="row row--wrap">
                <Tag tone="blue">📖 {book.chapters.length} 个章节板块</Tag>
                {book.plotChain?.length ? <Tag tone="jade">🧵 {book.plotChain.length} 环情节主线</Tag> : null}
                <Tag>✍️ {entry.questions.length} 道考点练习</Tag>
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {/* 情节主线：把整本书串成一条链，先看骨架再看细节 */}
      {book?.plotChain?.length ? (
        <Section title="情节主线（串起来看）" icon="🧵">
          <div className="small muted" style={{ marginBottom: 12 }}>
            按顺序读一遍这几环，全书的骨架就立住了；答题时先想「在哪一环」，再调细节。
          </div>
          <PlotChain steps={book.plotChain} />
        </Section>
      ) : null}

      {/* 记忆口诀 */}
      {book?.mnemonic?.length ? (
        <Section title="记忆口诀" icon="🧠">
          <div className="stack stack--sm">
            {book.mnemonic.map((m, i) => (
              <div className="mnemonic" key={i}>
                <span className="mnemonic__icon">💡</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 章节脉络：按书本身的结构逐章串下来 */}
      {book?.chapters?.length ? (
        <Section
          title={`章节脉络（${book.chapters.length}）`}
          icon="📖"
          extra={<span className="small muted">点标题展开</span>}
        >
          <div>
            {book.chapters.map((c, i) => (
              <Accordion key={i} title={c.name} icon={`${i + 1}`} defaultOpen={i === 0}>
                <div className="prose">
                  <p>{c.summary}</p>
                </div>
              </Accordion>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 本部名著的考点：按广州中考「整本书阅读」的考查面拆开，可逐点专项训练 */}
      {examPoints.length ? (
        <Section title="本部考点（广州中考标准）" icon="🎯" extra={<Tag tone="red">{examPoints.length} 类</Tag>}>
          <div className="small muted" style={{ marginBottom: 12 }}>
            整本书阅读的考查面就这几类。点任一考点，只练《{book?.name}》这一类题。
          </div>
          <div className="grid grid--auto">
            {examPoints.map((p) => {
              const n = entry.questions.filter((q) => (q.tags ?? []).includes(p.tag)).length;
              return (
                <Link
                  className="card card--pad card--flat stack stack--sm"
                  key={p.tag}
                  to={`/practice/literature/${entry.id}?tag=${encodeURIComponent(p.tag)}`}
                  style={{ background: 'var(--c-surface-2)' }}
                >
                  <div className="row row--between">
                    <span className="bold">
                      {p.icon} {p.tag}
                    </span>
                    <Tag tone="jade">{n} 题</Tag>
                  </div>
                  <div className="small muted">{p.desc}</div>
                </Link>
              );
            })}
          </div>
          <div className="row row--wrap" style={{ marginTop: 12 }}>
            <Link className="btn btn--primary btn--sm" to={`/practice/literature/${entry.id}`}>
              ✍️ 练《{book?.name}》全部 {entry.questions.length} 题
            </Link>
            <Link className="btn btn--sm" to="/s/chinese/exam">
              🎯 看全部名著考点
            </Link>
          </div>
        </Section>
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
