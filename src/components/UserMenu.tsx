/**
 * 用户菜单：把「与具体科目无关」的入口收在一处。
 *
 * 一级菜单让给了科目（学生最常用的动作是「进某一科」），于是学习报告、账户与同步
 * 这类跨科目的入口改挂在右上角的用户入口下：桌面是下拉，手机是底部面板，两处内容一致。
 *
 * 未配置云端时应用是纯本地模式：不出现「登录 / 注册」，但学习报告照常可用。
 */

import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { isCloudConfigured } from '../lib/supabase';
import { useStreak, useStudy } from '../store/StudyContext';
import { cn, dateKey } from '../lib/utils';

/** 用户相关入口：不针对某一科，所以不属于科目一级菜单 */
export const USER_NAV: { to: string; label: string; icon: string; desc: string }[] = [
  { to: '/stats', label: '学习报告', icon: '📈', desc: '各科进度与薄弱知识点' },
  ...(isCloudConfigured
    ? [{ to: '/account', label: '账户与同步', icon: '👤', desc: '登录后进度在设备间同步' }]
    : []),
];

/** 右上角用户入口的文案：登录状态决定它是「用户名」还是「登录 / 注册」 */
function useUserLabel(): string {
  const { user, displayName } = useAuth();
  if (!isCloudConfigured) return '👤 用户';
  return user ? `👤 ${displayName || '同学'}` : '登录 / 注册';
}

/**
 * 连续打卡与今日答题数：原本占着顶栏的位置，8 个科目平铺后放不下，
 * 于是收进「我的」（它们本来就只跟用户有关，不针对某一科）。
 */
function useUserStat(): { streak: number; answered: number } {
  const streak = useStreak();
  const { state } = useStudy();
  return { streak, answered: state.daily[dateKey()]?.answered ?? 0 };
}

function UserStat() {
  const { streak, answered } = useUserStat();
  return (
    <div className="usermenu__stat">
      <span>🔥 连续 {streak} 天</span>
      <span>✍️ 今日 {answered} 题</span>
    </div>
  );
}

/* ------------------------------ 桌面下拉 ------------------------------ */

export function UserMenu() {
  const label = useUserLabel();
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // 路由变化就收起
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="usermenu">
      <button
        type="button"
        className={cn(
          'usermenu__trigger',
          user ? 'timer-pill topbar__account' : 'btn btn--primary btn--sm topbar__account',
        )}
        aria-expanded={open}
        aria-haspopup="true"
        title="我的：学习报告与账户"
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <span className="subjmenu__caret">▾</span>
      </button>

      {open ? (
        <>
          <div className="subjmenu__mask" onClick={() => setOpen(false)} />
          <div className="usermenu__panel" role="menu">
            <UserStat />
            {USER_NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => cn('moresheet__link', isActive && 'is-active')}
              >
                <span className="moresheet__icon">{n.icon}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  {n.label}
                  <span
                    className="small muted"
                    style={{ display: 'block', fontWeight: 500, marginTop: 2 }}
                  >
                    {n.desc}
                  </span>
                </span>
              </NavLink>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------ 手机面板 ------------------------------ */

/** 手机底部栏「我的」按钮对应的弹起面板（与「学科」面板同一套视觉） */
export function UserSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const label = useUserLabel();
  const { user } = useAuth();
  if (!open) return null;

  return (
    <div className="moresheet" role="dialog" aria-label="我的">
      <div className="moresheet__mask" onClick={onClose} />
      <div className="moresheet__panel">
        <div className="moresheet__title">我的</div>
        <UserStat />
        {isCloudConfigured ? (
          <div className="moresheet__link" style={{ cursor: 'default' }}>
            <span className="moresheet__icon">👤</span>
            <span style={{ flex: 1 }}>
              {label.replace('👤 ', '')}
              <span className="small muted" style={{ display: 'block', fontWeight: 500, marginTop: 2 }}>
                {user ? '学习进度已开启云端同步' : '登录后换设备也能接着学'}
              </span>
            </span>
          </div>
        ) : null}
        {USER_NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={onClose}
            className={({ isActive }) => cn('moresheet__link', isActive && 'is-active')}
          >
            <span className="moresheet__icon">{n.icon}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              {n.label}
              <span className="small muted" style={{ display: 'block', fontWeight: 500, marginTop: 2 }}>
                {n.desc}
              </span>
            </span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}