"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenPomodoro: () => void;
}

const actions = [
  { id: "go-home", label: "Ir para Hoje", href: "/" },
  { id: "go-tasks", label: "Ir para Tarefas", href: "/tasks" },
  { id: "go-calendar", label: "Ir para Calendário", href: "/calendar" },
  { id: "go-finance", label: "Ir para Financeiro", href: "/finance" },
  { id: "go-dashboard", label: "Ir para Dashboard", href: "/dashboard" },
  { id: "go-settings", label: "Ir para Configurações", href: "/settings" },
  { id: "go-review", label: "Abrir revisão semanal", href: "/review" },
  { id: "open-pomodoro", label: "Abrir Pomodoro" }
] as const;

export function CommandPalette({ open, onClose, onOpenPomodoro }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  const filtered = useMemo(
    () =>
      actions.filter((action) =>
        action.label.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/25 p-4 pt-24 backdrop-blur-sm">
      <Card className="w-full max-w-2xl rounded-[30px] p-4">
        <div className="flex items-center gap-3">
          <Search className="size-4 text-text-muted" />
          <Input
            autoFocus
            className="border-0 px-0 focus:border-0"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Digite um comando ou uma tela"
            value={query}
          />
          <button
            className="inline-flex size-9 items-center justify-center rounded-[12px] border border-border"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-4 grid gap-2">
          {filtered.map((action) => (
            <button
              className="rounded-[16px] px-4 py-3 text-left text-sm transition hover:bg-bg-elevated"
              key={action.id}
              onClick={() => {
                if ("href" in action && action.href) {
                  router.push(action.href);
                } else {
                  onOpenPomodoro();
                }
                onClose();
              }}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
