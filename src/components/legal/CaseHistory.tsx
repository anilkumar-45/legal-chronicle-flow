import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CaseHistoryEvent } from "@/types/case";
import { format } from "date-fns";

interface CaseHistoryProps {
  caseId: string;
}

export default function CaseHistory({ caseId }: CaseHistoryProps) {
  const [events, setEvents] = useState<CaseHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchHistory() {
      setLoading(true);
      const { data, error } = await supabase
        .from("case_events")
        .select("id, case_id, field, old_date, new_date, changed_at, changed_by")
        .eq("case_id", caseId)
        .order("changed_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const mapped: CaseHistoryEvent[] = (data || []).map((row: any) => ({
        id: row.id,
        caseId: row.case_id,
        field: row.field,
        oldDate: row.old_date,
        newDate: row.new_date,
        changedAt: row.changed_at,
        changedBy: row.changed_by,
      }));

      setEvents(mapped);
      setLoading(false);
    }

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [caseId]);

  if (loading) {
    return <div className="text-sm text-legal-gray">Loading history…</div>;
  }

  if (error) {
    return <div className="text-sm text-destructive">Failed to load history: {error}</div>;
  }

  if (events.length === 0) {
    return <div className="text-sm text-legal-gray">No history yet.</div>;
  }

  return (
    <div className="mt-3 md:mt-4 space-y-2">
      {events.map((ev) => (
        <div key={ev.id} className="text-xs md:text-sm bg-muted/40 border border-legal-gray-light/30 rounded-md p-2 md:p-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-legal-navy">
              {ev.field === 'previous_date' ? 'Previous date' : 'Next date'}
            </span>
            <span className="text-legal-gray">{format(new Date(ev.changedAt), 'dd MMM yyyy, HH:mm')}</span>
          </div>
          <div className="mt-1 text-foreground">
            <span className="font-semibold">{ev.oldDate ? format(new Date(ev.oldDate), 'dd MMM yyyy') : '—'}</span>
            <span className="mx-2 text-legal-gold">→</span>
            <span className="font-semibold">{ev.newDate ? format(new Date(ev.newDate), 'dd MMM yyyy') : '—'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
