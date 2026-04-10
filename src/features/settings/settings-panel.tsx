"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { useAppState } from "@/providers/app-state-provider";
import { useTheme } from "@/providers/theme-provider";

export function SettingsPanel() {
  const { preferences, updatePreferences } = useAppState();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Preferências centrais do app, focadas em tema, ritmo de foco e comportamento geral."
        eyebrow="Módulo"
        title="Configurações"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-text-soft">Tema</label>
            <Select onChange={(event) => setTheme(event.target.value as typeof theme)} value={theme}>
              <option value="system">Sistema</option>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-text-soft">Pomodoro padrão</label>
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                onChange={(event) =>
                  updatePreferences({ pomodoroFocusMinutes: Number(event.target.value) })
                }
                type="number"
                value={preferences.pomodoroFocusMinutes}
              />
              <Input
                onChange={(event) =>
                  updatePreferences({ pomodoroBreakMinutes: Number(event.target.value) })
                }
                type="number"
                value={preferences.pomodoroBreakMinutes}
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <p className="text-sm text-text-soft">Direção de arquitetura</p>
          <p className="text-sm text-text-soft">
            O shell principal, os tipos de domínio e o estado compartilhado foram separados para facilitar a troca futura por adaptadores de persistência local ou Tauri.
          </p>
          <p className="text-sm text-text-soft">
            O tema e as preferências vivem como camada transversal, sem acoplar interface e storage.
          </p>
        </Card>
      </div>
    </div>
  );
}
