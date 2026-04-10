export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";
export type FinanceType = "income" | "expense";
export type ThemeMode = "light" | "dark" | "system";
export type CalendarView = "day" | "week" | "month" | "year";
export type EventRecurrenceType = "once" | "monthly" | "yearly";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string | null;
}

export interface Task {
  id: string;
  userId: string;
  projectId?: string | null;
  title: string;
  description?: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  tags: string[];
  completedAt?: string | null;
  subtasks?: TaskSubtask[];
  order?: number;
  startedAt?: string | null;
  trackedSeconds?: number;
}

export interface TaskSubtask {
  id: string;
  title: string;
  done: boolean;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  taskId?: string | null;
  title: string;
  description?: string | null;
  amount?: number | null;
  startsAt: string;
  endsAt: string;
  location?: string | null;
  isAllDay: boolean;
  recurrence?: EventRecurrenceRule | null;
}

export interface EventRecurrenceRule {
  type: EventRecurrenceType;
  dayOfMonth?: number | null;
  month?: number | null;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string | null;
  durationMinutes: number;
  breakMinutes: number;
  status: "planned" | "running" | "paused" | "completed";
  startedAt?: string | null;
  endedAt?: string | null;
}

export interface FinancialTransaction {
  id: string;
  userId: string;
  type: FinanceType;
  amount: number;
  category: string;
  date: string;
  description?: string | null;
}

export interface UserPreferences {
  userId: string;
  theme: ThemeMode;
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  compactMode: boolean;
  weekStartsOn: 0 | 1;
}
