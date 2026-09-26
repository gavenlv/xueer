/**
 * KaTeX 公式渲染。
 * 内容数据里以 TeX 源码书写数学表达式（如 `x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`），
 * 渲染失败时降级为原文显示，绝不因为一条公式写错而白屏。
 *
 * ⚠️ 这个模块**静态依赖 katex**（渲染器 + 样式 + 字体，约 600 kB），
 * 因此只允许被「确实需要公式」的页面引用：数学详情页直接引用它，
 * 而语文/公共组件请一律走 `RichText`（它按需异步加载本模块）。
 */

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '../lib/utils';

export function Tex({
  tex,
  block,
  className,
}: {
  tex: string;
  /** 独立成行居中显示（用于公式块） */
  block?: boolean;
  className?: string;
}) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        throwOnError: false,
        displayMode: Boolean(block),
        strict: false,
        output: 'html',
      });
    } catch {
      return null;
    }
  }, [tex, block]);

  if (html === null) {
    // 渲染失败：原样显示，保留可读性
    return <code className={cn('tex-fallback', className)}>{tex}</code>;
  }

  return (
    <span
      className={cn(block ? 'tex tex--block' : 'tex', className)}
      // KaTeX 输出的受信任 HTML（数据为本项目自带，不来自用户输入）
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

