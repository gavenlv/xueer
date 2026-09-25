/**
 * 思维导图渲染器：横向树状布局（根节点在左，分支向右展开）。
 * 用 CSS 伪元素画连接线，无需 SVG，中文自动换行、移动端可横向滚动。
 */

import { useState } from 'react';
import type { MindNode } from '../types';
import { cn } from '../lib/utils';

type Mode = 'default' | 'all' | 'none';

/** 默认展开深度：根的直接子分支展开一层，更深的层级收起，避免一屏塞满 */
const DEFAULT_OPEN_DEPTH = 1;

function shouldOpen(mode: Mode, depth: number): boolean {
  if (mode === 'all') return true;
  // 只看主干：所有分支都收起，仅显示中心主题与一级分支
  if (mode === 'none') return false;
  return depth < DEFAULT_OPEN_DEPTH;
}

function Branch({ node, depth, mode }: { node: MindNode; depth: number; mode: Mode }) {
  const kids = node.children ?? [];
  const hasKids = kids.length > 0;
  const [open, setOpen] = useState(() => shouldOpen(mode, depth));

  return (
    <div className="mm-branch">
      <div className="mm-self">
        <button
          type="button"
          className={cn('mm-label', hasKids && 'is-toggle')}
          onClick={hasKids ? () => setOpen((o) => !o) : undefined}
          disabled={!hasKids}
          aria-expanded={hasKids ? open : undefined}
        >
          <span className="mm-label__text">{node.label}</span>
          {hasKids ? <span className="mm-label__badge">{open ? '−' : kids.length}</span> : null}
        </button>
        {node.note ? <div className="mm-note">{node.note}</div> : null}
      </div>

      {hasKids && open ? (
        <div className="mm-kids">
          {kids.map((child, i) => (
            <Branch key={`${child.label}-${i}`} node={child} depth={depth + 1} mode={mode} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function MindMapView({
  root,
  defaultMode = 'default',
}: {
  root: MindNode;
  /** 初始展开程度：default=展开两层；none=只看主干（用于页面上的兜底导图） */
  defaultMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  // 切换模式时用 key 强制重挂载，让各节点回到对应展开状态
  const [nonce, setNonce] = useState(0);

  const switchMode = (next: Mode) => {
    setMode(next);
    setNonce((n) => n + 1);
  };

  const kids = root.children ?? [];

  return (
    <div>
      <div className="mindmap__toolbar">
        <button
          type="button"
          className={cn('btn btn--sm', mode === 'all' && 'btn--primary')}
          onClick={() => switchMode(mode === 'all' ? 'default' : 'all')}
        >
          展开全部
        </button>
        <button
          type="button"
          className={cn('btn btn--sm', mode === 'none' && 'btn--primary')}
          onClick={() => switchMode(mode === 'none' ? 'default' : 'none')}
        >
          只看主干
        </button>
        <span className="mindmap__hint">点节点可展开／收起，沿分支回忆能记得更牢</span>
      </div>

      <div className="mindmap">
        <div className="mm-self">
          <div className="mm-label mm-label--root">
            <span className="mm-label__text">{root.label}</span>
          </div>
          {root.note ? <div className="mm-note">{root.note}</div> : null}
        </div>

        {kids.length ? (
          <div className="mm-kids">
            {kids.map((child, i) => (
              <Branch
                key={`${nonce}-${child.label}-${i}`}
                node={child}
                depth={0}
                mode={mode}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
