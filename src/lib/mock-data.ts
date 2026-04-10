import type {
  CalendarEvent,
  FinancialTransaction,
  FocusSession,
  Project,
  Task,
  UserPreferences,
  UserProfile
} from "@/types/domain";

export const demoUser: UserProfile = {
  id: "demo-user",
  email: "demo@lifeos.app",
  fullName: "Seu espaço"
};

export const demoProjects: Project[] = [];

export const demoTasks: Task[] = [];

export const demoEvents: CalendarEvent[] = [];

export const demoSessions: FocusSession[] = [];

export const demoTransactions: FinancialTransaction[] = [];

export const demoPreferences: UserPreferences = {
  userId: demoUser.id,
  theme: "system",
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  compactMode: false,
  weekStartsOn: 1,
  soundEnabled: false,
  notificationsEnabled: false,
  todayNote: "",
  priorityTaskIds: [],
  financeCategories: ["Trabalho", "Moradia", "Saude", "Lazer"],
  savedTaskView: "all",
  habitTitles: ["Agua", "Leitura", "Alongamento"]
};
