"use client";

import Link from "next/link";
import { ArrowRight, CircleCheckBig, Clock3, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectPill } from "@/components/ui/project-pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatDate, formatDateTime, formatHours } from "@/lib/utils";
import { formatEventRecurrence, nextEventOccurrence } from "@/lib/event-utils";
import { useAppState } from "@/providers/app-state-provider";

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const offset = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - offset);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function priorityScore(priority: "low" | "medium" | "high") {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

function statusLabel(status: "todo" | "in_progress" | "done") {
  if (status === "todo") return "Pendente";
  if (status === "in_progress") return "Em andamento";
  return "Concluída";
}

export function DashboardOverview() {
  const { tasks, events, sessions, searchQuery, projects } = useAppState();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const visibleTasks = tasks.filter((task) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const visibleEvents = events.filter((event) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    );
  });

  const overdueTasks = visibleTasks.filter(
    (task) => task.status !== "done" && task.dueDate && new Date(task.dueDate) < today
  );
  const todayTasks = visibleTasks.filter((task) => task.dueDate && sameDay(new Date(task.dueDate), today));
  const inProgressTasks = visibleTasks.filter((task) => task.status === "in_progress");
  const pendingTasks = visibleTasks.filter((task) => task.status === "todo");
  const doneTasks = visibleTasks.filter((task) => task.status === "done");
  const nextEvents = [...visibleEvents]
    .map((event) => ({
      event,
      nextOccurrence: nextEventOccurrence(event, now)
    }))
    .filter((item): item is { event: (typeof visibleEvents)[number]; nextOccurrence: Date } => Boolean(item.nextOccurrence))
    .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime())
    .slice(0, 4);

  const focusMinutes = sessions
    .filter((session) => session.status === "completed")
    .reduce((total, session) => total + session.durationMinutes, 0);

  const highlightedTasks = [...visibleTasks]
    .filter((task) => task.status !== "done")
    .sort((a, b) => {
      const dueA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const dueB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

      if (a.status !== b.status) {
        return a.status === "in_progress" ? -1 : 1;
      }

      if (priorityScore(a.priority) !== priorityScore(b.priority)) {
        return priorityScore(b.priority) - priorityScore(a.priority);
      }

      return dueA - dueB;
    })
    .slice(0, 4);

  const nextAction =
    inProgressTasks[0] ??
    [...pendingTasks].sort((a, b) => priorityScore(b.priority) - priorityScore(a.priority))[0] ??
    null;

  const weekStart = startOfWeek(now);
  const weeklyFlow = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)).map((day) => {
    const dayTasks = visibleTasks.filter((task) => task.dueDate && sameDay(new Date(task.dueDate), day));
    return {
      label: new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(day).replace(".", ""),
      total: dayTasks.length,
      todo: dayTasks.filter((task) => task.status === "todo").length,
      inProgress: dayTasks.filter((task) => task.status === "in_progress").length,
      done: dayTasks.filter((task) => task.status === "done").length
    };
  });

  const hasSignal = visibleTasks.length > 0 || visibleEvents.length > 0;

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Um painel decisivo do dia: o que pede atenção, o que já está em movimento e qual é o próximo compromisso."
        eyebrow="Painel central"
        title="Dashboard"
        action={
          <div className="flex items-center gap-2">
            <Badge>{visibleTasks.length} atividades</Badge>
            <Badge>{nextEvents.length} próximos compromissos</Badge>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.95fr]">
        <Card className="editorial-surface overflow-hidden bg-bg-elevated/60">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Leitura do dia</p>
              <h3 className="text-[2.7rem] font-semibold tracking-[-0.08em] md:text-[3.1rem]">
                O que merece sua atenção agora.
              </h3>
              <p className="max-w-xl text-[0.96rem] leading-7 text-text-soft">
                O dashboard passa a responder primeiro o que está em andamento, o que vence hoje e qual
                é a próxima ação mais importante para manter o ritmo da operação.
              </p>
            </div>
            <div className="grid w-full gap-2.5 sm:grid-cols-3 xl:w-[22rem] xl:grid-cols-1">
              <QuickMetric label="Vencem hoje" value={String(todayTasks.length)} />
              <QuickMetric label="Em andamento" value={String(inProgressTasks.length)} />
              <QuickMetric label="Atrasadas" tone="alert" value={String(overdueTasks.length)} />
            </div>
          </div>
        </Card>

        <Card className="space-y-4 bg-bg-elevated/52">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-soft">Próxima ação</p>
            <Sparkles className="size-4 text-accent" />
          </div>
          {nextAction ? (
            <div className="space-y-4 rounded-[24px] border border-border/85 bg-bg-panel/64 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{statusLabel(nextAction.status)}</Badge>
                <Badge>{nextAction.priority}</Badge>
                {nextAction.projectId ? (
                  <ProjectPill
                    color={projects.find((project) => project.id === nextAction.projectId)?.color ?? "#2563eb"}
                    name={projects.find((project) => project.id === nextAction.projectId)?.name ?? "Projeto"}
                  />
                ) : null}
              </div>
              <div>
                <p className="text-xl font-semibold tracking-[-0.04em]">{nextAction.title}</p>
                <p className="mt-2 text-sm leading-7 text-text-soft">
                  {nextAction.description ?? "Sem descrição adicional. Use esta atividade como próximo foco operacional."}
                </p>
              </div>
              <div className="flex items-center justify-between rounded-[18px] border border-border/80 bg-bg-elevated/80 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Prazo</p>
                  <p className="mt-1 text-sm font-medium">{nextAction.dueDate ? formatDate(nextAction.dueDate) : "Livre"}</p>
                </div>
                <Link href="/tasks">
                  <Button variant="secondary">
                    Abrir atividades
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <EmptyState
              description="Assim que você criar atividades, o dashboard passa a sugerir a próxima ação mais relevante."
              title="Nenhuma ação sugerida"
            />
          )}
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pendentes" value={String(pendingTasks.length)} />
        <StatCard label="Em andamento" value={String(inProgressTasks.length)} />
        <StatCard label="Concluídas" value={String(doneTasks.length)} />
        <StatCard label="Foco acumulado" value={formatHours(focusMinutes)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr_0.95fr]">
        <Card className="space-y-4 bg-bg-elevated/54">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-soft">Fila de prioridade</p>
            <Badge>{highlightedTasks.length}</Badge>
          </div>
          {highlightedTasks.length ? (
            <div className="space-y-3">
              {highlightedTasks.map((task) => (
                <div className="rounded-[20px] border border-border/80 bg-bg-panel/64 p-4" key={task.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <CircleCheckBig className="size-4 text-accent" />
                    <p className="font-medium">{task.title}</p>
                    <Badge>{task.priority}</Badge>
                    <Badge className="bg-bg-elevated text-text-soft">{statusLabel(task.status)}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-text-soft">{task.description ?? "Sem descrição adicional."}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {task.projectId ? (
                      <ProjectPill
                        color={projects.find((project) => project.id === task.projectId)?.color ?? "#2563eb"}
                        name={projects.find((project) => project.id === task.projectId)?.name ?? "Projeto"}
                      />
                    ) : null}
                    <span className="text-xs text-text-muted">
                      {task.dueDate ? `Prazo ${formatDate(task.dueDate)}` : "Sem prazo fechado"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState description="Crie atividades para montar sua fila de prioridade." title="Sem prioridades ainda" />
          )}
        </Card>

        <Card className="space-y-4 bg-bg-elevated/52">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-soft">Compromissos e lembretes</p>
            <Link className="text-sm text-text-muted transition hover:text-text" href="/calendar">
              Ver calendário
            </Link>
          </div>
          {nextEvents.length ? (
            <div className="space-y-3">
              {nextEvents.map(({ event, nextOccurrence }) => (
                <div className="rounded-[20px] border border-border/80 bg-bg-panel/62 p-4" key={event.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{event.title}</p>
                    <Badge className="bg-bg-elevated text-text-soft">{formatEventRecurrence(event)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-text-soft">{formatDateTime(nextOccurrence.toISOString())}</p>
                  {event.description ? <p className="mt-1 text-sm text-text-muted">{event.description}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Ative lembretes na criação das atividades para começar a alimentar o fluxo do calendário."
              title="Sem próximos compromissos"
            />
          )}
        </Card>

        <Card className="space-y-4 bg-bg-elevated/48">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-soft">Ritmo da semana</p>
            <Clock3 className="size-4 text-text-muted" />
          </div>
          {hasSignal ? (
            <div className="space-y-3">
              {weeklyFlow.map((item) => {
                const total = item.total || 1;
                return (
                  <div key={item.label}>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
                      <span>{item.label}</span>
                      <span>{item.total} itens</span>
                    </div>
                    <div className="flex h-2.5 overflow-hidden rounded-full bg-bg-panel/72">
                      <div className="bg-[#fca5a5] dark:bg-[#713232]" style={{ width: `${(item.todo / total) * 100}%` }} />
                      <div className="bg-[#fcd34d] dark:bg-[#6f5620]" style={{ width: `${(item.inProgress / total) * 100}%` }} />
                      <div className="bg-[#86efac] dark:bg-[#25553a]" style={{ width: `${(item.done / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              description="Assim que o sistema receber atividades com prazo, esta leitura semanal começa a mostrar o ritmo real."
              title="Semana sem sinal"
            />
          )}
        </Card>
      </div>
    </div>
  );
}

function QuickMetric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "alert" }) {
  return (
    <div className={`rounded-[20px] border p-4 ${tone === "alert" ? "border-[#fca5a5]/60 bg-[#fff1f1] dark:border-[#713232] dark:bg-[#2c1515]" : "border-border/80 bg-bg-panel/72"}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="relative overflow-hidden bg-bg-panel/54">
      <p className="text-sm text-text-soft">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
    </Card>
  );
}
