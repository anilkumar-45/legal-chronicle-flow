-- Create cases table for legal diary
create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  previous_date date not null,
  next_date date not null,
  status text not null,
  case_details text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_cases_user_id on public.cases(user_id);
create index if not exists idx_cases_next_date on public.cases(next_date);
create index if not exists idx_cases_previous_date on public.cases(previous_date);

-- Enable Row Level Security
alter table public.cases enable row level security;

-- RLS Policies: users only see and modify their own rows
create policy "Users can view their own cases"
  on public.cases for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own cases"
  on public.cases for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own cases"
  on public.cases for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own cases"
  on public.cases for delete
  to authenticated
  using (auth.uid() = user_id);

-- Timestamp maintenance trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists t_update_cases_updated_at on public.cases;
create trigger t_update_cases_updated_at
before update on public.cases
for each row execute function public.update_updated_at_column();