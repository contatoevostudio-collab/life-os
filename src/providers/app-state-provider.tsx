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
  preferences: UserPreferences;
  searchQuery: string;
  onboardingOpen: boolean;
  activePomodoroSeconds: number | null;
  pomodoroRunning: boolean;
  toggleTaskStatus: (taskId: string) => void;
  addProject: (project: Omit<Project, "id">) => void;
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  addTransaction: (transaction: Omit<FinancialTransaction, "id">) => void;
  saveSession: (session: Omit<FocusSession, "id">) => void;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  setSearchQuery: (value: string) => void;
  closeOnboarding: () => void;
  setPomodoroState: (state: { seconds: number | null; running: boolean }) => void;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [activePomodoroSeconds, setActivePomodoroSeconds] = useState<number | null>(null);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);

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
        onboardingDismissed: boolean;
      }>;

      setProjects(parsed.projects ?? demoProjects);
      setTasks(parsed.tasks ?? demoTasks);
      setEvents(parsed.events ?? demoEvents);
      setSessions(parsed.sessions ?? demoSessions);
      setTransactions(parsed.transactions ?? demoTransactions);
      setPreferences(parsed.preferences ?? demoPreferences);
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
        preferences,
        onboardingDismissed: !onboardingOpen
      })
    );
  }, [events, hydrated, onboardingOpen, preferences, projects, sessions, tasks, transactions]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      projects,
      tasks,
      events,
      sessions,
      transactions,
      preferences,
      searchQuery,
      onboardingOpen,
      activePomodoroSeconds,
      pomodoroRunning,
      toggleTaskStatus(taskId) {
        setTasks((current) =>
          current.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            const nextStatus =
              task.status === "todo"
                ? "in_progress"
                : task.status === "in_progress"
                  ? "done"
                  : "todo";
            const now = new Date();
            const alreadyTracked = task.trackedSeconds ?? 0;
            const liveTracked =
              task.status === "in_progress" && task.startedAt
                ? Math.max(0, Math.floor((now.getTime() - new Date(task.startedAt).getTime()) / 1000))
                : 0;
            return {
              ...task,
              status: nextStatus,
              startedAt: nextStatus === "in_progress" ? now.toISOString() : null,
              trackedSeconds:
                task.status === "in_progress" && nextStatus !== "in_progress"
                  ? alreadyTracked + liveTracked
                  : alreadyTracked,
              completedAt: nextStatus === "done" ? now.toISOString() : null
            };
          })
        );
      },
      addProject(project) {
        setProjects((current) => [{ ...project, id: uid("project") }, ...current]);
      },
      addTask(task) {
        setTasks((current) => [
          {
            ...task,
            id: uid("task"),
            subtasks: task.subtasks ?? [],
            order: current.length + 1,
            startedAt: null,
            trackedSeconds: 0
          },
          ...current
        ]);
      },
      updateTask(taskId, patch) {
        setTasks((current) =>
          current.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            if (!patch.status || patch.status === task.status) {
              return { ...task, ...patch };
            }

            const now = new Date();
            const alreadyTracked = task.trackedSeconds ?? 0;
            const liveTracked =
              task.status === "in_progress" && task.startedAt
                ? Math.max(0, Math.floor((now.getTime() - new Date(task.startedAt).getTime()) / 1000))
                : 0;

            return {
              ...task,
              ...patch,
              startedAt: patch.status === "in_progress" ? now.toISOString() : null,
              trackedSeconds:
                task.status === "in_progress" && patch.status !== "in_progress"
                  ? alreadyTracked + liveTracked
                  : alreadyTracked,
              completedAt: patch.status === "done" ? now.toISOString() : null
            };
          })
        );
      },
      deleteTask(taskId) {
        setTasks((current) => current.filter((task) => task.id !== taskId));
        setEvents((current) => current.filter((event) => event.taskId !== taskId));
      },
      addEvent(event) {
        setEvents((current) => [{ ...event, id: uid("event") }, ...current]);
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
      setPomodoroState(state) {
        setActivePomodoroSeconds(state.seconds);
        setPomodoroRunning(state.running);
      }
    }),
    [
      activePomodoroSeconds,
      events,
      onboardingOpen,
      pomodoroRunning,
      preferences,
      projects,
      searchQuery,
      sessions,
      tasks,
      transactions
    ]
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
