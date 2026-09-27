/**
 * 「计分科目与分值」一览：**首页的科目入口**（学科页只讲本学科的章节，不再重复这张表）。
 *
 * 排序依据是 2027—2029 广州中考录取计分科目满分（数学 150 → 体育与健康 70），
 * 条形长度按分值等比，学生一眼就能看出该把时间往哪儿放。
 * 每一行都是链接，点一下直接进入该科——首页要做的「快速跳到任何一科」就是这一张表。
 * 待开发科目照常列出（标注「待开发」），因为**分值不会因为还没开发而消失**——
 * 提前知道物理 100 分、化学 70 分，比只看到已上线的科目更有用。
 */

import { Link } from 'react-router-dom';
import { SUBJECTS, TOTAL_SCORE, weightOf } from '../data/subjects';
import { cn } from '../lib/utils';
import { SectionTitle, Tag } from './common';

/** 条形按最高分（数学 150）等比，最长的那条即满分科目 */
const MAX_SCORE = Math.max(...SUBJECTS.map((s) => s.score));

export function SubjectWeightList({ currentId }: { currentId?: string }) {
  return (
    <div className="stack stack--sm">
      {SUBJECTS.map((s) => {
        const active = s.id === currentId;
        return (
          <Link
            key={s.id}
            to={`/s/${s.id}`}
            className={cn('row', 'weight-row', active && 'is-active')}
            style={{
              background: active ? `${s.color}12` : undefined,
              border: `1px solid ${active ? `${s.color}55` : 'transparent'}`,
            }}
          >
            <span
              className="weight-row__name"
              style={{ fontWeight: active ? 700 : 500 }}
            >
              {s.icon} {s.name}
            </span>
            <span className="weight-row__bar">
              <span className="progress" style={{ height: 8, display: 'block' }}>
                <span
                  className="progress__bar"
                  style={{
                    width: `${Math.round((s.score / MAX_SCORE) * 100)}%`,
                    background: s.color,
                    display: 'block',
                  }}
                />
              </span>
            </span>
            <span className="weight-row__score" style={{ color: s.color }}>
              {s.score} 分
            </span>
            <span className="weight-row__pct small muted">{weightOf(s)}%</span>
            <span className="weight-row__state">
              {s.available ? (
                <span className="small" style={{ color: 'var(--c-jade, #1a9a6c)' }}>
                  已上线
                </span>
              ) : (
                <Tag tone="gold">待开发</Tag>
              )}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function WeightBoard({ currentId }: { currentId?: string }) {
  return (
    <section className="card card--pad stack stack--sm">
      <SectionTitle sub={`点任意一科直接进入 · 按 2027—2029 广州中考录取计分科目满分排序 · 总分 ${TOTAL_SCORE} 分`}>
        计分科目与分值
      </SectionTitle>
      <SubjectWeightList currentId={currentId} />
    </section>
  );
}