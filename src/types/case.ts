export interface CaseEntry {
  id: string;
  previousDate: string;
  caseDetails: string;
  status: 'pending' | 'active' | 'completed' | 'urgent';
  nextDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyView {
  date: string;
  cases: CaseEntry[];
}

export type CaseStatus = 'pending' | 'active' | 'completed' | 'urgent';