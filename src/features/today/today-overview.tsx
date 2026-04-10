"use client";

import Link from "next/link";
import { CircleCheckBig, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectPill } from "@/components/ui/project-pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatDateTime, formatHours } from "@/lib/utils";
import { formatEventRecurrence, nextEventOccurrence } from "@/lib/event-utils";
import { useAppState } from "@/providers/app-state-provider";

export function TodayOverview() {
  const { tasks, events, sessions, searchQuery, projects } = useAppState();

  const filteredTasks = tasks.filter(
    (task) =>
      !searchQuery.trim() ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredEvents = events.filter(
    (event) =>
      !searchQuery.trim() ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const priorityTasks = filteredTasks.filter((task) => task.status !== "done").slice(0, 4);
  const nextEvents = [...filteredEvents]
    .sort((a, b) => {
      const nextA = nextEventOccurrence(a) ?? new Date(a.startsAt);
      const nextB = nextEventOccurrence(b) ?? new Date(b.startsAt);
      return nextA.getTime() - nextB.getTime();
    })
    .slice(0, 3);
  const todoCount = filteredTasks.filter((task) => task.status === "todo").length;
  const progressCount = filteredTasks.filter((task) => task.status === "in_progress").length;
  const doneCount = filteredTasks.filter((task) => task.status === "done").length;
  const focusMinutes = sessions
    .filter((session) => session.status === "completed")
    .reduce((total, session) => total + session.durationMinutes, 0);

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Resumo do que está pendente, do que está andando e dos próximos lembretes vinculados ao seu fluxo."
        eyebrow="Home"
        title="Hoje"
        action={
          <div className="flex items-center gap-2">
            <Badge>{priorityTasks.length} atividades</Badge>
            <Badge>{nextEvents.length} lembretes</Badge>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="space-y-5 bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(255,255,255,0.08))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm text-text-soft">Controle da atividade</p>
              <h3 className="text-2xl font-semibold tracking-[-0.05em]">
                Hoje funciona como o seu novo dashboard
              </h3>
              <p className="max-w-xl text-sm text-text-soft">
                Tarefas, status e lembretes pessoais aparecem em um painel só, com menos ruído e mais decisão.
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-bg-elevated px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Em aberto</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.06em]">{priorityTasks.length}</p>
            </div>
          </div>

          <div className="grid gap-3">
            {priorityTasks.length ? (
              priorityTasks.map((task) => (
                <div
                  className="rounded-[22px] border border-border bg-bg-elevated/70 px-4 py-4 shadow-sm backdrop-blur-sm"
                  key={task.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CircleCheckBig className="size-4 text-accent" />
                        <p className="font-medium">{task.title}</p>
                        <Badge className="bg-bg-panel text-text-soft">{task.status}</Badge>
                      </div>
                      <p className="text-sm text-text-soft">{task.description ?? "Sem descrição"}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {task.projectId ? (
                          <ProjectPill
                            color={projects.find((project) => project.id === task.projectId)?.color ?? "#2563eb"}
                            name={projects.find((project) => project.id === task.projectId)?.name ?? "Projeto"}
                          />
                        ) : null}
                        <Badge className="bg-bg-elevated">{formatHours(task.estimatedMinutes ?? 0)}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                description="Adicione atividades, projetos e lembretes para a tela Hoje virar seu painel central."
                title="Seu dia ainda está em branco"
              />
            )}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="space-y-4">
            <p className="text-sm text-text-soft">Status da operação</p>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[20px] border border-border bg-bg-elevated/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">A fazer</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{todoCount}</p>
              </div>
              <div className="rounded-[20px] border border-border bg-bg-elevated/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Em andamento</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{progressCount}</p>
              </div>
              <div className="rounded-[20px] border border-border bg-bg-elevated/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Concluídas</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{doneCount}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-soft">Próximos lembretes</p>
              <Link className="rounded-[14px] px-4 py-2 text-sm font-medium text-text-soft transition hover:bg-accent-soft hover:text-text" href="/calendar">
                Abrir calendário
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {nextEvents.length ? (
                nextEvents.map((event) => (
                  <div className="rounded-[20px] border border-border bg-bg-elevated/70 px-4 py-3" key={event.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{event.title}</p>
                      <Badge className="bg-bg-panel text-text-soft">{formatEventRecurrence(event)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-text-soft">{formatDateTime(event.startsAt)}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  description="Crie lembretes recorrentes ou atividades com prazo para vê-los no calendário."
                  title="Sem lembretes"
                />
              )}
            </div>
          </Card>

          <Card className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-sm text-text-soft">Foco acumulado</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{formatHours(focusMinutes)}</p>
            </div>
            <div>
              <p className="text-sm text-text-soft">Eventos hoje</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{nextEvents.length}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
