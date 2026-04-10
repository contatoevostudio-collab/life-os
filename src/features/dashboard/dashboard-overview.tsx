"use client";

import { ArrowUpRight, CircleCheckBig, Clock3, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatHours } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";

export function DashboardOverview() {
  const { tasks, events, sessions, searchQuery } = useAppState();
  const visibleTasks = tasks.filter(
    (task) =>
      !searchQuery.trim() ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const completed = visibleTasks.filter((task) => task.status === "done").length;
  const pending = visibleTasks.filter((task) => task.status !== "done").length;
  const inProgress = visibleTasks.filter((task) => task.status === "in_progress").length;
  const eventsCount = events.filter(
    (event) =>
      !searchQuery.trim() ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ).length;
  const focusMinutes = sessions
    .filter((session) => session.status === "completed")
    .reduce((total, session) => total + session.durationMinutes, 0);
  const hasData = visibleTasks.length > 0 || sessions.length > 0 || eventsCount > 0;

  const metrics = [
    { label: "Concluídas", value: String(completed) },
    { label: "Em andamento", value: String(inProgress) },
    { label: "Pendentes", value: String(pending) },
    { label: "Eventos", value: String(eventsCount) }
  ];

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Visão semanal e mensal orientada a decisão, com poucos números e leitura rápida."
        eyebrow="Módulo"
        title="Dashboard"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card className="relative overflow-hidden border border-border bg-bg-elevated/80" key={metric.label}>
            <span className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(37,99,235,1),rgba(96,165,250,0.2))]" />
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
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => (
                <div className="flex items-center gap-3" key={day}>
                  <span className="w-10 text-sm text-text-muted">{day}</span>
                  <div className="h-3 flex-1 rounded-full bg-bg-elevated">
                    <div
                      className="h-3 rounded-full bg-[linear-gradient(90deg,rgba(37,99,235,1),rgba(96,165,250,0.7))]"
                      style={{ width: `${12 + index * 8}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                description="O dashboard começa a ganhar sinal assim que você cria tarefas, eventos, foco ou lançamentos."
                title="Sem métricas ainda"
              />
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-soft">Leitura do período</p>
            <Sparkles className="size-4 text-accent" />
          </div>
          <div className="mt-4 space-y-3 text-sm text-text-soft">
            <p>O dashboard mostra status, eventos e foco no mesmo lugar para decisão rápida.</p>
            <p>Os gráficos são discretos e servem como leitura do ritmo, não como enfeite.</p>
            <p>Quanto mais tarefas você mover de estado, mais o painel fica útil no dia a dia.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
