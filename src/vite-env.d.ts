/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase 项目地址，如 https://xxxx.supabase.co */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon 公开密钥 */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
