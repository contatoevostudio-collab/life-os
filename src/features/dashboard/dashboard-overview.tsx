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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card className="relative overflow-hidden border border-border bg-bg-elevated/80" key={metric.label}>
            <span className={`absolute inset-x-0 top-0 h-1 ${metric.accent}`} />
            <p className="text-sm text-text-soft">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{metric.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
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
                    <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-bg-elevated">
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

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-soft">Leitura da operação</p>
            <Sparkles className="size-4 text-accent" />
          </div>
          <div className="mt-4 space-y-3 text-sm text-text-soft">
            <p>O dashboard mostra o que está pendente, em andamento e concluído no mesmo lugar.</p>
            <p>Os blocos de semana agora respeitam o status real das atividades do período.</p>
            <p>Quanto mais você mover atividades entre estados, mais útil fica a leitura do painel.</p>
            <div className="rounded-[20px] border border-border bg-bg-elevated/70 p-4">
              <div className="flex items-center gap-2 text-text">
                <CircleCheckBig className="size-4 text-accent" />
                <p className="font-medium">Resumo rápido</p>
              </div>
              <p className="mt-2 text-sm text-text-soft">
                Use este painel como sua central de decisão diária, sem finanças e sem ruído desnecessário.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
