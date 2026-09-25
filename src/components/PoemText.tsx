/** 古诗文正文渲染：支持竖排、逐句遮罩（背诵用）与逐句点击 */

import { cn } from '../lib/utils';

export interface PoemTextProps {
  lines: string[];
  /** 竖排显示 */
  vertical?: boolean;
  /** 被遮住的句子下标 */
  hidden?: number[];
  /** 点击某句（用于切换遮罩） */
  onToggleLine?: (index: number) => void;
  /** 高亮的句子下标（如刚揭示的那句） */
  highlight?: number[];
}

export function PoemText({
  lines,
  vertical,
  hidden = [],
  onToggleLine,
  highlight = [],
}: PoemTextProps) {
  return (
    <div className={cn('poem-body', vertical && 'poem-body--vertical')}>
      {lines.map((line, i) => {
        const isHidden = hidden.includes(i);
        const isHighlight = highlight.includes(i);
        return (
          <span
            key={i}
            className={cn(
              'poem-line',
              isHidden && 'is-blank',
              isHighlight && 'is-revealed',
            )}
            onClick={onToggleLine ? () => onToggleLine(i) : undefined}
            role={onToggleLine ? 'button' : undefined}
            tabIndex={onToggleLine ? 0 : undefined}
            title={onToggleLine ? (isHidden ? '点击显示' : '点击遮住') : undefined}
            onKeyDown={
              onToggleLine
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onToggleLine(i);
                    }
                  }
                : undefined
            }
            style={onToggleLine ? { cursor: 'pointer' } : undefined}
          >
            {isHidden ? line.replace(/[^\u4e00-\u9fa5]/g, '') || line : line}
          </span>
        );
      })}
    </div>
  );
}
