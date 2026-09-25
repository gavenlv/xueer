/**
 * 学一补多：在详情页把「学这一篇时顺带能补上的其它初中知识点」集中列出来。
 *
 * 与 `RelatedList`（🔗 关联学习：同作者／同主题／同意象的横向比较）分工不同：
 * 这里回答的是「学一补多」——同一作品在别的模块的另一种学法、同作者的其它作品、
 * 考同一批知识点的篇目、本篇正文里出现的字词成语、相关的文学常识。
 * 布局沿用既有的卡片 + 列表项样式，只是多了一层分组标题。
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Entry } from '../types';
import { allEntries, subjectOfModule } from '../data';
import { getModuleMeta } from '../data/subjects';
import { supplementsOf } from '../lib/relations';
import { Tag } from './common';

export function SupplementList({ entry }: { entry: Entry }) {
  const groups = useMemo(() => supplementsOf(entry, allEntries), [entry]);
  const total = groups.reduce((a, g) => a + g.items.length, 0);

  if (!total) return null;

  return (
    <section className="card">
      <div className="card__head">
        <span className="card__title">
          <span>🧩</span>
          学一补多
          <Tag tone="jade">{total} 个知识点</Tag>
        </span>
        <span className="spacer" />
        <span className="small muted">学一篇，顺带串起同源的其它知识点</span>
      </div>
      <div className="card__body card__body--tight">
        {groups.map((g, gi) => (
          <div key={g.kind} style={gi ? { marginTop: 10, borderTop: '1px solid var(--c-line)' } : undefined}>
            <div
              className="row row--wrap"
              style={{ alignItems: 'baseline', gap: 8, padding: '8px 16px 0' }}
            >
              <Tag tone="purple">{g.kind}</Tag>
              <span className="small muted">{g.hint}</span>
              {g.action ? (
                <>
                  <span className="spacer" />
                  <Link className="btn btn--sm" to={g.action.to}>
                    {g.action.label}
                  </Link>
                </>
              ) : null}
            </div>
            {g.items.map(({ entry: e, reason }) => {
              const meta = getModuleMeta(e.moduleId);
              const subject = subjectOfModule(e.moduleId) ?? 'chinese';
              return (
                <Link className="list-item" key={e.id} to={`/s/${subject}/${e.moduleId}/${e.id}`}>
                  <span
                    className="list-item__index"
                    style={{
                      background: `${meta?.module.color ?? '#2f66d6'}16`,
                      color: meta?.module.color,
                    }}
                  >
                    {meta?.module.icon}
                  </span>
                  <span className="list-item__main">
                    <span className="list-item__title">
                      {e.title}
                      <Tag tone="jade">{reason}</Tag>
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
        ))}
      </div>
    </section>
  );
}
