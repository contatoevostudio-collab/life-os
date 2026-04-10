"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ProjectPill } from "@/components/ui/project-pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { currency, formatDateTime } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";
import { useAuth } from "@/providers/auth-provider";
import type { CalendarView } from "@/types/domain";

const weekDays = ["seg.", "ter.", "qua.", "qui.", "sex.", "sáb.", "dom."];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthGrid(baseDate: Date) {
  const firstDay = startOfMonth(baseDate);
  const lastDay = endOfMonth(baseDate);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);
    return current;
  });
}

export function CalendarPlanner() {
<<<<<<< HEAD
  const { events, tasks, transactions, addEvent, searchQuery, projects } = useAppState();
=======
  const { events, tasks, addEvent, updateTask, searchQuery } = useAppState();
>>>>>>> parent of 8baacc3 (20 alteracoes)
  const { user } = useAuth();
  const [view, setView] = useState<CalendarView>("month");
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("2026-04-10T10:00");
  const [endsAt, setEndsAt] = useState("2026-04-10T11:00");
  const [taskId, setTaskId] = useState("");
<<<<<<< HEAD
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarSearch, setCalendarSearch] = useState("");
=======
  const [draggingTaskId, setDraggingTaskId] = useState("");
>>>>>>> parent of 8baacc3 (20 alteracoes)

  const monthGrid = useMemo(() => buildMonthGrid(monthCursor), [monthCursor]);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(monthCursor);

  const normalizedSearch = (calendarSearch || searchQuery).trim().toLowerCase();

  const visibleEvents = useMemo(
    () =>
      events.filter((event) => {
        if (!normalizedSearch) return true;
        return (
          event.title.toLowerCase().includes(normalizedSearch) ||
          event.description?.toLowerCase().includes(normalizedSearch)
        );
      }),
    [events, normalizedSearch]
  );

  const selectedTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;
    return sameDay(new Date(task.dueDate), selectedDate);
  });

  const selectedTransactions = transactions.filter((transaction) =>
    sameDay(new Date(transaction.date), selectedDate)
  );

  const selectedEvents = visibleEvents.filter((event) =>
    sameDay(new Date(event.startsAt), selectedDate)
  );

  const selectedBalance = selectedTransactions.reduce(
    (total, item) => total + (item.type === "income" ? item.amount : -item.amount),
    0
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Visão mensal limpa com contexto diário de tarefas, agenda e financeiro."
        eyebrow="Módulo"
        title="Calendário"
        action={
          <div className="flex gap-2">
            {(["day", "week", "month"] as CalendarView[]).map((item) => (
              <Button key={item} onClick={() => setView(item)} variant={view === item ? "primary" : "secondary"}>
                {item === "day" ? "Dia" : item === "week" ? "Semana" : "Mês"}
              </Button>
            ))}
          </div>
        }
      />

<<<<<<< HEAD
      <div className="grid gap-4 xl:grid-cols-[1.7fr_0.8fr]">
        <Card className="overflow-hidden rounded-[30px] p-0">
          <div className="border-b border-border px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-4xl font-semibold tracking-[-0.06em] capitalize">{monthLabel}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-56">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    className="pl-9"
                    onChange={(event) => setCalendarSearch(event.target.value)}
                    placeholder="Buscar no calendário"
                    value={calendarSearch}
                  />
                </div>
                <button
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-bg-elevated"
                  onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
                  type="button"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  className="rounded-full border border-border bg-bg-elevated px-4 py-2 text-sm"
                  onClick={() => {
                    const now = new Date();
                    setMonthCursor(now);
                    setSelectedDate(now);
                  }}
                  type="button"
                >
                  Hoje
                </button>
                <button
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-bg-elevated"
                  onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
                  type="button"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
=======
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="space-y-4">
          <p className="text-sm text-text-soft">Agenda {view}</p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((slot) => (
              <div
                className="rounded-[20px] border border-dashed border-border-strong bg-[linear-gradient(180deg,rgba(255,255,255,0.22),transparent)] px-4 py-5 transition hover:border-accent hover:bg-accent-soft/30"
                key={slot}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  const task = tasks.find((item) => item.id === draggingTaskId);
                  if (!task) return;
>>>>>>> parent of 8baacc3 (20 alteracoes)

          <div className="grid grid-cols-7 border-b border-border px-2 py-3">
            {weekDays.map((day) => (
              <div className="px-3 text-sm text-text-muted" key={day}>
                {day}
              </div>
            ))}
          </div>
<<<<<<< HEAD

          <div className="grid grid-cols-7">
            {monthGrid.map((day) => {
              const dayEvents = visibleEvents.filter((event) => sameDay(new Date(event.startsAt), day));
              const dayTasks = tasks.filter((task) => task.dueDate && sameDay(new Date(task.dueDate), day));
              const dayTransactions = transactions.filter((transaction) =>
                sameDay(new Date(transaction.date), day)
              );
              const outOfMonth = day.getMonth() !== monthCursor.getMonth();
              const isSelected = sameDay(day, selectedDate);

              return (
                <button
                  className={`min-h-44 border-r border-b border-border p-3 text-left align-top transition ${
                    outOfMonth ? "bg-black/2 opacity-45 dark:bg-white/2" : ""
                  } ${isSelected ? "bg-accent-soft/50" : "hover:bg-bg-elevated/80"}`}
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  type="button"
                >
                  <div className="flex items-start justify-between">
                    <span className={`text-sm ${sameDay(day, new Date()) ? "font-semibold text-accent" : "text-text-soft"}`}>
                      {day.getDate()}
                    </span>
=======
          <div className="space-y-3">
            {filteredEvents.length ? (
              [...filteredEvents]
                .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
                .map((event) => (
                  <div className="rounded-[20px] border border-border bg-bg-elevated px-4 py-4" key={event.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="mt-1 text-sm text-text-soft">{formatDateTime(event.startsAt)}</p>
                      </div>
                      <span className="text-sm text-text-muted">{event.taskId ? "Com tarefa" : "Evento"}</span>
                    </div>
>>>>>>> parent of 8baacc3 (20 alteracoes)
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        className="truncate rounded-full bg-[#dfe8ff] px-2.5 py-1 text-[11px] text-[#25406b] dark:bg-[#243145] dark:text-[#d8e4ff]"
                        key={event.id}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        className="truncate rounded-full bg-[#dff5e7] px-2.5 py-1 text-[11px] text-[#23533a] dark:bg-[#1e3a2f] dark:text-[#d3f6df]"
                        key={task.id}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTransactions.slice(0, 2).map((transaction) => (
                      <div
                        className="truncate rounded-full bg-[#f2e4ff] px-2.5 py-1 text-[11px] text-[#69418f] dark:bg-[#372447] dark:text-[#f0dcff]"
                        key={transaction.id}
                      >
                        {transaction.category}
                      </div>
                    ))}
                    {dayEvents.length + dayTasks.length + dayTransactions.length > 5 ? (
                      <p className="pt-1 text-[11px] text-text-muted">
                        +{dayEvents.length + dayTasks.length + dayTransactions.length - 5} mais
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4">
            <div>
              <p className="text-sm text-text-soft">Resumo do dia</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "long"
                }).format(selectedDate)}
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[20px] bg-bg-elevated p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Tarefas</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedTasks.length}</p>
              </div>
              <div className="rounded-[20px] bg-bg-elevated p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Eventos</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedEvents.length}</p>
              </div>
              <div className="rounded-[20px] bg-bg-elevated p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Financeiro</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{currency(selectedBalance)}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <p className="text-sm text-text-soft">Agenda e tarefas</p>
            {selectedEvents.length || selectedTasks.length ? (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <div className="rounded-[18px] bg-bg-elevated p-4" key={event.id}>
                    <p className="font-medium">{event.title}</p>
                    <p className="mt-1 text-sm text-text-soft">{formatDateTime(event.startsAt)}</p>
                  </div>
                ))}
                {selectedTasks.map((task) => (
                  <div className="rounded-[18px] bg-bg-elevated p-4" key={task.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{task.title}</span>
                      {task.projectId ? (
                        <ProjectPill
                          color={
                            projects.find((project) => project.id === task.projectId)?.color ?? "#2563eb"
                          }
                          name={
                            projects.find((project) => project.id === task.projectId)?.name ?? "Projeto"
                          }
                        />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-text-soft">{task.description ?? "Prazo do dia"}</p>
                  </div>
                ))}
                {selectedTransactions.map((transaction) => (
                  <div className="rounded-[18px] bg-bg-elevated p-4" key={transaction.id}>
                    <p className="font-medium">{transaction.category}</p>
                    <p className="mt-1 text-sm text-text-soft">
                      {transaction.type === "income" ? "Entrada" : "Saída"} de{" "}
                      {currency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="Selecione um dia com itens ou crie eventos para começar a preencher o calendário."
                title="Dia sem itens"
              />
            )}
          </Card>

          <Card className="space-y-4">
            <p className="text-sm text-text-soft">Novo evento</p>
            <Input onChange={(event) => setTitle(event.target.value)} placeholder="Título" value={title} />
            <Input onChange={(event) => setStartsAt(event.target.value)} type="datetime-local" value={startsAt} />
            <Input onChange={(event) => setEndsAt(event.target.value)} type="datetime-local" value={endsAt} />
            <Select onChange={(event) => setTaskId(event.target.value)} value={taskId}>
              <option value="">Sem tarefa vinculada</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </Select>
            <Button
              onClick={() => {
                if (!title.trim()) return;
                addEvent({
                  userId: user?.id ?? "demo-user",
                  title,
                  description: null,
                  startsAt: new Date(startsAt).toISOString(),
                  endsAt: new Date(endsAt).toISOString(),
                  taskId: taskId || null,
                  location: null,
                  isAllDay: false
                });
                setTitle("");
              }}
            >
              Salvar evento
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
