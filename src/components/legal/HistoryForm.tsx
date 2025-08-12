import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface HistoryFormProps {
  caseId: string;
  onAdded?: () => void;
}

export default function HistoryForm({ caseId, onAdded }: HistoryFormProps) {
  const [eventDate, setEventDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [action, setAction] = useState("");
  const [stageChange, setStageChange] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => !!eventDate && (!!action || !!notes || links.length > 0 || files.length > 0), [eventDate, action, notes, links, files]);

  const addLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    try {
      // validate URL
      const u = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
      setLinks((prev) => Array.from(new Set([...prev, u.toString()])));
      setLinkInput("");
    } catch {
      toast({ title: "Invalid link", description: "Please enter a valid URL.", variant: "destructive" as any });
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    try {
      const { data: userInfo } = await supabase.auth.getUser();
      const userId = userInfo.user?.id;
      if (!userId) throw new Error("Not authenticated");

      // 1) Upload files to private bucket
      const uploadedPaths: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const path = `${caseId}/${fileName}`;
        const { error: upErr } = await supabase.storage
          .from("case-documents")
          .upload(path, file, { upsert: false, contentType: file.type || undefined });
        if (upErr) throw upErr;
        uploadedPaths.push(path);
      }

      // 2) Insert history entry
      const insertPayload = {
        case_id: caseId,
        event_date: eventDate,
        action: action || "Manual update",
        stage_change: stageChange || null,
        document_links: links.length ? links : null,
        document_files: uploadedPaths.length ? uploadedPaths : null,
        notes: notes || null,
        source: "manual",
        created_by: userId,
      };

      const { error: insErr } = await supabase.from<any, any>("case_history").insert(insertPayload as any);
      if (insErr) throw insErr;

      toast({ title: "History added", description: "Your update was saved." });
      setAction("");
      setStageChange("");
      setLinks([]);
      setFiles([]);
      setNotes("");
      setEventDate(new Date().toISOString().split("T")[0]);
      onAdded?.();
    } catch (err: any) {
      toast({ title: "Failed to add history", description: err.message ?? String(err), variant: "destructive" as any });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="event_date">Date</Label>
          <Input id="event_date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="action">Action Taken</Label>
          <Input id="action" placeholder="e.g. Filed written statement" value={action} onChange={(e) => setAction(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="stage">Stage Change (optional)</Label>
        <Input id="stage" placeholder="e.g. Summons → Hearing" value={stageChange} onChange={(e) => setStageChange(e.target.value)} />
      </div>

      <div>
        <Label>Documents</Label>
        <div className="flex gap-2">
          <Input placeholder="https://link-to-doc" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }} />
          <Button type="button" variant="secondary" onClick={addLink}>Add Link</Button>
        </div>
        {links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {links.map((l) => (
              <span key={l} className="text-xs px-2 py-1 rounded bg-muted text-foreground border">
                {l}
                <button type="button" className="ml-2 opacity-70 hover:opacity-100" onClick={() => setLinks((prev) => prev.filter((x) => x !== l))}>×</button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-2">
          <Input type="file" multiple onChange={onFileChange} />
          {files.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">{files.length} file(s) selected</div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" placeholder="Key notes and details" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!canSubmit || submitting}>{submitting ? "Saving..." : "Add to History"}</Button>
      </div>
    </form>
  );
}
