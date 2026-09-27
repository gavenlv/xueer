/**
 * 物理模拟卷详情：卷面结构 + 实验操作说明 + 一键进入整卷计时考试。
 *
 * 与历史/道法的试卷详情同一套骨架，差别在物理的**卷面结构不同**：
 * 物理 100 分 = 笔试 90 分（选择 10×3 + 非选择 6 小题 60 分）+ 实验操作 10 分（另场），
 * 笔试 60 分钟，非选择题按「解答与计算 / 探究与实验 / 阅读与理解」三类命题。
 */

import { Link } from 'react-router-dom';
import type { PhysicsPaperEntry } from '../../types';
import { Tag } from '../../components/common';
import { RichText } from '../../components/RichText';
import { PhysicsFigureView } from '../../components/PhysicsFigure';
import { DetailShell, Section } from './DetailShell';

export function PhysicsPaperDetail({ entry, moduleName }: { entry: PhysicsPaperEntry; moduleName: string }) {
  const p = entry.data;
  const choiceCount = p.questions.filter((q) => q.type === 'choice').length;
  const askCount = p.materials.reduce((n, m) => n + m.questions.length, 0);

  return (
    <DetailShell
      entry={entry}
      subjectId="physics"
      moduleName={moduleName}
      backTo="/s/physics/phy-exam"
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
          物理的时间压力主要来自计算与「阅读与理解」题的信息提取，建议先做选择（10 题约 12 分钟），
          再按「解答与计算 → 探究与实验 → 阅读与理解」的顺序推进，最后留 5 分钟复查单位与有效数字。
          <br />
          另有**实验操作考试 10 分**（另场进行）：见「实验操作考试」模块的必做实验与评分要点。
        </div>
      </section>

      <Section title="试卷结构" icon="📋" extra={<Tag tone="jade">按 2027—2029 广州中考物理结构</Tag>}>
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
                    {s.kind === 'choice' ? '每题 3 分，四选一' : '解答与计算 / 探究与实验 / 阅读与理解'}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="history-table__item">全卷</td>
                <td>
                  {p.sections.reduce((n, s) => n + s.count, 0)} 题
                </td>
                <td>{p.totalScore} 分</td>
                <td>{p.duration} 分钟闭卷笔试（不含实验操作 10 分）</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="small muted" style={{ marginTop: 8 }}>
          依据：广州市教育局《2027—2029 年广州市初中学业水平考试录取计分科目考试实施方案》
          （穗教规字〔2025〕1 号）及官方解读。
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
                      {/* 作图小题的标准作图：先自己画，再展开对照 */}
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
