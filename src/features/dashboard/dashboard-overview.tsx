"use client";

import { ArrowUpRight, CircleCheckBig, Clock3, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { currency, formatHours } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";

export function DashboardOverview() {
  const { tasks, sessions, transactions, searchQuery } = useAppState();
  const visibleTasks = tasks.filter(
    (task) =>
      !searchQuery.trim() ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const visibleTransactions = transactions.filter(
    (transaction) =>
      !searchQuery.trim() ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completed = visibleTasks.filter((task) => task.status === "done").length;
  const pending = visibleTasks.filter((task) => task.status !== "done").length;
  const focusMinutes = sessions
    .filter((session) => session.status === "completed")
    .reduce((total, session) => total + session.durationMinutes, 0);
  const balance = visibleTransactions.reduce(
    (total, item) => total + (item.type === "income" ? item.amount : -item.amount),
    0
  );
  const hasData = visibleTasks.length > 0 || sessions.length > 0 || visibleTransactions.length > 0;

  const metrics = [
    { label: "Concluídas", value: String(completed) },
    { label: "Pendentes", value: String(pending) },
    { label: "Tempo de foco", value: formatHours(focusMinutes) },
    { label: "Saldo do período", value: currency(balance) }
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
            <p className="text-sm text-text-soft">Semana</p>
            <ArrowUpRight className="size-4 text-text-muted" />
          </div>
          {hasData ? (
            <div className="mt-4 grid gap-3">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, index) => (
                <div className="flex items-center gap-3" key={day}>
                  <span className="w-10 text-sm text-text-muted">{day}</span>
                  <div className="h-3 flex-1 rounded-full bg-bg-elevated">
                    <div
                      className="h-3 rounded-full bg-accent"
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
          <p className="text-sm text-text-soft">Leitura do período</p>
          <div className="mt-4 space-y-3 text-sm text-text-soft">
            <p>O sistema já consolida tarefas, foco e finanças no mesmo fluxo operacional.</p>
            <p>Os cards mostram apenas o que ajuda a decidir rápido, sem inflar o dashboard com gráficos supérfluos.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
