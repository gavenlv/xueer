/**
 * 历史「考点与考情总复习」页：把六册与专题里的**分层考点、命题角度、材料大题**
 * 汇总成一张总表——这正是「对过去中考试题分析、总结考点」要落到的页面。
 *
 * 三件事：
 *   ① 先讲清广州中考历史到底怎么考（结构、时长、评分方式），这是复习的靶子；
 *   ② 按「重点 / 次重点 / 了解」三档把全部考点列出来，可只看重点，也可按册折叠；
 *   ③ 把全部**材料大题**（广州中考的非选择题形态）与**命题角度**索引出来，直达对应内容。
 *
 * 数据全部由内容聚合而来（`pointStats` / `examAngleList` / `materialIndex`），
 * 因此不会出现「考点表与课文对不上」的情况。
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { examAngleList, materialIndex, pointStats, papersOfModule } from '../data/history';
import { getModuleMeta } from '../data/subjects';
import type { HistoryLevel } from '../types';
import { cn } from '../lib/utils';
import { useDataScope, DataLoading } from '../lib/useData';
import { Crumbs, PageHeader, Tag } from '../components/common';

const LEVEL_TONE: Record<HistoryLevel, 'red' | 'gold' | 'default'> = {
  重点: 'red',
  次重点: 'gold',
  了解: 'default',
};

const LEVEL_DESC: Record<HistoryLevel, string> = {
  重点: '必须会背会写、能默出结论，材料题的主要得分点',
  次重点: '要能再认与简述，选择题与材料题的次要得分点',
  了解: '背景知识，用于理解因果，知道即可',
};

export default function HistoryReviewPage() {
  /** 备考页要汇总六册 + 专题 + 模拟卷，因此把历史全部模块点名加载 */
  const ready = useDataScope([
    'hist-7a',
    'hist-7b',
    'hist-8a',
    'hist-8b',
    'hist-9a',
    'hist-9b',
    'hist-topics',
    'hist-exam',
  ]);

  const [onlyLevel, setOnlyLevel] = useState<HistoryLevel | 'all'>('all');
  /** 每一档先只列前若干条，避免一屏铺开几百条考点；点「展开」看全部 */
  const [expanded, setExpanded] = useState<Set<HistoryLevel>>(new Set());
  const PREVIEW = 8;

  const stats = useMemo(() => (ready ? pointStats() : []), [ready]);
  const angles = useMemo(() => (ready ? examAngleList() : []), [ready]);
  const material = useMemo(() => (ready ? materialIndex() : []), [ready]);
  const papers = useMemo(() => (ready ? papersOfModule() : []), [ready]);

  if (!ready) return <DataLoading label="正在汇总考点与考情…" />;

  const totalPoints = stats.reduce((n, s) => n + s.count, 0);
  const asks = material.reduce((n, m) => n + m.asks, 0);
  const shown = stats.filter((s) => onlyLevel === 'all' || s.level === onlyLevel);

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[{ label: '首页', to: '/' }, { label: '历史', to: '/s/history' }, { label: '考点与考情' }]}
        title="📊 历史考点与考情总复习"
        desc="把六册教材与中考专题里的考点按「重点 / 次重点 / 了解」三档摊开，配上命题角度与材料大题索引——复习的时候先看这一页，再决定今天啃哪一块。"
        extra={
          <Link className="btn btn--sm" to="/s/history/hist-exam">
            去做整卷模拟 →
          </Link>
        }
      />

      {/* ① 考试结构：先讲清靶子 */}
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 10 }}>
          <Tag tone="red">广州中考历史</Tag>
          <span className="small muted">2027—2029 年录取计分科目实施方案</span>
        </div>
        <div className="row row--wrap" style={{ marginTop: 10, gap: 8 }}>
          <Tag tone="blue">70 分（原 90 分，适当减分）</Tag>
          <Tag tone="gold">闭卷笔试 · 60 分钟</Tag>
          <Tag>与道德与法治同场分卷</Tag>
          <Tag tone="purple">20 道单项选择（40 分）</Tag>
          <Tag tone="purple">3 道非选择题（30 分）</Tag>
        </div>
        <div className="small muted" style={{ marginTop: 10, lineHeight: 1.9 }}>
          官方口径：8 个录取计分科目与总分 810 分不变，语文、数学、英语适当提分，
          <b>道德与法治、历史、化学适当减分</b>；试卷结构「不会因为科目分值的调整而发生较大变化」，
          历史与道法继续<b>全闭卷</b>，非语数英科目考试时长不超过 1 小时。
          命题强调在真实情境中分析解决问题、注重思维过程，适当减少单纯识记的考查——
          这也是本站把「关联与对比、材料题、考法分析」放在知识点前面的原因。
        </div>
        <div className="small muted" style={{ marginTop: 6 }}>
          依据：广州市教育局《2027—2029 年广州市初中学业水平考试录取计分科目考试实施方案》
          （穗教规字〔2025〕1 号，2025 年 12 月印发）。若后续配套文件调整卷面分值，以当年印发的试卷结构说明为准。
        </div>
      </section>

      {/* ② 分层考点总表 */}
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
          <Tag tone="jade">考点总览</Tag>
          <span className="small muted">
            共 {totalPoints} 条考点（{stats.map((s) => `${s.level} ${s.count}`).join(' · ')}）
          </span>
          <span className="spacer" />
          <div className="row row--wrap" style={{ gap: 6 }}>
            {(['all', '重点', '次重点', '了解'] as const).map((lv) => (
              <button
                key={lv}
                className={cn('chip chip--sm', onlyLevel === lv && 'is-active')}
                onClick={() => setOnlyLevel(lv)}
              >
                {lv === 'all' ? '全部层级' : lv}
              </button>
            ))}
          </div>
        </div>

        <div className="stack stack--lg" style={{ marginTop: 12 }}>
          {shown.map((s) => {
            const isOpen = expanded.has(s.level);
            const list = isOpen ? s.items : s.items.slice(0, PREVIEW);
            return (
              <div key={s.level}>
                <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
                  <Tag tone={LEVEL_TONE[s.level]}>{s.level}</Tag>
                  <span className="small muted">
                    {s.count} 条 · {LEVEL_DESC[s.level]}
                  </span>
                  <span className="spacer" />
                  {s.items.length > PREVIEW ? (
                    <button
                      className="btn btn--sm btn--ghost"
                      onClick={() =>
                        setExpanded((prev) => {
                          const next = new Set(prev);
                          if (next.has(s.level)) next.delete(s.level);
                          else next.add(s.level);
                          return next;
                        })
                      }
                    >
                      {isOpen ? '收起' : `展开全部 ${s.items.length} 条`}
                    </button>
                  ) : null}
                </div>
                <div className="stack stack--sm" style={{ marginTop: 8 }}>
                  {list.map((it, i) => {
                    const meta = getModuleMeta(it.moduleId as never);
                    return (
                      <Link
                        className="list-item"
                        key={`${it.id}-${i}`}
                        to={`/s/history/${it.moduleId}/${it.id}`}
                      >
                        <span className="list-item__main">
                          <span className="list-item__title">
                            {it.text.length > 46 ? `${it.text.slice(0, 46)}…` : it.text}
                            <Tag tone={LEVEL_TONE[s.level]}>{s.level}</Tag>
                          </span>
                          <span className="list-item__meta">
                            <span>{meta?.module.icon}</span>
                            <span>{meta?.module.name}</span>
                            <span>·</span>
                            <span>{it.title}</span>
                          </span>
                        </span>
                        <span className="list-item__right">→</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ③ 命题角度 */}
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
          <Tag tone="purple">命题角度与考法</Tag>
          <span className="small muted">{angles.length} 条（由各条内容的命题研判汇总）</span>
        </div>
        <div className="stack stack--sm" style={{ marginTop: 10 }}>
          {angles.slice(0, 24).map((a, i) => (
            <div className="history-angle" key={`${a.topicId}-${i}`}>
              <div className="history-angle__head">
                <Tag tone="purple">{a.angle}</Tag>
                <Link className="small" to={`/s/history/${a.moduleId}/${a.topicId}`}>
                  {a.topicTitle} →
                </Link>
              </div>
              <div className="history-angle__detail">{a.detail}</div>
            </div>
          ))}
        </div>
        {angles.length > 24 ? (
          <div className="small muted" style={{ marginTop: 10 }}>
            仅显示前 24 条；其余在各自内容页的「命题角度与考法」里。
          </div>
        ) : null}
        <div className="small muted" style={{ marginTop: 10 }}>
          说明：这些是依据课标、教材与命题方向整理的复习研判，<b>不是官方统计</b>。
        </div>
      </section>

      {/* ④ 材料大题索引 + 整卷模拟 */}
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
          <Tag tone="gold">材料大题（阅读材料，回答问题）</Tag>
          <span className="small muted">
            {material.length} 条内容里有 {material.reduce((n, m) => n + m.groups, 0)} 组 / {asks} 问
          </span>
          <span className="spacer" />
          <Link className="btn btn--sm btn--primary" to="/s/history/hist-exam">
            📝 整卷计时模拟（{papers.length} 套）
          </Link>
        </div>
        <div className="small muted" style={{ marginTop: 8, lineHeight: 1.85 }}>
          广州中考历史的非选择题就是 3 道「阅读材料，回答问题」，占 30 分。练法建议：
          先自己写一遍，再看参考答案与踩分点，最后回条目里把「必背结论」补上——
          得分点往往就是术语本身。
        </div>
        <div className="stack stack--sm" style={{ marginTop: 10 }}>
          {material.map((m) => {
            const meta = getModuleMeta(m.moduleId as never);
            return (
              <Link className="list-item" key={m.id} to={`/s/history/${m.moduleId}/${m.id}`}>
                <span className="list-item__main">
                  <span className="list-item__title">
                    {m.title}
                    <Tag tone="gold">{m.groups} 组 · {m.asks} 问</Tag>
                  </span>
                  <span className="list-item__meta">
                    <span>{meta?.module.icon}</span>
                    <span>{meta?.module.name}</span>
                  </span>
                </span>
                <span className="list-item__right">→</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
