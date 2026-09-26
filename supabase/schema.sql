-- 学而：用户学习进度云同步表
-- 用法：Supabase Dashboard → SQL Editor 中整体执行一次即可。

create table if not exists public.user_progress (
  -- 每个用户一行，id 直接对齐 auth.users.id
  id uuid primary key references auth.users (id) on delete cascade,
  -- 全部学习状态（进度/错题/打卡/统计）序列化为 JSONB 存储
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 开启行级安全：任何用户只能读写自己那一行
alter table public.user_progress enable row level security;

create policy "user_progress_select_own"
  on public.user_progress for select
  using (auth.uid() = id);

create policy "user_progress_insert_own"
  on public.user_progress for insert
  with check (auth.uid() = id);

create policy "user_progress_update_own"
  on public.user_progress for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
