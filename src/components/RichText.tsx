/**
 * 行内富文本：文字里混着公式时按 `$...$` 切分渲染。
 *
 * **这个文件刻意不 import katex**：
 * 语文页面的题干、解析、选项都要走 RichText，而语文内容里根本没有公式。
 * 如果在这里静态 import KaTeX，600 kB 的渲染器与字体会被打进首屏包，
 * 语文学生白下载一份永远用不到的东西。
 *
 * 所以只有真的出现 `$` 时才**按需加载** `./Tex`（里面才有 katex）：语文一路走
 * 下面的纯文本分支，零开销；数学页第一次遇到公式时才拉那个异步块。
 */

import { Suspense, lazy, useMemo } from 'react';
import { cn } from '../lib/utils';

const LazyTex = lazy(() => import('./Tex').then((m) => ({ default: m.Tex })));

export function RichText({ text, block }: { text: string; block?: boolean }) {
  const hasFormula = text.includes('$');
  const parts = useMemo(() => (hasFormula ? text.split(/(\$[^$]+\$)/g) : [text]), [text, hasFormula]);

  // 没有公式：纯文本直出，不触碰 katex
  if (!hasFormula) {
    return <span className={cn(block && 'rich-block')}>{text}</span>;
  }

  return (
    <span className={cn(block && 'rich-block')}>
      {parts.map((p, i) => {
        if (p.startsWith('$') && p.endsWith('$') && p.length > 2) {
          const tex = p.slice(1, -1);
          return (
            <Suspense key={i} fallback={<code className="tex-fallback">{tex}</code>}>
              <LazyTex tex={tex} />
            </Suspense>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}
