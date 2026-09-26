/** 应用外壳：顶栏（含学科下拉）+ 移动端底部标签栏（含「更多」与「学科」面板） */

import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStreak, useStudy } from '../store/StudyContext';
import { useAuth } from '../auth/AuthContext';
import { isCloudConfigured } from '../lib/supabase';
import { SUBJECTS } from '../data/subjects';
import { cn, dateKey } from '../lib/utils';
import { SubjectMenu, SubjectSheet } from './SubjectMenu';

/**
 * 导航项。
 *
 * `mobile: true` 的项进手机底部标签栏（放不下 6 个以上，因此只留最常用的），
 * 其余进「更多」面板。**学科不进这里**——学科与模块由 `SubjectMenu` 统一管，
 * 否则「语文」会占掉底部栏宝贵的一格，而历史却无处安放。
 */
const NAV = [
  { to: '/', label: '首页', icon: '🏠', end: true, mobile: true },
  { to: '/recite', label: '背诵', icon: '📅', end: false, mobile: true },
  { to: '/wrong', label: '错题本', icon: '🗂️', end: false, mobile: true },
  // 以下进「更多」面板（手机上点底部栏的「⋯ 更多」）
  { to: '/exam', label: '语文考点', icon: '🎯', end: false, mobile: false },
  { to: '/history-review', label: '历史考点与考情', icon: '📊', end: false, mobile: false },
  { to: '/extras', label: '知识拓展', icon: '🧩', end: false, mobile: false },
  { to: '/stats', label: '学习报告', icon: '📈', end: false, mobile: false },
  // 账户入口仅在配置了 Supabase 环境变量后出现（纯本地模式下没有意义）
  ...(isCloudConfigured
    ? [{ to: '/account', label: '账户', icon: '👤', end: false, mobile: false }]
    : []),
];

/** 移动端 tab 放不下的入口，收进「更多」面板 */
const MORE_NAV = NAV.filter((n) => !n.mobile);

/** 顶栏品牌下的副标题：跟着已上线学科走，不再写死「语文」 */
const LIVE_SUBJECTS = SUBJECTS.filter((s) => s.available && !s.hidden);

export default function AppShell() {
  const streak = useStreak();
  const { checkin, state } = useStudy();
  const { user, displayName } = useAuth();
  const location = useLocation();
  /** 面板同一时刻只开一个：'more' 更多页面 / 'subjects' 学科与模块 */
  const [sheet, setSheet] = useState<'more' | 'subjects' | null>(null);

  // 打开应用即完成当日打卡
  useEffect(() => {
    checkin();
  }, [checkin]);

  // 路由变化时收起面板
  useEffect(() => {
    setSheet(null);
  }, [location.pathname]);

  const todayAnswered = state.daily[dateKey()]?.answered ?? 0;
  // 当前位于「更多」收录的页面时，底部栏的「更多」按钮保持高亮
  const moreActive = MORE_NAV.some((n) => location.pathname.startsWith(n.to));
  // 进入了某个学科（学科页/模块页/详情页）时，底部栏「学科」按钮高亮
  const subjectActive = location.pathname.startsWith('/s/');

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <NavLink to="/" className="brand">
            <span className="brand__mark">学</span>
            <span>
              <span className="brand__text">学而</span>
              <span className="brand__sub" style={{ marginLeft: 6 }}>
                初中 · {LIVE_SUBJECTS.map((s) => s.name).join(' / ')}
              </span>
            </span>
          </NavLink>

          <nav className="topnav">
            <NavLink
              to="/"
              end
              className={({ isActive }) => cn('topnav__link', isActive && 'is-active')}
            >
              首页
            </NavLink>
            {/* 学科与模块统一收在这里：两个学科共 14 个模块，塞进导航栏会挤爆 */}
            <SubjectMenu />
            {NAV.filter((n) => n.to !== '/' && n.to !== '/account').map((n) => (
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

          {/* 右上角账户状态：已登录显示用户名，未登录提供登录入口（纯本地模式下不显示） */}
          {isCloudConfigured ? (
            user ? (
              <NavLink
                to="/account"
                className="timer-pill topbar__account"
                title="账户：点这里查看登录与同步状态"
              >
                👤 {displayName || '同学'}
              </NavLink>
            ) : (
              <NavLink to="/account" className="btn btn--primary btn--sm topbar__account">
                登录 / 注册
              </NavLink>
            )
          ) : null}
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
        {/* 学科入口：两个学科共 14 个模块，只有收进面板才放得下 */}
        <button
          type="button"
          className={cn('tabbar__item', subjectActive && 'is-active')}
          onClick={() => setSheet('subjects')}
        >
          <span className="tabbar__icon">📚</span>
          <span>学科</span>
        </button>
        <button
          type="button"
          className={cn('tabbar__item', 'tabbar__more', moreActive && 'is-active')}
          onClick={() => setSheet('more')}
        >
          <span className="tabbar__icon">⋯</span>
          <span>更多</span>
        </button>
      </nav>

      {sheet === 'more' ? (
        <div className="moresheet" role="dialog" aria-label="更多页面">
          <div className="moresheet__mask" onClick={() => setSheet(null)} />
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
      ) : null}

      <SubjectSheet open={sheet === 'subjects'} onClose={() => setSheet(null)} />
    </div>
  );
}
