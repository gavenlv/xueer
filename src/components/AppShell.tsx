/** 应用外壳：顶栏 + 移动端底部标签栏（含「更多」面板） */

import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStreak, useStudy } from '../store/StudyContext';
import { isCloudConfigured } from '../lib/supabase';
import { cn, dateKey } from '../lib/utils';

const NAV = [
  { to: '/', label: '首页', icon: '🏠', end: true, mobile: true },
  { to: '/s/chinese', label: '语文', icon: '📕', end: false, mobile: true },
  // 数学入口暂时隐藏（内容与路由都还在，直接访问 /s/math 可用）。
  // 想恢复，取消下面这行的注释即可。
  // { to: '/s/math', label: '数学', icon: '📐', end: false, mobile: true },
  { to: '/recite', label: '背诵', icon: '📅', end: false, mobile: true },
  { to: '/exam', label: '中考考点', icon: '🎯', end: false, mobile: false },
  { to: '/extras', label: '知识拓展', icon: '🧩', end: false, mobile: false },
  { to: '/wrong', label: '错题本', icon: '🗂️', end: false, mobile: true },
  { to: '/stats', label: '学习报告', icon: '📊', end: false, mobile: true },
  // 账户入口仅在配置了 Supabase 环境变量后出现（纯本地模式下没有意义）
  ...(isCloudConfigured
    ? [{ to: '/account', label: '账户', icon: '👤', end: false, mobile: false }]
    : []),
];

/** 移动端 tab 放不下的入口，收进「更多」面板 */
const MORE_NAV = NAV.filter((n) => !n.mobile);

export default function AppShell() {
  const streak = useStreak();
  const { checkin, state } = useStudy();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  // 打开应用即完成当日打卡
  useEffect(() => {
    checkin();
  }, [checkin]);

  // 路由变化时收起「更多」面板
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const todayAnswered = state.daily[dateKey()]?.answered ?? 0;
  // 当前位于「更多」收录的页面时，底部栏的「更多」按钮保持高亮
  const moreActive = MORE_NAV.some((n) => location.pathname.startsWith(n.to));

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <NavLink to="/" className="brand">
            <span className="brand__mark">学</span>
            <span>
              <span className="brand__text">学而</span>
              <span className="brand__sub" style={{ marginLeft: 6 }}>
                中学生学习 · 语文
              </span>
            </span>
          </NavLink>

          <nav className="topnav">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) => cn('topnav__link', isActive && 'is-active')}
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <span className="spacer" />

          {todayAnswered > 0 ? (
            <span className="timer-pill" title="今日已答题数">
              ✍️ {todayAnswered}
            </span>
          ) : null}
          <span className="topbar__streak" title="连续打卡天数">
            🔥 连续 {streak} 天
          </span>
        </div>
      </header>

      <main className="app__main" key={location.pathname}>
        <div className="container">
          <Outlet />
        </div>
      </main>

      <nav className="tabbar">
        {NAV.filter((n) => n.mobile).map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => cn('tabbar__item', isActive && 'is-active')}
          >
            <span className="tabbar__icon">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className={cn('tabbar__item', 'tabbar__more', moreActive && 'is-active')}
          onClick={() => setMoreOpen(true)}
        >
          <span className="tabbar__icon">⋯</span>
          <span>更多</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="moresheet" role="dialog" aria-label="更多页面">
          <div className="moresheet__mask" onClick={() => setMoreOpen(false)} />
          <div className="moresheet__panel">
            <div className="moresheet__title">更多页面</div>
            {MORE_NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) => cn('moresheet__link', isActive && 'is-active')}
              >
                <span className="moresheet__icon">{n.icon}</span>
                <span>{n.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
