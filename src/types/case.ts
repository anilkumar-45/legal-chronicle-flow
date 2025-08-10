export interface CaseEntry {
  id: string;
  previousDate: string;
  caseDetails: string;
  status: CaseStatus;
  nextDate: string;
  createdAt: string;
  updatedAt: string;
  teamId?: string | null;
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

export type CaseHistoryField = 'previous_date' | 'next_date';

export interface CaseHistoryEvent {
  id: string;
  caseId: string;
  field: CaseHistoryField;
  oldDate: string | null;
  newDate: string | null;
  changedAt: string;
  changedBy: string;
}
