"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { useAppState } from "@/providers/app-state-provider";

interface ContextMenuItem {
  label: string;
  action: () => void;
  danger?: boolean;
}

interface ContextMenuState {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

interface ContextMenuContextValue {
  closeMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

export function ContextMenuProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { projects, tasks, toggleTaskStatus, deleteTask } = useAppState();
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    function onContextMenu(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const element = target?.closest<HTMLElement>("[data-context]");

      if (!element) {
        return;
      }

      event.preventDefault();

      const context = element.dataset.context;
      const items: ContextMenuItem[] = [];

      if (context === "task") {
        const taskId = element.dataset.taskId;
        const task = tasks.find((item) => item.id === taskId);

        if (task) {
          items.push({
            label:
              task.status === "todo"
                ? "Iniciar tarefa"
                : task.status === "in_progress"
                  ? "Concluir tarefa"
                  : "Reabrir tarefa",
            action: () => toggleTaskStatus(task.id)
          });
          items.push({
            label: "Abrir em Tarefas",
            action: () => router.push("/tasks")
          });
          items.push({
            label: "Excluir tarefa",
            action: () => deleteTask(task.id),
            danger: true
          });
        }
      }

      if (context === "project") {
        const projectId = element.dataset.projectId;

        if (projectId) {
          items.push({
            label: "Abrir projeto",
            action: () => router.push(`/projects/${projectId}` as Route)
          });
        }

        items.push({
          label: "Gerenciar projetos",
          action: () => router.push("/projects")
        });
      }

      if (context === "calendar-day") {
        items.push({
          label: "Abrir calendário",
          action: () => router.push("/calendar")
        });
        items.push({
          label: "Ir para tarefas",
          action: () => router.push("/tasks")
        });
      }

      if (context === "workspace") {
        items.push({
          label: "Abrir tarefas",
          action: () => router.push("/tasks")
        });
        items.push({
          label: "Abrir projetos",
          action: () => router.push("/projects")
        });
        items.push({
          label: "Abrir calendário",
          action: () => router.push("/calendar")
        });
      }

      if (!items.length) {
        return;
      }

      setMenu({
        x: event.clientX,
        y: event.clientY,
        items
      });
    }

    function close() {
      setMenu(null);
    }

    window.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("click", close);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);

    return () => {
      window.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("click", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [deleteTask, projects, router, tasks, toggleTaskStatus]);

  const value = useMemo<ContextMenuContextValue>(
    () => ({
      closeMenu() {
        setMenu(null);
      }
    }),
    []
  );

  return (
    <ContextMenuContext.Provider value={value}>
      <div className="contents">{children}</div>
      {menu ? (
        <div
          className="fixed z-[60] min-w-56 rounded-[18px] border border-border-strong bg-[rgba(255,255,255,0.9)] p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:bg-[rgba(16,20,24,0.9)]"
          style={{ left: menu.x, top: menu.y }}
        >
          {menu.items.map((item) => (
            <button
              className={`flex w-full items-center rounded-[12px] px-3 py-2 text-left text-sm transition ${
                item.danger ? "text-danger hover:bg-red-500/10" : "text-text hover:bg-bg-elevated"
              }`}
              key={item.label}
              onClick={() => {
                item.action();
                setMenu(null);
              }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu() {
  const context = useContext(ContextMenuContext);

  if (!context) {
    throw new Error("useContextMenu must be used within ContextMenuProvider");
  }

  return context;
}
