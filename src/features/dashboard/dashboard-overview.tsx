"use client";

import { ArrowUpRight, CircleCheckBig, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { useAppState } from "@/providers/app-state-provider";

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

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function DashboardOverview() {
  const { tasks, sessions, searchQuery } = useAppState();
  const visibleTasks = tasks.filter(
    (task) =>
      !searchQuery.trim() ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completed = visibleTasks.filter((task) => task.status === "done").length;
  const pending = visibleTasks.filter((task) => task.status === "todo").length;
  const inProgress = visibleTasks.filter((task) => task.status === "in_progress").length;
  const focusMinutes = sessions
    .filter((session) => session.status === "completed")
    .reduce((total, session) => total + session.durationMinutes, 0);

  const hasData = visibleTasks.length > 0 || sessions.length > 0;
  const weekStart = startOfWeek(new Date());
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const metrics = [
    { label: "Pendentes", value: String(pending), accent: "bg-[#fee2e2] dark:bg-[#3a1818]" },
    { label: "Em andamento", value: String(inProgress), accent: "bg-[#fef3c7] dark:bg-[#3b2f13]" },
    { label: "Concluídas", value: String(completed), accent: "bg-[#dcfce7] dark:bg-[#163625]" },
    { label: "Foco", value: `${focusMinutes}m`, accent: "bg-bg-elevated" }
  ];

  const weekStats = weekDates.map((day) => {
    const dayTasks = visibleTasks.filter((task) => task.dueDate && sameDay(new Date(task.dueDate), day));

    return {
      day,
      todo: dayTasks.filter((task) => task.status === "todo").length,
      inProgress: dayTasks.filter((task) => task.status === "in_progress").length,
      done: dayTasks.filter((task) => task.status === "done").length
    };
  });

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Resumo claro do andamento real das atividades, com leitura semanal e métricas objetivas."
        eyebrow="Módulo"
        title="Dashboard"
      />

      <div className="grid gap-4 xl:grid-cols-[1.55fr_0.8fr]">
        <Card className="overflow-hidden bg-bg-elevated/64">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">Painel central</p>
              <h3 className="text-[2.7rem] font-semibold tracking-[-0.08em] md:text-[3.15rem]">
                Clareza para decidir o ritmo da semana.
              </h3>
              <p className="max-w-xl text-[0.96rem] leading-7 text-text-soft">
                O dashboard agora funciona mais como uma mesa de comando: leitura imediata do que pede ação,
                do que já avançou e de como o fluxo está distribuído ao longo dos dias.
              </p>
            </div>
            <div className="grid w-full gap-2.5 sm:grid-cols-3 xl:w-[20rem] xl:grid-cols-1">
              <div className="rounded-[20px] border border-border/80 bg-bg-panel/72 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Pendentes</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{pending}</p>
              </div>
              <div className="rounded-[20px] border border-border/80 bg-bg-panel/72 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Em andamento</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{inProgress}</p>
              </div>
              <div className="rounded-[20px] border border-border/80 bg-bg-panel/72 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Concluídas</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{completed}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 bg-bg-elevated/56">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-soft">Leitura da operação</p>
            <Sparkles className="size-4 text-accent" />
          </div>
          <div className="space-y-3 text-sm leading-7 text-text-soft">
            <p>O painel prioriza sinal real, não volume visual.</p>
            <p>O bloco semanal já responde ao status verdadeiro das atividades.</p>
            <p>As métricas menores abaixo funcionam como leitura rápida, sem competir com a área principal.</p>
          </div>
          <div className="rounded-[20px] border border-border/80 bg-bg-panel/68 p-4">
            <div className="flex items-center gap-2 text-text">
              <CircleCheckBig className="size-4 text-accent" />
              <p className="font-medium">Foco acumulado</p>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.06em]">{focusMinutes}m</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card className="relative overflow-hidden bg-bg-panel/58" key={metric.label}>
            <span className={`absolute left-5 top-5 h-2.5 w-2.5 rounded-full ${metric.accent}`} />
            <p className="pl-5 text-sm text-text-soft">{metric.label}</p>
            <p className="mt-2 pl-5 text-3xl font-semibold tracking-[-0.05em]">{metric.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="bg-bg-elevated/58">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-soft">Fluxo da semana</p>
            <ArrowUpRight className="size-4 text-text-muted" />
          </div>
          {hasData ? (
            <div className="mt-4 grid gap-3">
              {weekStats.map((item) => {
                const total = item.todo + item.inProgress + item.done || 1;
                const todoWidth = (item.todo / total) * 100;
                const inProgressWidth = (item.inProgress / total) * 100;
                const doneWidth = (item.done / total) * 100;

                return (
                  <div className="flex items-center gap-3" key={item.day.toISOString()}>
                    <span className="w-10 text-sm text-text-muted">
                      {new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(item.day).replace(".", "")}
                    </span>
                    <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-bg-panel/72">
                      <div className="bg-[#fecaca] dark:bg-[#5a2626]" style={{ width: `${todoWidth}%` }} />
                      <div className="bg-[#fcd34d] dark:bg-[#6a5420]" style={{ width: `${inProgressWidth}%` }} />
                      <div className="bg-[#86efac] dark:bg-[#25553a]" style={{ width: `${doneWidth}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                description="O dashboard começa a ganhar sinal assim que você cria atividades e move seus status."
                title="Sem métricas ainda"
              />
            </div>
          )}
        </Card>

        <Card className="bg-bg-elevated/52">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-soft">Legenda visual</p>
            <Sparkles className="size-4 text-accent" />
          </div>
          <div className="mt-4 grid gap-2.5">
            <div className="flex items-center justify-between rounded-[18px] border border-border/80 bg-bg-panel/64 px-4 py-3">
              <span className="text-sm text-text-soft">A fazer</span>
              <span className="h-3.5 w-20 rounded-full bg-[#fecaca] dark:bg-[#5a2626]" />
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-border/80 bg-bg-panel/64 px-4 py-3">
              <span className="text-sm text-text-soft">Em andamento</span>
              <span className="h-3.5 w-20 rounded-full bg-[#fcd34d] dark:bg-[#6a5420]" />
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-border/80 bg-bg-panel/64 px-4 py-3">
              <span className="text-sm text-text-soft">Concluída</span>
              <span className="h-3.5 w-20 rounded-full bg-[#86efac] dark:bg-[#25553a]" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
