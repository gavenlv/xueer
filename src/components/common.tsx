/** 通用小部件 */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export type Tone = 'default' | 'blue' | 'red' | 'jade' | 'gold' | 'purple';

export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: Tone }) {
  return <span className={cn('tag', tone !== 'default' && `tag--${tone}`)}>{children}</span>;
}

export function ProgressBar({
  value,
  max,
  tone = 'blue',
  thin,
}: {
  value: number;
  max: number;
  tone?: 'blue' | 'jade' | 'gold' | 'red';
  thin?: boolean;
}) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={cn('progress', thin && 'progress--thin')}>
      <div
        className={cn('progress__bar', tone !== 'blue' && `progress__bar--${tone}`)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function SectionTitle({
  children,
  sub,
  extra,
}: {
  children: ReactNode;
  sub?: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className="row row--between" style={{ alignItems: 'flex-end' }}>
      <div>
        <h2 className="section-title">
          <span className="section-title__bar" />
          {children}
        </h2>
        {sub ? <div className="section-sub">{sub}</div> : null}
      </div>
      {extra}
    </div>
  );
}

export function Stat({
  value,
  label,
  tone,
}: {
  value: ReactNode;
  label: ReactNode;
  tone?: string;
}) {
  return (
    <div className="stat">
      <div className="stat__value" style={tone ? { color: tone } : undefined}>
        {value}
      </div>
      <div className="stat__label">{label}</div>
    </div>
  );
}

export function EmptyState({
  icon = '📭',
  title,
  desc,
  action,
}: {
  icon?: string;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty__icon">{icon}</div>
      <div className="empty__title">{title}</div>
      {desc ? <div className="empty__desc">{desc}</div> : null}
      {action ? <div style={{ marginTop: 16 }}>{action}</div> : null}
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = '搜索…',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search">
      <span className="search__icon">🔍</span>
      <input
        className="search__input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
      {value ? (
        <button
          className="btn btn--icon"
          style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
          onClick={() => onChange('')}
          aria-label="清空搜索"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

export function Accordion({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn('accordion', open && 'is-open')}>
      <button className="accordion__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {icon ? <span>{icon}</span> : null}
        <span>{title}</span>
        <span className="accordion__caret">▼</span>
      </button>
      {open ? <div className="accordion__body fade-in">{children}</div> : null}
    </div>
  );
}

export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="crumbs">
      {items.map((it, i) => (
        <span key={`${it.label}-${i}`} className="row" style={{ gap: 7 }}>
          {i > 0 ? <span aria-hidden>/</span> : null}
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  crumbs,
  title,
  desc,
  extra,
}: {
  crumbs?: { label: string; to?: string }[];
  title: ReactNode;
  desc?: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <div className="stack stack--sm slide-up">
      {crumbs ? <Crumbs items={crumbs} /> : null}
      <div className="row row--between row--wrap" style={{ alignItems: 'flex-start', gap: 14 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="page-title">{title}</h1>
          {desc ? <div className="page-desc">{desc}</div> : null}
        </div>
        {extra ? <div className="row row--wrap">{extra}</div> : null}
      </div>
    </div>
  );
}

/** 键值对照表（注释、语法等） */
export function NoteGrid({ items }: { items: { word: string; explain: string }[] }) {
  if (!items.length) return null;
  return (
    <div className="note-grid">
      {items.map((n, i) => (
        <div className="note" key={`${n.word}-${i}`}>
          <span className="note__word">{n.word}</span>
          <span className="note__text">{n.explain}</span>
        </div>
      ))}
    </div>
  );
}

/** 段落正文渲染：以 `## ` 开头视为小标题 */
export function Prose({ paragraphs, classical }: { paragraphs: string[]; classical?: boolean }) {
  return (
    <div className={cn('prose', classical && 'prose--classical')}>
      {paragraphs.map((p, i) => {
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
  );
}
