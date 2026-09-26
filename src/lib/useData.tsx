/**
 * 数据按需加载的 React 接入点。
 *
 * 页面开头声明自己需要哪些模块的数据：
 *
 * ```tsx
 * const ready = useDataScope(['poems']);
 * if (!ready) return <DataLoading />;
 * ```
 *
 * 两个要点：
 * 1. **服务端渲染（`pnpm smoke`）不会卡住**：`isScopeReady` 先做同步判断，
 *    校验脚本在渲染前已经 `await ensureAll()`，因此首帧就是「已就绪」，
 *    页面直接渲染真实内容——既有的「渲染出真实内容」断言因此依然有效。
 * 2. **重复声明安全**：已加载的模块直接返回 true，不会重复请求。
 */

import { useEffect, useState } from 'react';
import { ensureModules, isScopeReady, type DataScope } from '../data';

export function useDataScope(scope: DataScope[]): boolean {
  // 用 join 出来的字符串当依赖，避免每次渲染都因为新数组而重跑
  const key = scope.join(',');
  const [ready, setReady] = useState(() => isScopeReady(scope));

  useEffect(() => {
    if (isScopeReady(scope)) {
      setReady(true);
      return;
    }
    let alive = true;
    ensureModules(scope).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return ready;
}

/** 加载中的占位：尽量轻，只占住位置避免跳版 */
export function DataLoading({ label = '正在加载内容…' }: { label?: string }) {
  return (
    <div className="stack stack--lg">
      <div className="card card--pad">
        <div className="small muted">{label}</div>
      </div>
    </div>
  );
}
