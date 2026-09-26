/**
 * 道法模拟卷详情：结构说明 + 一键进入整卷计时考试。
 *
 * 与历史那份试卷详情同一套（道法与历史的卷面结构相似：选择 + 「阅读材料，回答问题」），
 * 差别在于道法的非选择题分值更高（3 小题 36 分，占全卷一半以上），
 * 所以页面上把「材料题怎么拿分」写清楚。
 */

import { Link } from 'react-router-dom';
import type { PoliticsPaperEntry } from '../../types';
import { Tag } from '../../components/common';
import { RichText } from '../../components/RichText';
import { DetailShell, Section } from './DetailShell';

export function PoliticsPaperDetail({
  entry,
  moduleName,
}: {
  entry: PoliticsPaperEntry;
  moduleName: string;
}) {
  const p = entry.data;
  const choiceCount = p.questions.filter((q) => q.type === 'choice').length;
  const askCount = p.materials.reduce((n, m) => n + m.questions.length, 0);
  const scoreSum = p.sections.reduce((n, s) => n + s.score, 0);

  return (
    <DetailShell
      entry={entry}
      subjectId="politics"
      moduleName={moduleName}
      backTo="/s/politics/pol-exam"
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
        <div className="small muted" style={{ marginTop: 10, lineHeight: 1.85 }}>
          考试模式下**做完全卷才批改**：中途不给答案，可以随时返回修改；交卷后逐题给出正误、
          解析与得分，错题照常进入错题本。道法的非选择题占 36 分（一半以上），
          答题时按「观点（规范表述）+ 材料依据 + 结论」的结构写，比堆字数有效得多。
        </div>
      </section>

      <Section title="试卷结构" icon="📋" extra={<Tag tone="jade">按 2027—2029 广州中考道法结构</Tag>}>
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
                  <td>{s.count} 题{s.kind === 'material' ? `（${askCount} 问）` : ''}</td>
                  <td>{s.score} 分</td>
                  <td>
                    {s.kind === 'choice'
                      ? '单项选择，覆盖成长、道德、法治、国情四大板块'
                      : '阅读材料，回答问题；按分值分点，用教材规范表述作答'}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="history-table__item">全卷</td>
                <td>{choiceCount + p.materials.length} 题（{choiceCount + askCount} 问）</td>
                <td>{scoreSum} 分</td>
                <td>{p.duration} 分钟闭卷</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="small muted" style={{ marginTop: 10, lineHeight: 1.85 }}>
          依据：{p.basis} 道法与历史同场分卷、均为闭卷，各 60 分钟。
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
