/**
 * 认证上下文：邮箱 + 密码注册/登录。
 *
 * 会话由 supabase-js 自动持久化在 localStorage，刷新或重开浏览器无需重新登录。
 * 云端未配置时所有方法直接抛错，UI 层应先用 `isCloudConfigured` 隐藏入口。
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isCloudConfigured, supabase } from '../lib/supabase';

interface AuthContextValue {
  /** 当前会话（null 表示未登录） */
  session: Session | null;
  user: User | null;
  /** 初始会话是否已恢复完毕（避免刷新瞬间登录态闪变） */
  ready: boolean;
  /**
   * 注册。返回 'confirm-email' 表示项目开启了邮箱确认，
   * 需要先去邮箱点击确认链接才能登录。
   */
  signUp: (email: string, password: string) => Promise<'session' | 'confirm-email'>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!isCloudConfigured);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;

    // 恢复本地已保存的会话
    void supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setReady(true);
    });

    // 订阅登录/登出/令牌刷新等事件
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      ready,
      signUp: async (email, password) => {
        if (!supabase) throw new Error('云端未配置');
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data.session ? 'session' : 'confirm-email';
      },
      signIn: async (email, password) => {
        if (!supabase) throw new Error('云端未配置');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signOut: async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [session, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
}
