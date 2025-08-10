import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface Team {
  id: string;
  name: string;
}

interface TeamSelectProps {
  label?: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}

const TeamSelect = ({ label = "Team", value, onChange }: TeamSelectProps) => {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      const { data, error } = await (supabase as any)
        .from("teams")
        .select("id,name")
        .order("name", { ascending: true });
      if (error) {
        console.error("Error fetching teams:", error);
        return;
      }
      setTeams(data || []);
    };
    fetchTeams();
  }, []);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-legal-navy">{label}</Label>
      <Select value={value ?? "__personal__"} onValueChange={(v) => onChange(v === "__personal__" ? null : v)}>
        <SelectTrigger className="border-legal-gray-light">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__personal__">Personal (no team)</SelectItem>
          {teams.map((t) => (
            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TeamSelect;
