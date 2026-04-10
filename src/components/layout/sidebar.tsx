"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { primaryNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

import { ProjectsNav } from "./projects-nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-panel hidden h-[calc(100vh-2rem)] w-72 shrink-0 flex-col rounded-[28px] p-5 lg:flex">
      <div className="mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
          Life OS
        </p>
        <div>
          <h1 className="text-[2rem] font-semibold tracking-[-0.06em]">Workspace</h1>
          <p className="text-sm text-text-soft">
            Um painel pessoal enxuto para operar o seu dia.
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {primaryNavigation.map((item) => {
          if (item.href === "/projects") {
            return <ProjectsNav key={item.href} />;
          }

          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-medium text-text-soft transition",
                active
                  ? "bg-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] dark:text-slate-950"
                  : "hover:bg-bg-elevated hover:text-text"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[24px] border border-border bg-bg-elevated p-4">
        <p className="text-sm font-medium">Workspace sereno</p>
        <p className="mt-1 text-sm text-text-soft">
          Visual pensado para manter foco e preparar a futura evolução para macOS.
        </p>
      </div>
    </aside>
  );
}
