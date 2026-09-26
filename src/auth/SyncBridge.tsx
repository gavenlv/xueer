/**
 * 同步桥：把认证与学习状态连起来。
 *
 * - 登录 / 会话恢复后：拉取云端进度并与本地逐条合并（取较新），合并结果写回本地；
 *   合并引发的本地状态变化会触发下方防抖上传，把合并结果同步回云端
 * - 登录期间本地任何变更：防抖 1.5s 全量上传
 * - 未登录或未配置云端：什么都不做，应用保持纯本地模式
 */

import { useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useStudy } from '../store/StudyContext';
import { supabase } from '../lib/supabase';
import { mergeStates, normalizeStudyState, uploadState } from '../lib/sync';

const UPLOAD_DEBOUNCE_MS = 1500;

export default function SyncBridge() {
  const { user } = useAuth();
  const { state, replaceState } = useStudy();
  const userId = user?.id ?? null;

  const stateRef = useRef(state);
  stateRef.current = state;

  // 登录后：拉取云端 → 与本地合并 → 写回本地
  useEffect(() => {
    const client = supabase;
    if (!client || !userId) return;
    let cancelled = false;

    void (async () => {
      const { data, error } = await client
        .from('user_progress')
        .select('data')
        .eq('id', userId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.warn('[sync] 拉取云端进度失败：', error.message);
        return;
      }
      if (data?.data) {
        // 合并后写回本地；状态变化会触发防抖上传，把合并结果同步回云端
        replaceState(mergeStates(stateRef.current, normalizeStudyState(data.data)));
      } else {
        // 云端还没有数据：把本地进度整体推上去
        void uploadState(userId, stateRef.current);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, replaceState]);

  // 登录期间：本地状态变化 → 防抖上传
  useEffect(() => {
    if (!supabase || !userId) return;
    const t = window.setTimeout(() => {
      void uploadState(userId, state);
    }, UPLOAD_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [state, userId]);

  return null;
}
