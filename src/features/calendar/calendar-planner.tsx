"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";
import { useAuth } from "@/providers/auth-provider";
import type { CalendarView } from "@/types/domain";

export function CalendarPlanner() {
  const { events, tasks, addEvent, updateTask, searchQuery } = useAppState();
  const { user } = useAuth();
  const [view, setView] = useState<CalendarView>("week");
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("2026-04-10T10:00");
  const [endsAt, setEndsAt] = useState("2026-04-10T11:00");
  const [taskId, setTaskId] = useState("");
  const [draggingTaskId, setDraggingTaskId] = useState("");

  const scheduledTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          !task.scheduledStart &&
          (!searchQuery.trim() ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [searchQuery, tasks]
  );
  const filteredEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          !searchQuery.trim() ||
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [events, searchQuery]
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Eventos manuais e tarefas agendadas convivem na mesma visão, com vínculo opcional."
        eyebrow="Módulo"
        title="Calendário"
        action={
          <div className="flex gap-2">
            {(["day", "week", "month"] as CalendarView[]).map((item) => (
              <Button key={item} onClick={() => setView(item)} variant={view === item ? "primary" : "secondary"}>
                {item}
              </Button>
            ))}
          </div>
        }
      />

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

                  const start = `2026-04-10T${slot}:00`;
                  const [hour] = slot.split(":").map(Number);
                  const end = `2026-04-10T${String(hour + 1).padStart(2, "0")}:00:00`;

                  addEvent({
                    userId: task.userId,
                    title: task.title,
                    description: task.description ?? null,
                    startsAt: new Date(start).toISOString(),
                    endsAt: new Date(end).toISOString(),
                    taskId: task.id,
                    location: null,
                    isAllDay: false
                  });
                  updateTask(task.id, {
                    scheduledStart: new Date(start).toISOString(),
                    scheduledEnd: new Date(end).toISOString()
                  });
                  setDraggingTaskId("");
                }}
              >
                <p className="text-sm font-medium">{slot}</p>
                <p className="mt-1 text-sm text-text-soft">
                  Solte uma tarefa aqui para criar um bloco no calendario.
                </p>
              </div>
            ))}
          </div>
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
                  </div>
                ))
            ) : (
              <EmptyState
                description="Crie um evento manual ou arraste uma tarefa para um horário da agenda."
                title="Calendário vazio"
              />
            )}
          </div>
        </Card>

        <div className="space-y-4">
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

          <Card>
            <p className="text-sm text-text-soft">Tarefas sem horário</p>
            <div className="mt-4 space-y-3">
              {scheduledTasks.length ? (
                scheduledTasks.map((task) => (
                  <div
                    className="rounded-[18px] border border-dashed border-border-strong bg-bg-elevated px-4 py-3 transition hover:border-accent"
                    draggable
                    key={task.id}
                    onDragStart={() => setDraggingTaskId(task.id)}
                  >
                    <p className="font-medium">{task.title}</p>
                    <p className="mt-1 text-sm text-text-soft">
                      Arraste para um horario da agenda.
                    </p>
                  </div>
                ))
              ) : (
                <EmptyState
                  description="As tarefas ainda sem horário aparecerão aqui para você distribuí-las no calendário."
                  title="Nada para encaixar"
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
