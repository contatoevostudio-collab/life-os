"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAppState } from "@/providers/app-state-provider";
import { useAuth } from "@/providers/auth-provider";
import type { Priority } from "@/types/domain";

interface TaskComposerModalProps {
  open: boolean;
  onClose: () => void;
  mode: "quick" | "full";
  defaultProjectId?: string | null;
}

const emptyState = {
  title: "",
  description: "",
  priority: "medium" as Priority,
  dueDate: "",
  estimatedMinutes: "30",
  projectId: "none",
  tags: ""
};

export function TaskComposerModal({
  open,
  onClose,
  mode,
  defaultProjectId = null
}: TaskComposerModalProps) {
  const { addTask, projects } = useAppState();
  const { user } = useAuth();
  const [form, setForm] = useState({
    ...emptyState,
    projectId: defaultProjectId ?? "none"
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      ...emptyState,
      projectId: defaultProjectId ?? "none"
    });
  }, [defaultProjectId, open]);

  if (!open) {
    return null;
  }

  function submit() {
    if (!form.title.trim()) {
      return;
    }

    addTask({
      userId: user?.id ?? "demo-user",
      title: form.title.trim(),
      description: mode === "full" ? form.description.trim() || null : null,
      priority: form.priority,
      status: "todo",
      dueDate: mode === "full" ? form.dueDate || null : null,
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

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-xl space-y-5 rounded-[30px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-soft">
              {mode === "quick" ? "Criação rápida" : "Nova tarefa completa"}
            </p>
            <h3 className="text-2xl font-semibold tracking-[-0.04em]">
              {mode === "quick" ? "Adicionar tarefa" : "Adicionar tarefa detalhada"}
            </h3>
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
              placeholder="Nome da tarefa"
              value={form.title}
            />
          </div>

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
            <>
              <div>
                <label className="mb-2 block text-sm text-text-soft">Descrição</label>
                <textarea
                  className="min-h-28 w-full rounded-[14px] border border-border bg-transparent px-3 py-3 text-sm text-text outline-none transition focus:border-accent"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Contexto, detalhes e observações"
                  value={form.description}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-text-soft">Prazo</label>
                  <Input
                    onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                    type="date"
                    value={form.dueDate}
                  />
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
              <div>
                <label className="mb-2 block text-sm text-text-soft">Tags</label>
                <Input
                  onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                  placeholder="trabalho, urgente, cliente"
                  value={form.tags}
                />
              </div>
            </>
          ) : (
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
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="ghost">
            Cancelar
          </Button>
          <Button onClick={submit}>{mode === "quick" ? "Criar rápido" : "Criar tarefa"}</Button>
        </div>
      </Card>
    </div>
  );
}
