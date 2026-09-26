/** 账户页：登录 / 注册 / 云同步状态管理 */

import { useState } from 'react';
import type { FormEvent } from 'react';
import { PageHeader, EmptyState } from '../components/common';
import { cn } from '../lib/utils';
import { useAuth } from '../auth/AuthContext';
import { isCloudConfigured, LAST_SYNC_KEY } from '../lib/supabase';

type Mode = 'signin' | 'signup';

export default function AccountPage() {
  const { user, displayName, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isCloudConfigured) {
    return (
      <>
        <PageHeader title="👤 账户" desc="云同步未启用" />
        <EmptyState
          icon="☁️"
          title="云同步未配置"
          desc="当前为纯本地模式：学习进度只保存在本设备浏览器中。配置 Supabase 环境变量后即可开启多设备同步。"
        />
      </>
    );
  }

  const lastSync = (() => {
    try {
      return localStorage.getItem(LAST_SYNC_KEY);
    } catch {
      return null;
    }
  })();

  // 已登录：账户信息 + 退出
  if (user) {
    return (
      <>
        <PageHeader title="👤 账户" desc="学习进度已登录云端，多设备自动同步" />
        <div className="stack">
          <div className="card card--pad">
            <div className="row row--between">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 17 }}>{displayName || '同学'}</div>
                <div className="page-desc" style={{ wordBreak: 'break-all', marginTop: 2 }}>
                  {user.email}
                </div>
                <div className="page-desc" style={{ marginTop: 4 }}>
                  {lastSync
                    ? `上次同步：${new Date(lastSync).toLocaleString()}`
                    : '尚未同步过，学习后稍等片刻即自动上传'}
                </div>
              </div>
              <span className="tag tag--jade">已登录</span>
            </div>
          </div>
          <button className="btn btn--red" onClick={() => void signOut()}>
            退出登录
          </button>
          <p className="page-desc">
            退出后本设备的进度仍保留在本地浏览器，下次登录时会自动与云端合并，不会丢失。
          </p>
        </div>
      </>
    );
  }

  // 未登录：登录 / 注册表单
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'signup') {
        const result = await signUp(email.trim(), password, username.trim());
        if (result === 'confirm-email') {
          setNotice('注册成功！项目开启了邮箱确认，请先到邮箱点击确认链接，再回来登录。');
        }
        // session 直接建立时，onAuthStateChange 会自动切到已登录视图
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="👤 账户" desc="登录后学习进度云端保存，手机、平板、电脑自动同步" />
      <div className="stack">
        {notice ? (
          <div
            className="card card--pad"
            style={{ borderColor: 'var(--c-jade)', background: 'var(--c-jade-soft)' }}
          >
            {notice}
          </div>
        ) : null}
        <div className="card card--pad">
          <div className="row" style={{ gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={cn('chip', mode === 'signin' && 'is-active')}
              onClick={() => {
                setMode('signin');
                setError(null);
                setNotice(null);
              }}
            >
              邮箱登录
            </button>
            <button
              type="button"
              className={cn('chip', mode === 'signup' && 'is-active')}
              onClick={() => {
                setMode('signup');
                setError(null);
                setNotice(null);
              }}
            >
              注册新账户
            </button>
            <span className="chip" style={{ opacity: 0.45, cursor: 'not-allowed' }}>
              手机号（即将支持）
            </span>
          </div>
          <form onSubmit={(e) => void submit(e)} className="stack stack--sm">
            {mode === 'signup' ? (
              <label className="stack" style={{ gap: 6 }}>
                <span className="section-sub">用户名（显示在右上角与学习报告）</span>
                <input
                  className="input"
                  type="text"
                  required
                  minLength={2}
                  maxLength={16}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="给同学起个名字，如：小明"
                />
              </label>
            ) : null}
            <label className="stack" style={{ gap: 6 }}>
              <span className="section-sub">邮箱</span>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label className="stack" style={{ gap: 6 }}>
              <span className="section-sub">密码（至少 6 位）</span>
              <input
                className="input"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </label>
            {error ? <div style={{ color: 'var(--c-red)' }}>{error}</div> : null}
            <button className="btn btn--primary btn--block btn--lg" disabled={busy}>
              {busy ? '请稍候…' : mode === 'signup' ? '注册' : '登录'}
            </button>
          </form>
        </div>
        <p className="page-desc">登录信息会保存在本设备，之后打开无需重复登录。</p>
      </div>
    </>
  );
}
