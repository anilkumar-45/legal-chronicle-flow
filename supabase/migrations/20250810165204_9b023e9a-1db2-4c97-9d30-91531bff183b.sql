-- Harden functions by setting search_path and using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.can_access_case(p_case_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

CREATE OR REPLACE FUNCTION public.log_case_date_history()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;