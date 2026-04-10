"use client";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { currency, formatHours } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";

export function WeeklyReview() {
  const { tasks, sessions, transactions, habits } = useAppState();

  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const focusMinutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);
  const balance = transactions.reduce(
    (total, item) => total + (item.type === "income" ? item.amount : -item.amount),
    0
  );
  const habitScore = habits.filter((habit) => habit.completedToday).length;

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Uma leitura simples para fechar a semana com contexto e decidir a próxima."
        eyebrow="Review"
        title="Revisão semanal"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-text-soft">Concluídas</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{completedTasks}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-soft">Foco acumulado</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{formatHours(focusMinutes)}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-soft">Saldo</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{currency(balance)}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-soft">Hábitos feitos</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{habitScore}</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <p className="text-sm text-text-soft">O que avançou</p>
          <div className="mt-4 space-y-2 text-sm text-text-soft">
            <p>As tarefas concluídas mostram o ritmo real da semana.</p>
            <p>O foco acumulado ajuda a diferenciar volume de trabalho de trabalho profundo.</p>
            <p>O saldo fecha a leitura para você ajustar a próxima semana com mais clareza.</p>
          </div>
        </Card>
        <Card>
          <p className="text-sm text-text-soft">Próxima iteração</p>
          <div className="mt-4 space-y-2 text-sm text-text-soft">
            <p>Escolha até 3 prioridades para a próxima semana.</p>
            <p>Agende os blocos principais no calendário.</p>
            <p>Remova compromissos ou tarefas que não ajudam a fechar o ciclo.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
