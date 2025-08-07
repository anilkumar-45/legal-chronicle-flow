export interface CaseEntry {
  id: string;
  previousDate: string;
  caseDetails: string;
  status: CaseStatus;
  nextDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyView {
  date: string;
  cases: CaseEntry[];
}

export type CaseStatus = 
  | 'summons' 
  | 'hearing' 
  | 'judgment' 
  | 'appeal' 
  | 'pending' 
  | 'active' 
  | 'completed' 
  | 'urgent' 
  | 'dismissed' 
  | 'settled';

export interface CaseStats {
  total: number;
  byStatus: Record<CaseStatus, number>;
  upcoming: number;
  today: number;
}