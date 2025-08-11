-- Add triggers for updated_at and case history logging
-- Ensure this runs only once in a clean way by creating triggers (none exist currently per config)

-- Update the updated_at timestamp on any update
CREATE TRIGGER set_cases_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Log previous_date / next_date changes into case_events
CREATE TRIGGER log_case_date_history
AFTER UPDATE ON public.cases
FOR EACH ROW
EXECUTE FUNCTION public.log_case_date_history();