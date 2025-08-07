import { useState, useEffect } from "react";
import { CaseEntry } from "@/types/case";

export const useCaseStore = () => {
  const [cases, setCases] = useState<CaseEntry[]>([]);

  // Load cases from localStorage on mount
  useEffect(() => {
    const storedCases = localStorage.getItem("legalCases");
    if (storedCases) {
      try {
        setCases(JSON.parse(storedCases));
      } catch (error) {
        console.error("Error loading cases from localStorage:", error);
      }
    }
  }, []);

  // Save cases to localStorage whenever cases change
  useEffect(() => {
    localStorage.setItem("legalCases", JSON.stringify(cases));
  }, [cases]);

  const addCase = (caseData: Omit<CaseEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCase: CaseEntry = {
      ...caseData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCases(prev => [...prev, newCase]);
  };

  const getCasesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    
    return cases.filter(caseEntry => {
      const previousDate = new Date(caseEntry.previousDate).toISOString().split('T')[0];
      const nextDate = new Date(caseEntry.nextDate).toISOString().split('T')[0];
      
      // Show cases that either have their previous date or next date on the selected date
      return previousDate === dateString || nextDate === dateString;
    });
  };

  const updateCase = (id: string, updates: Partial<CaseEntry>) => {
    setCases(prev => prev.map(caseEntry => 
      caseEntry.id === id 
        ? { ...caseEntry, ...updates, updatedAt: new Date().toISOString() }
        : caseEntry
    ));
  };

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(caseEntry => caseEntry.id !== id));
  };

  const getAllCases = () => {
    return cases;
  };

  return {
    cases,
    addCase,
    getCasesForDate,
    getAllCases,
    updateCase,
    deleteCase
  };
};