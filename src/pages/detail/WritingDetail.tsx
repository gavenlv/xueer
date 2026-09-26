/** 作文训练详情：方法讲解、范文与分项点评、素材积累与训练任务 */

import { useState } from 'react';
import type { WritingExample, WritingEntry } from '../../types';
import { cn } from '../../lib/utils';
import { sampleLength, EXAM_MIN_WORDS } from '../../lib/writing';
import { Accordion, Tag } from '../../components/common';
import { DetailShell, Section } from './DetailShell';

/**
 * 一篇范文的完整呈现：命题形式 → 全文 → 亮点句 → 分项点评 → 总评。
 *
 * 为什么把「亮点句」单列出来放在点评前面：学生最缺的不是「这篇很好」的判断，
 * 而是**可以背下来化用的句子**。先给句子与它好在哪里，再讲整篇的得失，
 * 模仿的抓手更硬。分项点评对应中考作文的内容、结构、语言等评分维度，
 * 学生可以逐项对照自己的文章。
 */
function SampleBlock({ ex, defaultOpen }: { ex: WritingExample; defaultOpen: boolean }) {
  return (
    <Accordion
      title={
        <span className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
          <span>{ex.title}</span>
          {ex.score ? <Tag tone="red">{ex.score}</Tag> : null}
          {/* 字数现算（去掉空白后的字符数，含标点），与考场按格计字一致 */}
          <Tag>{sampleLength(ex.text)} 字</Tag>
        </span>
      }
      icon="📄"
      defaultOpen={defaultOpen}
    >
      {ex.prompt ? (
        <div className="explain" style={{ marginTop: 0 }}>
          <div className="explain__title">📌 题目要求</div>
          <div style={{ lineHeight: 1.9 }}>{ex.prompt}</div>
        </div>
      ) : null}

      <div
        className="prose"
        style={{
          fontFamily: 'var(--font-kai)',
          fontSize: 16,
          lineHeight: 2,
          letterSpacing: '0.02em',
          marginTop: 12,
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

      {ex.highlights?.length ? (
        <div className="stack stack--sm" style={{ marginTop: 16 }}>
          <div className="explain__title">✨ 亮点句（可以直接背下来化用）</div>
          {ex.highlights.map((h, i) => (
            <div className="sample-highlight" key={i}>
              <div className="sample-highlight__sentence">{h.sentence}</div>
              <div className="sample-highlight__why">为什么好：{h.why}</div>
            </div>
          ))}
        </div>
      ) : null}

      {ex.review?.length ? (
        <div className="stack stack--sm" style={{ marginTop: 16 }}>
          <div className="explain__title">🔍 分项点评（对照中考评分维度看自己的文章）</div>
          <div className="sample-review">
            {ex.review.map((r, i) => (
              <div className="sample-review__row" key={i}>
                <span className="sample-review__aspect">{r.aspect}</span>
                <span className="sample-review__text">{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="explain" style={{ marginTop: 14 }}>
        <div className="explain__title">📝 总评</div>
        <div style={{ lineHeight: 1.85 }}>{ex.comment}</div>
      </div>
    </Accordion>
  );
}

export function WritingDetail({
  entry,
  moduleName,
}: {
  entry: WritingEntry;
  moduleName: string;
}) {
  const w = entry.data;
  /** 范文多于一篇时，默认只展开第一篇，避免一进页面铺开上万字 */
  const [allOpen, setAllOpen] = useState(false);
  const samples = w.examples ?? [];
  const isSample = w.category === '范文点评';
  /** 完整例文（≥600 字，含标点）与片段示例分开计数：学生关心的是有几篇能当样板看的全文 */
  const fullSamples = samples.filter((ex) => sampleLength(ex.text) >= EXAM_MIN_WORDS);
  const totalWords = fullSamples.reduce((n, ex) => n + sampleLength(ex.text), 0);

  return (
    <DetailShell
      entry={entry}
      moduleName={moduleName}
      backTo="/s/chinese/writing"
      subtitle={
        <span>
          {w.category}
          {w.theme ? ` · ${w.theme}` : ''}
          {samples.length > 1 ? ` · ${samples.length} 篇范文` : ''}
        </span>
      }
    >
      <section className="card card--pad">
        <div className="row row--wrap" style={{ marginBottom: 10 }}>
          <Tag tone="red">{w.category}</Tag>
          {w.theme ? <Tag tone="purple">主题·{w.theme}</Tag> : null}
          {fullSamples.length ? (
            <Tag tone="jade">{fullSamples.length} 篇完整范例</Tag>
          ) : null}
          {totalWords ? <Tag>{totalWords} 字</Tag> : null}
        </div>
        <div className="prose">
          <p style={{ fontWeight: 600 }}>{w.summary}</p>
        </div>
        {isSample ? (
          <div className="small muted" style={{ marginTop: 8, lineHeight: 1.8 }}>
            作文在语文中考里占 60 分（全卷 140 分，约 43%），是单项分值最高的题。
            建议的用法：先自己按题目写一遍，再逐段对看范文与「亮点句」，
            最后照「分项点评」的五个维度给自己打一遍分。
          </div>
        ) : null}
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

      {samples.length ? (
        <Section
          title={`范文与点评（${samples.length} 篇）`}
          icon="📄"
          extra={
            samples.length > 1 ? (
              <button
                className={cn('btn btn--sm', allOpen && 'btn--primary')}
                onClick={() => {
                  setAllOpen((v) => !v);
                  // Accordion 的展开是各自的状态，用 key 变化重新挂载以实现「全部展开」
                }}
              >
                {allOpen ? '只展开第一篇' : `全部展开（${samples.length} 篇）`}
              </button>
            ) : null
          }
        >
          <div key={allOpen ? 'open-all' : 'open-first'}>
            {samples.map((ex, i) => (
              <SampleBlock key={i} ex={ex} defaultOpen={allOpen || i === 0} />
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
