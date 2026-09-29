/** 数学知识点详情：概念、中考考点（综合）、公式定理（KaTeX 渲染）、例题精讲、易错点、解题方法 */

import type { MathEntry } from '../../types';
import { Accordion, Tag } from '../../components/common';
import { PhysicsFigureView } from '../../components/PhysicsFigure';
import { RichText } from '../../components/RichText';
import { Tex } from '../../components/Tex';
import { DetailShell, Section } from './DetailShell';

/**
 * 数学知识点详情页。
 *
 * ## 布局口径（用户明确的偏好）
 *
 * 每个区块折叠成**一行卡片**（图标 + 名称 + 条数摘要 + 箭头），**默认全部收起**：
 * 一页有五六个区块，全部铺开要划很久才能看完；收起时标题行上的摘要
 * （「N 条」「N 道」）足以判断值不值得展开，展开是一次明确的点击。
 * 全部用 `Section` 的 `fold` 模式（见 `DetailShell.tsx`），观感与
 * 思维导图 / 知识点背诵那些折叠卡片一致。
 *
 * ## 「中考考点（综合）」
 *
 * 与语文模块同一思路：每个知识点都写清「中考里怎么被考」——题位题型、
 * 与哪些知识综合、踩分靠什么（`MathTopic.examPoints`）。放在核心概念之后，
 * 先知道学什么，再知道考什么，例题与练习才有针对性。
 */
export function MathDetail({ entry, moduleName }: { entry: MathEntry; moduleName: string }) {
  const t = entry.data;

  return (
    <DetailShell
      entry={entry}
      moduleName={moduleName}
      backTo={`/s/math/${entry.moduleId}`}
      subtitle={
        <span>
          {t.chapter ? `${t.chapter} · ` : ''}
          <RichText text={t.summary} />
        </span>
      }
      // 标签按纯文本渲染，只能放短标签；解题方法含公式标记，绝不能塞进标签
      tags={['数学']}
    >
      {/* 核心概念 */}
      {t.concepts?.length ? (
        <Section
          title={`核心概念（${t.concepts.length} 条）`}
          icon="📘"
          fold
          summary={t.concepts
            .slice(0, 4)
            .map((c) => c.term)
            .join(' · ')}
        >
          <div className="note-grid">
            {t.concepts.map((c, i) => (
              <div className="note" key={i}>
                <span className="note__word">{c.term}</span>
                <span className="note__text">
                  <RichText text={c.explain} />
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 中考考点（综合）：这个知识点中考里怎么被考、与哪些知识综合 */}
      {t.examPoints?.length ? (
        <Section
          title={`中考考点（${t.examPoints.length} 条）`}
          icon="🎯"
          fold
          summary={t.examPoints[0]?.point}
          extra={<Tag tone="gold">综合</Tag>}
        >
          <div className="stack stack--sm">
            {t.examPoints.map((p, i) => (
              <div className="history-angle" key={i}>
                <div className="history-angle__head">
                  <Tag tone="purple">
                    <RichText text={p.point} />
                  </Tag>
                </div>
                <div className="history-angle__detail" style={{ lineHeight: 1.8 }}>
                  <RichText text={p.how} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 公式与定理 */}
      {t.formulas?.length ? (
        <Section
          title={`公式与定理（${t.formulas.length} 条）`}
          icon="🧮"
          fold
          summary={t.formulas.map((f) => f.name).slice(0, 4).join(' · ')}
        >
          <div>
            {t.formulas.map((f, i) => (
              <div className="formula" key={i}>
                <div className="formula__name">{f.name}</div>
                <div className="formula__body">
                  {f.tex ? <Tex tex={f.tex} block /> : null}
                  {f.text ? (
                    <div
                      className="small"
                      style={{ color: 'var(--c-ink-2)', lineHeight: 1.8, marginTop: f.tex ? 4 : 0 }}
                    >
                      <RichText text={f.text} />
                    </div>
                  ) : null}
                  {f.note ? (
                    <div className="formula__note">
                      ⚠️ <RichText text={f.note} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 例题精讲 */}
      {t.examples?.length ? (
        <Section
          title={`例题精讲（${t.examples.length} 道）`}
          icon="✏️"
          fold
          summary="分步解答 · 第一道已展开"
        >
          <div>
            {t.examples.map((ex, i) => (
              <Accordion
                key={i}
                title={
                  <span>
                    例 {i + 1}
                    <span className="muted" style={{ marginLeft: 8, fontWeight: 400 }}>
                      <RichText text={ex.stem.slice(0, 28) + (ex.stem.length > 28 ? '…' : '')} />
                    </span>
                  </span>
                }
                icon="▪"
                defaultOpen={i === 0}
              >
                <div className="example__stem" style={{ borderRadius: 'var(--r-sm)', border: 'none' }}>
                  <span className="example__label">题目</span>
                  <span style={{ whiteSpace: 'pre-line' }}>
                    <RichText text={ex.stem} />
                  </span>
                </div>

                {/* 配图：几何、函数等不看图难理解的例题 */}
                {ex.figure ? <PhysicsFigureView figure={ex.figure} className="physics-quizFig" /> : null}

                {ex.steps?.length ? (
                  <div className="example__body" style={{ padding: '12px 0 0' }}>
                    {ex.steps.map((s, j) => (
                      <div className="example__step" key={j}>
                        <span className="example__step-no">{j + 1}</span>
                        <span>
                          <RichText text={s} />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="example__answer">
                  <strong>答案：</strong>
                  <RichText text={ex.answer} />
                </div>

                {ex.tip ? (
                  <div className="example__tip">
                    💡 <RichText text={ex.tip} />
                  </div>
                ) : null}
              </Accordion>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 易错点 */}
      {t.pitfalls?.length ? (
        <Section
          title={`易错点（${t.pitfalls.length} 条）`}
          icon="⚠️"
          fold
          summary="都是「好像会了」的地方"
        >
          <div className="stack stack--sm">
            {t.pitfalls.map((p, i) => (
              <div className="explain explain--wrong" style={{ marginTop: 0 }} key={i}>
                <span style={{ lineHeight: 1.8 }}>
                  <RichText text={p} />
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 解题方法 */}
      {t.methods?.length ? (
        <Section title="解题方法与思路" icon="🧠" fold summary={`${t.methods.length} 条 · 怎么想 + 怎么验`}>
          <div className="stack stack--sm">
            {t.methods.map((m, i) => (
              <div className="note" key={i}>
                <span className="note__word">{i + 1}</span>
                <span className="note__text">
                  <RichText text={m} />
                </span>
              </div>
            ))}
          </div>
          <div className="row row--wrap" style={{ marginTop: 12 }}>
            <Tag tone="jade">数学</Tag>
            {t.chapter ? <Tag tone="blue">{t.chapter}</Tag> : null}
          </div>
        </Section>
      ) : null}
    </DetailShell>
  );
}
