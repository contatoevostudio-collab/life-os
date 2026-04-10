"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import Link from "next/link";

import { CommandPalette } from "@/components/layout/command-palette";
import { navigation } from "@/config/navigation";
import { OnboardingModal } from "@/components/layout/onboarding-modal";
import { PomodoroModal } from "@/features/focus/pomodoro-modal";
import { useAppState } from "@/providers/app-state-provider";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: PropsWithChildren) {
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { preferences } = useAppState();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className={`min-h-screen p-4 ${preferences.compactMode ? "text-[14px]" : ""}`}>
        <div className="mx-auto flex max-w-[1680px] gap-4">
          <Sidebar />

          <div className="flex min-h-[calc(100vh-2rem)] min-w-0 flex-1 flex-col gap-4">
            <Topbar
              onOpenMobileNav={() => setMobileOpen((current) => !current)}
              onOpenPomodoro={() => setPomodoroOpen(true)}
            />

            {mobileOpen ? (
              <div className="glass-panel rounded-[24px] p-4 lg:hidden">
                <nav className="grid gap-2">
                  {navigation.map((item) => (
                    <Link
                      className="rounded-[16px] px-4 py-3 text-sm font-medium text-text-soft transition hover:bg-bg-elevated hover:text-text"
                      href={item.href}
                      key={item.href}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ) : null}

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>

      <PomodoroModal onClose={() => setPomodoroOpen(false)} open={pomodoroOpen} />
      <CommandPalette
        onClose={() => setPaletteOpen(false)}
        onOpenPomodoro={() => setPomodoroOpen(true)}
        open={paletteOpen}
      />
      <OnboardingModal />
    </>
  );
}
