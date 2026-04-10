"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { useAppState } from "@/providers/app-state-provider";
import type { Priority, TaskStatus } from "@/types/domain";

interface ContextMenuItem {
  label: string;
  action?: () => void;
  danger?: boolean;
  children?: ContextMenuItem[];
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

const priorityLabels: Record<Priority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta"
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "A fazer",
  in_progress: "Em andamento",
  done: "Concluída"
};

export function ContextMenuProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { projects, tasks, toggleTaskStatus, deleteTask, updateTask, openTaskComposer } = useAppState();
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const [submenu, setSubmenu] = useState<{ item: ContextMenuItem; index: number } | null>(null);

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
            label: "Prioridade",
            children: (["low", "medium", "high"] as Priority[]).map((priority) => ({
              label: priorityLabels[priority],
              action: () => updateTask(task.id, { priority })
            }))
          });
          items.push({
            label: "Projeto",
            children: [
              { label: "Sem projeto", action: () => updateTask(task.id, { projectId: null }) },
              ...projects.map((project) => ({
                label: project.name,
                action: () => updateTask(task.id, { projectId: project.id })
              }))
            ]
          });
          items.push({
            label: "Status",
            children: (["todo", "in_progress", "done"] as TaskStatus[]).map((status) => ({
              label: statusLabels[status],
              action: () => updateTask(task.id, { status })
            }))
          });
          items.push({
            label: "Abrir em Atividades",
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
        const calendarDate = element.dataset.calendarDate;

        items.push({
          label: "Criar atividade",
          action: () =>
            openTaskComposer({
              mode: "full",
              defaultDueDate: calendarDate ? new Date(calendarDate).toISOString().slice(0, 10) : null
            })
        });
        items.push({
          label: "Abrir calendário",
          action: () => router.push("/calendar")
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
      setSubmenu(null);
    }

    function close() {
      setMenu(null);
      setSubmenu(null);
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
  }, [deleteTask, openTaskComposer, projects, router, tasks, toggleTaskStatus, updateTask]);

  const value = useMemo<ContextMenuContextValue>(
    () => ({
      closeMenu() {
        setMenu(null);
        setSubmenu(null);
      }
    }),
    []
  );

  const activeChildren = submenu?.item.children ?? null;

  return (
    <ContextMenuContext.Provider value={value}>
      <div className="contents">{children}</div>
      {menu ? (
        <>
          <div
            className="fixed z-[60] min-w-60 rounded-[18px] border border-border-strong bg-[rgba(255,255,255,0.92)] p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:bg-[rgba(16,20,24,0.92)]"
            style={{ left: menu.x, top: menu.y }}
          >
            {menu.items.map((item, index) => (
              <button
                className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-sm transition ${
                  item.danger ? "text-danger hover:bg-red-500/10" : "text-text hover:bg-bg-elevated"
                }`}
                key={item.label}
                onClick={() => {
                  if (!item.children) {
                    item.action?.();
                    setMenu(null);
                    setSubmenu(null);
                  }
                }}
                onMouseEnter={() => {
                  if (item.children) {
                    setSubmenu({ item, index });
                  } else {
                    setSubmenu(null);
                  }
                }}
                type="button"
              >
                <span>{item.label}</span>
                {item.children ? <span className="text-text-muted">›</span> : null}
              </button>
            ))}
          </div>

          {activeChildren?.length ? (
            <div
              className="fixed z-[61] min-w-56 rounded-[18px] border border-border-strong bg-[rgba(255,255,255,0.94)] p-2 shadow-[0_18px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:bg-[rgba(16,20,24,0.94)]"
              style={{
                left: menu.x + 248,
                top: menu.y + (submenu?.index ?? 0) * 44
              }}
            >
              {activeChildren.map((child) => (
                <button
                  className={`flex w-full items-center rounded-[12px] px-3 py-2 text-left text-sm transition ${
                    child.danger ? "text-danger hover:bg-red-500/10" : "text-text hover:bg-bg-elevated"
                  }`}
                  key={child.label}
                  onClick={() => {
                    child.action?.();
                    setMenu(null);
                    setSubmenu(null);
                  }}
                  type="button"
                >
                  {child.label}
                </button>
              ))}
            </div>
          ) : null}
        </>
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
