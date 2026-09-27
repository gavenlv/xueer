/**
 * 物理知识点详情页。
 *
 * 与历史/道法那两个「应试型」渲染器不同，这里按**理科的理解顺序**排：
 *
 *   ① 问题与关键    —— 这一节要回答什么、理解的关键在哪（不从定义切入）
 *   ② 理解过程      —— 分步讲解，每步配图（图不是装饰：把文字讲不清的关系画出来）
 *   ③ 公式与适用条件 —— 每个公式都写清「什么时候能用」，只背公式是学不会物理的
 *   ④ 应用          —— 情境 → 物理模型 → 规范步骤 → 结论（含计算）
 *   ⑤ 易错与对比    —— 概念边界、条件对照
 *   ⑥ 综合题        —— 中考非选择题形态（解答与计算 / 探究与实验 / 阅读与理解）
 *   ⑦ 练习与过关清单 —— **这个知识点的每一道题都过关才算掌握**：
 *                       学生在这里看到「过关 5/8」，还能一键只练没过的题
 */

import { useMemo } from 'react';
import type { HistoryMaterialGroup, PhysicsTopicEntry } from '../../types';
import { Tag } from '../../components/common';
import { RichText } from '../../components/RichText';
import { PhysicsFigureView } from '../../components/PhysicsFigure';
import { useStudy } from '../../store/StudyContext';
import { isMastered, passedCount, progressLabel } from '../../lib/progress';
import { DetailShell, Section } from './DetailShell';

/** 综合题的一组材料与设问（与历史/道法同一套数据结构） */
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
            <details className="history-ask__ref">
              <summary>看参考答案与踩分点</summary>
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
  );
}

export function PhysicsDetail({ entry, moduleName }: { entry: PhysicsTopicEntry; moduleName: string }) {
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

  /** 只练没过关的题：复用练习页的 ?ids= 入口（与错题重做同一条路径） */
  const practiceUnpassedHref = `/practice/${entry.moduleId}?ids=${unpassed.slice(0, 40).join(',')}`;

  const typeCount = useMemo(() => {
    const c = { choice: 0, fill: 0, short: 0 };
    for (const q of entry.questions) if (q.type in c) c[q.type as keyof typeof c] += 1;
    return c;
  }, [entry.questions]);

  return (
    <DetailShell
      entry={entry}
      subjectId="physics"
      moduleName={moduleName}
      backTo={`/s/physics/${entry.moduleId}`}
      subtitle={<span>{t.unit}</span>}
      tags={['物理', ...entry.tags.slice(0, 4)]}
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
              {progressLabel({ moduleId: entry.moduleId, progress: state.progress[entry.id], passed: state.passed, questionIds })}
            </span>
          </div>
          <div className="physics-head__bar" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={questionIds.length}>
            <span className="physics-head__fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          <Tag tone="blue">理解 {t.steps.length} 步</Tag>
          <Tag tone="jade">应用 {t.apps.length} 例</Tag>
          {t.formulas?.length ? <Tag tone="gold">公式 {t.formulas.length} 条</Tag> : null}
          <Tag tone="purple">练习 {entry.questions.length} 道（选择 {typeCount.choice} · 填空 {typeCount.fill} · 解答 {typeCount.short}）</Tag>
        </div>
      </section>

      {/* ② 理解过程（图文并茂） */}
      <Section title={`理解过程（${t.steps.length} 步）`} icon="🧭">
        <ol className="physics-stepsList">
          {t.steps.map((s, i) => (
            <li key={i} className="physics-step">
              <div className="physics-step__head">
                <span className="physics-step__no">{i + 1}</span>
                <span className="physics-step__title">{s.heading}</span>
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

      {/* ③ 公式与适用条件 */}
      {t.formulas?.length ? (
        <Section title="公式与适用条件（知道什么时候能用，比背下来更重要）" icon="🧮">
          <div className="physics-formulas">
            {t.formulas.map((f, i) => (
              <div key={i} className="physics-formula">
                <div className="physics-formula__name">{f.name}</div>
                <div className="physics-formula__tex">
                  <RichText text={f.tex ? `$${f.tex}$` : (f.text ?? '')} />
                </div>
                {f.units ? <div className="physics-formula__units">{f.units}</div> : null}
                <div className="physics-formula__usage">
                  <span className="physics-formula__usageTag">适用条件</span>
                  <RichText text={f.usage} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ④ 应用 */}
      <Section title={`应用：从情境到物理模型（${t.apps.length} 例）`} icon="🔧">
        <div className="physics-apps">
          {t.apps.map((a, i) => (
            <div key={i} className="physics-app">
              <div className="physics-app__title">{a.title}</div>
              <div className="physics-app__scene">{a.scene}</div>
              {a.figure ? <PhysicsFigureView figure={a.figure} /> : null}
              <div className="physics-app__model">
                <span className="physics-app__tag">物理模型</span>
                <RichText text={a.model} />
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

      {/* ⑤ 易错与对比 */}
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

      {/* ⑥ 命题角度 */}
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

      {/* ⑦ 综合题 */}
      {t.materials?.length ? (
        <Section title="综合题（解答与计算 / 探究与实验 / 阅读与理解）" icon="✍️">
          <div className="history-materials">
            {t.materials.map((g) => (
              <MaterialBlock key={g.id} group={g} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑧ 练习与过关清单 —— 「全部习题都过关才算掌握」的落地 */}
      <Section
        title={`练习与过关清单（${done}/${questionIds.length} 已过关）`}
        icon="🎯"
        extra={
          <div className="row row--wrap">
            {unpassed.length ? (
              <a className="btn btn--sm btn--primary" href={`#${practiceUnpassedHref}`}>
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
          理科的掌握标准是**这个知识点的每一道题都答对过**：下面的清单会记住你过到哪一题，
          答错过的题再答对同样算过关——但不留一道没做过的题。
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
