export type ActivityCategory =
  | 'Coding'
  | 'Meeting'
  | 'UI/UX Design'
  | 'Self-learning'
  | 'Documentation'
  | 'Bug Fixing'
  | 'Other';

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  'Coding',
  'Meeting',
  'UI/UX Design',
  'Self-learning',
  'Documentation',
  'Bug Fixing',
  'Other',
];

export interface LogEntryInput {
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  category: ActivityCategory;
  details: string;
  documentation: string;
}

export interface LogEntry {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  durationHours: number;
  category: string;
  details: string;
  documentation: string;
  createdAt: string; // ISO string
}

export interface WeeklyReview {
  weekIndex: number;
  summaryText: string;
  updatedAt: string;
}

export interface WeekData {
  weekIndex: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  label: string; // e.g. "Week 1 (20 Mei - 26 Mei)"
  totalHours: number;
  entries: LogEntry[];
  review?: WeeklyReview;
}

export interface DashboardStats {
  totalHours: number;
  targetHours: number; // 900
  percentage: number;
  remainingHours: number;
  daysRemaining: number;
  requiredDailyHours: number;
  requiredWeeklyHours: number;
  categoryBreakdown: { category: string; hours: number; percentage: number }[];
}
