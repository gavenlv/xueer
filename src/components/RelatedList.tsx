/**
 * 关联学习：在内容详情页展示与之相关的其他内容，并说明关联理由。
 * 用于「同作者比较」「同主题串联」「同意象勾连」——中考最常见的横向考查方式。
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Entry } from '../types';
import { allEntries, subjectOfModule } from '../data';
import { getModuleMeta } from '../data/subjects';
import { relatedEntries } from '../lib/relations';
import { Tag } from './common';

export function RelatedList({ entry, limit = 6 }: { entry: Entry; limit?: number }) {
  const items = useMemo(() => relatedEntries(entry, allEntries, limit), [entry, limit]);

  if (!items.length) return null;

  return (
    <section className="card">
      <div className="card__head">
        <span className="card__title">
          <span>🔗</span>
          关联学习
          <Tag tone="purple">{items.length} 条</Tag>
        </span>
        <span className="spacer" />
        <span className="small muted">横向比较比单篇死记更有效</span>
      </div>
      <div className="card__body card__body--tight">
        {items.map(({ entry: e, reason }) => {
          const meta = getModuleMeta(e.moduleId);
          const subject = subjectOfModule(e.moduleId) ?? 'chinese';
          return (
            <Link className="list-item" key={e.id} to={`/s/${subject}/${e.moduleId}/${e.id}`}>
              <span
                className="list-item__index"
                style={{ background: `${meta?.module.color ?? '#2f66d6'}16`, color: meta?.module.color }}
              >
                {meta?.module.icon}
              </span>
              <span className="list-item__main">
                <span className="list-item__title">
                  {e.title}
                  <Tag tone="blue">{reason}</Tag>
                </span>
                <span className="list-item__meta">
                  <span>{meta?.module.name}</span>
                  <span>·</span>
                  <span>{e.subtitle}</span>
                </span>
              </span>
              <span className="list-item__right">→</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
