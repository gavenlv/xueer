/**
 * 化学知识点详情页。
 *
 * 化学的讲解按**三重表征**排（宏观现象 → 微观解释 → 符号表达 → 应用），
 * 这是化学教学里公认的框架：学生「会背不会用」，几乎都是在三种表达之间断了链。
 * 所以这一页与物理那份的区别就在两处：
 *
 *   ① 理解过程每一步都标出它属于哪一重表征（`representation`），让学生看到三种表达怎么互相对应；
 *   ② 化学特有的两块内容单独成节：**化学方程式**（含条件、现象、配平要点）与
 *      **实验**（目的、器材、装置图、步骤、现象、结论、注意事项）。
 *
 * 掌握判定与物理一致：**这个知识点的每一道题都过关才算掌握**（见 lib/progress.ts）。
 */

import { useMemo } from 'react';
import type { ChemTopicEntry, HistoryMaterialGroup } from '../../types';
import { Tag } from '../../components/common';
import { RichText } from '../../components/RichText';
import { PhysicsFigureView } from '../../components/PhysicsFigure';
import { useStudy } from '../../store/StudyContext';
import { isMastered, passedCount, progressLabel } from '../../lib/progress';
import { DetailShell, Section } from './DetailShell';

/** 三重表征的配色与说明（宏观看现象、微观看粒子、符号看式子） */
const REP_TONE: Record<string, 'blue' | 'jade' | 'gold' | 'purple'> = {
  宏观: 'blue',
  微观: 'jade',
  符号: 'gold',
  应用: 'purple',
};

function MaterialBlock({ group }: { group: HistoryMaterialGroup }) {
  return (
    <div className="history-material">
      <div className="history-material__body">
        {group.material.split('\n').map((line, i) => (
          <p key={i} className="history-material__line">
            {line}
          </p>
        ))}
      </div>
      <ol className="history-material__asks">
        {group.questions.map((q) => (
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
              {q.explanation ? (
                <div className="small muted" style={{ marginTop: 6, lineHeight: 1.75 }}>
                  <RichText text={q.explanation} />
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
  );
}

export function ChemistryDetail({ entry, moduleName }: { entry: ChemTopicEntry; moduleName: string }) {
  const t = entry.data;
  const { state } = useStudy();

  const questionIds = useMemo(() => entry.questions.map((q) => q.id), [entry.questions]);
  const done = passedCount(questionIds, state.passed);
  const mastered = isMastered({
    moduleId: entry.moduleId,
    progress: state.progress[entry.id],
    passed: state.passed,
    questionIds,
  });
  const unpassed = questionIds.filter((id) => !state.passed?.[id]);
  const pct = questionIds.length ? Math.round((done / questionIds.length) * 100) : 0;

  const typeCount = useMemo(() => {
    const c = { choice: 0, fill: 0, short: 0 };
    for (const q of entry.questions) if (q.type in c) c[q.type as keyof typeof c] += 1;
    return c;
  }, [entry.questions]);

  return (
    <DetailShell
      entry={entry}
      subjectId="chemistry"
      moduleName={moduleName}
      backTo={`/s/chemistry/${entry.moduleId}`}
      subtitle={<span>{t.unit}</span>}
      tags={['化学', ...entry.tags.slice(0, 4)]}
    >
      {/* ① 问题与关键 */}
      <section className="card card--pad physics-head">
        <div className="physics-head__q">
          <span className="physics-head__badge">要解决的问题</span>
          <span className="physics-head__text">{t.question}</span>
        </div>
        <div className="physics-head__idea">
          <span className="physics-head__badge">理解的关键</span>
          <span className="physics-head__text">
            <RichText text={t.keyIdea} />
          </span>
        </div>
        <div className="physics-head__meter">
          <div className="physics-head__meterRow">
            <span className="small muted">
              {mastered ? '🎉 已掌握（本知识点全部题目都过关）' : '全部题目都过关才算掌握'}
            </span>
            <span className="small">
              {progressLabel({
                moduleId: entry.moduleId,
                progress: state.progress[entry.id],
                passed: state.passed,
                questionIds,
              })}
            </span>
          </div>
          <div
            className="physics-head__bar"
            role="progressbar"
            aria-valuenow={done}
            aria-valuemin={0}
            aria-valuemax={questionIds.length}
          >
            <span className="physics-head__fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          <Tag tone="blue">理解 {t.steps.length} 步</Tag>
          {t.equations?.length ? <Tag tone="gold">方程式 {t.equations.length} 个</Tag> : null}
          {t.experiments?.length ? <Tag tone="jade">实验 {t.experiments.length} 个</Tag> : null}
          <Tag tone="purple">
            练习 {entry.questions.length} 道（选择 {typeCount.choice} · 填空 {typeCount.fill} · 解答 {typeCount.short}）
          </Tag>
        </div>
      </section>

      {/* ② 理解过程（三重表征） */}
      <Section title={`理解过程（${t.steps.length} 步 · 宏观 → 微观 → 符号）`} icon="🧭">
        <div className="small muted" style={{ marginBottom: 8 }}>
          化学的同一个事实有三种说法：看得见的<strong>现象</strong>、看不见的<strong>粒子</strong>、
          写出来的<strong>符号</strong>。每一步都标出它属于哪一重，对着看就不容易断链。
        </div>
        <ol className="physics-stepsList">
          {t.steps.map((s, i) => (
            <li key={i} className="physics-step">
              <div className="physics-step__head">
                <span className="physics-step__no">{i + 1}</span>
                <span className="physics-step__title">{s.heading}</span>
                {s.representation ? (
                  <Tag tone={REP_TONE[s.representation] ?? 'blue'}>{s.representation}</Tag>
                ) : null}
              </div>
              <div className="physics-step__body">
                <RichText text={s.body} />
              </div>
              {s.figure ? <PhysicsFigureView figure={s.figure} /> : null}
              {s.note ? <div className="physics-step__note">⚠️ {s.note}</div> : null}
            </li>
          ))}
        </ol>
      </Section>

      {/* ③ 化学方程式 */}
      {t.equations?.length ? (
        <Section title={`化学方程式（${t.equations.length} 个）`} icon="🧪">
          <div className="chem-equations">
            {t.equations.map((e, i) => (
              <div key={i} className="chem-equation">
                <div className="chem-equation__eq">{e.equation}</div>
                {e.condition ? <div className="chem-equation__cond">反应条件：{e.condition}</div> : null}
                <div className="chem-equation__row">
                  <span className="chem-equation__tag">现象</span>
                  <span>{e.phenomenon}</span>
                </div>
                {e.note ? (
                  <div className="chem-equation__row chem-equation__row--note">
                    <span className="chem-equation__tag">配平与易错</span>
                    <span>{e.note}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ④ 实验 */}
      {t.experiments?.length ? (
        <Section title={`实验（${t.experiments.length} 个）`} icon="🔬">
          <div className="chem-experiments">
            {t.experiments.map((ex, i) => (
              <div key={i} className="chem-experiment">
                <div className="chem-experiment__title">{ex.title}</div>
                <div className="chem-experiment__purpose">
                  <span className="chem-equation__tag">目的</span>
                  {ex.purpose}
                </div>
                <div className="chem-experiment__apparatus">
                  <span className="chem-equation__tag">器材与药品</span>
                  {ex.apparatus.join('、')}
                </div>
                {ex.figure ? <PhysicsFigureView figure={ex.figure} /> : null}
                <ol className="physics-app__steps">
                  {ex.steps.map((s, k) => (
                    <li key={k}>
                      <RichText text={s} />
                    </li>
                  ))}
                </ol>
                <div className="physics-app__model">
                  <span className="physics-app__tag">现象</span>
                  <RichText text={ex.phenomenon} />
                </div>
                <div className="physics-app__result">
                  <span className="physics-app__tag">结论</span>
                  <RichText text={ex.conclusion} />
                </div>
                {ex.cautions?.length ? (
                  <div className="chem-experiment__cautions">
                    <div className="chem-experiment__cautionsTitle">⚠️ 注意事项（中考必考）</div>
                    <ul>
                      {ex.cautions.map((c, k) => (
                        <li key={k}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑤ 应用 */}
      <Section title={`应用：从情境到化学表达（${t.apps.length} 例）`} icon="🔧">
        <div className="physics-apps">
          {t.apps.map((a, i) => (
            <div key={i} className="physics-app">
              <div className="physics-app__title">{a.title}</div>
              <div className="physics-app__scene">{a.scene}</div>
              {a.figure ? <PhysicsFigureView figure={a.figure} /> : null}
              <div className="physics-app__model">
                <span className="physics-app__tag">化学视角</span>
                <RichText text={a.analysis} />
              </div>
              <ol className="physics-app__steps">
                {a.steps.map((s, k) => (
                  <li key={k}>
                    <RichText text={s} />
                  </li>
                ))}
              </ol>
              <div className="physics-app__result">
                <span className="physics-app__tag">结论</span>
                <RichText text={a.result} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ⑥ 计算关系与化学用语规则 */}
      {t.formulas?.length ? (
        <Section title="计算关系与书写规则（知道什么时候能用，比背下来更重要）" icon="🧮">
          <div className="physics-formulas">
            {t.formulas.map((f, i) => (
              <div key={i} className="physics-formula">
                <div className="physics-formula__name">{f.name}</div>
                <div className="physics-formula__tex">
                  <RichText text={f.tex ? `$${f.tex}$` : (f.text ?? '')} />
                </div>
                {f.units ? <div className="physics-formula__units">{f.units}</div> : null}
                <div className="physics-formula__usage">
                  <span className="physics-formula__usageTag">适用范围</span>
                  <RichText text={f.usage} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑦ 易错与对比 */}
      {t.confusions?.length ? (
        <Section title="易错辨析（选择题最爱设的坑）" icon="⚠️">
          <div className="history-confusions">
            {t.confusions.map((c, i) => (
              <div key={i} className="history-confusion">
                <div className="history-confusion__row history-confusion__row--wrong">
                  <span className="history-confusion__mark">✘</span>
                  <span>{c.wrong}</span>
                </div>
                <div className="history-confusion__row history-confusion__row--right">
                  <span className="history-confusion__mark">✔</span>
                  <span>{c.right}</span>
                </div>
                <div className="history-confusion__why">为什么容易错：{c.why}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {t.compares?.length ? (
        <Section title="关联与对比" icon="🔀">
          <div className="history-compares">
            {t.compares.map((c, i) => (
              <div key={i} className="history-compare">
                <div className="history-compare__title">
                  {c.title}
                  <span className="history-compare__aspect">{c.aspect}</span>
                </div>
                <table className="table history-table">
                  <thead>
                    <tr>
                      <th>对比项</th>
                      <th>{c.left}</th>
                      <th>{c.right}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.rows.map((r, k) => (
                      <tr key={k}>
                        <td className="history-table__item">{r.item}</td>
                        <td>
                          <RichText text={r.left} />
                        </td>
                        <td>
                          <RichText text={r.right} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑧ 命题角度 */}
      {t.examAngles?.length ? (
        <Section title="命题角度与考法" icon="📊">
          <div className="small muted" style={{ marginBottom: 8 }}>
            以下为复习研判（依据官方卷面结构与近年常见考法整理），不是官方考频统计。
          </div>
          <div className="history-angles">
            {t.examAngles.map((a, i) => (
              <div key={i} className="history-angle">
                <div className="history-angle__name">{a.angle}</div>
                <div className="history-angle__detail">{a.detail}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑨ 综合题 */}
      {t.materials?.length ? (
        <Section title="综合题（化学用语 · 实验探究 · 计算）" icon="✍️">
          <div className="history-materials">
            {t.materials.map((g) => (
              <MaterialBlock key={g.id} group={g} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑩ 练习与过关清单 */}
      <Section
        title={`练习与过关清单（${done}/${questionIds.length} 已过关）`}
        icon="🎯"
        extra={
          <div className="row row--wrap">
            {unpassed.length ? (
              <a className="btn btn--sm btn--primary" href={`#/practice/${entry.moduleId}?ids=${unpassed.slice(0, 40).join(',')}`}>
                只练没过的 {unpassed.length} 题
              </a>
            ) : null}
            <a className="btn btn--sm" href={`#/practice/${entry.moduleId}?item=${entry.id}`}>
              练这个知识点
            </a>
          </div>
        }
      >
        <div className="small muted" style={{ marginBottom: 8 }}>
          化学的掌握标准是**这个知识点的每一道题都答对过**：化学用语写错、条件漏写、计算单位错，
          都会在下面的清单里留下一个没过的圈。
        </div>
        <ol className="physics-quizList">
          {entry.questions.map((q, i) => {
            const ok = Boolean(state.passed?.[q.id]);
            return (
              <li key={q.id} className={`physics-quizItem${ok ? ' physics-quizItem--ok' : ''}`}>
                <span className="physics-quizItem__mark">{ok ? '✔' : '○'}</span>
                <span className="physics-quizItem__no">{i + 1}</span>
                <span className="physics-quizItem__stem">{q.stem}</span>
                <span className="physics-quizItem__meta">
                  {q.type === 'choice' ? '选择' : q.type === 'fill' ? '填空' : '解答'}
                  {q.figure ? ' · 有图' : ''}
                </span>
              </li>
            );
          })}
        </ol>
      </Section>
    </DetailShell>
  );
}
