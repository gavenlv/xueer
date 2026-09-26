/**
 * 练习题的「学回去」入口：答完一题之后，学生最需要的是**回到知识点**再读一遍，
 * 而不是继续蒙下一题。所以每道题的解析下方都给两个出口：
 *
 *   📖 回知识点 —— 直接跳到这道题的来源内容（如「《陋室铭》理解性默写」→《陋室铭》详情页）；
 *   🧩 关联知识 —— 展开这道题牵出的其它初中知识点（同作者、同一考点、本篇字词、相关文学常识），
 *                  每一条都能点进去，等于把「学一补多」搬进了练习里。
 *
 * 关联数据用 `supplementsOf` 现算：来源条目已加载就用完整数据（能带上「本篇涉及的字词」），
 * 未加载就退回轻量清单骨架（见 `lib/relNode.ts`），因此练习页不必为了这个入口多加载模块。
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { QuizItem } from '../types';
import { allEntries, findEntryById, subjectOfModule } from '../data';
import { getModuleMeta } from '../data/subjects';
import { supplementsOf } from '../lib/relations';
import { metaById, relOfEntry, relOfMeta, relPool } from '../lib/relNode';
import { cn } from '../lib/utils';
import { Tag } from './common';

/** 关联知识点最多列几条 */
const MAX_RELATED = 4;

export function QuizLearnLinks({ item, className }: { item: QuizItem; className?: string }) {
  const [open, setOpen] = useState(false);

  const related = useMemo(() => {
    const entry = findEntryById(item.sourceId);
    const meta = entry ? undefined : metaById(item.sourceId);
    const self = entry ? relOfEntry(entry) : meta ? relOfMeta(meta) : undefined;
    if (!self) return [];
    const groups = supplementsOf(self, relPool(allEntries));
    return groups
      .flatMap((g) => g.items.map((it) => ({ ...it, kind: g.kind })))
      .slice(0, MAX_RELATED);
  }, [item.sourceId]);

  const subject = subjectOfModule(item.moduleId) ?? 'chinese';
  const moduleMeta = getModuleMeta(item.moduleId);

  return (
    <div className={cn('learn-back', className)}>
      <div className="row row--wrap">
        <Link className="btn btn--sm btn--primary" to={`/s/${subject}/${item.moduleId}/${item.sourceId}`}>
          📖 回知识点：{item.sourceTitle}
        </Link>
        {related.length ? (
          <button
            type="button"
            className="btn btn--sm"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            🧩 关联知识（{related.length}）
            <span className="learn-back__caret">{open ? '▲' : '▼'}</span>
          </button>
        ) : null}
        {moduleMeta ? <Tag>{moduleMeta.module.name}</Tag> : null}
      </div>

      {open && related.length ? (
        <div className="learn-back__list fade-in">
          {related.map((r) => (
            <Link
              className="list-item"
              key={r.entry.id}
              to={`/s/${subjectOfModule(r.entry.moduleId) ?? 'chinese'}/${r.entry.moduleId}/${r.entry.id}`}
            >
              <span className="list-item__main">
                <span className="list-item__title">
                  {r.entry.title}
                  <Tag tone="purple">{r.kind}</Tag>
                </span>
                <span className="list-item__meta">
                  <span>{r.reason}</span>
                </span>
              </span>
              <span className="list-item__right">→</span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
