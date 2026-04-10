"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ProjectPill } from "@/components/ui/project-pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { eventOccursOn, formatEventRecurrence } from "@/lib/event-utils";
import { formatDateTime } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";
import type { CalendarEvent, CalendarView, Task } from "@/types/domain";

const weekDays = ["seg.", "ter.", "qua.", "qui.", "sex.", "sáb.", "dom."];
const views: CalendarView[] = ["day", "week", "month", "year"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
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

function reminderToneClass() {
  return "border-border/80 bg-bg-panel/74 text-text-soft";
}

function bucketLabel(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Manhã";
  if (hour < 18) return "Tarde";
  return "Noite";
}

type DayTimelineItem =
  | {
      id: string;
      kind: "task";
      title: string;
      description?: string | null;
      bucket: "Manhã" | "Tarde" | "Noite";
      meta: string;
      status: Task["status"];
      projectId?: string | null;
    }
  | {
      id: string;
      kind: "reminder";
      title: string;
      description?: string | null;
      bucket: "Manhã" | "Tarde" | "Noite";
      meta: string;
      recurrence: string;
    };

export function CalendarPlanner() {
  const { events, tasks, searchQuery, projects, openTaskComposer } = useAppState();
  const [view, setView] = useState<CalendarView>("month");
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
  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (!normalizedSearch) return true;
        return (
          task.title.toLowerCase().includes(normalizedSearch) ||
          task.description?.toLowerCase().includes(normalizedSearch) ||
          task.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
        );
      }),
    [normalizedSearch, tasks]
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

  function itemsForDay(day: Date) {
    return {
      reminders: visibleEvents.filter((event) => eventOccursOn(event, day)),
      tasks: visibleTasks.filter((task) => task.dueDate && sameDay(new Date(task.dueDate), day))
    };
  }

  const selectedDayItems = itemsForDay(selectedDate);
  const selectedTimeline = buildTimeline(selectedDate, selectedDayItems.tasks, selectedDayItems.reminders);

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
        description="Cada visualização assume um papel diferente: agenda do dia, operação semanal, leitura mensal e mapa anual."
        eyebrow="Módulo"
        title="Calendário"
        action={
          <div className="inline-flex rounded-full border border-border bg-bg-panel/85 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
            {views.map((item) => (
              <button
                className={`rounded-full px-4 py-2 text-sm transition ${
                  view === item
                    ? "bg-bg-elevated text-text shadow-sm"
                    : "text-text-soft hover:bg-bg-elevated/50 hover:text-text"
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
        <Card className="overflow-hidden rounded-[32px] bg-bg-elevated/58 p-0">
          <div className="border-b border-border px-6 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm text-text-soft">
                  {view === "day"
                    ? "Agenda detalhada"
                    : view === "week"
                      ? "Operação semanal"
                      : view === "month"
                        ? "Leitura mensal"
                        : "Mapa anual"}
                </p>
                <h3 className="text-4xl font-semibold tracking-[-0.06em] capitalize">{headerLabel}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-56">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <Input
                    className="pl-9"
                    onChange={(event) => setCalendarSearch(event.target.value)}
                    placeholder="Buscar atividades e lembretes"
                    value={calendarSearch}
                  />
                </div>
                <button
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border/80 bg-bg-panel/72"
                  onClick={() => moveCursor(-1)}
                  type="button"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  className="rounded-full border border-border/80 bg-bg-panel/72 px-4 py-2 text-sm"
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
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border/80 bg-bg-panel/72"
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
              <div className="grid grid-cols-7 border-b border-border px-3 py-3">
                {weekDays.map((day) => (
                  <div className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted" key={day}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {currentMonthGrid.map((day) => {
                  const dayItems = itemsForDay(day);
                  const outOfMonth = !sameMonth(day, cursorDate);
                  const isSelected = sameDay(day, selectedDate);
                  const totalItems = dayItems.tasks.length + dayItems.reminders.length;

                  return (
                    <button
                      className={`min-h-44 border-r border-b border-border/80 p-3 text-left transition ${
                        outOfMonth ? "bg-black/2 opacity-45 dark:bg-white/2" : ""
                      } ${isSelected ? "bg-accent-soft/30" : "hover:bg-bg-panel/52"}`}
                      data-calendar-date={day.toISOString()}
                      data-context="calendar-day"
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      type="button"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`${sameDay(day, new Date()) ? "font-semibold text-accent" : "text-sm text-text-soft"}`}>
                          {day.getDate()}
                        </span>
                        {totalItems ? <span className="text-[10px] text-text-muted">{totalItems}</span> : null}
                      </div>
                      <div className="mt-3 space-y-1">
                        {dayItems.tasks.slice(0, 2).map((task) => (
                          <div
                            className={`truncate rounded-full border px-2.5 py-[0.28rem] text-[10px] ${taskToneClass(task.status)}`}
                            key={task.id}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayItems.reminders.slice(0, 2).map((reminder) => (
                          <div
                            className={`truncate rounded-full border px-2.5 py-[0.28rem] text-[10px] ${reminderToneClass()}`}
                            key={reminder.id}
                          >
                            {reminder.title}
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
                const done = dayItems.tasks.filter((task) => task.status === "done").length;
                return (
                  <button
                    className={`min-h-[34rem] border-r border-border/80 p-4 text-left transition hover:bg-bg-panel/48 ${
                      sameDay(day, selectedDate) ? "bg-accent-soft/24" : ""
                    }`}
                    data-calendar-date={day.toISOString()}
                    data-context="calendar-day"
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    type="button"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">
                      {weekDays[(day.getDay() + 6) % 7]}
                    </p>
                    <p className="mt-2 text-xl font-semibold">{day.getDate()}</p>
                    <div className="mt-4 rounded-[18px] border border-border/80 bg-bg-panel/56 p-3">
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>Fluxo</span>
                        <span>{dayItems.tasks.length + dayItems.reminders.length} itens</span>
                      </div>
                      <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-bg-elevated/84">
                        <div
                          className="bg-[#fca5a5] dark:bg-[#713232]"
                          style={{ width: `${dayItems.tasks.length ? (dayItems.tasks.filter((task) => task.status === "todo").length / dayItems.tasks.length) * 100 : 0}%` }}
                        />
                        <div
                          className="bg-[#fcd34d] dark:bg-[#6f5620]"
                          style={{ width: `${dayItems.tasks.length ? (dayItems.tasks.filter((task) => task.status === "in_progress").length / dayItems.tasks.length) * 100 : 0}%` }}
                        />
                        <div
                          className="bg-[#86efac] dark:bg-[#25553a]"
                          style={{ width: `${dayItems.tasks.length ? (done / dayItems.tasks.length) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {dayItems.tasks.slice(0, 3).map((task) => (
                        <div className={`rounded-[14px] border px-3 py-2 text-[11px] ${taskToneClass(task.status)}`} key={task.id}>
                          {task.title}
                        </div>
                      ))}
                      {dayItems.reminders.slice(0, 2).map((reminder) => (
                        <div className={`rounded-[14px] border px-3 py-2 text-[11px] opacity-88 ${reminderToneClass()}`} key={reminder.id}>
                          <div className="flex items-center justify-between gap-2">
                            <span>{reminder.title}</span>
                            <span className="text-[10px] uppercase tracking-[0.18em] text-text-muted">
                              {formatEventRecurrence(reminder)}
                            </span>
                          </div>
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
                className="rounded-[24px] border border-border/80 bg-bg-panel/66 p-5"
                data-calendar-date={cursorDate.toISOString()}
                data-context="calendar-day"
              >
                <p className="text-sm text-text-soft">Visão do dia</p>
                <h4 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                  {new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(cursorDate)}
                </h4>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {(["Manhã", "Tarde", "Noite"] as const).map((bucket) => {
                  const bucketItems = selectedTimeline.filter((item) => item.bucket === bucket);

                  return (
                    <Card className="space-y-3 bg-bg-panel/58" key={bucket}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-text-soft">{bucket}</p>
                        <Badge>{bucketItems.length}</Badge>
                      </div>
                      {bucketItems.length ? (
                        bucketItems.map((item) =>
                          item.kind === "task" ? (
                            <div className={`rounded-[16px] border px-3 py-3 ${taskToneClass(item.status)}`} key={item.id}>
                              <p className="font-medium">{item.title}</p>
                              <p className="mt-1 text-sm text-text-soft">{item.description ?? "Prazo do dia"}</p>
                              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-muted">{item.meta}</p>
                            </div>
                          ) : (
                            <div className="rounded-[16px] border border-border/80 bg-bg-panel/72 p-3" key={item.id}>
                              <p className="font-medium">{item.title}</p>
                              <p className="mt-1 text-sm text-text-soft">{item.description ?? item.recurrence}</p>
                              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-muted">{item.meta}</p>
                            </div>
                          )
                        )
                      ) : (
                        <EmptyState description={`Nada programado para ${bucket.toLowerCase()}.`} title={`${bucket} livre`} />
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : null}

          {view === "year" ? (
            <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
              {yearMonths.map((month) => {
                const grid = buildMonthGrid(month).slice(0, 35);
                const monthDaysWithItems = grid.filter((day) => sameMonth(day, month) && (itemsForDay(day).tasks.length || itemsForDay(day).reminders.length)).length;
                const monthItems = grid.reduce((total, day) => {
                  if (!sameMonth(day, month)) return total;
                  const dayItems = itemsForDay(day);
                  return total + dayItems.tasks.length + dayItems.reminders.length;
                }, 0);

                return (
                  <button
                    className="rounded-[26px] border border-border/80 bg-bg-panel/58 p-4 text-left transition hover:border-accent/70 hover:bg-bg-panel/72"
                    key={month.toISOString()}
                    onClick={() => {
                      setCursorDate(month);
                      setView("month");
                    }}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold capitalize">{monthLabel(month)}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-text-muted">
                          {monthDaysWithItems} dias com sinal
                        </p>
                      </div>
                      <Badge>{monthItems}</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] text-text-muted">
                      {weekDays.map((day) => (
                        <span key={day}>{day.slice(0, 1)}</span>
                      ))}
                      {grid.map((day) => {
                        const count = itemsForDay(day).reminders.length + itemsForDay(day).tasks.length;
                        return (
                          <span
                            className={`rounded-full py-1 ${sameMonth(day, month) ? "text-text" : "opacity-30"} ${
                              count > 2 ? "bg-accent text-white dark:text-slate-950" : count ? "bg-accent-soft text-accent" : ""
                            }`}
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
          <Card className="space-y-4 bg-bg-panel/52">
            <div>
              <p className="text-sm text-text-soft">Resumo do dia selecionado</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" }).format(selectedDate)}
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[20px] bg-bg-panel/74 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Atividades</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedDayItems.tasks.length}</p>
              </div>
              <div className="rounded-[20px] bg-bg-panel/74 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Lembretes</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedDayItems.reminders.length}</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 bg-bg-panel/52">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-soft">Leitura contextual</p>
              <Badge>{selectedTimeline.length}</Badge>
            </div>
            {selectedTimeline.length ? (
              <div className="space-y-3">
                {selectedTimeline.map((item) =>
                  item.kind === "task" ? (
                    <div className={`rounded-[18px] border px-4 py-4 ${taskToneClass(item.status)}`} key={item.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.title}</span>
                        {item.projectId ? (
                          <ProjectPill
                            color={projects.find((project) => project.id === item.projectId)?.color ?? "#2563eb"}
                            name={projects.find((project) => project.id === item.projectId)?.name ?? "Projeto"}
                          />
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-text-soft">{item.description ?? "Prazo vinculado ao dia."}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-muted">{item.meta}</p>
                    </div>
                  ) : (
                    <div className="rounded-[18px] border border-border/80 bg-bg-panel/72 p-4" key={item.id}>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-text-soft">{item.description ?? item.recurrence}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-text-muted">{item.meta}</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <EmptyState description="Selecione um dia com itens ou crie uma nova atividade para este calendário." title="Dia sem itens" />
            )}
          </Card>

          <Card className="space-y-4 bg-bg-panel/56">
            <p className="text-sm text-text-soft">Criar a partir do calendário</p>
            <p className="text-sm leading-7 text-text-soft">
              O calendário agora puxa o mesmo fluxo de criação das atividades. Você registra a atividade uma vez
              e decide ali se ela também vira lembrete recorrente.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  openTaskComposer({
                    mode: "full",
                    defaultDueDate: selectedDate.toISOString().slice(0, 10)
                  })
                }
              >
                Nova atividade
              </Button>
              <Button
                onClick={() =>
                  openTaskComposer({
                    mode: "quick",
                    defaultDueDate: selectedDate.toISOString().slice(0, 10)
                  })
                }
                variant="secondary"
              >
                Atividade rápida
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function buildTimeline(day: Date, tasks: Task[], reminders: CalendarEvent[]): DayTimelineItem[] {
  const taskItems: DayTimelineItem[] = tasks.map((task) => ({
    id: task.id,
    kind: "task",
    title: task.title,
    description: task.description,
    bucket:
      task.status === "in_progress"
        ? "Tarde"
        : task.priority === "high"
          ? "Manhã"
          : task.status === "done"
            ? "Noite"
            : "Tarde",
    meta: task.status === "done" ? "Concluída" : task.status === "in_progress" ? "Em andamento" : "Prazo do dia",
    status: task.status,
    projectId: task.projectId
  }));

  const reminderItems: DayTimelineItem[] = reminders.map((reminder) => {
    const anchor = new Date(reminder.startsAt);
    const sameReferenceDay = sameDay(anchor, day);
    return {
      id: reminder.id,
      kind: "reminder",
      title: reminder.title,
      description: reminder.description,
      bucket: sameReferenceDay ? bucketLabel(anchor) : "Manhã",
      meta: sameReferenceDay ? formatDateTime(reminder.startsAt) : "Recorrência ativa neste dia",
      recurrence: formatEventRecurrence(reminder)
    };
  });

  return [...taskItems, ...reminderItems].sort((a, b) => {
    const order = { "Manhã": 0, "Tarde": 1, "Noite": 2 };
    return order[a.bucket] - order[b.bucket];
  });
}
