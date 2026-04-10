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
import { eventOccursOn, formatEventRecurrence } from "@/lib/event-utils";
import { currency, formatDateTime } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";
import { useAuth } from "@/providers/auth-provider";
import type { CalendarView } from "@/types/domain";

const weekDays = ["seg.", "ter.", "qua.", "qui.", "sex.", "sáb.", "dom."];
const views: CalendarView[] = ["day", "week", "month", "year"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
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

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function buildMonthGrid(baseDate: Date) {
  const firstDay = startOfMonth(baseDate);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

function taskTone(status: "todo" | "in_progress" | "done") {
  if (status === "done") {
    return {
      bg: "bg-[#dcfce7] dark:bg-[#163625]",
      text: "text-[#166534] dark:text-[#bbf7d0]",
      border: "border-[#86efac] dark:border-[#23553a]"
    };
  }

  if (status === "in_progress") {
    return {
      bg: "bg-[#fef3c7] dark:bg-[#3b2f13]",
      text: "text-[#92400e] dark:text-[#fde68a]",
      border: "border-[#fcd34d] dark:border-[#6f5620]"
    };
  }

  return {
    bg: "bg-[#fee2e2] dark:bg-[#3a1818]",
    text: "text-[#b91c1c] dark:text-[#fecaca]",
    border: "border-[#fca5a5] dark:border-[#713232]"
  };
}

function taskToneClass(status: "todo" | "in_progress" | "done") {
  const tone = taskTone(status);
  return `${tone.bg} ${tone.text} ${tone.border}`;
}

function eventToneClass() {
  return "border-border bg-bg-elevated/70 text-text-soft";
}

export function CalendarPlanner() {
  const { events, tasks, transactions, addEvent, searchQuery, projects } = useAppState();
  const { user } = useAuth();
  const [view, setView] = useState<CalendarView>("month");
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("2026-04-10T10:00");
  const [endsAt, setEndsAt] = useState("2026-04-10T11:00");
  const [taskId, setTaskId] = useState("");
  const [cursorDate, setCursorDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarSearch, setCalendarSearch] = useState("");

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

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(cursorDate), index)),
    [cursorDate]
  );
  const currentMonthGrid = useMemo(() => buildMonthGrid(cursorDate), [cursorDate]);
  const yearMonths = useMemo(
    () => Array.from({ length: 12 }, (_, index) => new Date(cursorDate.getFullYear(), index, 1)),
    [cursorDate]
  );

  const selectedTasks = tasks.filter((task) => task.dueDate && sameDay(new Date(task.dueDate), selectedDate));
  const selectedTransactions = transactions.filter((transaction) =>
    sameDay(new Date(transaction.date), selectedDate)
  );
  const selectedEvents = visibleEvents.filter((event) => eventOccursOn(event, selectedDate));
  const selectedBalance = selectedTransactions.reduce(
    (total, item) => total + (item.type === "income" ? item.amount : -item.amount),
    0
  );

  function itemsForDay(day: Date) {
    return {
      events: visibleEvents.filter((event) => eventOccursOn(event, day)),
      tasks: tasks.filter((task) => task.dueDate && sameDay(new Date(task.dueDate), day)),
      transactions: transactions.filter((transaction) => sameDay(new Date(transaction.date), day))
    };
  }

  function moveCursor(direction: -1 | 1) {
    setCursorDate((current) => {
      const next = new Date(current);
      if (view === "day") next.setDate(current.getDate() + direction);
      if (view === "week") next.setDate(current.getDate() + direction * 7);
      if (view === "month") next.setMonth(current.getMonth() + direction);
      if (view === "year") next.setFullYear(current.getFullYear() + direction);
      return next;
    });
  }

  const headerLabel =
    view === "day"
      ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(cursorDate)
      : view === "week"
        ? `${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(weekDates[0])} - ${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(weekDates[6])}`
        : view === "month"
          ? monthLabel(cursorDate)
          : `${cursorDate.getFullYear()}`;

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Calendário adaptável por dia, semana, mês ou ano, com resumo lateral de tudo que importa."
        eyebrow="Módulo"
        title="Calendário"
        action={
          <div className="inline-flex rounded-full border border-border bg-bg-panel p-1">
            {views.map((item) => (
              <button
                className={`rounded-full px-4 py-2 text-sm transition ${
                  view === item ? "bg-bg-elevated text-text shadow-sm" : "text-text-soft hover:text-text"
                }`}
                key={item}
                onClick={() => setView(item)}
                type="button"
              >
                {item === "day" ? "Dia" : item === "week" ? "Semana" : item === "month" ? "Mês" : "Ano"}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.7fr_0.8fr]">
        <Card className="overflow-hidden rounded-[30px] p-0">
          <div className="border-b border-border px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-4xl font-semibold tracking-[-0.06em] capitalize">{headerLabel}</h3>
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
                  onClick={() => moveCursor(-1)}
                  type="button"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  className="rounded-full border border-border bg-bg-elevated px-4 py-2 text-sm"
                  onClick={() => {
                    const now = new Date();
                    setCursorDate(now);
                    setSelectedDate(now);
                  }}
                  type="button"
                >
                  Hoje
                </button>
                <button
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-bg-elevated"
                  onClick={() => moveCursor(1)}
                  type="button"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {view === "month" ? (
            <>
              <div className="grid grid-cols-7 border-b border-border px-2 py-3">
                {weekDays.map((day) => (
                  <div className="px-3 text-sm text-text-muted" key={day}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {currentMonthGrid.map((day) => {
                  const dayItems = itemsForDay(day);
                  const outOfMonth = !sameMonth(day, cursorDate);
                  const isSelected = sameDay(day, selectedDate);

                  return (
                    <button
                      className={`min-h-44 border-r border-b border-border p-3 text-left transition ${
                        outOfMonth ? "bg-black/2 opacity-45 dark:bg-white/2" : ""
                      } ${isSelected ? "bg-accent-soft/50" : "hover:bg-bg-elevated/80"}`}
                      data-calendar-date={day.toISOString()}
                      data-context="calendar-day"
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      type="button"
                    >
                      <span className={`text-sm ${sameDay(day, new Date()) ? "font-semibold text-accent" : "text-text-soft"}`}>
                        {day.getDate()}
                      </span>
                      <div className="mt-3 space-y-1.5">
                        {dayItems.events.slice(0, 3).map((event) => (
                          <div
                            className={`truncate rounded-full border px-2.5 py-1 text-[11px] ${eventToneClass()}`}
                            key={event.id}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayItems.tasks.slice(0, 2).map((task) => (
                          <div
                            className={`truncate rounded-full border px-2.5 py-1 text-[11px] ${taskToneClass(task.status)}`}
                            key={task.id}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayItems.transactions.slice(0, 2).map((transaction) => (
                          <div
                            className="truncate rounded-full bg-[#f2e4ff] px-2.5 py-1 text-[11px] text-[#69418f] dark:bg-[#372447] dark:text-[#f0dcff]"
                            key={transaction.id}
                          >
                            {transaction.category}
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          {view === "week" ? (
            <div className="grid grid-cols-7">
              {weekDates.map((day) => {
                const dayItems = itemsForDay(day);
                return (
                  <button
                    className={`min-h-[34rem] border-r border-border p-4 text-left transition hover:bg-bg-elevated/60 ${
                      sameDay(day, selectedDate) ? "bg-accent-soft/40" : ""
                    }`}
                    data-calendar-date={day.toISOString()}
                    data-context="calendar-day"
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    type="button"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">{weekDays[(day.getDay() + 6) % 7]}</p>
                    <p className="mt-2 text-xl font-semibold">{day.getDate()}</p>
                    <div className="mt-4 space-y-2">
                      {dayItems.events.map((event) => (
                        <div className={`rounded-[16px] border px-3 py-2 text-xs ${eventToneClass()}`} key={event.id}>
                          <div className="flex items-center justify-between gap-2">
                            <span>{event.title}</span>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                              {formatEventRecurrence(event)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {dayItems.tasks.map((task) => (
                        <div className={`rounded-[16px] border px-3 py-2 text-xs ${taskToneClass(task.status)}`} key={task.id}>
                          {task.title}
                        </div>
                      ))}
                      {dayItems.transactions.map((transaction) => (
                        <div className="rounded-[16px] bg-[#f2e4ff] px-3 py-2 text-xs text-[#69418f] dark:bg-[#372447] dark:text-[#f0dcff]" key={transaction.id}>
                          {transaction.category}
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          {view === "day" ? (
            <div className="grid gap-4 p-6">
              <div
                className="rounded-[24px] border border-border bg-bg-elevated p-5"
                data-calendar-date={cursorDate.toISOString()}
                data-context="calendar-day"
              >
                <p className="text-sm text-text-soft">Visão do dia</p>
                <h4 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                  {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(cursorDate)}
                </h4>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="space-y-3 bg-bg-elevated">
                  <p className="text-sm text-text-soft">Eventos</p>
                  {itemsForDay(cursorDate).events.length ? (
                    itemsForDay(cursorDate).events.map((event) => (
                      <div className="rounded-[16px] border border-border bg-bg-panel p-3" key={event.id}>
                        <p className="font-medium">{event.title}</p>
                        <p className="mt-1 text-sm text-text-soft">
                          {formatDateTime(event.startsAt)} • {formatEventRecurrence(event)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <EmptyState description="Sem eventos neste dia." title="Agenda vazia" />
                  )}
                </Card>
                <Card className="space-y-3 bg-bg-elevated">
                  <p className="text-sm text-text-soft">Tarefas</p>
                  {itemsForDay(cursorDate).tasks.length ? (
                    itemsForDay(cursorDate).tasks.map((task) => (
                      <div className={`rounded-[16px] border px-3 py-3 ${taskToneClass(task.status)}`} key={task.id}>
                        <p className="font-medium">{task.title}</p>
                        <p className="mt-1 text-sm text-text-soft">{task.description ?? "Sem descrição"}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState description="Sem tarefas neste dia." title="Sem tarefas" />
                  )}
                </Card>
                <Card className="space-y-3 bg-bg-elevated">
                  <p className="text-sm text-text-soft">Financeiro</p>
                  {itemsForDay(cursorDate).transactions.length ? (
                    itemsForDay(cursorDate).transactions.map((transaction) => (
                      <div className="rounded-[16px] bg-bg-panel p-3" key={transaction.id}>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="mt-1 text-sm text-text-soft">{currency(transaction.amount)}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState description="Sem movimentações neste dia." title="Financeiro vazio" />
                  )}
                </Card>
              </div>
            </div>
          ) : null}

          {view === "year" ? (
            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              {yearMonths.map((month) => {
                const grid = buildMonthGrid(month).slice(0, 35);
                return (
                  <button
                    className="rounded-[24px] border border-border bg-bg-elevated p-4 text-left transition hover:border-accent hover:bg-bg-panel"
                    key={month.toISOString()}
                    onClick={() => {
                      setCursorDate(month);
                      setView("month");
                    }}
                    type="button"
                  >
                    <p className="text-lg font-semibold capitalize">{monthLabel(month)}</p>
                    <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] text-text-muted">
                      {weekDays.map((day) => (
                        <span key={day}>{day.slice(0, 1)}</span>
                      ))}
                      {grid.map((day) => {
                        const count = itemsForDay(day).events.length + itemsForDay(day).tasks.length;
                        return (
                          <span
                            className={`rounded-full py-1 ${sameMonth(day, month) ? "text-text" : "opacity-30"} ${count ? "bg-accent-soft text-accent" : ""}`}
                            key={day.toISOString()}
                          >
                            {day.getDate()}
                          </span>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
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
            {selectedEvents.length || selectedTasks.length || selectedTransactions.length ? (
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
                          color={projects.find((project) => project.id === task.projectId)?.color ?? "#2563eb"}
                          name={projects.find((project) => project.id === task.projectId)?.name ?? "Projeto"}
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
                      {transaction.type === "income" ? "Entrada" : "Saída"} de {currency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState description="Selecione um dia com itens ou crie eventos para começar." title="Dia sem itens" />
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
