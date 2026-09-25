/** 古诗词详情：竖排/横排、逐句遮罩背诵、译文注释、赏析与考点 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PoemEntry } from '../../types';
import { useStudy } from '../../store/StudyContext';
import { PoemText } from '../../components/PoemText';
import { Tag } from '../../components/common';
import { ReciteTrainer } from '../../components/ReciteTrainer';
import { DetailShell, Section } from './DetailShell';

export function PoemDetail({ entry, moduleName }: { entry: PoemEntry; moduleName: string }) {
  const poem = entry.data;
  const { getProgress } = useStudy();
  const [vertical, setVertical] = useState(false);
  const [hidden, setHidden] = useState<number[]>([]);
  const [flash, setFlash] = useState<number[]>([]);

  const progress = getProgress(entry.id);
  const recited = progress.recited ?? 0;

  // 逐句串讲仅在长度匹配时展示，避免错位
  const lineNotes = useMemo(() => {
    const notes = poem.lineNotes;
    if (!notes || notes.length !== poem.lines.length) return null;
    return poem.lines.map((line, i) => ({ line, note: notes[i] }));
  }, [poem.lines, poem.lineNotes]);

  useEffect(() => {
    if (!flash.length) return;
    const t = window.setTimeout(() => setFlash([]), 900);
    return () => window.clearTimeout(t);
  }, [flash]);

  const toggleLine = (i: number) => {
    setHidden((h) => (h.includes(i) ? h.filter((x) => x !== i) : [...h, i]));
  };

  const hideRandomLine = () => {
    const candidates = poem.lines
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => l.replace(/[^\u4e00-\u9fa5]/g, '').length >= 4)
      .map(({ i }) => i);
    if (!candidates.length) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    setHidden((h) => (h.includes(pick) ? h : [...h, pick]));
    setFlash([pick]);
  };

  const showOne = () => {
    setHidden((h) => {
      if (!h.length) return h;
      setFlash([h[h.length - 1]]);
      return h.slice(0, -1);
    });
  };

  return (
    <DetailShell
      entry={entry}
      moduleName={moduleName}
      backTo="/s/chinese/poems"
      subtitle={
        <span>
          {poem.dynasty}·{poem.author} · {poem.genre} · 共 {poem.lines.length} 句
        </span>
      }
      tags={[poem.genre, ...(poem.tags ?? [])]}
      actions={
        <>
          <button className="btn btn--sm" onClick={() => setVertical((v) => !v)}>
            {vertical ? '⇄ 横排' : '⇅ 竖排'}
          </button>
          <button className="btn btn--sm" onClick={hideRandomLine}>
            🎲 随机遮一句
          </button>
          {hidden.length > 0 ? (
            <button className="btn btn--sm" onClick={showOne}>
              👁 显示一句
            </button>
          ) : null}
          {hidden.length > 0 ? (
            <button className="btn btn--sm btn--ghost" onClick={() => setHidden([])}>
              全部显示
            </button>
          ) : (
            <button
              className="btn btn--sm btn--ghost"
              onClick={() => setHidden(poem.lines.map((_, i) => i))}
            >
              全部遮住
            </button>
          )}
        </>
      }
    >
      {/* 正文 */}
      <section className="poem-sheet">
        <div className="poem-sheet__inner">
          <h2 className="poem-title">{poem.title}</h2>
          <div className="poem-author">
            〔{poem.dynasty}〕{poem.author}
          </div>
          <PoemText
            lines={poem.lines}
            vertical={vertical}
            hidden={hidden}
            highlight={flash}
            onToggleLine={toggleLine}
          />
          <div className="small muted center" style={{ marginTop: 18 }}>
            提示：点击任意一句可以遮住它，用来检验自己是否背得下来。
          </div>
        </div>
      </section>

      {/* 背诵训练（三级提示 + 间隔重复） */}
      <ReciteTrainer poem={poem} entryId={entry.id} />

      {/* 名句 */}
      {poem.famousLines?.length ? (
        <Section title="千古名句" icon="✨">
          <div className="stack stack--sm">
            {poem.famousLines.map((l, i) => (
              <div
                key={i}
                style={{
                  fontFamily: 'var(--font-kai)',
                  fontSize: 17.5,
                  lineHeight: 1.95,
                  letterSpacing: '0.04em',
                  paddingLeft: 12,
                  borderLeft: '3px solid var(--c-gold)',
                }}
              >
                {l}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 译文 */}
      <Section title="白话译文" icon="📝">
        <div className="prose">
          <p style={{ whiteSpace: 'pre-line' }}>{poem.translation}</p>
        </div>
      </Section>

      {/* 逐句串讲 */}
      {lineNotes ? (
        <Section title="逐句串讲" icon="🔎">
          <div className="stack stack--sm">
            {lineNotes.map((row, i) => (
              <div
                key={i}
                className="note"
                style={{ display: 'block', padding: '11px 13px' }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-kai)',
                    fontSize: 16,
                    letterSpacing: '0.04em',
                    marginBottom: 3,
                  }}
                >
                  {row.line}
                </div>
                <div className="note__text">{row.note}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 赏析 */}
      <Section title="赏析与考点" icon="🎯">
        <div className="prose">
          <p style={{ whiteSpace: 'pre-line' }}>{poem.appreciation}</p>
        </div>
      </Section>

      {/* 易错字 */}
      {poem.pitfalls?.length ? (
        <Section title="默写易错点" icon="⚠️">
          <div className="stack stack--sm">
            {poem.pitfalls.map((p, i) => (
              <div className="note" key={i}>
                <span className="note__word" style={{ color: 'var(--c-red)' }}>
                  易错
                </span>
                <span className="note__text">{p}</span>
              </div>
            ))}
          </div>
          <div className="row row--wrap" style={{ marginTop: 12 }}>
            {poem.tags?.map((t) => (
              <Tag key={t}>#{t}</Tag>
            ))}
          </div>
        </Section>
      ) : null}
    </DetailShell>
  );
}
