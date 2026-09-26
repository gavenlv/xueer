/**
 * 道法「考点与考情总复习」页：与历史那一页同一套思路，按道法的特点调整。
 *
 * 三件事：
 *   ① 先讲清广州中考道法怎么考（结构、时长、题型、分值分布）；
 *   ② 按「重点 / 次重点 / 了解」把全部核心观点列出来（可只看重点），直达对应单元；
 *   ③ 把**必背金句、命题角度、时政热点、材料大题**索引出来——
 *      道法的非选择题占 36 分（一半以上），这一页就是为那 36 分准备的。
 *
 * 数据全部由内容聚合而来（`pointStats` / `examAngleList` / `materialIndex` / `keySentenceStats`）。
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { examAngleList, keySentenceStats, materialIndex, papersOfModule, pointStats } from '../data/politics';
import { allTopics } from '../data/politics';
import { getModuleMeta } from '../data/subjects';
import type { HistoryLevel } from '../types';
import { cn } from '../lib/utils';
import { useDataScope, DataLoading } from '../lib/useData';
import { Crumbs, EmptyState, PageHeader, Tag } from '../components/common';

const LEVEL_TONE: Record<HistoryLevel, 'red' | 'gold' | 'default'> = {
  重点: 'red',
  次重点: 'gold',
  了解: 'default',
};

const LEVEL_DESC: Record<HistoryLevel, string> = {
  重点: '必须能默写出规范表述，材料题的主要得分点',
  次重点: '要能再认与简述，选择题常考',
  了解: '背景知识，知道即可',
};

const MODULE_SCOPE = [
  'pol-growth',
  'pol-moral',
  'pol-law',
  'pol-nation',
  'pol-current',
  'pol-exam',
] as const;

export default function PoliticsReviewPage() {
  const ready = useDataScope([...MODULE_SCOPE]);

  const [onlyLevel, setOnlyLevel] = useState<HistoryLevel | 'all'>('all');
  const [expanded, setExpanded] = useState<Set<HistoryLevel>>(new Set());
  const PREVIEW = 8;

  const stats = useMemo(() => (ready ? pointStats() : []), [ready]);
  const angles = useMemo(() => (ready ? examAngleList() : []), [ready]);
  const material = useMemo(() => (ready ? materialIndex() : []), [ready]);
  const papers = useMemo(() => (ready ? papersOfModule() : []), [ready]);
  const keys = useMemo(() => (ready ? keySentenceStats() : { count: 0, byModule: {} }), [ready]);
  /** 时政热点：从时政专题条目里汇总（这是道法材料题最主要的取材来源） */
  const hotspots = useMemo(
    () => allTopics.flatMap((t) => (t.hotspots ?? []).map((h) => ({ ...h, topicId: t.id, topicTitle: t.title }))),
    [ready],
  );

  if (!ready) return <DataLoading label="正在汇总考点与考情…" />;

  const totalPoints = stats.reduce((n, s) => n + s.count, 0);
  const asks = material.reduce((n, m) => n + m.asks, 0);
  const shown = stats.filter((s) => onlyLevel === 'all' || s.level === onlyLevel);

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[{ label: '首页', to: '/' }, { label: '道德与法治', to: '/s/politics' }, { label: '考点与考情' }]}
        title="📊 道法考点与考情总复习"
        desc="把六块内容里的核心观点、必背金句、命题角度与材料大题摊开——道法非选择题占 36 分（一半以上），这一页就是为那 36 分准备的。"
        extra={
          <Link className="btn btn--sm" to="/s/politics/pol-exam">
            去做整卷模拟 →
          </Link>
        }
      />

      {/* ① 考试结构 */}
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 10 }}>
          <Tag tone="red">广州中考道法</Tag>
          <span className="small muted">2027—2029 年录取计分科目实施方案</span>
        </div>
        <div className="row row--wrap" style={{ marginTop: 10, gap: 8 }}>
          <Tag tone="blue">70 分（原 90 分，适当减分）</Tag>
          <Tag tone="gold">闭卷笔试 · 60 分钟</Tag>
          <Tag>与历史同场分卷</Tag>
          <Tag tone="purple">单项选择 17 小题（34 分）</Tag>
          <Tag tone="purple">非选择题 3 小题（36 分）</Tag>
        </div>
        <div className="small muted" style={{ marginTop: 10, lineHeight: 1.9 }}>
          结构上的关键事实：**非选择题 3 小题就有 36 分，占全卷一半以上**——
          选择题靠理解与排除，非选择题靠「规范表述 + 材料依据 + 结论」。
          因此本站把「必背金句」与「材料大题」放在显眼位置：不背规范表述，写再多也得不了分。
        </div>
        <div className="small muted" style={{ marginTop: 6 }}>
          依据：广州市教育局《2027—2029 年广州市初中学业水平考试录取计分科目考试实施方案》
          （穗教规字〔2025〕1 号）。
        </div>
      </section>

      {/* ② 核心观点总表 */}
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
          <Tag tone="jade">核心观点总览</Tag>
          <span className="small muted">
            共 {totalPoints} 条（{stats.map((s) => `${s.level} ${s.count}`).join(' · ')}）· 必背金句 {keys.count} 句
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
                      <Link className="list-item" key={`${it.id}-${i}`} to={`/s/politics/${it.moduleId}/${it.id}`}>
                        <span className="list-item__main">
                          <span className="list-item__title">
                            {it.text.length > 52 ? `${it.text.slice(0, 52)}…` : it.text}
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

      {/* ③ 时政热点与答题角度 */}
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
          <Tag tone="purple">时政热点与答题角度</Tag>
          <span className="small muted">{hotspots.length} 个方向（材料题最主要的取材来源）</span>
        </div>
        {hotspots.length === 0 ? (
          <EmptyState icon="📰" title="还没有时政热点" desc="时政专题条目里会写清事件与答题角度。" />
        ) : (
          <div className="stack stack--sm" style={{ marginTop: 10 }}>
            {hotspots.map((h) => (
              <div className="history-angle" key={`${h.topicId}-${h.event}`}>
                <div className="history-angle__head">
                  <Tag tone="purple">{h.event}</Tag>
                  <Link className="small" to={`/s/politics/pol-current/${h.topicId}`}>
                    {h.topicTitle} →
                  </Link>
                </div>
                <div className="history-angle__detail">
                  {h.angles.map((a) => (
                    <div key={a.angle}>
                      <b>{a.angle}</b>（{a.point}）
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ④ 命题角度 */}
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
          <Tag tone="purple">命题角度与考法</Tag>
          <span className="small muted">{angles.length} 条（由各单元命题研判汇总）</span>
        </div>
        <div className="stack stack--sm" style={{ marginTop: 10 }}>
          {angles.slice(0, 24).map((a, i) => (
            <div className="history-angle" key={`${a.topicId}-${i}`}>
              <div className="history-angle__head">
                <Tag tone="purple">{a.angle}</Tag>
                <Link className="small" to={`/s/politics/${a.moduleId}/${a.topicId}`}>
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

      {/* ⑤ 材料大题索引 */}
      <section className="card card--pad">
        <div className="row row--wrap" style={{ alignItems: 'center', gap: 8 }}>
          <Tag tone="gold">材料大题（阅读材料，回答问题）</Tag>
          <span className="small muted">
            {material.length} 条内容里有 {material.reduce((n, m) => n + m.groups, 0)} 组 / {asks} 问
          </span>
          <span className="spacer" />
          <Link className="btn btn--sm btn--primary" to="/s/politics/pol-exam">
            📝 整卷计时模拟（{papers.length} 套）
          </Link>
        </div>
        <div className="small muted" style={{ marginTop: 8, lineHeight: 1.85 }}>
          练法建议：先按「观点（规范表述）+ 材料依据 + 结论」自己写一遍，再对照参考答案与踩分点，
          最后回到「必背金句」里把没写出来的术语补上——**分数就落在那些术语上**。
        </div>
        <div className="stack stack--sm" style={{ marginTop: 10 }}>
          {material.map((m) => {
            const meta = getModuleMeta(m.moduleId as never);
            return (
              <Link className="list-item" key={m.id} to={`/s/politics/${m.moduleId}/${m.id}`}>
                <span className="list-item__main">
                  <span className="list-item__title">
                    {m.title}
                    <Tag tone="gold">
                      {m.groups} 组 · {m.asks} 问
                    </Tag>
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
