/**
 * 语文「中考专题」（`zh-topics`）详情页：按**卷面题型逐个攻破**的备考页。
 *
 * 为什么单独做一个渲染器：`zh-topics` 与前面六个教材模块的内容形状完全不同——
 * 它不是「一篇课文 + 若干题」，而是「近五年考情 + 专门讲解 + 专项训练」三件套，
 * 落到的字段（`trends` / `trendSummary` / `angles` / `steps` / `templates` /
 * `scoring` / `pitfalls` / `drills`）在其它详情页里都没有对应位置，
 * 因此不能复用 `PoemDetail` 那一套骨架。
 *
 * 页面按**学生的使用顺序**排布，每一块的用途都不一样：
 *
 *   ① 攻破标准        —— 本专题每一道题都答对过才算攻破（全题过关策略），并把进度摆在最上面
 *   ② 一句话拿分逻辑   —— 这个专题考什么、分丢在哪，决定复习时间怎么分配
 *   ③ 近五年考情      —— 逐年形态（最新一年置顶并标出），末尾单列趋势结论
 *   ④ 命题角度        —— 复习时对号入座：这几年反复从哪几个角度考
 *   ⑤ 分步讲解        —— 考场上的动作序列，`demo` 以「示范」引用块呈现
 *   ⑥ 答题模板        —— 可以直接背下来套用的成套句式
 *   ⑦ 评分点／踩分点   —— 写成「写到什么才给分」，做完题逐条对照
 *   ⑧ 易错与失分      —— 三行写法：错在哪 / 应该怎么做 / 为什么容易错
 *   ⑨ 专项训练分组     —— 每组一个「刷这一组」入口，组名即题目标签
 *   ⑩ 题库总览        —— 只列题干摘要与题型，作答一律走练习页
 *   ⑪ 底部行动条      —— 「从头练这个专题（全部 N 题）」，另给「只练没过关的」
 *
 * 分组刷题走 `/practice/zh-topics/<条目 id>?tag=<组名>`：组名本身就是题目上的
 * 标签（见 `data/chinese/zh-topics/CONTENT-SPEC.md`），因此不需要另建一套组的 id。
 *
 * 底部「知识点背诵 / 本课思维导图 / 拓展阅读 / 关联学习 / 学一补多」由 `DetailShell`
 * 统一接上，与其它详情页完全一致，这里不再重复实现。
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { ChineseExamTopicEntry, QuizQuestion } from '../../types';
import { cn } from '../../lib/utils';
import { passedCount, unpassedIds } from '../../lib/progress';
import { useStudy } from '../../store/StudyContext';
import { Tag } from '../../components/common';
import { DetailShell, Section } from './DetailShell';

/** 题库总览最多列这么多题：详情页只用来「看清题量与考法」，作答在练习页 */
const PREVIEW_LIMIT = 40;
/** 题干摘要的截断长度（题干多是长材料，整段铺开会把页面拉爆） */
const STEM_LIMIT = 60;

const TYPE_LABEL: Record<QuizQuestion['type'], string> = {
  choice: '选择题',
  fill: '填空·默写',
  short: '简答题',
};

const DIFFICULTY_LABEL: Record<1 | 2 | 3, string> = { 1: '易', 2: '中', 3: '难' };

/**
 * 数据里偶有 Markdown 加粗标记（`**…**`，如 `trendSummary`）。
 * 这是文案层面的强调约定，渲染成 `<strong>` 才不会让学生看到一排星号。
 */
function Emph({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : <span key={i}>{p}</span>))}
    </>
  );
}

/** 题干摘要：把换行与连续空格压成一行，超长截断加省略号 */
function summarize(stem: string, limit = STEM_LIMIT): string {
  const one = stem.replace(/\s+/g, ' ').trim();
  return one.length > limit ? `${one.slice(0, limit)}…` : one;
}

export default function ChineseExamTopicDetail({
  entry,
  moduleName,
}: {
  entry: ChineseExamTopicEntry;
  moduleName: string;
}) {
  const t = entry.data;
  const { state } = useStudy();
  const questions = entry.questions;
  const total = questions.length;
  const practiceBase = `/practice/${entry.moduleId}/${entry.id}`;

  /** 已过关题数：「全题过关」策略下的进度（`lib/progress.ts`），答题页写入 */
  const passed = useMemo(
    () => passedCount(questions.map((q) => q.id), state.passed),
    [questions, state.passed],
  );
  const unpassed = useMemo(
    () => unpassedIds(questions.map((q) => q.id), state.passed),
    [questions, state.passed],
  );

  /** 考情按年份倒序：最近一年在最上面，学生第一眼看到的是「现在怎么考」 */
  const trends = useMemo(() => [...t.trends].sort((a, b) => b.year.localeCompare(a.year)), [t.trends]);
  const latestYear = useMemo(
    () => t.trends.reduce((max, tr) => (tr.year > max ? tr.year : max), ''),
    [t.trends],
  );

  /** 每个训练组的题量；组名就是题目标签，与练习页 `?tag=` 的筛选口径完全一致 */
  const drills = useMemo(
    () =>
      t.drills.map((d) => ({
        ...d,
        count: questions.filter((q) => (q.tags ?? []).includes(d.name)).length,
      })),
    [t.drills, questions],
  );

  /** 没有任何训练组标签的题：它们仍会出现在「从头练这个专题」里，这里如实说明 */
  const ungrouped = useMemo(
    () => questions.filter((q) => !t.drills.some((d) => (q.tags ?? []).includes(d.name))).length,
    [t.drills, questions],
  );

  const preview = questions.slice(0, PREVIEW_LIMIT);

  return (
    <DetailShell
      entry={entry}
      subjectId="chinese"
      moduleName={moduleName}
      backTo={`/s/chinese/${entry.moduleId}`}
      subtitle={<span>{t.paper}</span>}
      actions={
        total > 0 ? (
          <Link className="btn btn--sm btn--primary" to={practiceBase}>
            ✍️ 刷题（全部 {total} 题）
          </Link>
        ) : null
      }
    >
      {/* ① 攻破标准：把「怎样才算学完」说在最前面，并把全题过关进度摆出来 */}
      <section className="card card--pad zht-standard">
        <div className="zht-standard__label">这个专题攻破的标准</div>
        <div className="zht-standard__text">本专题每一道题都答对过，才算攻破。</div>
        <div className="row row--wrap" style={{ marginTop: 10 }}>
          <Tag tone="red">共 {total} 题</Tag>
          <Tag tone="jade">
            已过关 {passed} / {total}
          </Tag>
          {drills.length ? <Tag tone="gold">{drills.length} 组专项训练</Tag> : null}
          {t.trends.length ? <Tag tone="blue">近五年考情 {t.trends.length} 条</Tag> : null}
        </div>
        <div className="small muted" style={{ marginTop: 8, lineHeight: 1.85 }}>
          过关按「每道题曾经答对过一次」记：答错的题会进错题本，重做后答对同样算过关，
          不必从头再来一遍。因此这一块的进度只增不减，凑够 {total} / {total} 就是把这个专题拿下。
        </div>
      </section>

      {/* ② 一句话拿分逻辑：试卷上这一块考什么、分丢在哪 */}
      <section className="card card--pad history-mainline">
        <div className="history-mainline__label">一句话拿分逻辑</div>
        <div className="history-mainline__text">
          <Emph text={t.summary} />
        </div>
        <div className="small muted" style={{ marginTop: 8 }}>
          卷面定位：{t.paper}
        </div>
      </section>

      {/* ③ 近五年考情：逐年一条，最近一年置顶；结论单独强调 */}
      {trends.length ? (
        <Section
          title={`近五年考情（${trends.length} 条）`}
          icon="📈"
          extra={latestYear ? <Tag tone="purple">最近一年 · {latestYear}</Tag> : null}
        >
          <div className="small muted" style={{ marginBottom: 8, lineHeight: 1.85 }}>
            只看「这几年都在考什么形态、分值大概多少、选材偏向什么」——考情用来决定复习时间往哪块倾斜，
            具体某一年考了哪道题不必记。
          </div>
          <div className="stack stack--sm">
            {trends.map((tr) => (
              <div className={cn('zht-trend', tr.year === latestYear && 'is-latest')} key={tr.year}>
                <div className="zht-trend__year">
                  <span>{tr.year}</span>
                  {tr.year === latestYear ? <Tag tone="red">最近一年</Tag> : null}
                </div>
                <div className="zht-trend__note">
                  <Emph text={tr.note} />
                </div>
              </div>
            ))}
          </div>

          {/* 趋势结论：单列强调，它是「接下来怎么复习」的依据 */}
          <div className="sample-highlight" style={{ marginTop: 12 }}>
            <div className="small muted" style={{ marginBottom: 4 }}>
              五年趋势结论
            </div>
            <div className="sample-highlight__sentence">
              <Emph text={t.trendSummary} />
            </div>
          </div>
        </Section>
      ) : null}

      {/* ④ 命题角度：这几年反复从哪几个角度考，复习时对号入座 */}
      {t.angles.length ? (
        <Section
          title={`命题角度（${t.angles.length} 类）`}
          icon="🎯"
          extra={<span className="small muted">复习时对号入座</span>}
        >
          <div className="stack stack--sm">
            {t.angles.map((a, i) => (
              <div className="history-angle" key={`${a.angle}-${i}`}>
                <div className="history-angle__head">
                  <Tag tone="purple">{a.angle}</Tag>
                  {a.years ? <span className="small muted">{a.years}</span> : null}
                </div>
                <div className="history-angle__detail">
                  <Emph text={a.detail} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑤ 分步讲解：考场上的动作序列，每一步「做什么」，demo 是「做一遍给你看」 */}
      {t.steps.length ? (
        <Section
          title={`分步讲解（${t.steps.length} 步）`}
          icon="🧭"
          extra={<span className="small muted">按顺序做，别跳步</span>}
        >
          <div className="small muted" style={{ marginBottom: 10, lineHeight: 1.85 }}>
            这几步是考场上真按这个顺序执行的，读的时候把每一步的「动作」记下来，
            带「示范」的引用块是这一步的完整做法。
          </div>
          <div className="stack stack--sm">
            {t.steps.map((s, i) => (
              <div className="zht-step" key={`${s.heading}-${i}`}>
                <div className="zht-step__head">
                  <span className="zht-step__no">{i + 1}</span>
                  <span className="zht-step__heading">{s.heading}</span>
                </div>
                <div className="zht-step__body">
                  <Emph text={s.body} />
                </div>
                {s.demo ? (
                  <div className="zht-demo">
                    <div className="zht-demo__label">示范</div>
                    <div className="zht-demo__text">
                      <Emph text={s.demo} />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑥ 答题模板：可以直接背下来套用的成套句式 */}
      {t.templates?.length ? (
        <Section
          title={`答题模板（${t.templates.length} 套）`}
          icon="📋"
          extra={<Tag tone="jade">可以直接背下来套用</Tag>}
        >
          <div className="stack stack--lg">
            {t.templates.map((tpl, i) => (
              <div className="zht-template" key={`${tpl.name}-${i}`}>
                <div className="zht-template__name">{tpl.name}</div>
                <ol className="zht-template__items">
                  {tpl.items.map((it, k) => (
                    <li key={k}>
                      <Emph text={it} />
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <div className="small muted" style={{ marginTop: 10, lineHeight: 1.85 }}>
            用法：先背成条的句式（顺序也一起背），考场上按句式填内容——模板的作用是保证不漏项，
            不是代替思考。
          </div>
        </Section>
      ) : null}

      {/* ⑦ 评分点／踩分点：写成「写到什么才给分」，做完题逐条对照 */}
      {t.scoring?.length ? (
        <Section
          title={`评分点与踩分点（${t.scoring.length} 条）`}
          icon="✅"
          extra={<span className="small muted">写到什么才给分</span>}
        >
          <div className="small muted" style={{ marginBottom: 8, lineHeight: 1.85 }}>
            做完一组题，拿这几条对自己的答案过一遍：说到哪几条、漏了哪几条，比「感觉答得还行」准得多。
          </div>
          <div className="rubric">
            <div className="rubric__title">对照检查自己答到了几条</div>
            {t.scoring.map((s, i) => (
              <div className="rubric__item" key={i}>
                <span className="rubric__mark">◆</span>
                <span>
                  <Emph text={s} />
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑧ 易错与失分：错在哪 → 应该怎么做 → 为什么容易错（三行） */}
      {t.pitfalls?.length ? (
        <Section
          title={`易错与失分（${t.pitfalls.length} 条）`}
          icon="⚠️"
          extra={<span className="small muted">都是「好像会了」的地方</span>}
        >
          <div className="stack stack--sm">
            {t.pitfalls.map((p, i) => (
              <div className="history-confuse" key={i}>
                <div className="history-confuse__row">
                  <Tag tone="red">✘ 常见做法</Tag>
                  <span>{p.wrong}</span>
                </div>
                <div className="history-confuse__row">
                  <Tag tone="jade">✔ 应该这样做</Tag>
                  <span>{p.right}</span>
                </div>
                <div className="small muted">为什么容易错：{p.why}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ⑨ 专项训练分组：组名即题目标签，一组一个入口，只出这一组的题 */}
      {drills.length ? (
        <Section
          title={`专项训练（${drills.length} 组 · ${total} 题）`}
          icon="🏋️"
          extra={<span className="small muted">点「刷这一组」只出这一组的题</span>}
        >
          <div className="small muted" style={{ marginBottom: 12, lineHeight: 1.85 }}>
            每一组对应一种卷面考法，组名就是题目上的标签。建议一组一组过：练完一组，
            这一组的题都会记进上面的过关进度。
          </div>
          <div className="grid grid--auto">
            {drills.map((d, i) => (
              <div
                className="card card--pad card--flat stack stack--sm"
                key={d.name}
                style={{ background: 'var(--c-surface-2)' }}
              >
                <div className="row row--between">
                  <span className="bold">
                    {i + 1}. {d.name}
                  </span>
                  <Tag tone={d.count ? 'jade' : 'default'}>{d.count} 题</Tag>
                </div>
                <div className="small muted" style={{ lineHeight: 1.8 }}>
                  {d.note}
                </div>
                <div className="row row--wrap">
                  <Link
                    className="btn btn--sm"
                    to={`${practiceBase}?tag=${encodeURIComponent(d.name)}`}
                  >
                    ✍️ 刷这一组
                  </Link>
                  {d.count === 0 ? <span className="small muted">本组题目正在补充</span> : null}
                </div>
              </div>
            ))}
          </div>
          {ungrouped > 0 ? (
            <div className="small muted" style={{ marginTop: 10 }}>
              另有 {ungrouped} 题暂未归入上面的训练组，练「从头练这个专题」时会一并出现。
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* ⑩ 题库总览：只给题干摘要与题型，用来判断题量，作答一律走练习页 */}
      <Section
        title={`题库总览（共 ${total} 题）`}
        icon="📚"
        extra={<span className="small muted">只列题干，作答在练习页</span>}
      >
        {preview.length ? (
          <>
            <div className="small muted" style={{ marginBottom: 10, lineHeight: 1.85 }}>
              这里只列题干，用来判断这一专题的题量与考法；不在详情页作答，做题请走上面的训练组入口。
            </div>
            <div>
              {preview.map((q, i) => (
                <div className="zht-q" key={q.id}>
                  <span className="zht-q__no">{i + 1}</span>
                  <span className="zht-q__stem">
                    <Emph text={summarize(q.stem)} />
                  </span>
                  <span className="zht-q__type">
                    <Tag tone="blue">{TYPE_LABEL[q.type]}</Tag>
                    {q.difficulty ? (
                      <span className="small muted">{DIFFICULTY_LABEL[q.difficulty]}</span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
            {total > preview.length ? (
              <div className="small muted" style={{ marginTop: 10 }}>
                以上是第 1—{preview.length} 题，其余 {total - preview.length} 题在练习页里按组出题。
              </div>
            ) : null}
          </>
        ) : (
          <div className="small muted">本专题的题库正在补充，先看讲解，题目到位后入口会自动出现。</div>
        )}
      </Section>

      {/* ⑪ 底部行动条：从头练全部题；已经练过的，只练还没过关的那几题 */}
      <section className="card card--pad zht-cta">
        <div className="row row--between row--wrap" style={{ alignItems: 'center', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="zht-cta__title">🎯 从头练这个专题（全部 {total} 题）</div>
            <div className="small muted" style={{ marginTop: 4, lineHeight: 1.85 }}>
              {passed > 0
                ? `已过关 ${passed} / ${total}，还差 ${Math.max(total - passed, 0)} 题。`
                : '按顺序过一遍，答对的题记一次过关，答错的题进错题本，重做答对同样算过关。'}
            </div>
          </div>
          {total > 0 ? (
            <div className="row row--wrap">
              {unpassed.length > 0 && unpassed.length < total ? (
                <Link
                  className="btn btn--sm"
                  to={`${practiceBase}?ids=${unpassed.slice(0, 60).join(',')}`}
                >
                  🎯 只练还没过关的 {unpassed.length} 题
                </Link>
              ) : null}
              <Link className="btn btn--primary" to={practiceBase}>
                ✍️ 从头练这个专题（全部 {total} 题）
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </DetailShell>
  );
}

/**
 * 具名导出：与其它详情页 `import { XDetail } from './detail/XDetail'` 的写法保持兼容。
 * 接线时用默认导入或具名导入都可以。
 */
export { ChineseExamTopicDetail };
