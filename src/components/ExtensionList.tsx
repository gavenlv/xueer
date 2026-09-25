/** 拓展阅读列表：按类别展示额外讲解，可逐条展开 */

import { useState } from 'react';
import type { Extension } from '../types';
import { cn } from '../lib/utils';
import { Tag, type Tone } from './common';

const KIND_TONE: Record<Extension['kind'], Tone> = {
  背景拓展: 'blue',
  对比阅读: 'purple',
  文化常识: 'jade',
  考点延伸: 'red',
  趣味知识: 'gold',
  学法指导: 'default',
};

export function ExtensionList({ items }: { items: Extension[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  if (!items.length) return null;

  return (
    <div className="ext-list">
      {items.map((ext) => {
        const open = openId === ext.id;
        return (
          <div className={cn('ext', open && 'is-open')} key={ext.id}>
            <button
              type="button"
              className="ext__head"
              onClick={() => setOpenId(open ? null : ext.id)}
              aria-expanded={open}
            >
              <Tag tone={KIND_TONE[ext.kind]}>{ext.kind}</Tag>
              <span className="ext__title">{ext.title}</span>
              <span className="ext__caret">▼</span>
            </button>

            {open ? (
              <div className="ext__body fade-in">
                <div className="small muted" style={{ margin: '8px 0 10px' }}>
                  {ext.summary}
                </div>
                <div className="prose">
                  {ext.content.map((p, i) => {
                    const text = p.trim();
                    if (!text) return null;
                    if (text.startsWith('## ')) {
                      return (
                        <h4 key={i} className="prose__h">
                          {text.slice(3)}
                        </h4>
                      );
                    }
                    return <p key={i}>{text}</p>;
                  })}
                </div>

                {ext.think?.length ? (
                  <div className="ext__think">
                    <div className="ext__think-title">💭 想一想</div>
                    {ext.think.map((t, i) => (
                      <div className="ext__think-item" key={i}>
                        <span>{i + 1}.</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
