"use client";

import { useEffect, useState, type PropsWithChildren } from "react";
import Link from "next/link";

import { primaryNavigation } from "@/config/navigation";
import { OnboardingModal } from "@/components/layout/onboarding-modal";
import { PomodoroModal } from "@/features/focus/pomodoro-modal";
import { TaskComposerModal } from "@/features/tasks/task-composer-modal";
import { useAppState } from "@/providers/app-state-provider";
import { formatDurationSeconds } from "@/lib/utils";

import { ProjectsNav } from "./projects-nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: PropsWithChildren) {
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activePomodoroSeconds, pomodoroRunning, taskComposerRequest, closeTaskComposer } = useAppState();

  useEffect(() => {
    if (pomodoroRunning && activePomodoroSeconds !== null) {
      document.title = `${formatDurationSeconds(activePomodoroSeconds)} · Life OS`;
      return;
    }

    document.title = "Life OS";
  }, [activePomodoroSeconds, pomodoroRunning]);

  return (
    <>
      <div className="page-shell min-h-screen p-4 md:p-5">
        <div className="mx-auto flex max-w-[1680px] gap-4">
          <Sidebar />

          <div className="flex min-h-[calc(100vh-2rem)] min-w-0 flex-1 flex-col gap-4">
            <Topbar
              onOpenMobileNav={() => setMobileOpen((current) => !current)}
              onOpenPomodoro={() => setPomodoroOpen(true)}
            />

            {mobileOpen ? (
              <div className="glass-panel animate-fade-in rounded-[24px] p-4 lg:hidden">
                <nav className="grid gap-2">
                  {primaryNavigation.map((item) =>
                    item.href === "/projects" ? (
                      <ProjectsNav key={item.href} onNavigate={() => setMobileOpen(false)} />
                    ) : (
                      <Link
                        className="rounded-[16px] px-4 py-3 text-sm font-medium text-text-soft transition hover:bg-bg-elevated hover:text-text"
                        href={item.href}
                        key={item.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </nav>
              </div>
            ) : null}

            <main className="min-w-0 flex-1" data-context="workspace">
              {children}
            </main>
          </div>
        </div>
      </div>

      {taskComposerRequest ? (
        <TaskComposerModal
          defaultDueDate={taskComposerRequest.defaultDueDate}
          defaultProjectId={taskComposerRequest.defaultProjectId}
          mode={taskComposerRequest.mode}
          onClose={closeTaskComposer}
          open
        />
      ) : null}
      <PomodoroModal onClose={() => setPomodoroOpen(false)} open={pomodoroOpen} />
      <OnboardingModal />
    </>
  );
}
