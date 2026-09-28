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
 * 三个要点：
 * 1. **服务端渲染（`pnpm smoke`）不会卡住**：`isScopeReady` 先做同步判断，
 *    校验脚本在渲染前已经 `await ensureAll()`，因此首帧就是「已就绪」，
 *    页面直接渲染真实内容——既有的「渲染出真实内容」断言因此依然有效。
 * 2. **重复声明安全**：已加载的模块直接返回 true，不会重复请求。
 * 3. **失败必须给出口**：加载失败时 `ensureModules` 会抛出，此时不能一直停在
 *    「正在加载内容…」上——占位组件给出重试入口，订阅进度在重试成功后自动恢复渲染。
 */

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import {
  ensureModules,
  isScopeReady,
  loadProgress,
  subscribeLoadProgress,
  type DataScope,
} from '../data';
import { isZhTopicsReady, loadZhTopics } from '../data/chinese';
import { ProgressBar } from '../components/common';

export function useDataScope(scope: DataScope[]): boolean {
  // 用 join 出来的字符串当依赖，避免每次渲染都因为新数组而重跑
  const key = scope.join(',');
  const [ready, setReady] = useState(() => isScopeReady(scope));

  useEffect(() => {
    const check = () => setReady(isScopeReady(scope));
    check();
    if (isScopeReady(scope)) return;

    let alive = true;
    // 成功与失败都再判一次：失败时不能永远停在占位上（见文件头第 3 点）
    ensureModules(scope).then(
      () => alive && check(),
      () => alive && check(),
    );
    // 重试成功后进度会变到终态，这里据此把页面切回真实内容。
    // 只认终态：进度 100% 时全局容器还没同步，此刻放行会渲染出空内容。
    const unsub = subscribeLoadProgress(() => {
      if (!alive) return;
      const p = loadProgress();
      if (p.synced || p.failed) check();
    });
    return () => {
      alive = false;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return ready;
}

/**
 * 加载中的占位：显示**真实进度**而不是一个静止的转圈。
 *
 * 手机上某一科的内容有几百 KB 到数 MB，慢的时候要好几分钟；原来只有一句
 * 「正在加载内容…」，学生分不清是在下载、下了多少、还是已经卡死。这里给出
 * 正在下载的范围、已加载块数、进度条与已等待秒数；真失败了给「重试」。
 *
 * `failed` / `onRetry` 是给**模块之外**的加载用的（中考专题正文：一个专题一块，
 * 不经过 `ensureModules` 的进度上报）。页面把自己的失败状态传进来，学生同样有出口，
 * 而不是永远停在「正在加载内容…」上。
 */
export function DataLoading({
  label = '正在加载内容…',
  failed = false,
  onRetry,
}: {
  label?: string;
  failed?: boolean;
  onRetry?: () => void;
}) {
  const p = useSyncExternalStore(subscribeLoadProgress, loadProgress, loadProgress);
  // 已等待秒数：让用户分得清「在下载」与「卡死了」
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const scopeText = p.labels.join('、');

  if (p.failed || failed) {
    return (
      <div className="stack stack--lg">
        <div className="card card--pad">
          <div className="row row--between">
            <div>
              <div className="bold">内容加载失败</div>
              <div className="small muted">
                网络可能中断，或应用刚更新过缓存。点「重试」重新下载
                {scopeText ? `：${scopeText}` : '本页内容'}。
              </div>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--sm nowrap"
              onClick={() => {
                // 重试由调用方决定重下哪一块（专题正文），没有回调时退回本页模块范围
                if (onRetry) {
                  onRetry();
                  return;
                }
                // 失败已记在进度状态里；重试会重新走一遍 ensureModules
                void ensureModules(p.scope).catch(() => undefined);
              }}
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack stack--lg">
      <div className="card card--pad">
        <div className="stack stack--sm">
          <div className="row row--between">
            <div className="small muted">{label}</div>
            <div className="small muted nowrap">已等待 {elapsed} 秒</div>
          </div>
          <div className="row row--between small">
            <span>{scopeText || '本页内容'}</span>
            <span className="muted nowrap">
              {p.total > 0 ? `已加载 ${Math.min(p.done, p.total)} / ${p.total} 块` : '正在准备…'}
            </span>
          </div>
          {p.total > 0 && <ProgressBar value={p.done} max={p.total} thin />}
        </div>
      </div>
    </div>
  );
}

/* ---------------------- 中考专题正文（一专题一块） ---------------------- */

/**
 * 本页要哪几块专题正文：
 *   - `undefined`：本页**不需要**专题正文（例如看的是别的模块）；
 *   - `'all'`：需要全部七块（错题本 / 学习报告 / 考点页这类按题目聚合的页面）；
 *   - `['zht-moxie', …]`：只这几块（详情页、单条内容组卷、错题重做）。
 */
export type ZhTopicSpec = readonly string[] | 'all';

export interface ZhTopicsState {
  ready: boolean;
  failed: boolean;
  /** 失败出口：重新下载本页要的那几块 */
  retry: () => void;
}

/**
 * 等「中考专题」的正文到位，语义与 `useDataScope` **完全一致**：
 *
 * 1. **先同步判断**：已加载的直接放行——SSR 冒烟脚本在渲染前 `await ensureAll()`，
 *    因此首帧就是就绪态，页面直接渲染真实内容（占位不会出现在冒烟 HTML 里）；
 * 2. **再异步加载**：只下载本页点名的那几块，加载完原地补齐条目后自动放行；
 * 3. **失败给出口**：下载失败时返回 `failed`，页面用 `DataLoading` 的重试按钮再试一次，
 *    而不是永远停在「正在加载内容…」上。
 *
 * 为什么不能只靠 `useDataScope(['zh-topics'])`：那个范围代表的是「**轻量清单**已就绪」
 * （模块列表页要能首帧渲染），专题正文是另外一层，必须由用到正文的页面显式声明。
 */
export function useZhTopics(spec: ZhTopicSpec | undefined): ZhTopicsState {
  // 稳定键：数组每次渲染都是新对象，直接进依赖会反复触发加载
  const key = spec === undefined ? '' : spec === 'all' ? 'all' : [...new Set(spec)].sort().join(',');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const ids = key === 'all' ? 'all' : (key.split(',').filter(Boolean) as string[]);
  // 同步判断（见文件头第 1 点）：这一步让「已就绪」的页面不必先渲染一帧占位
  const ready = key === '' || isZhTopicsReady(ids);

  useEffect(() => {
    if (key === '') return;
    if (isZhTopicsReady(key === 'all' ? 'all' : key.split(',').filter(Boolean))) {
      setFailed(false);
      return;
    }
    let alive = true;
    setFailed(false);
    loadZhTopics(key === 'all' ? 'all' : key.split(',').filter(Boolean)).then(
      // 加载完成后推一次渲染：上面的同步判断随即为真，页面切到真实内容
      () => alive && setAttempt((n) => n + 1),
      () => alive && setFailed(true),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ready, failed, retry };
}
