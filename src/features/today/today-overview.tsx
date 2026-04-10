"use client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { currency, formatDateTime, formatHours } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";

export function TodayOverview() {
  const { tasks, events, sessions, transactions, searchQuery } = useAppState();

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
  const nextEvents = [...filteredEvents].sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, 3);
  const focusMinutes = sessions
    .filter((session) => session.status === "completed")
    .reduce((total, session) => total + session.durationMinutes, 0);
  const monthlyBalance = transactions.reduce(
    (total, transaction) =>
      transaction.type === "income" ? total + transaction.amount : total - transaction.amount,
    0
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Resumo rápido do que exige atenção, do que vem a seguir e de como o dia está evoluindo."
        eyebrow="Home"
        title="Hoje"
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-soft">Prioridades do dia</p>
              <h3 className="text-xl font-semibold tracking-[-0.03em]">
                Execução focada, sem excesso de ruído
              </h3>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold tracking-[-0.05em]">{priorityTasks.length}</p>
              <p className="text-sm text-text-soft">itens ativos</p>
            </div>
          </div>

          <div className="space-y-3">
            {priorityTasks.length ? (
              priorityTasks.map((task) => (
                <div
                  className="rounded-[20px] border border-border bg-bg-elevated px-4 py-4"
                  key={task.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="mt-1 text-sm text-text-soft">{task.description ?? "Sem descrição"}</p>
                    </div>
                    <p className="text-sm text-text-muted">{formatHours(task.estimatedMinutes ?? 0)}</p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                description="Adicione tarefas, eventos e lançamentos para a tela Hoje virar seu painel central."
                title="Seu dia ainda está em branco"
              />
            )}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="space-y-4">
            <p className="text-sm text-text-soft">Ritmo do dia</p>
            <div className="grid gap-3">
              <div className="rounded-[20px] bg-bg-elevated p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Tarefas ativas</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                  {filteredTasks.filter((task) => task.status !== "done").length}
                </p>
              </div>
              <div className="rounded-[20px] bg-bg-elevated p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Eventos próximos</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{nextEvents.length}</p>
              </div>
            </div>
          </Card>
          <Card>
            <p className="text-sm text-text-soft">Próximos eventos</p>
            <div className="mt-4 space-y-3">
              {nextEvents.length ? (
                nextEvents.map((event) => (
                  <div className="rounded-[18px] border border-border bg-bg-elevated px-4 py-3" key={event.id}>
                    <p className="font-medium">{event.title}</p>
                    <p className="mt-1 text-sm text-text-soft">{formatDateTime(event.startsAt)}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  description="Os próximos eventos aparecem aqui assim que você criar os primeiros blocos."
                  title="Sem eventos agendados"
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
              <p className="text-sm text-text-soft">Saldo do mês</p>
              <p className="mt-1 text-3xl font-semibold tracking-[-0.05em]">{currency(monthlyBalance)}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
