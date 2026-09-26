/**
 * 道德与法治详情页：按**备考八块**排布（与历史同一套骨架，标签按道法改）。
 *
 *   ① 主线一句话            —— 这一单元在讲什么、为什么中考重要
 *   ② 核心观点与考点分层     —— 可以**直接抄进答题卡**的规范表述，分重点/次重点/了解
 *   ③ 必背金句与答题术语     —— 道法给分靠规范表述，这一块是提分关键
 *   ④ 易错辨析              —— 权力/权利、法制/法治这类最爱考的概念混用
 *   ⑤ 关联与对比            —— 跨单元与概念对照，材料题的「比较」设问靠它
 *   ⑥ 时政热点与答题角度     —— 时政专题特有：事件 → 从哪几个教材考点切入
 *   ⑦ 命题角度与考法         —— 这一块中考怎么考
 *   ⑧ 材料大题              —— 广州中考非选择题形态：材料 + 设问 + 参考答案 + 踩分点
 *
 * 底部由 `DetailShell` 统一接上「关联学习 / 学一补多 / 课时导图 / 朗读」等通用能力。
 */

import { useMemo, useState } from 'react';
import type { HistoryLevel, HistoryMaterialGroup, PoliticsTopicEntry } from '../../types';
import { cn } from '../../lib/utils';
import { Tag } from '../../components/common';
import { RichText } from '../../components/RichText';
import { SpeakButton } from '../../components/SpeechBar';
import { DetailShell, Section } from './DetailShell';

const LEVEL_STYLE: Record<HistoryLevel, { tone: 'red' | 'gold' | 'default'; hint: string }> = {
  重点: { tone: 'red', hint: '必须能默写出来，材料题的主要得分点' },
  次重点: { tone: 'gold', hint: '要能再认与简述，选择题常考' },
  了解: { tone: 'default', hint: '背景知识，知道即可' },
};

const LEVELS: HistoryLevel[] = ['重点', '次重点', '了解'];

/** 材料大题：默认只露题目，点「看参考答案」再展开 */
function MaterialBlock({ group }: { group: HistoryMaterialGroup }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="stack stack--sm">
      <div className="history-material">
        <div className="history-material__label">材料</div>
        <div className="history-material__text">
          <RichText text={group.material} />
        </div>
      </div>

      {group.questions.map((q, i) => {
        const shown = open[q.id] ?? false;
        return (
          <div className="history-ask" key={q.id}>
            <div className="history-ask__stem">
              <span className="history-ask__no">{i + 1}</span>
              <RichText text={q.stem} />
            </div>
            {q.tags?.length ? (
              <div className="row row--wrap" style={{ marginTop: 6 }}>
                {q.tags.map((t) => (
                  <Tag key={t}>#{t}</Tag>
                ))}
              </div>
            ) : null}
            <div className="row row--wrap" style={{ marginTop: 8 }}>
              <button
                className={cn('btn btn--sm', shown ? 'btn--ghost' : 'btn--primary')}
                onClick={() => setOpen((o) => ({ ...o, [q.id]: !shown }))}
                aria-expanded={shown}
              >
                {shown ? '收起答案' : '看参考答案与踩分点'}
              </button>
              <SpeakButton text={q.stem} label={`第 ${i + 1} 问`} />
            </div>

            {shown ? (
              <div className="explain fade-in" style={{ marginTop: 10 }}>
                <div className="explain__title">📖 参考答案</div>
                <div style={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                  <RichText text={q.answer} />
                </div>
                {q.rubric?.length ? (
                  <div className="rubric">
                    <div className="rubric__title">踩分点（对照检查自己答到了几条）</div>
                    {q.rubric.map((r, k) => (
                      <div className="rubric__item" key={k}>
                        <span className="rubric__mark">◆</span>
                        <span>
                          <RichText text={r} />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="small muted" style={{ marginTop: 8 }}>
                  提示：把这段答案与踩分点对一遍，再回到「必背金句与答题术语」里找对应的规范表述——
                  道法材料题的分数就落在那几句术语上。
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function PoliticsDetail({
  entry,
  moduleName,
}: {
  entry: PoliticsTopicEntry;
  moduleName: string;
}) {
  const t = entry.data;
  const [onlyKey, setOnlyKey] = useState(false);

  const counts = useMemo(() => {
    const c: Record<HistoryLevel, number> = { 重点: 0, 次重点: 0, 了解: 0 };
    for (const p of t.points) c[p.level] += 1;
    return c;
  }, [t.points]);

  const pointsShown = onlyKey ? t.points.filter((p) => p.level === '重点') : t.points;
  const materialCount = t.materials?.reduce((n, m) => n + m.questions.length, 0) ?? 0;
  const isCurrent = entry.moduleId === 'pol-current';

  return (
    <DetailShell
      entry={entry}
      subjectId="politics"
      moduleName={moduleName}
      backTo={`/s/politics/${entry.moduleId}`}
      subtitle={<span>{t.unit}</span>}
      tags={['道德与法治', ...entry.tags.slice(0, 4)]}
    >
      {/* ① 主线 */}
      <section className="card card--pad history-mainline">
        <div className="history-mainline__label">这一条的主线</div>
        <div className="history-mainline__text">{t.mainline}</div>
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          <Tag tone="red">重点 {counts['重点']} 条</Tag>
          <Tag tone="gold">次重点 {counts['次重点']} 条</Tag>
          <Tag>了解 {counts['了解']} 条</Tag>
          {t.keySentences?.length ? <Tag tone="jade">必背金句 {t.keySentences.length} 句</Tag> : null}
          {t.hotspots?.length ? <Tag tone="purple">时政热点 {t.hotspots.length} 个</Tag> : null}
          {materialCount ? <Tag tone="blue">材料题 {materialCount} 问</Tag> : null}
        </div>
      </section>

      {/* ② 核心观点与考点分层 */}
      <Section
        title={`核心观点与考点分层（${t.points.length} 条）`}
        icon="📌"
        extra={
          <button
            className={cn('btn btn--sm', onlyKey && 'btn--primary')}
            onClick={() => setOnlyKey((v) => !v)}
            aria-pressed={onlyKey}
          >
            {onlyKey ? '显示全部层级' : `只看重点（${counts['重点']}）`}
          </button>
        }
      >
        <div className="small muted" style={{ marginBottom: 8 }}>
          下面这些句子是**可以直接写进答题卡**的规范表述，先记准，再谈理解。
        </div>
        <div className="stack stack--sm">
          {LEVELS.filter((lv) => pointsShown.some((p) => p.level === lv)).map((lv) => (
            <div className="history-level" key={lv}>
              <div className="history-level__head">
                <Tag tone={LEVEL_STYLE[lv].tone}>{lv}</Tag>
                <span className="small muted">{LEVEL_STYLE[lv].hint}</span>
              </div>
              <div className="stack stack--sm">
                {pointsShown
                  .filter((p) => p.level === lv)
                  .map((p, i) => (
                    <div className="history-point" key={`${lv}-${i}`}>
                      <div className="history-point__text">
                        <RichText text={p.text} />
                      </div>
                      {p.explain ? (
                        <div className="history-point__explain">怎么考/怎么答：{p.explain}</div>
                      ) : null}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ③ 必背金句 */}
      {t.keySentences?.length ? (
        <Section
          title="必背金句与答题术语"
          icon="💬"
          extra={<Tag tone="jade">材料题的分数落在这几句上</Tag>}
        >
          <div className="stack stack--sm">
            {t.keySentences.map((c, i) => (
              <div className="sample-highlight" key={i}>
                <div className="sample-highlight__sentence">{c}</div>
              </div>
            ))}
          </div>
          <div className="small muted" style={{ marginTop: 10 }}>
            用法：答题时先写金句（观点），再用材料里的事实作依据——「观点 + 材料」是道法材料题的标准结构。
          </div>
        </Section>
      ) : null}

      {/* ④ 易错辨析 */}
      {t.confusions?.length ? (
        <Section title="易错辨析（选择题与评析题最爱设的坑）" icon="⚠️">
          <div className="stack stack--sm">
            {t.confusions.map((c, i) => (
              <div className="history-confuse" key={i}>
                <div className="history-confuse__row">
                  <Tag tone="red">✘ 常见错误</Tag>
                  <span>{c.wrong}</span>
                </div>
                <div className="history-confuse__row">
                  <Tag tone="jade">✔ 正确理解</Tag>
                  <span>{c.right}</span>
                </div>
                <div className="small muted">为什么容易错：{c.why}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑤ 关联与对比 */}
      {t.compares?.length ? (
        <Section
          title={`关联与对比（${t.compares.length} 组）`}
          icon="🔀"
          extra={<span className="small muted">材料题的「比较」设问靠它</span>}
        >
          <div className="stack stack--lg">
            {t.compares.map((c, i) => (
              <div key={i}>
                <div className="history-compare__title">{c.title}</div>
                <div className="small muted" style={{ marginBottom: 8 }}>
                  {c.aspect}
                </div>
                <div className="table-wrap">
                  <table className="table history-table">
                    <thead>
                      <tr>
                        <th>比较项</th>
                        <th>{c.left}</th>
                        <th>{c.right}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.rows.map((r, k) => (
                        <tr key={k}>
                          <td className="history-table__item">{r.item}</td>
                          <td>{r.left}</td>
                          <td>{r.right}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑥ 时政热点（时政专题条目） */}
      {t.hotspots?.length ? (
        <Section
          title={`时政热点与答题角度（${t.hotspots.length} 个）`}
          icon="📰"
          extra={isCurrent ? <Tag tone="purple">时政专题</Tag> : null}
        >
          <div className="stack stack--lg">
            {t.hotspots.map((h, i) => (
              <div key={i}>
                <div className="history-compare__title">{h.event}</div>
                <div className="small muted" style={{ margin: '6px 0 10px', lineHeight: 1.85 }}>
                  {h.background}
                </div>
                <div className="stack stack--sm">
                  {h.angles.map((a, k) => (
                    <div className="history-angle" key={k}>
                      <div className="history-angle__head">
                        <Tag tone="blue">{a.angle}</Tag>
                        <span className="small muted">{a.point}</span>
                      </div>
                      <div className="history-angle__detail">{a.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑦ 命题角度 */}
      {t.examAngles?.length ? (
        <Section
          title="命题角度与考法"
          icon="📊"
          extra={<span className="small muted">按考点整理，供复习时对号入座</span>}
        >
          <div className="stack stack--sm">
            {t.examAngles.map((a, i) => (
              <div className="history-angle" key={i}>
                <div className="history-angle__head">
                  <Tag tone="purple">{a.angle}</Tag>
                  {a.years ? <span className="small muted">{a.years}</span> : null}
                </div>
                <div className="history-angle__detail">{a.detail}</div>
              </div>
            ))}
          </div>
          <div className="small muted" style={{ marginTop: 10 }}>
            说明：以上是依据课标、教材与命题方向整理的**复习研判**，不是官方统计。
            做题时以官方公布的考试说明与当年时政为准。
          </div>
        </Section>
      ) : null}

      {/* ⑧ 材料大题 */}
      {t.materials?.length ? (
        <Section
          title={`材料大题（${t.materials.length} 组 · ${materialCount} 问）`}
          icon="✍️"
          extra={<Tag tone="gold">广州中考非选择题形态</Tag>}
        >
          <div className="stack stack--lg">
            {t.materials.map((g) => (
              <MaterialBlock group={g} key={g.id} />
            ))}
          </div>
        </Section>
      ) : null}
    </DetailShell>
  );
}
