"use client";

import { Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppState } from "@/providers/app-state-provider";

export function OnboardingModal() {
  const { onboardingOpen, closeOnboarding } = useAppState();

  if (!onboardingOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl rounded-[32px] border-border-strong bg-[linear-gradient(135deg,rgba(255,250,243,0.96),rgba(241,248,244,0.9))] p-8 dark:bg-[linear-gradient(135deg,rgba(24,32,38,0.95),rgba(20,31,28,0.92))]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex size-12 items-center justify-center rounded-[18px] bg-accent-soft text-accent">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.05em]">
                Monte seu Life OS do seu jeito
              </h2>
              <p className="mt-2 max-w-xl text-sm text-text-soft">
                O app começa em branco para virar um espaço realmente seu. Crie um projeto,
                adicione tarefas e use a tela Hoje como centro de operação.
              </p>
            </div>
          </div>
          <button
            className="inline-flex size-10 items-center justify-center rounded-[14px] border border-border text-text-soft transition hover:bg-bg-elevated"
            onClick={closeOnboarding}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-border bg-bg-elevated p-4">
            <p className="font-medium">1. Crie a estrutura</p>
            <p className="mt-2 text-sm text-text-soft">
              Comece por um projeto e pelas tarefas principais da semana.
            </p>
          </div>
          <div className="rounded-[20px] border border-border bg-bg-elevated p-4">
            <p className="font-medium">2. Distribua no tempo</p>
            <p className="mt-2 text-sm text-text-soft">
              Arraste tarefas para o calendário e construa blocos de execução.
            </p>
          </div>
          <div className="rounded-[20px] border border-border bg-bg-elevated p-4">
            <p className="font-medium">3. Entre em foco</p>
            <p className="mt-2 text-sm text-text-soft">
              Use o Pomodoro para sessões discretas e acumuladas no dashboard.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={closeOnboarding}>Começar</Button>
        </div>
      </Card>
    </div>
  );
}
