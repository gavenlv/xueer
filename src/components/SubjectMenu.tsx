/**
 * 一级菜单 = 全部计分科目。
 *
 * 为什么这样排：科目多达 8 个（数学/语文/英语/物理/化学/道法/历史/体育），
 * 而学生最常用的两个动作就是「换一科」和「直接进某一科的某个模块」。
 * 所以顶栏把 8 个科目**直接平铺**出来——顺序与首页完全一致（同一份 `SUBJECTS`），
 * 点哪个科目，就地展开该科的中考模块清单，换科只要点另一个科目，不必先回首页。
 *
 *   - 桌面顶栏：8 个科目各一个入口，共用一个下拉面板，面板里只放当前这一科的模块
 *     （面板贴在导航左缘，不会被最后一个科目挤出屏幕）；
 *   - 手机底部栏：点「学科」弹起底部面板，**只列 8 个科目**（大热区，适合手指），
 *     模块交给学科页的章节导航——面板因此始终保持一屏可读完。
 *
 * 两处共用同一份科目数据与同一套排序，因此不会出现「手机里少了某一科」这种不一致。
 * 内容未开发的科目/模块照常列出并标注「待开发」——分值与模块结构本身就是有效信息。
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SUBJECTS } from '../data/subjects';
import { cn } from '../lib/utils';
import { Tag } from './common';

/** 一级菜单：全部计分科目，数组顺序即 2027 广州中考满分降序（与首页同一份数据） */
function menuSubjects() {
  return SUBJECTS;
}

/** 从当前路由推断所在学科，如 /s/history/hist-8a → history */
function subjectIdOfPath(pathname: string): string | undefined {
  const m = /^\/s\/([^/]+)/.exec(pathname);
  return m?.[1];
}

/** 从当前路由推断所在模块，如 /s/history/hist-8a → hist-8a（用于高亮模块项） */
function moduleIdOfPath(pathname: string): string | undefined {
  const m = /^\/s\/[^/]+\/([^/]+)/.exec(pathname);
  return m?.[1];
}

/* ------------------------ 桌面：科目平铺 + 就地展开模块 ------------------------ */

export function SubjectMenu() {
  const location = useLocation();
  /** 当前展开的科目 id（同时只开一个面板） */
  const [openId, setOpenId] = useState<string | null>(null);
  const subjects = useMemo(menuSubjects, []);
  const currentId = subjectIdOfPath(location.pathname);
  const currentModule = moduleIdOfPath(location.pathname);
  const open = subjects.find((s) => s.id === openId);

  // 路由变化就收起：点完模块直接进内容，别让面板挡着
  useEffect(() => {
    setOpenId(null);
  }, [location.pathname]);

  return (
    <>
      {subjects.map((s) => (
        <button
          key={s.id}
          type="button"
          className={cn('topnav__link subjmenu__trigger', s.id === currentId && 'is-active')}
          aria-expanded={openId === s.id}
          aria-haspopup="true"
          title={`${s.name} · 中考 ${s.score} 分 · ${s.modules.length} 个模块`}
          onClick={() => setOpenId(openId === s.id ? null : s.id)}
        >
          {s.icon} {s.name}
          <span className="subjmenu__caret">▾</span>
        </button>
      ))}

      {open ? (
        <>
          {/* 点空白处收起 */}
          <div className="subjmenu__mask" onClick={() => setOpenId(null)} />
          <div className="subjmenu__panel" role="menu">
            <div className="subjmenu__title">
              {open.icon} {open.name}
              <Tag>
                {open.score} 分 · {open.modules.length} 模块
              </Tag>
              {open.available ? null : <Tag tone="gold">待开发</Tag>}
            </div>
            <div className="subjmenu__modules">
              {open.modules.map((m) => (
                <Link
                  key={m.id}
                  className={cn(
                    'subjmenu__module',
                    open.id === currentId && m.id === currentModule && 'is-active',
                  )}
                  to={`/s/${open.id}/${m.id}`}
                  style={{ borderColor: `${m.color}33`, opacity: m.available ? undefined : 0.6 }}
                >
                  <span style={{ color: m.color }}>{m.icon}</span>
                  <span>{m.name}</span>
                  {m.available ? null : <span className="small muted">待开发</span>}
                </Link>
              ))}
            </div>
            <Link className="subjmenu__subject" to={`/s/${open.id}`}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="subjmenu__name">进入{open.name}首页</span>
                <span className="subjmenu__desc">{open.desc}</span>
              </span>
              <span className="subjmenu__arrow">→</span>
            </Link>
          </div>
        </>
      ) : null}
    </>
  );
}

/* ------------------------------ 手机面板 ------------------------------ */

/**
 * 手机底部栏的「学科」按钮 + 弹起面板。
 *
 * 面板只列科目（点一下进该科），**不再展开模块**：8 科 × 每科 6~8 个模块铺出来
 * 上千像素，面板贴在屏幕底部又划不动，排在后面的科目根本够不着（真机上就是
 * 「点了学科进不去具体科目」）。模块是学科页的本职——`/s/:id` 的章节导航一屏列全，
 * 所以这里把模块交给学科页，面板保持短小、一屏可读完。
 */
export function SubjectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const subjects = useMemo(menuSubjects, []);
  if (!open) return null;

  return (
    <div className="moresheet" role="dialog" aria-label="选择学科">
      <div className="moresheet__mask" onClick={onClose} />
      <div className="moresheet__panel">
        <div className="moresheet__title">选择学科</div>
        {subjects.map((s) => (
          <NavLink
            key={s.id}
            className="moresheet__link"
            to={`/s/${s.id}`}
            onClick={onClose}
          >
            <span
              className="moresheet__icon"
              style={{ background: `${s.color}18`, color: s.color, borderRadius: 10 }}
            >
              {s.icon}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              {s.name}
              <span
                className="small muted"
                style={{ display: 'block', fontWeight: 500, marginTop: 2 }}
              >
                {s.score} 分 · {s.modules.length} 模块
                {s.available ? '' : ' · 待开发'}
              </span>
            </span>
            <span className="subjmenu__arrow">→</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}