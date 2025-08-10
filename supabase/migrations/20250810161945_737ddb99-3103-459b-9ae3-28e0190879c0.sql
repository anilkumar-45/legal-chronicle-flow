-- 1) Teams and membership tables
-- Create teams table
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create team_members table
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(team_id, user_id)
);

-- Enable RLS
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- 2) Helper functions to avoid RLS recursion and simplify policies
create or replace function public.is_team_member(_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members tm
    where tm.team_id = _team_id and tm.user_id = auth.uid()
  );
$$;

create or replace function public.is_team_owner(_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.teams t
    where t.id = _team_id and t.created_by = auth.uid()
  );
$$;

-- 3) RLS policies for teams and members
-- Drop existing policies if they exist, then recreate
DO $$ BEGIN
  BEGIN DROP POLICY "Members can view their teams" ON public.teams; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY "Authenticated can create teams" ON public.teams; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY "Owners can update their teams" ON public.teams; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY "Owners can delete their teams" ON public.teams; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

create policy "Members can view their teams"
  on public.teams for select
  to authenticated
  using (public.is_team_member(id));

create policy "Authenticated can create teams"
  on public.teams for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Owners can update their teams"
  on public.teams for update
  to authenticated
  using (created_by = auth.uid());

create policy "Owners can delete their teams"
  on public.teams for delete
  to authenticated
  using (created_by = auth.uid());

DO $$ BEGIN
  BEGIN DROP POLICY "Members can view team members" ON public.team_members; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY "Owners can add team members" ON public.team_members; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY "Owners can update team members" ON public.team_members; EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN DROP POLICY "Owners can remove team members" ON public.team_members; EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

create policy "Members can view team members"
  on public.team_members for select
  to authenticated
  using (public.is_team_member(team_id));

create policy "Owners can add team members"
  on public.team_members for insert
  to authenticated
  with check (public.is_team_owner(team_id));

create policy "Owners can update team members"
  on public.team_members for update
  to authenticated
  using (public.is_team_owner(team_id));

create policy "Owners can remove team members"
  on public.team_members for delete
  to authenticated
  using (public.is_team_owner(team_id) or user_id = auth.uid());

-- 4) Timestamps trigger for updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Attach triggers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_teams_set_updated_at') THEN
    CREATE TRIGGER trg_teams_set_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_team_members_set_updated_at') THEN
    CREATE TRIGGER trg_team_members_set_updated_at
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- 5) Auto-add creator as owner member
create or replace function public.handle_new_team()
returns trigger as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_on_team_created_add_owner') THEN
    CREATE TRIGGER trg_on_team_created_add_owner
    AFTER INSERT ON public.teams
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_team();
  END IF;
END $$;

-- 6) Extend cases with team_id and update policies
-- Add column if missing
alter table public.cases add column if not exists team_id uuid references public.teams(id) on delete set null;

-- Ensure updated_at trigger exists on cases
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cases_set_updated_at') THEN
    CREATE TRIGGER trg_cases_set_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- Drop existing restrictive policies to replace them
DO $$ BEGIN
  -- Avoid errors if policies don't exist
  BEGIN
    DROP POLICY IF EXISTS "Users can view their own cases" ON public.cases;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    DROP POLICY IF EXISTS "Users can create their own cases" ON public.cases;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    DROP POLICY IF EXISTS "Users can update their own cases" ON public.cases;
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    DROP POLICY IF EXISTS "Users can delete their own cases" ON public.cases;
  EXCEPTION WHEN others THEN NULL; END;
END $$;

-- New team-aware policies for cases
create policy "Users or team members can view cases"
  on public.cases for select
  to authenticated
  using (
    auth.uid() = user_id
    or (team_id is not null and public.is_team_member(team_id))
  );

create policy "Users or team members can update cases"
  on public.cases for update
  to authenticated
  using (
    auth.uid() = user_id
    or (team_id is not null and public.is_team_member(team_id))
  );

create policy "Users or team owners can delete cases"
  on public.cases for delete
  to authenticated
  using (
    auth.uid() = user_id
    or (team_id is not null and public.is_team_owner(team_id))
  );

create policy "Users can insert their cases (optionally into teams they own)"
  on public.cases for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and (
      team_id is null
      or public.is_team_member(team_id)
    )
  );

-- 7) Enable realtime for cases
alter table public.cases replica identity full;
-- Add table to supabase_realtime publication if not already there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cases'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.cases';
  END IF;
END$$;