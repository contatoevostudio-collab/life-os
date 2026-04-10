"use client";

import { useState, type PropsWithChildren } from "react";
import Link from "next/link";

import { navigation } from "@/config/navigation";
import { OnboardingModal } from "@/components/layout/onboarding-modal";
import { PomodoroModal } from "@/features/focus/pomodoro-modal";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: PropsWithChildren) {
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen p-4">
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
      <OnboardingModal />
    </>
  );
}
