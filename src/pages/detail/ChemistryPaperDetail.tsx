/**
 * 化学模拟卷详情：卷面结构说明 + 一键开始整卷考试。
 *
 * 化学的卷面与其它科目都不同：**70 分 = 笔试 60 分（60 分钟）+ 实验操作考试 10 分**，
 * 笔试是**选择 12 小题 × 2 分 = 24 分 + 非选择 5 小题 36 分**。
 * 也就是说非选择题占了六成，且每题 5—9 分——分数大头在化学用语、实验探究与计算，
 * 这一点要在页面上说清楚，否则学生会按「选择题刷分」的思路复习化学。
 */

import { Link } from 'react-router-dom';
import type { ChemPaperEntry } from '../../types';
import { Tag } from '../../components/common';
import { RichText } from '../../components/RichText';
import { PhysicsFigureView } from '../../components/PhysicsFigure';
import { DetailShell, Section } from './DetailShell';

export function ChemistryPaperDetail({ entry, moduleName }: { entry: ChemPaperEntry; moduleName: string }) {
  const p = entry.data;
  const choiceCount = p.questions.filter((q) => q.type === 'choice').length;
  const askCount = p.materials.reduce((n, m) => n + m.questions.length, 0);
  const perGroup = p.materials.length ? p.sections.find((s) => s.kind === 'material')!.score / p.materials.length : 0;

  return (
    <DetailShell
      entry={entry}
      subjectId="chemistry"
      moduleName={moduleName}
      backTo="/s/chemistry/chem-exam"
      subtitle={<span>{p.basis}</span>}
      tags={['模拟卷', '整卷计时', `${p.totalScore} 分`, `${p.duration} 分钟`]}
    >
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 10 }}>
          <Tag tone="gold">📝 整卷模拟</Tag>
          <span className="small muted">
            笔试 {p.totalScore} 分 · {p.duration} 分钟 · 选择 {choiceCount} 题 + 非选择题 {p.materials.length} 组（
            {askCount} 问）
          </span>
          <span className="spacer" />
          <Link className="btn btn--primary" to={`/exam-run/${p.id}?start=1`}>
            ▶ 开始整卷考试
          </Link>
        </div>
        <div className="small muted" style={{ marginTop: 10, lineHeight: 1.85 }}>
          考试模式下**做完全卷才批改**：中途不给答案，可以随时返回修改；交卷后逐题给出正误与解析。
          化学的时间分配建议：12 道选择题约 12 分钟，5 道非选择题每组 8—9 分钟，
          最后留 3—5 分钟专门检查**化学用语**（下标、条件、配平、沉淀与气体符号）——这几处错一处就扣一处。
          <br />
          另有**实验操作考试 10 分**（另场进行）：见「实验操作与气体制备」模块的基本操作与评分要点。
        </div>
      </section>

      <Section title="试卷结构" icon="📋" extra={<Tag tone="jade">按 2027—2029 广州中考化学结构</Tag>}>
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
                      ? '每题 2 分，四选一'
                      : `每小题约 ${Math.round(perGroup)} 分：化学用语 / 实验探究 / 计算`}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="history-table__item">全卷</td>
                <td>{p.sections.reduce((n, s) => n + s.count, 0)} 题</td>
                <td>{p.totalScore} 分</td>
                <td>{p.duration} 分钟闭卷笔试（不含实验操作 10 分）</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="small muted" style={{ marginTop: 8 }}>
          依据：广州市教育局《2027—2029 年广州市初中学业水平考试录取计分科目考试实施方案》
          （穗教规字〔2025〕1 号）：化学 70 分（含实验操作 10 分），笔试 60 分、60 分钟；
          选择题 12 小题 24 分，非选择题 5 小题 36 分。**非选择题占六成**，是这一科的主战场。
        </div>
      </Section>

      <Section title="非选择题预览" icon="✍️">
        <div className="history-materials">
          {p.materials.map((g) => (
            <div key={g.id} className="history-material">
              <div className="history-material__body">
                {g.material.split('\n').map((line, i) => (
                  <p key={i} className="history-material__line">
                    {line}
                  </p>
                ))}
              </div>
              <ol className="history-material__asks">
                {g.questions.map((q) => (
                  <li key={q.id} className="history-ask">
                    <div className="history-ask__stem">{q.stem}</div>
                    {q.figure ? <PhysicsFigureView figure={q.figure} className="physics-quizFig" /> : null}
                    <details className="history-ask__ref">
                      <summary>看参考答案与踩分点</summary>
                      {q.answerFigure ? (
                        <div className="physics-answerFig">
                          <PhysicsFigureView figure={q.answerFigure} />
                        </div>
                      ) : null}
                      <div className="history-ask__answer">
                        <RichText text={q.answer} />
                      </div>
                      {q.answerSteps?.length ? (
                        <div className="physics-steps">
                          <div className="physics-steps__title">规范解题步骤</div>
                          <ol>
                            {q.answerSteps.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ol>
                        </div>
                      ) : null}
                      {q.rubric?.length ? (
                        <ul className="history-ask__rubric">
                          {q.rubric.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      ) : null}
                    </details>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </Section>
    </DetailShell>
  );
}
