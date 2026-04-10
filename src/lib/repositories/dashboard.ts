import type {
  CalendarEvent,
  FinancialTransaction,
  FocusSession,
  Task
} from "@/types/domain";

export function buildDashboardSnapshot(input: {
  tasks: Task[];
  events: CalendarEvent[];
  sessions: FocusSession[];
  transactions: FinancialTransaction[];
}) {
  const completedTasks = input.tasks.filter((task) => task.status === "done").length;
  const pendingTasks = input.tasks.filter((task) => task.status !== "done").length;
  const focusMinutes = input.sessions
    .filter((session) => session.status === "completed")
    .reduce((total, session) => total + session.durationMinutes, 0);
  const balance = input.transactions.reduce(
    (total, item) => total + (item.type === "income" ? item.amount : -item.amount),
    0
  );
  const nextEvents = [...input.events]
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, 3);

  return {
    completedTasks,
    pendingTasks,
    focusMinutes,
    balance,
    nextEvents
  };
}
