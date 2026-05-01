-- WSDTY Platform — Initial Schema
-- Run this in the Supabase SQL editor

-- ───────────────────────────────────────────────
-- TABLES
-- ───────────────────────────────────────────────

create table if not exists public.trades (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  pair        text not null,
  direction   text not null check (direction in ('long', 'short')),
  entry_price text,
  sl_price    text,
  tp_price    text,
  lot_size    text,
  pl_dollars  numeric,
  result      text check (result in ('win', 'loss', 'be')),
  notes       text
);

create table if not exists public.trade_ideas (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  created_at       timestamptz not null default now(),
  macro_context    text,
  chart_pattern    text,
  chart_image_url  text,
  entry            text,
  sl               text,
  tp               text,
  will_work        text check (will_work in ('yes', 'maybe', 'no')),
  reasoning        text
);

create table if not exists public.diary_entries (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  entry_date           date not null,
  personal_reflection  text,
  mood_score           smallint check (mood_score between 1 and 10),
  discipline_score     smallint check (discipline_score between 1 and 10),
  unique (user_id, entry_date)
);

create table if not exists public.trade_reflections (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  trade_id         uuid not null references public.trades(id) on delete cascade,
  reflection_text  text
);

-- ───────────────────────────────────────────────
-- INDEXES
-- ───────────────────────────────────────────────

create index if not exists trades_user_id_idx        on public.trades(user_id);
create index if not exists trade_ideas_user_id_idx   on public.trade_ideas(user_id);
create index if not exists diary_entries_user_id_idx on public.diary_entries(user_id);
create index if not exists diary_entries_date_idx    on public.diary_entries(user_id, entry_date);

-- ───────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────

alter table public.trades            enable row level security;
alter table public.trade_ideas       enable row level security;
alter table public.diary_entries     enable row level security;
alter table public.trade_reflections enable row level security;

-- Trades policies
create policy "Users can view own trades"
  on public.trades for select
  using (auth.uid() = user_id);

create policy "Users can insert own trades"
  on public.trades for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trades"
  on public.trades for update
  using (auth.uid() = user_id);

create policy "Users can delete own trades"
  on public.trades for delete
  using (auth.uid() = user_id);

-- Trade ideas policies
create policy "Users can view own trade ideas"
  on public.trade_ideas for select
  using (auth.uid() = user_id);

create policy "Users can insert own trade ideas"
  on public.trade_ideas for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trade ideas"
  on public.trade_ideas for update
  using (auth.uid() = user_id);

create policy "Users can delete own trade ideas"
  on public.trade_ideas for delete
  using (auth.uid() = user_id);

-- Diary entries policies
create policy "Users can view own diary entries"
  on public.diary_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own diary entries"
  on public.diary_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own diary entries"
  on public.diary_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own diary entries"
  on public.diary_entries for delete
  using (auth.uid() = user_id);

-- Trade reflections policies
create policy "Users can view own trade reflections"
  on public.trade_reflections for select
  using (auth.uid() = user_id);

create policy "Users can insert own trade reflections"
  on public.trade_reflections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trade reflections"
  on public.trade_reflections for update
  using (auth.uid() = user_id);

create policy "Users can delete own trade reflections"
  on public.trade_reflections for delete
  using (auth.uid() = user_id);

-- ───────────────────────────────────────────────
-- STORAGE BUCKET FOR CHART IMAGES
-- ───────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('chart-images', 'chart-images', false)
on conflict (id) do nothing;

create policy "Users can upload own chart images"
  on storage.objects for insert
  with check (
    bucket_id = 'chart-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own chart images"
  on storage.objects for select
  using (
    bucket_id = 'chart-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own chart images"
  on storage.objects for delete
  using (
    bucket_id = 'chart-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
