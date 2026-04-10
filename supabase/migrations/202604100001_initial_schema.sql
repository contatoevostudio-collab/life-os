create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  color text not null default '#0f766e',
  created_at timestamptz not null default timezone('utc', now())
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'task_priority') then
    create type public.task_priority as enum ('low', 'medium', 'high');
  end if;

  if not exists (select 1 from pg_type where typname = 'task_status') then
    create type public.task_status as enum ('todo', 'in_progress', 'done');
  end if;

  if not exists (select 1 from pg_type where typname = 'focus_status') then
    create type public.focus_status as enum ('planned', 'running', 'paused', 'completed');
  end if;

  if not exists (select 1 from pg_type where typname = 'finance_type') then
    create type public.finance_type as enum ('income', 'expense');
  end if;

  if not exists (select 1 from pg_type where typname = 'theme_mode') then
    create type public.theme_mode as enum ('light', 'dark', 'system');
  end if;
end
$$;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  description text,
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'todo',
  due_date date,
  estimated_minutes integer,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  tags text[] not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  is_all_day boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  constraint calendar_events_time_check check (ends_at > starts_at)
);

create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  duration_minutes integer not null,
  break_minutes integer not null,
  status public.focus_status not null default 'planned',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type public.finance_type not null,
  amount numeric(12,2) not null,
  category text not null,
  date date not null,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.users (id) on delete cascade,
  theme public.theme_mode not null default 'system',
  pomodoro_focus_minutes integer not null default 25,
  pomodoro_break_minutes integer not null default 5,
  compact_mode boolean not null default false,
  week_starts_on integer not null default 1,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_projects_user_id on public.projects (user_id);
create index if not exists idx_tasks_user_id_status_due_date on public.tasks (user_id, status, due_date);
create index if not exists idx_tasks_project_id on public.tasks (project_id);
create index if not exists idx_calendar_events_user_id_starts_at on public.calendar_events (user_id, starts_at);
create index if not exists idx_focus_sessions_user_id_started_at on public.focus_sessions (user_id, started_at);
create index if not exists idx_financial_transactions_user_id_date on public.financial_transactions (user_id, date desc);

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.financial_transactions enable row level security;
alter table public.user_preferences enable row level security;

create policy "users can read own profile"
on public.users
for select
using (auth.uid() = id);

create policy "users can update own profile"
on public.users
for update
using (auth.uid() = id);

create policy "projects are owned by user"
on public.projects
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "tasks are owned by user"
on public.tasks
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "events are owned by user"
on public.calendar_events
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "sessions are owned by user"
on public.focus_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "transactions are owned by user"
on public.financial_transactions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "preferences are owned by user"
on public.user_preferences
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'user'), '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
