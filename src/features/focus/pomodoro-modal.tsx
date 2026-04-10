"use client";

import { Pause, Play, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAppState } from "@/providers/app-state-provider";
import { useAuth } from "@/providers/auth-provider";
import { formatDurationSeconds } from "@/lib/utils";

interface PomodoroModalProps {
  open: boolean;
  onClose: () => void;
}

export function PomodoroModal({ open, onClose }: PomodoroModalProps) {
  const { tasks, preferences, saveSession, setPomodoroState } = useAppState();
  const { user } = useAuth();
  const [focusMinutes, setFocusMinutes] = useState(preferences.pomodoroFocusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(preferences.pomodoroBreakMinutes);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(focusMinutes * 60);
  const [running, setRunning] = useState(false);
  const [focusView, setFocusView] = useState(false);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);

  useEffect(() => {
    setFocusMinutes(preferences.pomodoroFocusMinutes);
    setBreakMinutes(preferences.pomodoroBreakMinutes);
  }, [preferences]);

  useEffect(() => {
    setPomodoroState({
      seconds: remainingSeconds,
      running
    });
  }, [remainingSeconds, running, setPomodoroState]);

  useEffect(() => {
    return () => {
      setPomodoroState({
        seconds: null,
        running: false
      });
    };
  }, [setPomodoroState]);

  useEffect(() => {
    if (!running) {
      return;
    }

    if (!endsAt) {
      return;
    }

    const interval = window.setInterval(() => {
      const nextSeconds = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemainingSeconds(nextSeconds);

      if (nextSeconds > 0) {
        return;
      }

      window.clearInterval(interval);
      setRunning(false);
      setEndsAt(null);
      saveSession({
        userId: user?.id ?? "demo-user",
        taskId: selectedTaskId || null,
        durationMinutes: focusMinutes,
        breakMinutes,
        status: "completed",
        startedAt: new Date(sessionStartedAt ?? Date.now() - focusMinutes * 60 * 1000).toISOString(),
        endedAt: new Date().toISOString()
      });
      setSessionStartedAt(null);
      setRemainingSeconds(focusMinutes * 60);
    }, 250);

    return () => window.clearInterval(interval);
  }, [breakMinutes, endsAt, focusMinutes, running, saveSession, selectedTaskId, sessionStartedAt, user?.id]);

  useEffect(() => {
    setRemainingSeconds(focusMinutes * 60);
  }, [focusMinutes]);

  if (!open) {
    return null;
  }

  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (remainingSeconds % 60).toString().padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <Card
        className={
          focusView
            ? "animate-fade-in w-full max-w-3xl space-y-6 rounded-[34px] border-border-strong bg-[linear-gradient(135deg,rgba(22,29,35,0.96),rgba(24,38,34,0.94))] p-10 text-white"
            : "animate-fade-in w-full max-w-xl space-y-6 rounded-[30px]"
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge>Foco</Badge>
            <div>
              <h3 className="text-2xl font-semibold tracking-[-0.04em]">Pomodoro rápido</h3>
              <p className={focusView ? "text-sm text-white/70" : "text-sm text-text-soft"}>
                Sessão discreta para manter ritmo sem sair do fluxo.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setFocusView((current) => !current)} variant="ghost">
              {focusView ? "Normal" : "Focus view"}
            </Button>
            <button
              className="inline-flex size-10 items-center justify-center rounded-[14px] border border-border text-text-soft transition hover:bg-bg-elevated"
              onClick={onClose}
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            className="rounded-[18px] border border-border bg-bg-elevated/70 px-4 py-3 text-left transition hover:border-accent"
            onClick={() => {
              setFocusMinutes(25);
              setBreakMinutes(5);
            }}
            type="button"
          >
            <p className="font-medium">25 / 5</p>
            <p className="text-sm text-text-soft">Ritmo clássico</p>
          </button>
          <button
            className="rounded-[18px] border border-border bg-bg-elevated/70 px-4 py-3 text-left transition hover:border-accent"
            onClick={() => {
              setFocusMinutes(50);
              setBreakMinutes(10);
            }}
            type="button"
          >
            <p className="font-medium">50 / 10</p>
            <p className="text-sm text-text-soft">Bloco profundo</p>
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-text-soft">Foco</label>
            <Input
              min={5}
              onChange={(event) => setFocusMinutes(Number(event.target.value))}
              type="number"
              value={focusMinutes}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-text-soft">Pausa</label>
            <Input
              min={1}
              onChange={(event) => setBreakMinutes(Number(event.target.value))}
              type="number"
              value={breakMinutes}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-text-soft">Tarefa</label>
            <Select onChange={(event) => setSelectedTaskId(event.target.value)} value={selectedTaskId}>
              <option value="">Sem vínculo</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.14))] px-6 py-10 text-center dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))]">
          <p className="font-mono text-6xl font-semibold tracking-[-0.08em]">
            {formatDurationSeconds(remainingSeconds)}
          </p>
          <p className={focusView ? "mt-2 text-sm text-white/70" : "mt-2 text-sm text-text-soft"}>
            {running ? "Sessão em andamento" : "Pronto para iniciar"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              if (running) {
                const nextSeconds = endsAt ? Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)) : remainingSeconds;
                setRemainingSeconds(nextSeconds);
                setEndsAt(null);
                setRunning(false);
                return;
              }

              setSessionStartedAt((current) => current ?? Date.now());
              setEndsAt(Date.now() + remainingSeconds * 1000);
              setRunning(true);
            }}
            variant={running ? "secondary" : "primary"}
          >
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            {running ? "Pausar" : "Iniciar"}
          </Button>
          <Button
            onClick={() => {
              setRunning(false);
              setEndsAt(null);
              setSessionStartedAt(null);
              setRemainingSeconds(focusMinutes * 60);
            }}
            variant="ghost"
          >
            <RotateCcw className="size-4" />
            Resetar
          </Button>
        </div>
      </Card>
    </div>
  );
}
