/**
 * 英语知识详情页：按**中考知识模块**的学法组织，而不是按教材单元。
 *
 * 页面顺序对应学生实际复习的顺序：
 *   ① 这一段考什么（分层考点）→ ② 知识点本身（词根词缀 / 同义辨析 / 语法规则 /
 *   阅读语篇 / 听说脚本 / 书面表达）→ ③ 易错 → ④ 应试策略 → ⑤ 练习入口
 *
 * 几个英语特有的处理：
 *   - **近义词必须给区别**：`confusables` 每条都要求写清 `diff` 与两边例句，
 *     只罗列同义词对学生没有用（这也是用户明确提出的一点）。
 *   - **听说没有音频文件**：听力材料写成脚本，交给页面顶部的朗读条用浏览器语音读出来
 *     （`entrySpeech` 会把脚本按段拆给 SpeechBar），模仿朗读另给重音/连读提示。
 *   - 阅读与听说材料里挂的题目会一并进入题库（见 `data/english/index.ts`），
 *     因此在练习、错题本与统计里同样能被跟踪。
 */

import { useState } from 'react';
import type { EnglishKnowledgeEntry } from '../../types';
import { cn } from '../../lib/utils';
import { Accordion, Tag } from '../../components/common';
import { RichText } from '../../components/RichText';
import { SpeakButton } from '../../components/SpeechBar';
import { englishWordCount } from '../../lib/writing';
import { DetailShell, Section } from './DetailShell';

type Level = '重点' | '次重点' | '了解';

const LEVEL_TONE: Record<Level, 'red' | 'gold' | 'default'> = {
  重点: 'red',
  次重点: 'gold',
  了解: 'default',
};

/** 语篇 + 题目：题目只给题干与选项，答案可展开（练习时先自己做） */
function PassageBlock({
  title,
  text,
  cnText,
  kind,
  questions,
}: {
  title: string;
  text: string;
  cnText?: string;
  kind?: string;
  questions?: { id: string; stem: string; options?: string[]; answer: string; explanation: string }[];
}) {
  const [showCn, setShowCn] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="stack stack--sm">
      <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 700 }}>{title}</span>
        {kind ? <Tag tone="blue">{kind}</Tag> : null}
        <span className="spacer" />
        <SpeakButton text={text} label={title} />
        {cnText ? (
          <button className="btn btn--sm btn--ghost" onClick={() => setShowCn((v) => !v)}>
            {showCn ? '隐藏译文' : '看译文'}
          </button>
        ) : null}
      </div>

      <div className="en-passage">
        {text
          .split(/\n+/)
          .filter((s) => s.trim())
          .map((p, i) => (
            <p key={i}>{p}</p>
          ))}
      </div>

      {showCn && cnText ? (
        <div className="small muted" style={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}>
          {cnText}
        </div>
      ) : null}

      {questions?.length ? (
        <div className="stack stack--sm">
          {questions.map((q, i) => {
            const shown = open[q.id] ?? false;
            return (
              <div className="history-ask" key={q.id}>
                <div className="history-ask__stem">
                  <span className="history-ask__no">{i + 1}</span>
                  <RichText text={q.stem} />
                </div>
                {q.options?.length ? (
                  <ul className="en-options">
                    {q.options.map((o, k) => (
                      <li key={k}>{o}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="row row--wrap" style={{ marginTop: 8 }}>
                  <button
                    className={cn('btn btn--sm', shown ? 'btn--ghost' : 'btn--primary')}
                    onClick={() => setOpen((o) => ({ ...o, [q.id]: !shown }))}
                    aria-expanded={shown}
                  >
                    {shown ? '收起答案' : '看答案与解析'}
                  </button>
                </div>
                {shown ? (
                  <div className="explain fade-in" style={{ marginTop: 10 }}>
                    <div className="explain__title">✅ 答案：{q.answer}</div>
                    <div style={{ lineHeight: 1.85 }}>
                      <RichText text={q.explanation} />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function EnglishDetail({
  entry,
  moduleName,
}: {
  entry: EnglishKnowledgeEntry;
  moduleName: string;
}) {
  const d = entry.data;
  const [onlyKey, setOnlyKey] = useState(false);
  const counts = { 重点: 0, 次重点: 0, 了解: 0 } as Record<Level, number>;
  for (const p of d.points) counts[p.level as Level] = (counts[p.level as Level] ?? 0) + 1;
  const points = onlyKey ? d.points.filter((p) => p.level === '重点') : d.points;

  return (
    <DetailShell
      entry={entry}
      subjectId="english"
      moduleName={moduleName}
      backTo={`/s/english/${entry.moduleId}`}
      subtitle={
        <span>
          {d.unit}
          {d.enTitle ? ` · ${d.enTitle}` : ''}
        </span>
      }
      tags={['英语', ...entry.tags.slice(0, 4)]}
    >
      <section className="card card--pad history-mainline">
        <div className="history-mainline__label">这一个知识点</div>
        <div className="history-mainline__text">{d.summary}</div>
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          <Tag tone="red">重点 {counts['重点']}</Tag>
          <Tag tone="gold">次重点 {counts['次重点']}</Tag>
          <Tag>了解 {counts['了解']}</Tag>
          {d.affixes?.length ? <Tag tone="purple">词缀 {d.affixes.length} 组</Tag> : null}
          {d.confusables?.length ? <Tag tone="purple">辨析 {d.confusables.length} 组</Tag> : null}
          {d.passages?.length ? <Tag tone="blue">语篇 {d.passages.length} 篇</Tag> : null}
          {d.scripts?.length ? <Tag tone="jade">听说材料 {d.scripts.length} 段</Tag> : null}
        </div>
      </section>

      {/* 考点分层 */}
      <Section
        title={`考点分层（${d.points.length} 条）`}
        icon="📌"
        extra={
          <button
            className={cn('btn btn--sm', onlyKey && 'btn--primary')}
            onClick={() => setOnlyKey((v) => !v)}
            aria-pressed={onlyKey}
          >
            {onlyKey ? '显示全部' : `只看重点（${counts['重点']}）`}
          </button>
        }
      >
        <div className="stack stack--sm">
          {points.map((p, i) => (
            <div className="history-point" key={i}>
              <div className="history-point__text">
                <Tag tone={LEVEL_TONE[p.level as Level]}>{p.level}</Tag>
                <RichText text={p.text} />
              </div>
              {p.explain ? <div className="history-point__explain">怎么考/怎么答：{p.explain}</div> : null}
            </div>
          ))}
        </div>
      </Section>

      {/* 词根词缀 */}
      {d.affixes?.length ? (
        <Section title="词根词缀（一个词缀带一串词）" icon="🧬">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>词缀</th>
                  <th>含义</th>
                  <th>例词</th>
                </tr>
              </thead>
              <tbody>
                {d.affixes.map((a, i) => (
                  <tr key={i}>
                    <td className="en-word">{a.affix}</td>
                    <td>{a.meaning}</td>
                    <td>
                      {a.examples.map((e, k) => (
                        <div key={k}>
                          <b className="en-word">{e.word}</b> {e.cn}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {/* 同义近义辨析 */}
      {d.confusables?.length ? (
        <Section
          title={`同义/近义辨析（${d.confusables.length} 组）`}
          icon="⚖️"
          extra={<span className="small muted">考的就是「区别在哪」</span>}
        >
          <div className="stack stack--sm">
            {d.confusables.map((c, i) => (
              <div className="history-confuse" key={i}>
                <div className="history-confuse__row">
                  <Tag tone="blue">{c.a}</Tag>
                  <span>vs</span>
                  <Tag tone="purple">{c.b}</Tag>
                </div>
                <div className="history-confuse__row">
                  <Tag tone="jade">区别</Tag>
                  <span>{c.diff}</span>
                </div>
                {c.exampleA ? (
                  <div className="small en-example">
                    {c.a}：{c.exampleA}
                  </div>
                ) : null}
                {c.exampleB ? (
                  <div className="small en-example">
                    {c.b}：{c.exampleB}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 高频搭配 */}
      {d.collocations?.length ? (
        <Section title="高频搭配与短语" icon="🔗">
          <div className="stack stack--sm">
            {d.collocations.map((c, i) => (
              <div className="note" key={i} style={{ display: 'block' }}>
                <span className="en-word" style={{ fontWeight: 700 }}>
                  {c.phrase}
                </span>
                <span className="note__text"> {c.cn}</span>
                {c.note ? <div className="small muted">{c.note}</div> : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 语法规则 */}
      {d.rules?.length ? (
        <Section title="规则与用法" icon="🔤">
          <div className="stack stack--sm">
            {d.rules.map((r, i) => (
              <div className="history-angle" key={i}>
                <div className="history-angle__head">
                  <span style={{ fontWeight: 700 }}>{r.rule}</span>
                  {r.form ? <Tag tone="purple">{r.form}</Tag> : null}
                </div>
                <div className="en-example" style={{ marginTop: 6 }}>
                  {r.example}
                </div>
                {r.cn ? <div className="small muted">{r.cn}</div> : null}
                {r.tip ? <div className="small muted">提示：{r.tip}</div> : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 易错点 */}
      {d.mistakes?.length ? (
        <Section title="易错点（命题人爱在这里设陷阱）" icon="⚠️">
          <div className="stack stack--sm">
            {d.mistakes.map((m, i) => (
              <div className="history-confuse" key={i}>
                <div className="history-confuse__row">
                  <Tag tone="red">✘</Tag>
                  <span className="en-word">{m.wrong}</span>
                </div>
                <div className="history-confuse__row">
                  <Tag tone="jade">✔</Tag>
                  <span className="en-word">{m.right}</span>
                </div>
                <div className="small muted">为什么容易错：{m.why}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 阅读语篇 */}
      {d.passages?.length ? (
        <Section title={`语篇与题目（${d.passages.length} 篇）`} icon="📖">
          <div className="stack stack--lg">
            {d.passages.map((p, i) => (
              <PassageBlock
                key={i}
                title={p.title}
                text={p.text}
                cnText={p.cn}
                kind={p.kind}
                questions={p.questions}
              />
            ))}
          </div>
        </Section>
      ) : null}

      {/* 听说材料 */}
      {d.scripts?.length ? (
        <Section
          title={`听说材料（${d.scripts.length} 段）`}
          icon="🎧"
          extra={<Tag tone="jade">点标题旁 🔊 用语音朗读</Tag>}
        >
          <div className="stack stack--lg">
            {d.scripts.map((s, i) => (
              <div key={i} className="stack stack--sm">
                <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>{s.title}</span>
                  <span className="spacer" />
                  <SpeakButton text={s.text} label={s.title} />
                </div>
                <div className="en-passage">
                  {s.text
                    .split(/\n+/)
                    .filter((x) => x.trim())
                    .map((p, k) => (
                      <p key={k}>{p}</p>
                    ))}
                </div>
                {s.cn ? <div className="small muted">{s.cn}</div> : null}
                {s.cues?.length ? (
                  <div className="rubric">
                    <div className="rubric__title">朗读要点（重音 / 连读 / 语调）</div>
                    {s.cues.map((c, k) => (
                      <div className="rubric__item" key={k}>
                        <span className="rubric__mark">◆</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {s.tasks?.length ? (
                  <Accordion title={`听力任务（${s.tasks.length} 题）`} icon="🎯" defaultOpen>
                    <div className="stack stack--sm">
                      {s.tasks.map((q, k) => (
                        <div className="history-ask" key={q.id}>
                          <div className="history-ask__stem">
                            <span className="history-ask__no">{k + 1}</span>
                            <RichText text={q.stem} />
                          </div>
                          {q.options?.length ? (
                            <ul className="en-options">
                              {q.options.map((o, j) => (
                                <li key={j}>{o}</li>
                              ))}
                            </ul>
                          ) : null}
                          <div className="small muted" style={{ marginTop: 6 }}>
                            参考答案：{q.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Accordion>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 书面表达 */}
      {d.writing ? (
        <Section title="书面表达" icon="✍️">
          <div className="explain" style={{ marginTop: 0 }}>
            <div className="explain__title">📌 题目要求</div>
            <div style={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}>{d.writing.topic}</div>
          </div>
          {d.writing.requirements?.length ? (
            <div className="stack stack--sm" style={{ marginTop: 10 }}>
              {d.writing.requirements.map((r, i) => (
                <div className="note" key={i} style={{ display: 'block' }}>
                  <span className="note__word">{i + 1}</span>
                  <span className="note__text">{r}</span>
                </div>
              ))}
            </div>
          ) : null}

          {d.writing.usefulExpressions?.length ? (
            <div style={{ marginTop: 12 }}>
              <div className="explain__title">可套用的句型与连接词</div>
              <div className="row row--wrap" style={{ gap: 6, marginTop: 6 }}>
                {d.writing.usefulExpressions.map((u, i) => (
                  <Tag key={i} tone="purple">
                    {u}
                  </Tag>
                ))}
              </div>
            </div>
          ) : null}

          {d.writing.samples?.length ? (
            <div className="stack stack--lg" style={{ marginTop: 14 }}>
              {d.writing.samples.map((s, i) => (
                <div key={i}>
                  <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
                    <Tag tone="gold">{s.level}</Tag>
                    <span className="small muted">{englishWordCount(s.text)} 词左右</span>
                    <span className="spacer" />
                    <SpeakButton text={s.text} label="范读" />
                  </div>
                  <div className="en-passage" style={{ marginTop: 8 }}>
                    {s.text
                      .split(/\n+/)
                      .filter((x) => x.trim())
                      .map((p, k) => (
                        <p key={k}>{p}</p>
                      ))}
                  </div>
                  {s.cn ? (
                    <div className="small muted" style={{ marginTop: 6, lineHeight: 1.85 }}>
                      {s.cn}
                    </div>
                  ) : null}
                  <div className="explain" style={{ marginTop: 10 }}>
                    <div className="explain__title">📝 点评</div>
                    <div style={{ lineHeight: 1.85 }}>{s.comment}</div>
                  </div>
                  {s.highlights?.length ? (
                    <div className="stack stack--sm" style={{ marginTop: 10 }}>
                      {s.highlights.map((h, k) => (
                        <div className="sample-highlight" key={k}>
                          <div className="sample-highlight__sentence en-word">{h.sentence}</div>
                          <div className="sample-highlight__why">为什么好：{h.why}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* 应试策略 */}
      {d.examTips?.length ? (
        <Section title="应试策略" icon="🎯">
          <div className="stack stack--sm">
            {d.examTips.map((t, i) => (
              <div className="note" key={i} style={{ display: 'block' }}>
                <span className="note__word" style={{ color: 'var(--c-primary)' }}>
                  {i + 1}
                </span>
                <span className="note__text">{t}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </DetailShell>
  );
}
