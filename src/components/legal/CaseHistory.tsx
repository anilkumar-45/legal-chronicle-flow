import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import HistoryForm from "./HistoryForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CaseHistoryProps {
  caseId: string;
}

interface HistoryItem {
  id: string;
  createdAt: string;
  eventDate: string | null;
  action: string;
  stageChange?: string | null;
  notes?: string | null;
  documentLinks?: string[] | null;
  documentFiles?: string[] | null;
  source: 'manual' | 'system' | 'event';
}

export default function CaseHistory({ caseId }: CaseHistoryProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const withinStart = startDate ? (it.eventDate || it.createdAt) >= startDate : true;
      const withinEnd = endDate ? (it.eventDate || it.createdAt) <= endDate : true;
      const actionOk = actionFilter ? it.action.toLowerCase().includes(actionFilter.toLowerCase()) : true;
      const kw = keywords.trim().toLowerCase();
      const notesOk = kw ? (it.notes || "").toLowerCase().includes(kw) : true;
      return withinStart && withinEnd && actionOk && notesOk;
    });
  }, [items, startDate, endDate, actionFilter, keywords]);

  async function fetchHistory() {
    setLoading(true);
    setError(null);

    // 1) Case history (manual + system)
    const { data: histRows, error: histErr } = await supabase
      .from<any, any>('case_history')
      .select("id, case_id, event_date, action, stage_change, document_links, document_files, notes, source, created_at")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });

    if (histErr) {
      setError(histErr.message);
      setLoading(false);
      return;
    }

    // 2) Legacy case_events (date changes)
    const { data: eventRows, error: evErr } = await supabase
      .from("case_events")
      .select("id, case_id, field, old_date, new_date, changed_at, changed_by")
      .eq("case_id", caseId)
      .order("changed_at", { ascending: false });

    if (evErr) {
      setError(evErr.message);
      setLoading(false);
      return;
    }

    // 3) Map to unified items
    const fromHistory: HistoryItem[] = (histRows || []).map((r: any) => ({
      id: r.id,
      createdAt: r.created_at,
      eventDate: r.event_date,
      action: r.action,
      stageChange: r.stage_change,
      notes: r.notes,
      documentLinks: r.document_links,
      documentFiles: r.document_files,
      source: r.source,
    }));

    const fromEvents: HistoryItem[] = (eventRows || []).map((r: any) => ({
      id: r.id,
      createdAt: r.changed_at,
      eventDate: r.new_date,
      action: r.field === 'previous_date' ? 'Previous date updated' : 'Next date updated',
      stageChange: null,
      notes: null,
      documentLinks: null,
      documentFiles: null,
      source: 'event',
    }));

    const combined = [...fromHistory, ...fromEvents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 4) Resolve signed URLs for any stored files
    const withSigned = await Promise.all(combined.map(async (it) => {
      if (!it.documentFiles || it.documentFiles.length === 0) return it;
      const signed: string[] = [];
      for (const path of it.documentFiles) {
        const { data, error } = await supabase.storage.from('case-documents').createSignedUrl(path, 3600);
        if (!error && data?.signedUrl) signed.push(data.signedUrl);
      }
      return { ...it, documentFiles: signed };
    }));

    setItems(withSigned);
    setLoading(false);
  }

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  if (loading) return <div className="text-sm text-legal-gray">Loading history…</div>;
  if (error) return <div className="text-sm text-destructive">Failed to load history: {error}</div>;

  return (
    <div className="mt-3 md:mt-4 space-y-4">
      {/* Manual entry form */}
      <div className="border rounded-md p-3 bg-muted/30">
        <h3 className="text-sm font-semibold mb-2 text-legal-navy">Add History</h3>
        <HistoryForm caseId={caseId} onAdded={fetchHistory} />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label htmlFor="hist-start">From</Label>
          <Input id="hist-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="hist-end">To</Label>
          <Input id="hist-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="hist-action">Action</Label>
          <Input id="hist-action" placeholder="Filter by action" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="hist-notes">Keyword</Label>
          <Input id="hist-notes" placeholder="Search notes" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-sm text-legal-gray">No history yet.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ev) => (
            <div key={ev.id} className="text-xs md:text-sm bg-muted/40 border border-legal-gray-light/30 rounded-md p-2 md:p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-legal-navy">
                  {ev.action} {ev.source !== 'manual' && <span className="ml-2 text-[10px] px-1 py-0.5 rounded bg-legal-gray-light/30">System-generated</span>}
                </span>
                <span className="text-legal-gray">{format(new Date(ev.createdAt), 'dd MMM yyyy, HH:mm')}</span>
              </div>
              <div className="mt-1 text-foreground">
                {ev.eventDate && (
                  <div>
                    <span className="font-semibold">Event date: </span>
                    <span>{format(new Date(ev.eventDate), 'dd MMM yyyy')}</span>
                  </div>
                )}
                {ev.stageChange && (
                  <div className="mt-1"><span className="font-semibold">Stage: </span>{ev.stageChange}</div>
                )}
                {ev.notes && (
                  <div className="mt-1"><span className="font-semibold">Notes: </span>{ev.notes}</div>
                )}
                {(ev.documentLinks?.length || 0) > 0 && (
                  <div className="mt-1">
                    <span className="font-semibold">Links: </span>
                    <ul className="list-disc ml-5">
                      {ev.documentLinks!.map((l) => (
                        <li key={l}><a href={l} target="_blank" rel="noopener noreferrer" className="underline">{l}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
                {(ev.documentFiles?.length || 0) > 0 && (
                  <div className="mt-1">
                    <span className="font-semibold">Files: </span>
                    <ul className="list-disc ml-5">
                      {ev.documentFiles!.map((url, idx) => (
                        <li key={idx}><a href={url} target="_blank" rel="noopener noreferrer" className="underline">Open file {idx + 1}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
