"use client";

import { CalendarDays, CircleCheckBig, Clock3, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        action={
          <div className="flex items-center gap-2">
            <Badge>{priorityTasks.length} prioridades</Badge>
            <Badge>{nextEvents.length} eventos</Badge>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card className="space-y-5 bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(255,255,255,0.14))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm text-text-soft">Prioridades do dia</p>
              <h3 className="text-2xl font-semibold tracking-[-0.05em]">
                Execução focada, sem excesso de ruído
              </h3>
              <p className="max-w-xl text-sm text-text-soft">
                O painel central resume o que precisa de atenção agora, sem esconder o resto do seu fluxo.
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-bg-elevated px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Ativos</p>
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
                      <div className="flex items-center gap-2">
                        <CircleCheckBig className="size-4 text-accent" />
                        <p className="font-medium">{task.title}</p>
                      </div>
                      <p className="text-sm text-text-soft">{task.description ?? "Sem descrição"}</p>
                    </div>
                    <Badge className="bg-bg-panel">{formatHours(task.estimatedMinutes ?? 0)}</Badge>
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
              <div className="rounded-[20px] border border-border bg-bg-elevated/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Tarefas ativas</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                      {filteredTasks.filter((task) => task.status !== "done").length}
                    </p>
                  </div>
                  <Clock3 className="size-5 text-accent" />
                </div>
              </div>
              <div className="rounded-[20px] border border-border bg-bg-elevated/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Eventos próximos</p>
                    <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{nextEvents.length}</p>
                  </div>
                  <CalendarDays className="size-5 text-accent" />
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-soft">Próximos eventos</p>
              <Button variant="ghost">Abrir calendário</Button>
            </div>
            <div className="mt-4 space-y-3">
              {nextEvents.length ? (
                nextEvents.map((event) => (
                  <div className="rounded-[20px] border border-border bg-bg-elevated/70 px-4 py-3" key={event.id}>
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
