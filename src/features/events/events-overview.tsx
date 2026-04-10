"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { currency, formatDateTime } from "@/lib/utils";
import { formatEventRecurrence, formatNextEventOccurrence, nextEventOccurrence } from "@/lib/event-utils";
import { useAppState } from "@/providers/app-state-provider";
import { useAuth } from "@/providers/auth-provider";
import type { CalendarEvent, EventRecurrenceType } from "@/types/domain";

export function EventsOverview() {
  const { events, addEvent, updateEvent, deleteEvent, searchQuery } = useAppState();
  const { user } = useAuth();
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [recurrence, setRecurrence] = useState<EventRecurrenceType>("once");
  const [dateValue, setDateValue] = useState("2026-04-22");
  const [monthValue, setMonthValue] = useState("10");
  const [dayOfMonth, setDayOfMonth] = useState("15");

  const activeEvent = editingEventId ? events.find((event) => event.id === editingEventId) ?? null : null;

  useEffect(() => {
    if (!activeEvent) {
      return;
    }

    setTitle(activeEvent.title);
    setDescription(activeEvent.description ?? "");
    setAmount(activeEvent.amount ? String(activeEvent.amount) : "");
    setRecurrence(activeEvent.recurrence?.type ?? "once");
    setDateValue(activeEvent.startsAt.slice(0, 10));
    setMonthValue(String((activeEvent.recurrence?.month ?? new Date(activeEvent.startsAt).getMonth() + 1)));
    setDayOfMonth(String(activeEvent.recurrence?.dayOfMonth ?? new Date(activeEvent.startsAt).getDate()));
  }, [activeEvent]);

  const visibleEvents = events.filter((event) => {
    if (!searchQuery.trim()) return true;
    return (
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const sortedEvents = [...visibleEvents].sort((a, b) => {
    const nextA = nextEventOccurrence(a) ?? new Date(a.startsAt);
    const nextB = nextEventOccurrence(b) ?? new Date(b.startsAt);
    return nextA.getTime() - nextB.getTime();
  });

  const recurringCount = events.filter((event) => event.recurrence?.type === "monthly" || event.recurrence?.type === "yearly").length;

  function resetForm() {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setAmount("");
    setRecurrence("once");
    setDateValue("2026-04-22");
    setMonthValue("10");
    setDayOfMonth("15");
  }

  function buildPayload() {
    const startsAt =
      recurrence === "once"
        ? new Date(dateValue).toISOString()
        : recurrence === "monthly"
          ? new Date(new Date().getFullYear(), new Date().getMonth(), Number(dayOfMonth) || 1, 9, 0).toISOString()
          : new Date(new Date().getFullYear(), Number(monthValue) - 1, Number(dayOfMonth) || 1, 9, 0).toISOString();

    const recurrencePayload =
      recurrence === "once"
        ? null
        : recurrence === "monthly"
          ? { type: "monthly" as const, dayOfMonth: Number(dayOfMonth) || null }
          : {
              type: "yearly" as const,
              month: Number(monthValue) || null,
              dayOfMonth: Number(dayOfMonth) || null
            };

    return {
      title: title.trim(),
      description: description.trim() || null,
      amount: amount ? Number(amount) : null,
      startsAt,
      endsAt: startsAt,
      recurrence: recurrencePayload,
      taskId: null,
      location: null,
      isAllDay: true,
      userId: user?.id ?? "demo-user"
    } satisfies Omit<CalendarEvent, "id">;
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Itens pessoais que se repetem, como contas, aniversários e lembretes mensais."
        eyebrow="Módulo"
        title="Eventos"
        action={
          <div className="flex items-center gap-2">
            <Badge>{events.length} itens</Badge>
            <Badge>{recurringCount} recorrentes</Badge>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <Card className="space-y-4">
          <div>
            <p className="text-sm text-text-soft">{editingEventId ? "Editar evento" : "Novo evento pessoal"}</p>
            <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
              {editingEventId ? "Ajuste o lembrete" : "Crie um lembrete recorrente"}
            </h3>
          </div>
          <Input onChange={(event) => setTitle(event.target.value)} placeholder="Ex. Internet" value={title} />
          <Textarea
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex. Valor R$ 65"
            value={description}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Valor opcional"
              type="number"
              value={amount}
            />
            <Select onChange={(event) => setRecurrence(event.target.value as EventRecurrenceType)} value={recurrence}>
              <option value="once">Uma vez</option>
              <option value="monthly">Todo mês</option>
              <option value="yearly">Todo ano</option>
            </Select>
          </div>

          {recurrence === "once" ? (
            <Input onChange={(event) => setDateValue(event.target.value)} type="date" value={dateValue} />
          ) : null}

          {recurrence === "monthly" ? (
            <Input
              onChange={(event) => setDayOfMonth(event.target.value)}
              placeholder="Dia do mês"
              type="number"
              value={dayOfMonth}
            />
          ) : null}

          {recurrence === "yearly" ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                onChange={(event) => setMonthValue(event.target.value)}
                placeholder="Mês"
                type="number"
                value={monthValue}
              />
              <Input
                onChange={(event) => setDayOfMonth(event.target.value)}
                placeholder="Dia"
                type="number"
                value={dayOfMonth}
              />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                if (!title.trim()) return;
                const payload = buildPayload();
                if (editingEventId) {
                  updateEvent(editingEventId, payload);
                } else {
                  addEvent(payload);
                }
                resetForm();
              }}
            >
              {editingEventId ? "Salvar" : "Criar evento"}
            </Button>
            <Button onClick={resetForm} variant="secondary">
              Limpar
            </Button>
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-sm text-text-soft">Como isso funciona</p>
          <div className="space-y-3 text-sm text-text-soft">
            <p>Use para lembretes pessoais e recorrências que você quer ver todo mês ou todo ano.</p>
            <p>Exemplos: Internet, aluguel, aniversário, feira do mês ou revisão de contas.</p>
            <p>Esses itens aparecem no calendário com menos destaque do que as tarefas.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] border border-border bg-bg-elevated/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Uma vez</p>
              <p className="mt-2 text-2xl font-semibold">{events.filter((event) => !event.recurrence?.type || event.recurrence.type === "once").length}</p>
            </div>
            <div className="rounded-[18px] border border-border bg-bg-elevated/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Mensais</p>
              <p className="mt-2 text-2xl font-semibold">{events.filter((event) => event.recurrence?.type === "monthly").length}</p>
            </div>
            <div className="rounded-[18px] border border-border bg-bg-elevated/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Anuais</p>
              <p className="mt-2 text-2xl font-semibold">{events.filter((event) => event.recurrence?.type === "yearly").length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-3">
        {sortedEvents.length ? (
          sortedEvents.map((event) => {
            const amountLabel = event.amount ? currency(event.amount) : null;

            return (
              <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={event.id}>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-medium">{event.title}</p>
                    <Badge className="bg-bg-elevated text-text-soft">{formatEventRecurrence(event)}</Badge>
                    {amountLabel ? <Badge>{amountLabel}</Badge> : null}
                  </div>
                  <p className="text-sm text-text-soft">{event.description ?? "Sem descrição"}</p>
                  <p className="text-sm text-text-muted">
                    Próxima ocorrência {formatNextEventOccurrence(event)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      setEditingEventId(event.id);
                    }}
                    variant="secondary"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => deleteEvent(event.id)}
                    variant="ghost"
                  >
                    Excluir
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <EmptyState
            description="Adicione seu primeiro lembrete recorrente para essa seção começar a ter utilidade."
            title="Nenhum evento criado"
          />
        )}
      </div>
    </div>
  );
}
