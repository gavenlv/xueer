/**
 * Supabase 客户端。
 *
 * 环境变量未配置时（例如 fork 后直接本地跑）`supabase` 为 null，
 * 登录相关入口自动隐藏，应用整体退回纯本地模式，不影响任何既有功能。
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** 云端是否已配置（决定登录入口是否展示） */
export const isCloudConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isCloudConfigured
  ? createClient(url as string, anonKey as string)
  : null;

/** 上次成功同步的时间戳（localStorage key） */
export const LAST_SYNC_KEY = 'xueer.lastSyncAt';
