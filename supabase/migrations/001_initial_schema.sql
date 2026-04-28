-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'manager', 'staff')),
  team_id uuid,
  created_at timestamptz not null default now()
);

-- Branches (지점)
create table public.branches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text not null,
  type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uploads (데이터 업로드 이력)
create table public.uploads (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  version integer not null default 1,
  file_url text not null,
  file_name text not null,
  uploaded_by uuid,
  uploaded_at timestamptz not null default now()
);

-- Analyses (분석 결과)
create table public.analyses (
  id uuid primary key default uuid_generate_v4(),
  upload_id uuid not null references public.uploads(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  result_json jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Categories (카테고리 마스터)
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  parent_id uuid references public.categories(id),
  eland_flag boolean not null default false
);

-- Recommendations (추천 브랜드)
create table public.recommendations (
  id uuid primary key default uuid_generate_v4(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  brand text not null,
  score numeric(5,2) not null check (score between 0 and 100),
  reason text not null,
  is_eland_brand boolean not null default false
);

-- Feedbacks (담당자 피드백)
create table public.feedbacks (
  id uuid primary key default uuid_generate_v4(),
  recommendation_id uuid not null references public.recommendations(id) on delete cascade,
  user_id uuid not null references public.users(id),
  type text not null check (type in ('like', 'hold', 'exclude')),
  created_at timestamptz not null default now(),
  unique(recommendation_id, user_id)
);

-- RLS 활성화
alter table public.users enable row level security;
alter table public.branches enable row level security;
alter table public.uploads enable row level security;
alter table public.analyses enable row level security;
alter table public.categories enable row level security;
alter table public.recommendations enable row level security;
alter table public.feedbacks enable row level security;

-- RLS 정책: 인증된 사용자만 접근
create policy "authenticated users can read branches" on public.branches
  for select to authenticated using (true);

create policy "authenticated users can read categories" on public.categories
  for select to authenticated using (true);

create policy "users can read own profile" on public.users
  for select to authenticated using (auth.uid() = id);

create policy "admin can manage users" on public.users
  for all to authenticated using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- 자동 타임스탬프 업데이트
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger branches_updated_at
  before update on public.branches
  for each row execute function update_updated_at();

-- 신규 사용자 자동 프로필 생성
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
