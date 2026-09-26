/**
 * 应用外壳：顶栏（首页 + 8 个科目一级菜单 + 用户菜单）+ 移动端底部标签栏。
 *
 * 一级菜单就是科目本身（顺序取自 `data/subjects.ts`，与首页一致）；
 * 背诵 / 错题本 / 考点 / 知识拓展这些**针对某一科**的入口放进各科自己的学科页，
 * 学习报告与账户这类**跨科目**的入口收进右上角用户菜单。
 * 因此这里只剩三件事：品牌、科目、用户。
 */

import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStudy } from '../store/StudyContext';
import { SUBJECTS, TOTAL_SCORE } from '../data/subjects';
import { cn } from '../lib/utils';
import { SubjectMenu, SubjectSheet } from './SubjectMenu';
import { UserMenu, UserSheet } from './UserMenu';

/**
 * 顶栏品牌副标题：计分科目有 8 个，逐科列名字会撑爆顶栏，
 * 因此只标明中考口径——学生一眼知道这个应用是照着哪一年的中考做的。
 * 8 个科目平铺后顶栏变挤，这行小字只在足够宽的屏幕上出现（见 index.css）。
 */
const SUBJECT_COUNT = SUBJECTS.length;

export default function AppShell() {
  const { checkin } = useStudy();
  const location = useLocation();
  /** 手机端面板同一时刻只开一个：'subjects' 学科与模块 / 'user' 我的 */
  const [sheet, setSheet] = useState<'subjects' | 'user' | null>(null);

  // 打开应用即完成当日打卡
  useEffect(() => {
    checkin();
  }, [checkin]);

  // 路由变化时收起面板
  useEffect(() => {
    setSheet(null);
  }, [location.pathname]);

  // 进入了某个学科（学科页/模块页/详情页/科目子页面）时，底部栏「学科」按钮高亮
  const subjectActive = location.pathname.startsWith('/s/');
  // 学习报告与账户页归「我的」
  const userActive =
    location.pathname.startsWith('/stats') || location.pathname.startsWith('/account');

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <NavLink to="/" className="brand">
            <span className="brand__mark">学</span>
            <span>
              <span className="brand__text">学而</span>
              <span className="brand__sub" style={{ marginLeft: 6 }}>
                2027 广州中考 · {SUBJECT_COUNT} 科 {TOTAL_SCORE} 分
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
            {/* 一级菜单 = 全部计分科目（按中考满分降序），点科目就地展开该科的模块 */}
            <SubjectMenu />
          </nav>

          <span className="spacer" />

          {/* 右上角用户入口：已登录显示用户名，未登录就是登录入口（纯本地模式显示「用户」）。
              连续打卡、今日答题数这些「我的」数据收在这个菜单里，把顶栏宽度全让给科目。 */}
          <UserMenu />
        </div>
      </header>

      <main className="app__main" key={location.pathname}>
        <div className="container">
          <Outlet />
        </div>
      </main>

      <nav className="tabbar">
        <NavLink
          to="/"
          end
          className={({ isActive }) => cn('tabbar__item', isActive && 'is-active')}
        >
          <span className="tabbar__icon">🏠</span>
          <span>首页</span>
        </NavLink>
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
          className={cn('tabbar__item', userActive && 'is-active')}
          onClick={() => setSheet('user')}
        >
          <span className="tabbar__icon">👤</span>
          <span>我的</span>
        </button>
      </nav>

      <SubjectSheet open={sheet === 'subjects'} onClose={() => setSheet(null)} />
      <UserSheet open={sheet === 'user'} onClose={() => setSheet(null)} />
    </div>
  );
}