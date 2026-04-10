"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/providers/app-state-provider";
import { useAuth } from "@/providers/auth-provider";
import type { EventRecurrenceType, Priority, TaskStatus } from "@/types/domain";

interface TaskComposerModalProps {
  open: boolean;
  onClose: () => void;
  mode: "quick" | "full";
  defaultProjectId?: string | null;
  defaultDueDate?: string | null;
}

const emptyState = {
  title: "",
  description: "",
  priority: "medium" as Priority,
  status: "todo" as TaskStatus,
  dueDate: "",
  estimatedMinutes: "30",
  projectId: "none",
  tags: "",
  reminderEnabled: false,
  recurrence: "once" as EventRecurrenceType,
  recurrenceDayOfMonth: "",
  recurrenceMonth: ""
};

export function TaskComposerModal({
  open,
  onClose,
  mode,
  defaultProjectId = null,
  defaultDueDate = null
}: TaskComposerModalProps) {
  const { addTask, addEvent, projects } = useAppState();
  const { user } = useAuth();
  const [form, setForm] = useState({
    ...emptyState,
    projectId: defaultProjectId ?? "none",
    dueDate: defaultDueDate ?? ""
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      ...emptyState,
      projectId: defaultProjectId ?? "none",
      dueDate: defaultDueDate ?? ""
    });
  }, [defaultDueDate, defaultProjectId, open]);

  if (!open) {
    return null;
  }

  function submit() {
    if (!form.title.trim()) {
      return;
    }

    const task = addTask({
      userId: user?.id ?? "demo-user",
      title: form.title.trim(),
      description: mode === "full" ? form.description.trim() || null : null,
      priority: form.priority,
      status: mode === "full" ? form.status : "todo",
      dueDate: form.dueDate || defaultDueDate || null,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : null,
      scheduledStart: null,
      scheduledEnd: null,
      projectId: form.projectId === "none" ? null : form.projectId,
      tags:
        mode === "full"
          ? form.tags
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : []
    });

    if (form.reminderEnabled) {
      const anchorDate = form.dueDate || defaultDueDate || new Date().toISOString().slice(0, 10);
      const anchor = new Date(`${anchorDate}T09:00:00`);

      addEvent({
        userId: user?.id ?? "demo-user",
        taskId: task.id,
        title: task.title,
        description: task.description,
        startsAt: anchor.toISOString(),
        endsAt: anchor.toISOString(),
        location: null,
        isAllDay: true,
        recurrence:
          form.recurrence === "once"
            ? null
            : form.recurrence === "monthly"
              ? {
                  type: "monthly",
                  dayOfMonth: Number(form.recurrenceDayOfMonth) || anchor.getDate()
                }
              : {
                  type: "yearly",
                  dayOfMonth: Number(form.recurrenceDayOfMonth) || anchor.getDate(),
                  month: Number(form.recurrenceMonth) || anchor.getMonth() + 1
                }
      });
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <Card className="animate-fade-in w-full max-w-xl space-y-5 overflow-hidden rounded-[30px]">
        <div className="h-1.5 bg-[linear-gradient(90deg,rgba(37,99,235,1),rgba(96,165,250,0.2))]" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-soft">
              {mode === "quick" ? "Criação rápida" : "Nova atividade completa"}
            </p>
            <h3 className="text-2xl font-semibold tracking-[-0.04em]">Nova atividade</h3>
            <p className="mt-2 text-sm text-text-soft">
              Uma única ação para registrar trabalho, prazo ou um lembrete que também aparece no calendário.
            </p>
          </div>
          <button
            className="inline-flex size-10 items-center justify-center rounded-[14px] border border-border text-text-soft transition hover:bg-bg-elevated"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm text-text-soft">Título</label>
            <Input
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Nome da atividade"
              value={form.title}
            />
          </div>

          {mode === "full" ? (
            <div>
              <label className="mb-2 block text-sm text-text-soft">Descrição</label>
              <Textarea
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Contexto, observações ou próximos passos"
                value={form.description}
              />
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-text-soft">Prioridade</label>
              <Select
                onChange={(event) =>
                  setForm((current) => ({ ...current, priority: event.target.value as Priority }))
                }
                value={form.priority}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm text-text-soft">Projeto</label>
              <Select
                onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}
                value={form.projectId}
              >
                <option value="none">Sem projeto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {mode === "full" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-text-soft">Status</label>
                <Select
                  onChange={(event) =>
                    setForm((current) => ({ ...current, status: event.target.value as TaskStatus }))
                  }
                  value={form.status}
                >
                  <option value="todo">A fazer</option>
                  <option value="in_progress">Em andamento</option>
                  <option value="done">Concluída</option>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-text-soft">Duração estimada</label>
                <Input
                  onChange={(event) =>
                    setForm((current) => ({ ...current, estimatedMinutes: event.target.value }))
                  }
                  type="number"
                  value={form.estimatedMinutes}
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-text-soft">Prazo</label>
              <Input
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                type="date"
                value={form.dueDate}
              />
            </div>
            {mode === "full" ? (
              <div>
                <label className="mb-2 block text-sm text-text-soft">Tags</label>
                <Input
                  onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                  placeholder="trabalho, urgente, cliente"
                  value={form.tags}
                />
              </div>
            ) : null}
          </div>

          {mode === "full" ? (
            <div className="rounded-[22px] border border-border bg-bg-elevated/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Calendário</p>
                  <p className="text-sm text-text-soft">
                    Opcional: transformar essa atividade em lembrete recorrente.
                  </p>
                </div>
                <button
                  className={`inline-flex h-10 items-center rounded-full px-4 text-sm transition ${
                    form.reminderEnabled
                      ? "bg-accent text-white dark:text-slate-950"
                      : "border border-border bg-bg-panel text-text-soft"
                  }`}
                  onClick={() =>
                    setForm((current) => ({ ...current, reminderEnabled: !current.reminderEnabled }))
                  }
                  type="button"
                >
                  {form.reminderEnabled ? "Lembrete ligado" : "Ligar lembrete"}
                </button>
              </div>

              {form.reminderEnabled ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-text-soft">Recorrência</label>
                    <Select
                      onChange={(event) =>
                        setForm((current) => ({ ...current, recurrence: event.target.value as EventRecurrenceType }))
                      }
                      value={form.recurrence}
                    >
                      <option value="once">Uma vez</option>
                      <option value="monthly">Todo mês</option>
                      <option value="yearly">Todo ano</option>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-text-soft">Dia do lembrete</label>
                    <Input
                      onChange={(event) =>
                        setForm((current) => ({ ...current, recurrenceDayOfMonth: event.target.value }))
                      }
                      placeholder="15"
                      type="number"
                      value={form.recurrenceDayOfMonth}
                    />
                  </div>
                  {form.recurrence === "yearly" ? (
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm text-text-soft">Mês do lembrete</label>
                      <Input
                        onChange={(event) =>
                          setForm((current) => ({ ...current, recurrenceMonth: event.target.value }))
                        }
                        placeholder="10"
                        type="number"
                        value={form.recurrenceMonth}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="ghost">
            Cancelar
          </Button>
          <Button onClick={submit}>{mode === "quick" ? "Criar rápido" : "Salvar atividade"}</Button>
        </div>
      </Card>
    </div>
  );
}
