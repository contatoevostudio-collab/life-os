"use client";

import { Menu, Moon, PlayCircle, Search, Sparkles, Sun, UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDurationSeconds } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";

interface TopbarProps {
  onOpenPomodoro: () => void;
  onOpenMobileNav: () => void;
}

export function Topbar({ onOpenPomodoro, onOpenMobileNav }: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, mode } = useAuth();
  const { searchQuery, setSearchQuery, activePomodoroSeconds, pomodoroRunning } = useAppState();

  return (
    <header className="glass-panel sticky top-4 z-30 flex min-h-16 flex-col gap-3 rounded-[24px] px-4 py-3 md:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <button
          className="inline-flex size-10 items-center justify-center rounded-[14px] border border-border text-text-soft transition hover:bg-bg-elevated lg:hidden"
          onClick={onOpenMobileNav}
          type="button"
        >
          <Menu className="size-4" />
        </button>
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3 py-1 text-[11px] font-medium text-text-soft">
            <span className="size-2 rounded-full bg-accent" />
            Workspace ao vivo
          </div>
          <h2 className="mt-2 truncate text-lg font-semibold tracking-[-0.05em]">
            Operação diária com clareza
          </h2>
          <p className="mt-1 text-sm text-text-soft">
            {new Intl.DateTimeFormat("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long"
            }).format(new Date())}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-1 items-center gap-3 lg:max-w-xl">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            className="pl-9"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar tarefas, eventos e lançamentos"
            value={searchQuery}
          />
        </div>
        <div className="hidden items-center gap-2 rounded-[16px] border border-border bg-bg-elevated px-3 py-2 text-sm text-text-soft xl:flex">
          <Sparkles className="size-4 text-accent" />
          Ao vivo
        </div>
      </div>

      <div className="flex w-full items-center justify-end gap-2 lg:w-auto">
        <Button onClick={onOpenPomodoro}>
          <PlayCircle className="size-4" />
          {pomodoroRunning && activePomodoroSeconds !== null
            ? formatDurationSeconds(activePomodoroSeconds)
            : "Pomodoro"}
        </Button>
        <button
          className="inline-flex size-10 items-center justify-center rounded-[14px] border border-border text-text-soft transition hover:bg-bg-elevated"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          type="button"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>
        <div className="flex min-w-0 items-center gap-2 rounded-[16px] border border-border bg-bg-elevated/70 px-3 py-2">
          <UserCircle2 className="size-5 text-text-soft" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.fullName ?? "Visitante"}</p>
            <p className="truncate text-xs text-text-muted">
              {mode === "demo" ? "Modo demo" : user?.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
