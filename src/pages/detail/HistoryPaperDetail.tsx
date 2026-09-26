/**
 * 模拟卷详情：把「这套卷子考什么、怎么考、考多久」讲清楚，然后一键进入**整卷计时考试**。
 *
 * 与普通练习页的区别（也是它存在的理由）：
 *   普通练习是「做一题看一眼解析」，适合学新知识；
 *   整卷模拟是「60 分钟 70 分一口气做完，交卷才批改」，练的是**时间分配与整卷节奏**——
 *   这正是初三下学期最需要、而单题练习给不了的东西。
 */

import { Link } from 'react-router-dom';
import type { HistoryPaperEntry } from '../../types';
import { Tag } from '../../components/common';
import { RichText } from '../../components/RichText';
import { DetailShell, Section } from './DetailShell';

export function HistoryPaperDetail({
  entry,
  moduleName,
}: {
  entry: HistoryPaperEntry;
  moduleName: string;
}) {
  const p = entry.data;
  const choiceCount = p.questions.filter((q) => q.type === 'choice').length;
  const askCount = p.materials.reduce((n, m) => n + m.questions.length, 0);
  const scoreSum = p.sections.reduce((n, s) => n + s.score, 0);

  return (
    <DetailShell
      entry={entry}
      moduleName={moduleName}
      backTo="/s/history/hist-exam"
      subtitle={<span>{p.basis}</span>}
      tags={['模拟卷', '整卷计时', `${p.totalScore} 分`, `${p.duration} 分钟`]}
    >
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 10 }}>
          <Tag tone="gold">📝 整卷模拟</Tag>
          <span className="small muted">
            {p.totalScore} 分 · {p.duration} 分钟 · 选择 {choiceCount} 题 + 材料题 {p.materials.length} 组（
            {askCount} 问）
          </span>
          <span className="spacer" />
          <Link className="btn btn--primary" to={`/exam-run/${p.id}`}>
            ▶ 开始整卷考试
          </Link>
        </div>
        <div className="small muted" style={{ marginTop: 10, lineHeight: 1.8 }}>
          考试模式下**做完全卷才批改**：中途不给答案，可以随时返回修改；
          交卷后逐题给出正误、解析与得分，错题照常进入错题本。建议关掉计时器的手机提醒，按 60 分钟实战演练。
        </div>
      </section>

      <Section title="试卷结构" icon="📋" extra={<Tag tone="jade">按广州中考历史结构</Tag>}>
        <div className="table-wrap">
          <table className="table history-table">
            <thead>
              <tr>
                <th>题型</th>
                <th>题量</th>
                <th>分值</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              {p.sections.map((s) => (
                <tr key={s.name}>
                  <td className="history-table__item">{s.name}</td>
                  <td>
                    {s.count} 题{s.kind === 'material' ? `（${askCount} 问）` : ''}
                  </td>
                  <td>{s.score} 分</td>
                  <td>
                    {s.kind === 'choice'
                      ? '单项选择，覆盖各册主干知识与时序判断'
                      : '阅读材料，回答问题；按分值分点作答，用术语答题'}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="history-table__item">全卷</td>
                <td>
                  {choiceCount + p.materials.length} 题（{choiceCount + askCount} 问）
                </td>
                <td>{scoreSum} 分</td>
                <td>{p.duration} 分钟闭卷</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="small muted" style={{ marginTop: 10, lineHeight: 1.8 }}>
          依据：{p.basis} 若官方后续公布具体分值调整，以当年印发的试卷结构说明为准。
        </div>
      </Section>

      <Section title={`材料题预览（${p.materials.length} 组）`} icon="✍️">
        <div className="stack stack--lg">
          {p.materials.map((g, i) => (
            <div key={g.id}>
              <div className="history-compare__title">第 {i + 1} 题</div>
              <div className="history-material" style={{ marginTop: 8 }}>
                <div className="history-material__label">材料</div>
                <div className="history-material__text">
                  <RichText text={g.material} />
                </div>
              </div>
              <div className="stack stack--sm" style={{ marginTop: 8 }}>
                {g.questions.map((q, k) => (
                  <div className="history-ask" key={q.id}>
                    <div className="history-ask__stem">
                      <span className="history-ask__no">{k + 1}</span>
                      <RichText text={q.stem} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="row row--wrap" style={{ marginTop: 14 }}>
          <Link className="btn btn--primary" to={`/exam-run/${p.id}`}>
            ▶ 开始整卷考试（{p.duration} 分钟）
          </Link>
          <Link className="btn" to={`/practice/${entry.moduleId}/${entry.id}`}>
            ✍️ 只做单题练习（做完即看答案）
          </Link>
        </div>
      </Section>
    </DetailShell>
  );
}
