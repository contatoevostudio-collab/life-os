"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import {
  demoEvents,
  demoPreferences,
  demoProjects,
  demoSessions,
  demoTasks,
  demoTransactions
} from "@/lib/mock-data";
import type {
  CalendarEvent,
  FinancialTransaction,
  FocusSession,
  Habit,
  Project,
  Task,
  UserPreferences
} from "@/types/domain";

interface AppStateContextValue {
  projects: Project[];
  tasks: Task[];
  events: CalendarEvent[];
  sessions: FocusSession[];
  transactions: FinancialTransaction[];
  habits: Habit[];
  preferences: UserPreferences;
  searchQuery: string;
  onboardingOpen: boolean;
  toggleTaskStatus: (taskId: string) => void;
  addProject: (project: Omit<Project, "id">) => void;
  addTask: (task: Omit<Task, "id">) => void;
  duplicateTask: (taskId: string) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  reorderTask: (taskId: string, direction: "up" | "down") => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  moveEvent: (eventId: string, nextStart: string, nextEnd: string) => void;
  resizeEvent: (eventId: string, deltaMinutes: number) => void;
  addTransaction: (transaction: Omit<FinancialTransaction, "id">) => void;
  saveSession: (session: Omit<FocusSession, "id">) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  setSearchQuery: (value: string) => void;
  closeOnboarding: () => void;
  togglePriorityTask: (taskId: string) => void;
  toggleHabit: (habitId: string) => void;
  addHabit: (title: string) => void;
  addFinanceCategory: (name: string) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);
const STORAGE_KEY = "lifeos-state";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [projects, setProjects] = useState(demoProjects);
  const [tasks, setTasks] = useState(demoTasks);
  const [events, setEvents] = useState(demoEvents);
  const [sessions, setSessions] = useState(demoSessions);
  const [transactions, setTransactions] = useState(demoTransactions);
  const [preferences, setPreferences] = useState(demoPreferences);
  const [habits, setHabits] = useState<Habit[]>(
    demoPreferences.habitTitles.map((title, index) => ({
      id: `habit-${index + 1}`,
      title,
      completedToday: false
    }))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      setOnboardingOpen(true);
      setHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<{
        projects: Project[];
        tasks: Task[];
        events: CalendarEvent[];
        sessions: FocusSession[];
        transactions: FinancialTransaction[];
        preferences: UserPreferences;
        habits: Habit[];
        onboardingDismissed: boolean;
      }>;

      setProjects(parsed.projects ?? demoProjects);
      setTasks(parsed.tasks ?? demoTasks);
      setEvents(parsed.events ?? demoEvents);
      setSessions(parsed.sessions ?? demoSessions);
      setTransactions(parsed.transactions ?? demoTransactions);
      setPreferences(parsed.preferences ?? demoPreferences);
      setHabits(
        parsed.habits ??
          (parsed.preferences?.habitTitles ?? demoPreferences.habitTitles).map((title, index) => ({
            id: `habit-${index + 1}`,
            title,
            completedToday: false
          }))
      );
      setOnboardingOpen(!parsed.onboardingDismissed);
    } catch {
      setOnboardingOpen(true);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        projects,
        tasks,
        events,
        sessions,
        transactions,
        habits,
        preferences,
        onboardingDismissed: !onboardingOpen
      })
    );
  }, [events, habits, hydrated, onboardingOpen, preferences, projects, sessions, tasks, transactions]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      projects,
      tasks,
      events,
      sessions,
      transactions,
      habits,
      preferences,
      searchQuery,
      onboardingOpen,
      toggleTaskStatus(taskId) {
        setTasks((current) =>
          current.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            const nextStatus = task.status === "done" ? "todo" : "done";
            return {
              ...task,
              status: nextStatus,
              completedAt: nextStatus === "done" ? new Date().toISOString() : null
            };
          })
        );
      },
      addProject(project) {
        setProjects((current) => [{ ...project, id: uid("project") }, ...current]);
      },
      addTask(task) {
        setTasks((current) => [
          { ...task, id: uid("task"), subtasks: task.subtasks ?? [], order: current.length + 1 },
          ...current
        ]);
      },
      duplicateTask(taskId) {
        setTasks((current) => {
          const found = current.find((task) => task.id === taskId);
          if (!found) return current;
          return [
            {
              ...found,
              id: uid("task"),
              title: `${found.title} (cópia)`,
              status: "todo",
              completedAt: null,
              subtasks: found.subtasks?.map((subtask) => ({
                ...subtask,
                id: uid("subtask"),
                done: false
              })),
              order: current.length + 1
            },
            ...current
          ];
        });
      },
      updateTask(taskId, patch) {
        setTasks((current) =>
          current.map((task) => (task.id === taskId ? { ...task, ...patch } : task))
        );
      },
      deleteTask(taskId) {
        setTasks((current) => current.filter((task) => task.id !== taskId));
        setEvents((current) => current.filter((event) => event.taskId !== taskId));
      },
      reorderTask(taskId, direction) {
        setTasks((current) => {
          const index = current.findIndex((task) => task.id === taskId);
          if (index === -1) return current;
          const status = current[index].status;
          const groupIndexes = current
            .map((task, idx) => ({ task, idx }))
            .filter(({ task }) => task.status === status);
          const withinGroup = groupIndexes.findIndex(({ idx }) => idx === index);
          const swapWith = direction === "up" ? withinGroup - 1 : withinGroup + 1;
          if (swapWith < 0 || swapWith >= groupIndexes.length) return current;
          const next = [...current];
          const a = groupIndexes[withinGroup].idx;
          const b = groupIndexes[swapWith].idx;
          [next[a], next[b]] = [next[b], next[a]];
          return next;
        });
      },
      addSubtask(taskId, title) {
        setTasks((current) =>
          current.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [...(task.subtasks ?? []), { id: uid("subtask"), title, done: false }]
                }
              : task
          )
        );
      },
      toggleSubtask(taskId, subtaskId) {
        setTasks((current) =>
          current.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: (task.subtasks ?? []).map((subtask) =>
                    subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
                  )
                }
              : task
          )
        );
      },
      addEvent(event) {
        setEvents((current) => [{ ...event, id: uid("event") }, ...current]);
      },
      moveEvent(eventId, nextStart, nextEnd) {
        setEvents((current) =>
          current.map((event) =>
            event.id === eventId ? { ...event, startsAt: nextStart, endsAt: nextEnd } : event
          )
        );
      },
      resizeEvent(eventId, deltaMinutes) {
        setEvents((current) =>
          current.map((event) => {
            if (event.id !== eventId) return event;
            const nextEnd = new Date(new Date(event.endsAt).getTime() + deltaMinutes * 60_000);
            if (nextEnd <= new Date(event.startsAt)) return event;
            return { ...event, endsAt: nextEnd.toISOString() };
          })
        );
      },
      addTransaction(transaction) {
        setTransactions((current) => [{ ...transaction, id: uid("txn") }, ...current]);
      },
      saveSession(session) {
        setSessions((current) => [{ ...session, id: uid("focus") }, ...current]);
      },
      updatePreferences(patch) {
        setPreferences((current) => ({ ...current, ...patch }));
      },
      setSearchQuery(value) {
        setSearchQuery(value);
      },
      closeOnboarding() {
        setOnboardingOpen(false);
      },
      togglePriorityTask(taskId) {
        setPreferences((current) => {
          const exists = current.priorityTaskIds.includes(taskId);
          const next = exists
            ? current.priorityTaskIds.filter((id) => id !== taskId)
            : [...current.priorityTaskIds, taskId].slice(-3);
          return { ...current, priorityTaskIds: next };
        });
      },
      toggleHabit(habitId) {
        setHabits((current) =>
          current.map((habit) =>
            habit.id === habitId ? { ...habit, completedToday: !habit.completedToday } : habit
          )
        );
      },
      addHabit(title) {
        setHabits((current) => [...current, { id: uid("habit"), title, completedToday: false }]);
      },
      addFinanceCategory(name) {
        setPreferences((current) => ({
          ...current,
          financeCategories: Array.from(new Set([...current.financeCategories, name]))
        }));
      }
    }),
    [events, habits, onboardingOpen, preferences, projects, searchQuery, sessions, tasks, transactions]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}
