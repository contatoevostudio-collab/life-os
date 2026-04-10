"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ProjectPill } from "@/components/ui/project-pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { TaskComposerModal } from "@/features/tasks/task-composer-modal";
import { formatDate, formatDurationSeconds } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";
import type { Priority, TaskStatus } from "@/types/domain";

type ViewMode = "list" | "kanban";

export function TasksBoard() {
  const {
    tasks,
    projects,
    toggleTaskStatus,
    updateTask,
    deleteTask,
    addProject,
    searchQuery
  } = useAppState();
  const [view, setView] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [projectName, setProjectName] = useState("");
  const [projectColor, setProjectColor] = useState("#4f8a7b");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);
  const [clockNow, setClockNow] = useState(Date.now());
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [fullModalOpen, setFullModalOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchQuery.trim() ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (projectFilter !== "all" && task.projectId !== projectFilter) return false;
    return true;
  });

  const columns: TaskStatus[] = ["todo", "in_progress", "done"];

  function getTaskElapsedSeconds(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return 0;
    const base = task.trackedSeconds ?? 0;
    if (task.status !== "in_progress" || !task.startedAt) {
      return base;
    }
    return base + Math.max(0, Math.floor((clockNow - new Date(task.startedAt).getTime()) / 1000));
  }

  function getAdvanceLabel(status: TaskStatus) {
    if (status === "todo") return "Iniciar";
    if (status === "in_progress") return "Concluir";
    return "Reabrir";
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Tarefas independentes do calendário, com filtros rápidos e visualização em lista ou kanban."
        eyebrow="Módulo"
        title="Tarefas"
        action={
          <div className="flex items-center gap-3">
            <Badge>{filteredTasks.length} visíveis</Badge>
            <div className="flex gap-2">
              <Button onClick={() => setView("list")} variant={view === "list" ? "primary" : "secondary"}>
                Lista
              </Button>
              <Button onClick={() => setView("kanban")} variant={view === "kanban" ? "primary" : "secondary"}>
                Kanban
              </Button>
            </div>
          </div>
        }
      />

      <Card className="grid gap-4 xl:grid-cols-[1.6fr_repeat(4,1fr)]">
        <div className="space-y-2">
          <label className="block text-sm text-text-soft">Tarefas</label>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setFullModalOpen(true)}>Adicionar tarefa</Button>
            <Button onClick={() => setQuickModalOpen(true)} variant="secondary">
              Tarefa rápida
            </Button>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm text-text-soft">Projeto novo</label>
          <div className="flex gap-2">
            <Input
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Nome do projeto"
              value={projectName}
            />
            <Input
              aria-label="Cor do projeto"
              className="h-11 w-14 rounded-[16px] px-2"
              onChange={(event) => setProjectColor(event.target.value)}
              type="color"
              value={projectColor}
            />
            <Button
              onClick={() => {
                if (!projectName.trim()) return;
                addProject({
                  name: projectName,
                  color: projectColor
                });
                setProjectName("");
                setProjectColor("#4f8a7b");
              }}
              variant="secondary"
            >
              Criar
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm text-text-soft">Status</label>
          <Select onChange={(event) => setStatusFilter(event.target.value as "all" | TaskStatus)} value={statusFilter}>
            <option value="all">Todos</option>
            <option value="todo">A fazer</option>
            <option value="in_progress">Em andamento</option>
            <option value="done">Concluídas</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-text-soft">Prioridade</label>
          <Select
            onChange={(event) => setPriorityFilter(event.target.value as "all" | Priority)}
            value={priorityFilter}
          >
            <option value="all">Todas</option>
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </Select>
        </div>
        <div>
          <label className="mb-2 block text-sm text-text-soft">Projeto</label>
          <Select onChange={(event) => setProjectFilter(event.target.value)} value={projectFilter}>
            <option value="all">Todos</option>
            {projects.length ? (
              projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))
            ) : (
              <option disabled value="empty">
                Sem projetos
              </option>
            )}
          </Select>
        </div>
      </Card>

      {view === "list" ? (
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="grid gap-3">
            {filteredTasks.length ? (
              filteredTasks.map((task) => (
                <Card
                  className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  data-context="task"
                  data-task-id={task.id}
                  key={task.id}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-medium">{task.title}</h3>
                      <Badge>{task.priority}</Badge>
                      {task.projectId ? (
                        <ProjectPill
                          color={
                            projects.find((project) => project.id === task.projectId)?.color ?? "#2563eb"
                          }
                          name={projects.find((project) => project.id === task.projectId)?.name ?? "Projeto"}
                        />
                      ) : null}
                      <Badge className="bg-bg-elevated text-text-soft">{task.status}</Badge>
                    </div>
                    <p className="text-sm text-text-soft">{task.description ?? "Sem descrição adicional."}</p>
                    <p className="text-sm text-text-muted">
                      Prazo {task.dueDate ? formatDate(task.dueDate) : "livre"}
                    </p>
                    {task.status === "in_progress" ? (
                      <p className="text-sm font-medium text-accent">
                        Cronômetro {formatDurationSeconds(getTaskElapsedSeconds(task.id))}
                      </p>
                    ) : task.trackedSeconds ? (
                      <p className="text-sm text-text-muted">
                        Tempo total {formatDurationSeconds(task.trackedSeconds)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setEditingTaskId(task.id)} variant="ghost">
                      Editar
                    </Button>
                    <Button onClick={() => toggleTaskStatus(task.id)} variant="secondary">
                      {getAdvanceLabel(task.status)}
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState
                description="Crie sua primeira tarefa para começar a montar o fluxo do dia."
                title="Nenhuma tarefa ainda"
              />
            )}
          </div>

          <Card className="space-y-4">
            <p className="text-sm text-text-soft">Editor rapido</p>
            {editingTaskId ? (
              (() => {
                const task = tasks.find((item) => item.id === editingTaskId);

                if (!task) {
                  return <p className="text-sm text-text-soft">Selecione uma tarefa para editar.</p>;
                }

                return (
                  <div className="space-y-3">
                    <Input
                      onChange={(event) => updateTask(task.id, { title: event.target.value })}
                      value={task.title}
                    />
                    <Input
                      onChange={(event) => updateTask(task.id, { description: event.target.value })}
                      placeholder="Descricao"
                      value={task.description ?? ""}
                    />
                    <Input
                      onChange={(event) => updateTask(task.id, { dueDate: event.target.value || null })}
                      type="date"
                      value={task.dueDate ?? ""}
                    />
                    <Input
                      onChange={(event) =>
                        updateTask(task.id, {
                          estimatedMinutes: event.target.value ? Number(event.target.value) : null
                        })
                      }
                      placeholder="Duracao estimada"
                      type="number"
                      value={task.estimatedMinutes ?? ""}
                    />
                    <Input
                      onChange={(event) =>
                        updateTask(task.id, {
                          tags: event.target.value
                            .split(",")
                            .map((item) => item.trim())
                            .filter(Boolean)
                        })
                      }
                      placeholder="tags separadas por virgula"
                      value={task.tags.join(", ")}
                    />
                    <Select
                      onChange={(event) =>
                        updateTask(task.id, { priority: event.target.value as Priority })
                      }
                      value={task.priority}
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </Select>
                    <Select
                      onChange={(event) =>
                        updateTask(task.id, { status: event.target.value as TaskStatus })
                      }
                      value={task.status}
                    >
                      <option value="todo">A fazer</option>
                      <option value="in_progress">Em andamento</option>
                      <option value="done">Concluida</option>
                    </Select>
                    <Select
                      onChange={(event) =>
                        updateTask(task.id, {
                          projectId: event.target.value === "none" ? null : event.target.value
                        })
                      }
                      value={task.projectId ?? "none"}
                    >
                      <option value="none">Sem projeto</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </Select>
                    <div className="flex gap-2">
                      <Button onClick={() => setEditingTaskId(null)} variant="secondary">
                        Fechar
                      </Button>
                      <Button
                        onClick={() => {
                          deleteTask(task.id);
                          setEditingTaskId(null);
                        }}
                        variant="danger"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-sm text-text-soft">
                Escolha uma tarefa da lista para editar campos ou excluir.
              </p>
            )}
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {columns.map((status) => (
            <Card
              className={`space-y-3 min-h-72 transition ${
                dropTarget === status ? "border-accent bg-accent-soft/40" : ""
              }`}
              key={status}
              onDragEnter={() => setDropTarget(status)}
              onDragLeave={() => setDropTarget((current) => (current === status ? null : current))}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (!draggingTaskId) return;
                updateTask(draggingTaskId, {
                  status,
                  completedAt: status === "done" ? new Date().toISOString() : null
                });
                setDraggingTaskId(null);
                setDropTarget(null);
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{status}</h3>
                <span className="text-sm text-text-muted">
                  {filteredTasks.filter((task) => task.status === status).length}
                </span>
              </div>
              {filteredTasks.filter((task) => task.status === status).length ? (
                filteredTasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <div
                      className="rounded-[18px] border border-border bg-bg-elevated p-4 transition hover:border-accent"
                      data-context="task"
                      data-task-id={task.id}
                      draggable
                      key={task.id}
                      onDragStart={() => setDraggingTaskId(task.id)}
                      onDragEnd={() => {
                        setDraggingTaskId(null);
                        setDropTarget(null);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Badge>{task.priority}</Badge>
                        {task.projectId ? (
                          <ProjectPill
                            color={
                              projects.find((project) => project.id === task.projectId)?.color ?? "#2563eb"
                            }
                            name={projects.find((project) => project.id === task.projectId)?.name ?? "Projeto"}
                          />
                        ) : null}
                        <span className="text-xs text-text-muted">arraste</span>
                      </div>
                      <p className="mt-3 font-medium">{task.title}</p>
                      <p className="mt-2 text-sm text-text-soft">{task.description ?? "Sem descrição"}</p>
                      {task.status === "in_progress" ? (
                        <p className="mt-2 text-sm font-medium text-accent">
                          {formatDurationSeconds(getTaskElapsedSeconds(task.id))}
                        </p>
                      ) : null}
                      {task.subtasks?.length ? (
                        <p className="mt-2 text-xs text-text-muted">
                          {task.subtasks.filter((subtask) => subtask.done).length}/{task.subtasks.length} subtarefas
                        </p>
                      ) : null}
                    </div>
                  ))
              ) : (
                <EmptyState
                  description="Arraste uma tarefa para esta coluna ou crie uma nova."
                  title="Coluna vazia"
                />
              )}
            </Card>
          ))}
        </div>
      )}

      <TaskComposerModal mode="quick" onClose={() => setQuickModalOpen(false)} open={quickModalOpen} />
      <TaskComposerModal mode="full" onClose={() => setFullModalOpen(false)} open={fullModalOpen} />
    </div>
  );
}
