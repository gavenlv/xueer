/**
 * KaTeX 公式渲染。
 * 内容数据里以 TeX 源码书写数学表达式（如 `x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}`），
 * 渲染失败时降级为原文显示，绝不因为一条公式写错而白屏。
 */

import { useMemo } from 'react';
import katex from 'katex';
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

/** 行内可能混有文字与公式：$...$ 之间按公式渲染 */
export function RichText({ text, block }: { text: string; block?: boolean }) {
  const parts = useMemo(() => text.split(/(\$[^$]+\$)/g), [text]);
  return (
    <span className={cn(block && 'rich-block')}>
      {parts.map((p, i) => {
        if (p.startsWith('$') && p.endsWith('$') && p.length > 2) {
          return <Tex key={i} tex={p.slice(1, -1)} />;
        }
        return <span key={i}>{p}</span>;
      })}
    </span>
  );
}
