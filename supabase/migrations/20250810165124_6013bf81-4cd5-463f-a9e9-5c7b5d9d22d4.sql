-- Create a helper to check case access, reused in RLS policies for history
CREATE OR REPLACE FUNCTION public.can_access_case(p_case_id uuid)
RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cases c
    WHERE c.id = p_case_id
      AND (
        auth.uid() = c.user_id OR (
          c.team_id IS NOT NULL AND public.is_team_member(c.team_id)
        )
      )
  );
$$;

-- Create case_events table to track changes to previous/next dates
CREATE TABLE IF NOT EXISTS public.case_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL,
  field text NOT NULL CHECK (field IN ('previous_date','next_date')),
  old_date date,
  new_date date,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by uuid NOT NULL,
  CONSTRAINT fk_case_events_case
    FOREIGN KEY (case_id)
    REFERENCES public.cases (id)
    ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON public.case_events (case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_changed_at ON public.case_events (changed_at DESC);

-- Enable RLS
ALTER TABLE public.case_events ENABLE ROW LEVEL SECURITY;

-- Policies: users/team members can view and insert history for cases they can access
DROP POLICY IF EXISTS "Users or team members can view case events" ON public.case_events;
CREATE POLICY "Users or team members can view case events"
ON public.case_events
FOR SELECT
USING (public.can_access_case(case_id));

DROP POLICY IF EXISTS "Users or team members can insert case events" ON public.case_events;
CREATE POLICY "Users or team members can insert case events"
ON public.case_events
FOR INSERT
WITH CHECK (public.can_access_case(case_id));

-- Trigger function to log history on date changes
CREATE OR REPLACE FUNCTION public.log_case_date_history()
RETURNS trigger AS $$
BEGIN
  -- Log previous_date change
  IF NEW.previous_date IS DISTINCT FROM OLD.previous_date THEN
    INSERT INTO public.case_events (case_id, field, old_date, new_date, changed_by)
    VALUES (NEW.id, 'previous_date', OLD.previous_date, NEW.previous_date, auth.uid());
  END IF;

  -- Log next_date change
  IF NEW.next_date IS DISTINCT FROM OLD.next_date THEN
    INSERT INTO public.case_events (case_id, field, old_date, new_date, changed_by)
    VALUES (NEW.id, 'next_date', OLD.next_date, NEW.next_date, auth.uid());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to cases updates
DROP TRIGGER IF EXISTS trg_log_case_date_history ON public.cases;
CREATE TRIGGER trg_log_case_date_history
AFTER UPDATE ON public.cases
FOR EACH ROW
WHEN (OLD.previous_date IS DISTINCT FROM NEW.previous_date OR OLD.next_date IS DISTINCT FROM NEW.next_date)
EXECUTE FUNCTION public.log_case_date_history();
