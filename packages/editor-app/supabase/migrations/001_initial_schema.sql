-- Design Ref: §3.1 — 초기 DB 스키마 및 RLS 정책
-- Plan SC: Supabase RLS로 사용자별 데이터 격리 확인

-- 확장 기능
create extension if not exists "uuid-ossp";

-- 사용자 프로필 (auth.users 확장)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business')),
  created_at timestamptz not null default now()
);

-- 신규 사용자 가입 시 자동으로 users 레코드 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 사이트
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  subdomain text unique not null,
  custom_domain text unique,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 페이지
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  slug text not null default '/',
  title text not null,
  meta_description text,
  created_at timestamptz not null default now(),
  unique(site_id, slug)
);

-- 블록
create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  type text not null,
  props jsonb not null default '{}',
  order_index integer not null,
  created_at timestamptz not null default now()
);

-- 구독
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null,
  status text not null check (status in ('active', 'cancelled', 'past_due')),
  toss_billing_key text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

-- updated_at 자동 갱신
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger sites_updated_at
  before update on public.sites
  for each row execute procedure public.update_updated_at();

-- 인덱스
create index sites_user_id_idx on public.sites(user_id);
create index pages_site_id_idx on public.pages(site_id);
create index blocks_page_id_idx on public.blocks(page_id);
create index blocks_order_idx on public.blocks(page_id, order_index);

-- ============================================================
-- RLS (Row Level Security) 정책
-- ============================================================

alter table public.users enable row level security;
alter table public.sites enable row level security;
alter table public.pages enable row level security;
alter table public.blocks enable row level security;
alter table public.subscriptions enable row level security;

-- users: 본인만 조회/수정
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- sites: 본인 사이트만 CRUD
create policy "sites_select_own" on public.sites
  for select using (auth.uid() = user_id);

create policy "sites_insert_own" on public.sites
  for insert with check (auth.uid() = user_id);

create policy "sites_update_own" on public.sites
  for update using (auth.uid() = user_id);

create policy "sites_delete_own" on public.sites
  for delete using (auth.uid() = user_id);

-- pages: 본인 사이트의 페이지만
create policy "pages_select_own" on public.pages
  for select using (
    exists (select 1 from public.sites where id = pages.site_id and user_id = auth.uid())
  );

create policy "pages_insert_own" on public.pages
  for insert with check (
    exists (select 1 from public.sites where id = site_id and user_id = auth.uid())
  );

create policy "pages_update_own" on public.pages
  for update using (
    exists (select 1 from public.sites where id = pages.site_id and user_id = auth.uid())
  );

create policy "pages_delete_own" on public.pages
  for delete using (
    exists (select 1 from public.sites where id = pages.site_id and user_id = auth.uid())
  );

-- blocks: 본인 페이지의 블록만
create policy "blocks_select_own" on public.blocks
  for select using (
    exists (
      select 1 from public.pages p
      join public.sites s on s.id = p.site_id
      where p.id = blocks.page_id and s.user_id = auth.uid()
    )
  );

create policy "blocks_insert_own" on public.blocks
  for insert with check (
    exists (
      select 1 from public.pages p
      join public.sites s on s.id = p.site_id
      where p.id = page_id and s.user_id = auth.uid()
    )
  );

create policy "blocks_update_own" on public.blocks
  for update using (
    exists (
      select 1 from public.pages p
      join public.sites s on s.id = p.site_id
      where p.id = blocks.page_id and s.user_id = auth.uid()
    )
  );

create policy "blocks_delete_own" on public.blocks
  for delete using (
    exists (
      select 1 from public.pages p
      join public.sites s on s.id = p.site_id
      where p.id = blocks.page_id and s.user_id = auth.uid()
    )
  );

-- subscriptions: 본인 구독만
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

-- 발행된 사이트는 누구나 읽기 가능 (site-renderer용)
create policy "sites_select_published" on public.sites
  for select using (published_at is not null);

create policy "pages_select_published" on public.pages
  for select using (
    exists (select 1 from public.sites where id = pages.site_id and published_at is not null)
  );

create policy "blocks_select_published" on public.blocks
  for select using (
    exists (
      select 1 from public.pages p
      join public.sites s on s.id = p.site_id
      where p.id = blocks.page_id and s.published_at is not null
    )
  );
