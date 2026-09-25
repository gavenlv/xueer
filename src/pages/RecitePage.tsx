/**
 * 今日背诵：按间隔重复安排，列出今天该复习的篇目，并可直接就地训练。
 * 「背完不是终点，到点复习才是」——这个页面就是解决「背完就忘」的。
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentStats } from '../data';
import { allPoems } from '../data/chinese';
import { useStudy } from '../store/StudyContext';
import type { Poem } from '../types';
import { GRADES, cn, gradeShort } from '../lib/utils';
import { daysUntilDue, isDue, levelLabel } from '../lib/recite';
import { EmptyState, PageHeader, ProgressBar, SectionTitle, Stat, Tag } from '../components/common';
import { ReciteTrainer } from '../components/ReciteTrainer';

export default function RecitePage() {
  const { state, grade } = useStudy();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string>(grade);

  const recite = state.recite ?? {};

  /** 分三类：今天该复习 / 从未练过 / 已排期 */
  const buckets = useMemo(() => {
    const inGrade = allPoems.filter(
      (p) => gradeFilter === 'all' || p.grade === gradeFilter,
    );
    const due: Poem[] = [];
    const fresh: Poem[] = [];
    const scheduled: Poem[] = [];

    for (const p of inGrade) {
      const rec = recite[p.id];
      if (!rec || rec.times === 0) fresh.push(p);
      else if (isDue(rec)) due.push(p);
      else scheduled.push(p);
    }

    due.sort((a, b) => (recite[a.id]?.dueAt ?? 0) - (recite[b.id]?.dueAt ?? 0));
    scheduled.sort((a, b) => (recite[a.id]?.dueAt ?? 0) - (recite[b.id]?.dueAt ?? 0));
    return { due, fresh, scheduled, total: inGrade.length };
  }, [recite, gradeFilter]);

  const totalPracticed = buckets.due.length + buckets.scheduled.length;
  const activePoem = activeId ? allPoems.find((p) => p.id === activeId) : undefined;

  return (
    <div className="stack stack--lg">
      <PageHeader
        crumbs={[
          { label: '首页', to: '/' },
          { label: '语文', to: '/s/chinese' },
          { label: '今日背诵' },
        ]}
        title="📅 今日背诵"
        desc="按遗忘规律安排复习：背下来后间隔逐步拉长（1→2→4→7→15→30 天），到点回来一次，比连背十遍更管用。"
        extra={
          <Link className="btn btn--sm" to="/s/chinese/poems">
            去选篇目
          </Link>
        }
      />

      <section className="card card--pad stack stack--sm">
        <div className="grid grid--3">
          <Stat value={buckets.due.length} label="今天该复习" tone="#d24f3d" />
          <Stat value={totalPracticed} label={`已开始背诵 / ${buckets.total}`} tone="#1a9a6c" />
          <Stat value={buckets.scheduled.length} label="已排期" tone="#2f66d6" />
        </div>
        <ProgressBar value={totalPracticed} max={Math.max(1, buckets.total)} thin />
        <div className="scroll-x">
          <button
            className={cn('chip chip--sm', gradeFilter === 'all' && 'is-active')}
            onClick={() => setGradeFilter('all')}
          >
            全部学段（{allPoems.length}）
          </button>
          {GRADES.map((g) => {
            const n = allPoems.filter((p) => p.grade === g.id).length;
            return (
              <button
                key={g.id}
                className={cn('chip chip--sm', gradeFilter === g.id && 'is-active')}
                onClick={() => setGradeFilter(g.id)}
              >
                {g.short}（{n}）
              </button>
            );
          })}
        </div>
      </section>

      {/* 就地训练 */}
      {activePoem ? (
        <div className="stack stack--sm">
          <div className="row row--between row--wrap">
            <SectionTitle sub={`${activePoem.dynasty}·${activePoem.author} · ${gradeShort(activePoem.grade)}`}>
              正在训练：《{activePoem.title}》
            </SectionTitle>
            <button className="btn btn--sm btn--ghost" onClick={() => setActiveId(null)}>
              收起
            </button>
          </div>
          <ReciteTrainer poem={activePoem} entryId={activePoem.id} />
        </div>
      ) : null}

      {/* 今天该复习 */}
      <section className="stack stack--sm">
        <SectionTitle
          sub={
            buckets.due.length
              ? '这些篇目已到复习时间，趁没忘先过一遍'
              : '今天没有到期的篇目，可以去练没背过的'
          }
        >
          🔔 今天该复习（{buckets.due.length}）
        </SectionTitle>
        {buckets.due.length === 0 ? (
          <div className="card card--pad small muted">今天没有到期的复习任务。</div>
        ) : (
          <div className="card">
            {buckets.due.map((p) => {
              const rec = recite[p.id]!;
              return (
                <button
                  key={p.id}
                  className={cn('list-item', activeId === p.id && 'is-active')}
                  onClick={() => setActiveId(activeId === p.id ? null : p.id)}
                >
                  <span className="list-item__index" style={{ background: '#fceeeb', color: '#d24f3d' }}>
                    🔔
                  </span>
                  <span className="list-item__main">
                    <span className="list-item__title">
                      {p.title}
                      <Tag tone="jade">{levelLabel(rec.level)}</Tag>
                    </span>
                    <span className="list-item__meta">
                      <span>
                        {p.dynasty}·{p.author}
                      </span>
                      <span>·</span>
                      <span>{gradeShort(p.grade)}</span>
                      <span>·</span>
                      <span>已背 {rec.times} 次</span>
                    </span>
                  </span>
                  <span className="list-item__right">开始 →</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 还没背过 */}
      <section className="stack stack--sm">
        <SectionTitle sub={`本学段还有 ${buckets.fresh.length} 篇没开始背，挑一篇试试`}>
          🌱 还没背过
        </SectionTitle>
        {buckets.fresh.length === 0 ? (
          <div className="card card--pad small muted">本学段的篇目都已经开始背了。</div>
        ) : (
          <div className="card">
            {buckets.fresh.slice(0, 12).map((p) => (
              <button
                key={p.id}
                className={cn('list-item', activeId === p.id && 'is-active')}
                onClick={() => setActiveId(activeId === p.id ? null : p.id)}
              >
                <span className="list-item__index">{gradeShort(p.grade)}</span>
                <span className="list-item__main">
                  <span className="list-item__title">{p.title}</span>
                  <span className="list-item__meta">
                    <span>
                      {p.dynasty}·{p.author}
                    </span>
                    <span>·</span>
                    <span>{p.genre}</span>
                    <span>·</span>
                    <span>{p.lines.length} 句</span>
                  </span>
                </span>
                <span className="list-item__right">开始 →</span>
              </button>
            ))}
            {buckets.fresh.length > 12 ? (
              <div className="card__body small muted center">
                还有 {buckets.fresh.length - 12} 篇，去
                <Link to="/s/chinese/poems" style={{ color: 'var(--c-primary)' }}>
                  「古诗词背诵与默写」
                </Link>
                里挑
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* 已排期 */}
      {buckets.scheduled.length ? (
        <section className="stack stack--sm">
          <SectionTitle sub="这些还没到复习时间，不用现在花力气">⏳ 已排期（{buckets.scheduled.length}）</SectionTitle>
          <div className="card card--pad">
            <div className="row row--wrap">
              {buckets.scheduled.slice(0, 20).map((p) => (
                <Tag key={p.id} tone="blue">
                  {p.title} · {daysUntilDue(recite[p.id])} 天后
                </Tag>
              ))}
              {buckets.scheduled.length > 20 ? (
                <Tag>… 另有 {buckets.scheduled.length - 20} 篇</Tag>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {allPoems.length === 0 ? (
        <EmptyState icon="📭" title="还没有可背诵的篇目" desc={`当前题库共 ${contentStats.entries} 条内容。`} />
      ) : null}
    </div>
  );
}
