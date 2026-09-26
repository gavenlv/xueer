/**
 * 学科切换：一个入口管住所有学科与模块。
 *
 * 为什么需要它：科目从 1 个变成 2 个（语文 6 模块 + 历史 8 模块，共 14 个模块）之后，
 * 导航栏塞不下「语文 / 历史 / 历史模拟考试 / 历史中考专题」这么多项，而学生最常用的动作
 * 恰恰是「换一科」「直接进某个模块」。所以把学科与模块收进一个下拉（桌面）/ 面板（手机）：
 *
 *   - 桌面顶栏：点「学科」展开，列出全部已上线学科，每个学科下面直接列它的模块；
 *   - 手机底部栏：点「学科」弹起底部面板，同样的内容做成可点区域足够大的列表。
 *
 * 两处共用同一份数据与同一套排序，因此不会出现「手机里少了某个模块」这种不一致。
 * 隐藏的学科（数学）不出现——与首页、学习报告保持一致。
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SUBJECTS } from '../data/subjects';
import { cn } from '../lib/utils';
import { Tag } from './common';

/** 已上线的学科（隐藏学科不算） */
function liveSubjects() {
  return SUBJECTS.filter((s) => s.available && !s.hidden);
}

/** 从当前路由推断所在学科，如 /s/history/hist-8a → history */
export function subjectIdOfPath(pathname: string): string | undefined {
  const m = /^\/s\/([^/]+)/.exec(pathname);
  return m?.[1];
}

/** 从当前路由推断所在模块，如 /s/history/hist-8a → hist-8a（用于高亮模块项） */
function moduleIdOfPath(pathname: string): string | undefined {
  const m = /^\/s\/[^/]+\/([^/]+)/.exec(pathname);
  return m?.[1];
}

/* ------------------------------ 桌面下拉 ------------------------------ */

export function SubjectMenu() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const subjects = useMemo(liveSubjects, []);
  const currentId = subjectIdOfPath(location.pathname);
  const currentModule = moduleIdOfPath(location.pathname);
  const current = subjects.find((s) => s.id === currentId);

  // 路由变化就收起：点完模块直接进内容，别让面板挡着
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="subjmenu">
      <button
        type="button"
        className={cn('topnav__link subjmenu__trigger', current && 'is-active')}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        {current ? `${current.icon} ${current.name}` : '📚 学科'}
        <span className="subjmenu__caret">▾</span>
      </button>

      {open ? (
        <>
          {/* 点空白处收起 */}
          <div className="subjmenu__mask" onClick={() => setOpen(false)} />
          <div className="subjmenu__panel" role="menu">
            {subjects.map((s) => (
              <div className="subjmenu__group" key={s.id}>
                <Link className="subjmenu__subject" to={`/s/${s.id}`}>
                  <span
                    className="subjmenu__icon"
                    style={{ background: `${s.color}18`, color: s.color }}
                  >
                    {s.icon}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="subjmenu__name">
                      {s.name}
                      <Tag>{s.modules.length} 个模块</Tag>
                    </span>
                    <span className="subjmenu__desc">{s.desc}</span>
                  </span>
                  <span className="subjmenu__arrow">→</span>
                </Link>
                <div className="subjmenu__modules">
                  {s.modules.map((m) => (
                    <Link
                      key={m.id}
                      className={cn(
                        'subjmenu__module',
                        s.id === currentId && m.id === currentModule && 'is-active',
                      )}
                      to={`/s/${s.id}/${m.id}`}
                      style={{ borderColor: `${m.color}33` }}
                    >
                      <span style={{ color: m.color }}>{m.icon}</span>
                      <span>{m.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------ 手机面板 ------------------------------ */

/**
 * 手机底部栏的「学科」按钮 + 弹起面板。
 * 与「更多页面」面板共用一套视觉（`.moresheet`），但内容换成学科与模块，
 * 每一项都是整行大热区，符合手机上的点击习惯。
 */
export function SubjectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const subjects = useMemo(liveSubjects, []);
  if (!open) return null;

  return (
    <div className="moresheet" role="dialog" aria-label="选择学科与模块">
      <div className="moresheet__mask" onClick={onClose} />
      <div className="moresheet__panel">
        <div className="moresheet__title">学科与模块</div>
        {subjects.map((s) => (
          <div key={s.id} style={{ marginBottom: 10 }}>
            <NavLink className="moresheet__link" to={`/s/${s.id}`} onClick={onClose}>
              <span className="moresheet__icon">{s.icon}</span>
              <span style={{ flex: 1 }}>
                {s.name}
                <span className="small muted" style={{ marginLeft: 8 }}>
                  {s.modules.length} 个模块
                </span>
              </span>
              <span className="subjmenu__arrow">→</span>
            </NavLink>
            <div className="sheet-modules">
              {s.modules.map((m) => (
                <Link
                  key={m.id}
                  className="sheet-module"
                  to={`/s/${s.id}/${m.id}`}
                  onClick={onClose}
                >
                  <span>{m.icon}</span>
                  <span>{m.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
