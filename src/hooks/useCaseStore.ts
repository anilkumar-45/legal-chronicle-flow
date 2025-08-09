import { useState, useEffect } from "react";
import { CaseEntry } from "@/types/case";
import { supabase } from "@/integrations/supabase/client";

// Helper to map DB row to app CaseEntry type
const mapRowToCase = (row: any): CaseEntry => ({
  id: row.id,
  previousDate: new Date(row.previous_date).toISOString(),
  nextDate: new Date(row.next_date).toISOString(),
  status: row.status,
  caseDetails: row.case_details,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
});

// Ensure YYYY-MM-DD for DATE columns
const toDateOnly = (value: string | Date): string => {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toISOString().split("T")[0];
};

export const useCaseStore = () => {
  const [cases, setCases] = useState<CaseEntry[]>([]);

  const fetchCases = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setCases([]);
      return;
    }

    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cases:", error);
      return;
    }

    setCases((data || []).map(mapRowToCase));
  };

  // Initial load + react to auth changes
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      fetchCases();
    });

    // Initial fetch
    fetchCases();

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const addCase = async (caseData: Omit<CaseEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      console.error("Must be logged in to add a case");
      return;
    }

    const insertPayload = {
      user_id: user.id,
      previous_date: toDateOnly(caseData.previousDate),
      next_date: toDateOnly(caseData.nextDate),
      status: caseData.status,
      case_details: caseData.caseDetails,
    };

    const { data, error } = await supabase
      .from("cases")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error) {
      console.error("Error adding case:", error);
      return;
    }

    setCases(prev => [mapRowToCase(data), ...prev]);
  };

  const getCasesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return cases.filter(caseEntry => {
      const previousDate = new Date(caseEntry.previousDate).toISOString().split('T')[0];
      const nextDate = new Date(caseEntry.nextDate).toISOString().split('T')[0];
      return previousDate === dateString || nextDate === dateString;
    });
  };

  const updateCase = async (id: string, updates: Partial<CaseEntry>) => {
    const payload: any = {};
    if (updates.previousDate) payload.previous_date = toDateOnly(updates.previousDate);
    if (updates.nextDate) payload.next_date = toDateOnly(updates.nextDate);
    if (updates.status) payload.status = updates.status;
    if (updates.caseDetails) payload.case_details = updates.caseDetails;

    const { data, error } = await supabase
      .from("cases")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("Error updating case:", error);
      return;
    }

    const updated = mapRowToCase(data);
    setCases(prev => prev.map(c => (c.id === id ? updated : c)));
  };

  const deleteCase = async (id: string) => {
    const { error } = await supabase
      .from("cases")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting case:", error);
      return;
    }

    setCases(prev => prev.filter(c => c.id !== id));
  };

  const getAllCases = () => cases;

  return {
    cases,
    addCase,
    getCasesForDate,
    getAllCases,
    updateCase,
    deleteCase
  };
};