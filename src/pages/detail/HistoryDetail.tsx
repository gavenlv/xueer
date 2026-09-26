/**
 * 历史详情页：一条内容 = 一个单元或一个中考专题。
 *
 * 页面按**备考顺序**排布，而不是按「知识点罗列」排布：
 *
 *   ① 主线一句话 + 时段          —— 先立骨架
 *   ② ⏳ 时空坐标（时间轴）       —— 时序观念，中考选择题的高频考法
 *   ③ 📌 考点分层（重点/次重点/了解）—— 复习先分主次，可以只看重点
 *   ④ 🧠 必背结论与答题术语       —— 材料题直接能用的句子
 *   ⑤ ⚠️ 易错易混               —— 命题人最爱设的陷阱
 *   ⑥ 🔀 关联与对比（表格）       —— 跨册/中外对比，大题的核心能力
 *   ⑦ 📊 命题角度与考法研判       —— 这一块中考怎么考
 *   ⑧ ✍️ 材料大题（阅读材料，回答问题）—— 广州中考非选择题的真题形态
 *
 * 底部由 `DetailShell` 统一接上「关联学习 / 学一补多 / 课时导图 / 朗读」等通用能力。
 */

import { useMemo, useState } from 'react';
import type { HistoryLevel, HistoryMaterialGroup, HistoryTopicEntry } from '../../types';
import { cn } from '../../lib/utils';
import { Tag } from '../../components/common';
import { RichText } from '../../components/RichText';
import { SpeakButton } from '../../components/SpeechBar';
import { DetailShell, Section } from './DetailShell';

/** 考点层级的配色与说明：复习时一眼能分出主次 */
const LEVEL_STYLE: Record<HistoryLevel, { tone: 'red' | 'gold' | 'default'; hint: string }> = {
  重点: { tone: 'red', hint: '必须会背会写，材料题主要得分点' },
  次重点: { tone: 'gold', hint: '要能再认与简述，选择题常考' },
  了解: { tone: 'default', hint: '背景知识，知道即可' },
};

const LEVELS: HistoryLevel[] = ['重点', '次重点', '了解'];

/** 材料大题：默认只露出题目，点「看参考答案」再展开 */
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
                  提示：把这段答案与踩分点对一遍，再回到「必背结论」里找对应的术语——
                  历史材料题的得分点就是这些术语。
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function HistoryDetail({
  entry,
  moduleName,
}: {
  entry: HistoryTopicEntry;
  moduleName: string;
}) {
  const t = entry.data;
  /** 「只看重点」：总复习时最常用的一档，默认关闭 */
  const [onlyKey, setOnlyKey] = useState(false);

  const counts = useMemo(() => {
    const c: Record<HistoryLevel, number> = { 重点: 0, 次重点: 0, 了解: 0 };
    for (const p of t.points) c[p.level] += 1;
    return c;
  }, [t.points]);

  const pointsShown = onlyKey ? t.points.filter((p) => p.level === '重点') : t.points;
  const materialCount = t.materials?.reduce((n, m) => n + m.questions.length, 0) ?? 0;
  const isTopic = entry.moduleId === 'hist-topics';

  return (
    <DetailShell
      entry={entry}
      moduleName={moduleName}
      backTo={`/s/history/${entry.moduleId}`}
      subtitle={
        <span>
          {t.period}
          {t.unit ? ` · ${t.unit}` : ''} · {isTopic ? '中考专题（跨册串联）' : '教材单元'}
        </span>
      }
      tags={['历史', ...entry.tags.slice(0, 4)]}
    >
      {/* 一句话主线：先立骨架 */}
      <section className="card card--pad history-mainline">
        <div className="history-mainline__label">这一条的主线</div>
        <div className="history-mainline__text">{t.mainline}</div>
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          <Tag tone="blue">{t.timeline.length} 个时间节点</Tag>
          <Tag tone="red">重点 {counts['重点']} 条</Tag>
          <Tag tone="gold">次重点 {counts['次重点']} 条</Tag>
          <Tag>了解 {counts['了解']} 条</Tag>
          {materialCount ? <Tag tone="purple">材料题 {materialCount} 问</Tag> : null}
        </div>
      </section>

      {/* 时空坐标 */}
      <Section
        title="时空坐标（时间轴）"
        icon="⏳"
        extra={<span className="small muted">时序是历史选择题的第一考点</span>}
      >
        <ol className="history-timeline">
          {t.timeline.map((p, i) => (
            <li className={cn('history-timeline__item', p.key && 'is-key')} key={`${p.time}-${i}`}>
              <span className="history-timeline__time">{p.time}</span>
              <span className="history-timeline__dot" />
              <span className="history-timeline__body">
                <span className="history-timeline__event">{p.event}</span>
                {p.note ? <span className="history-timeline__note">{p.note}</span> : null}
              </span>
              <SpeakButton text={`${p.time}，${p.event}${p.note ? `。${p.note}` : ''}`} label={p.time} />
            </li>
          ))}
        </ol>
      </Section>

      {/* 考点分层 */}
      <Section
        title={`考点分层（共 ${t.points.length} 条）`}
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
                        <div className="history-point__explain">为什么/怎么答：{p.explain}</div>
                      ) : null}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 必背结论 */}
      {t.conclusions?.length ? (
        <Section title="必背结论与答题术语" icon="🧠" extra={<Tag tone="jade">材料题直接用</Tag>}>
          <div className="stack stack--sm">
            {t.conclusions.map((c, i) => (
              <div className="note" key={i} style={{ display: 'block' }}>
                <span className="note__word" style={{ color: 'var(--c-primary)' }}>
                  {i + 1}
                </span>
                <span className="note__text">
                  <RichText text={c} />
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 易错易混 */}
      {t.confusions?.length ? (
        <Section title="易错易混（命题人爱在这里设陷阱）" icon="⚠️">
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

      {/* 关联与对比 */}
      {t.compares?.length ? (
        <Section
          title={`关联与对比（${t.compares.length} 组）`}
          icon="🔀"
          extra={<span className="small muted">中考大题的核心能力：比较与联系</span>}
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

      {/* 命题角度与考情 */}
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
            说明：以上是依据课标、教材与近年命题方向整理的**复习研判**，不是官方统计。
            做题时以官方公布的考试说明与真题为准。
          </div>
        </Section>
      ) : null}

      {/* 材料大题 */}
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
