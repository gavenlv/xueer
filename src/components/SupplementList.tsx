/**
 * 学一补多：在详情页把「学这一篇时顺带能补上的其它初中知识点」集中列出来。
 *
 * 与 `RelatedList`（🔗 关联学习：同作者／同主题／同意象的横向比较）分工不同：
 * 这里回答的是「学一补多」——同一作品在别的模块的另一种学法、同作者的其它作品、
 * 考同一批知识点的篇目、本篇正文里出现的字词成语、相关的文学常识。
 *
 * 一组可含 3~5 条，全部展开会让详情页过长，因此沿用拓展阅读那套「分组标题 + 点击展开」
 * 的既有折叠样式（`.ext`），默认只展开第一组。布局与配色完全复用现有设计系统。
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Entry } from '../types';
import { allEntries, subjectOfModule } from '../data';
import { getModuleMeta } from '../data/subjects';
import { supplementsOf } from '../lib/relations';
import { cn } from '../lib/utils';
import { Tag } from './common';

export function SupplementList({ entry }: { entry: Entry }) {
  const groups = useMemo(() => supplementsOf(entry, allEntries), [entry]);
  /** null 表示「还没动过」：默认只展开第一组，避免详情页末尾一下子铺开十几行 */
  const [picked, setPicked] = useState<string[] | null>(null);

  if (!groups.length) return null;

  const kinds = groups.map((g) => g.kind);
  const openList = picked ?? kinds.slice(0, 1);
  const isOpen = (k: string) => openList.includes(k);
  const allOpen = openList.length === kinds.length;
  const total = groups.reduce((a, g) => a + g.items.length, 0);

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
        <button
          className="btn btn--sm"
          onClick={() => setPicked(allOpen ? [] : kinds)}
        >
          {allOpen ? '收起全部' : '展开全部'}
        </button>
      </div>
      <div className="card__body">
        <div className="ext-list">
          {groups.map((g) => {
            const open = isOpen(g.kind);
            return (
              <div className={cn('ext', open && 'is-open')} key={g.kind}>
                <button
                  type="button"
                  className="ext__head"
                  onClick={() =>
                    setPicked(open ? openList.filter((k) => k !== g.kind) : [...openList, g.kind])
                  }
                  aria-expanded={open}
                >
                  <Tag tone="purple">{g.kind}</Tag>
                  <span className="small muted" style={{ flex: 1, minWidth: 0 }}>
                    {g.hint}
                  </span>
                  <span className="small muted">{g.items.length} 条</span>
                  <span className="ext__caret">▼</span>
                </button>

                {open ? (
                  <div className="ext__body fade-in">
                    <div className="card__body--tight" style={{ padding: '0 0 4px' }}>
                      {g.items.map(({ entry: e, reason }) => {
                        const meta = getModuleMeta(e.moduleId);
                        const subject = subjectOfModule(e.moduleId) ?? 'chinese';
                        return (
                          <Link
                            className="list-item"
                            key={e.id}
                            to={`/s/${subject}/${e.moduleId}/${e.id}`}
                          >
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

                    {g.action ? (
                      <div className="row row--wrap" style={{ marginTop: 4 }}>
                        <Link className="btn btn--sm btn--primary" to={g.action.to}>
                          {g.action.label}
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
