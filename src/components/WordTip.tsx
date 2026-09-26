/**
 * 带释义提示的正文：需要翻译的词带虚线下划线，鼠标悬停（或手机点按）弹出释义。
 *
 * 为什么不用纯 CSS 的 `::after` + `attr()`：气泡要跟随词的位置、还要避免被
 * `.card` / `.poem-sheet` 的 `overflow` 裁掉，纯 CSS 很难做稳；手机上也没有 hover。
 * 所以用一个**单例气泡层**：任何词被悬停或聚焦时，把气泡定位到它上方显示。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GlossaryWord, TextPiece } from '../lib/glossary';
import { splitText } from '../lib/glossary';
import { cn } from '../lib/utils';

interface TipState {
  text: string;
  x: number;
  y: number;
}

/** 同一时刻只允许一个气泡：任何一次的显示会先把上一个关掉 */
let closeCurrent: (() => void) | null = null;

function TipBubble({ tip }: { tip: TipState }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);

  // 气泡超出屏幕左右边界时修正位置，避免手机上被切掉
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const half = w / 2;
    const minX = half + 8;
    const maxX = window.innerWidth - half - 8;
    setOffset(tip.x < minX ? minX - tip.x : tip.x > maxX ? maxX - tip.x : 0);
  }, [tip]);

  return (
    <div
      ref={ref}
      className="tip-bubble"
      role="tooltip"
      style={{ left: tip.x + offset, top: tip.y }}
    >
      {tip.text}
    </div>
  );
}

export function WordTip({ word, explain }: { word: string; explain: string }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const ref = useRef<HTMLSpanElement | null>(null);

  const hide = useCallback(() => {
    setTip(null);
    if (closeCurrent === hide) closeCurrent = null;
  }, []);

  const show = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    closeCurrent?.();
    closeCurrent = hide;
    setTip({ text: explain, x: r.left + r.width / 2, y: r.top - 8 });
  }, [explain, hide]);

  useEffect(
    () => () => {
      if (closeCurrent === hide) closeCurrent = null;
    },
    [hide],
  );

  return (
    <>
      <span
        ref={ref}
        className={cn('tip-word', tip && 'is-open')}
        tabIndex={0}
        role="button"
        aria-label={`${word}：${explain}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          // 手机上点一下展开、再点一下收起。
          // 必须阻止冒泡：正文里的句子本身可点（点击遮住/显示），
          // 若点在词上又冒泡上去，会变成「点一下既弹释义又把整句遮掉」。
          e.preventDefault();
          e.stopPropagation();
          if (tip) hide();
          else show();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') hide();
        }}
      >
        {word}
      </span>
      {tip ? <TipBubble tip={tip} /> : null}
    </>
  );
}

/**
 * 渲染一段正文，自动给词表里的词加上提示。
 * `words` 为空时按纯文本输出，不产生任何额外节点。
 */
export function AnnotatedText({
  text,
  words,
  className,
}: {
  text: string;
  words: GlossaryWord[];
  className?: string;
}) {
  const pieces: TextPiece[] =
    words.length > 0 ? splitText(text, words) : [{ text } as TextPiece];

  return (
    <span className={className}>
      {pieces.map((p, i) =>
        p.explain ? (
          <WordTip key={i} word={p.text} explain={p.explain} />
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </span>
  );
}

/** 该段文字里是否真的有可提示的词（没有就不必包一层） */
export function hasTip(text: string, words: GlossaryWord[]): boolean {
  return words.length > 0 && splitText(text, words).some((p) => p.explain);
}
