"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectPill } from "@/components/ui/project-pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { TaskComposerModal } from "@/features/tasks/task-composer-modal";
import { formatDurationSeconds } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";
import type { TaskStatus } from "@/types/domain";

const columns: TaskStatus[] = ["todo", "in_progress", "done"];

interface ProjectKanbanProps {
  projectId: string;
}

export function ProjectKanban({ projectId }: ProjectKanbanProps) {
  const { projects, tasks, updateTask, toggleTaskStatus } = useAppState();
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);
  const [clockNow, setClockNow] = useState(Date.now());
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [fullModalOpen, setFullModalOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    return (
      <EmptyState
        description="Esse projeto não foi encontrado. Volte para a seção Projetos e escolha um item existente."
        title="Projeto indisponível"
      />
    );
  }

  const projectTasks = tasks.filter((task) => task.projectId === projectId);

  function getTaskElapsedSeconds(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return 0;
    const base = task.trackedSeconds ?? 0;
    if (task.status !== "in_progress" || !task.startedAt) {
      return base;
    }
    return base + Math.max(0, Math.floor((clockNow - new Date(task.startedAt).getTime()) / 1000));
  }

function label(status: TaskStatus) {
  if (status === "todo") return "A fazer";
  if (status === "in_progress") return "Em andamento";
  return "Concluídas";
}

function statusAccent(status: TaskStatus) {
  if (status === "todo") return "bg-danger";
  if (status === "in_progress") return "bg-warning";
  return "bg-success";
}

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Kanban dedicado ao projeto, com fases claras e leitura rápida das tarefas ativas."
        eyebrow="Projeto"
        title={project.name}
        action={<span className="text-sm text-text-soft">{projectTasks.length} itens no quadro</span>}
      />

      <Card className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-2">
          <ProjectPill color={project.color} name={project.name} />
          <p className="text-sm text-text-soft">
            {projectTasks.length} tarefas neste projeto.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 xl:max-w-xl xl:justify-end">
          <Button onClick={() => setFullModalOpen(true)}>Adicionar tarefa</Button>
          <Button onClick={() => setQuickModalOpen(true)} variant="secondary">
            Tarefa rápida
          </Button>
        </div>
      </Card>

      {projectTasks.length ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {columns.map((status) => (
            <Card
              className={
                dropTarget === status
                  ? "space-y-3 border-accent bg-accent-soft/40"
                  : "space-y-3 bg-bg-panel/80"
              }
              key={status}
              onDragEnter={() => setDropTarget(status)}
              onDragLeave={() => setDropTarget((current) => (current === status ? null : current))}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (!draggingTaskId) return;
                updateTask(draggingTaskId, { status });
                setDraggingTaskId(null);
                setDropTarget(null);
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{label(status)}</h3>
                <span className="text-sm text-text-muted">
                  {projectTasks.filter((task) => task.status === status).length}
                </span>
              </div>
              <span className={`block h-1 rounded-full ${statusAccent(status)} opacity-70`} />

              {projectTasks.filter((task) => task.status === status).length ? (
                projectTasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <div
                      className="rounded-[18px] border border-border bg-bg-elevated/70 p-4 transition hover:border-accent"
                      data-context="task"
                      data-task-id={task.id}
                      draggable
                      key={task.id}
                      onDragEnd={() => {
                        setDraggingTaskId(null);
                        setDropTarget(null);
                      }}
                      onDragStart={() => setDraggingTaskId(task.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Badge>{task.priority}</Badge>
                        <ProjectPill color={project.color} name={project.name} />
                      </div>
                      <p className="mt-3 font-medium">{task.title}</p>
                      <p className="mt-2 text-sm text-text-soft">{task.description ?? "Sem descrição"}</p>
                      {task.status === "in_progress" ? (
                        <p className="mt-2 text-sm font-medium text-accent">
                          {formatDurationSeconds(getTaskElapsedSeconds(task.id))}
                        </p>
                      ) : null}
                      <div className="mt-3">
                        <Button onClick={() => toggleTaskStatus(task.id)} variant="secondary">
                          {task.status === "todo" ? "Iniciar" : task.status === "in_progress" ? "Concluir" : "Reabrir"}
                        </Button>
                      </div>
                    </div>
                  ))
              ) : (
                <EmptyState
                  description="Arraste tarefas para esta fase ou adicione uma nova acima."
                  title="Sem tarefas nesta fase"
                />
              )}
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          description="Adicione a primeira tarefa deste projeto e o kanban começa a ganhar forma."
          title="Projeto vazio"
        />
      )}

      <TaskComposerModal
        defaultProjectId={projectId}
        mode="quick"
        onClose={() => setQuickModalOpen(false)}
        open={quickModalOpen}
      />
      <TaskComposerModal
        defaultProjectId={projectId}
        mode="full"
        onClose={() => setFullModalOpen(false)}
        open={fullModalOpen}
      />
    </div>
  );
}
