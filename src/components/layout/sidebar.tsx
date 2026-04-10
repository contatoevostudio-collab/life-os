"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_VERSION } from "@/config/app";
import { primaryNavigation } from "@/config/navigation";
import { cn } from "@/lib/utils";

import { ProjectsNav } from "./projects-nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass-panel hidden h-[calc(100vh-2rem)] w-72 shrink-0 flex-col overflow-hidden rounded-[28px] bg-bg-panel/56 p-5 lg:flex">
      <div className="mb-7 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-muted">Life OS</p>
          <h1 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.08em]">Life OS</h1>
        </div>
      </div>

      <nav className="scrollbar-subtle flex-1 space-y-2 overflow-y-auto pr-1">
        {primaryNavigation.map((item) => {
          if (item.href === "/projects") {
            return <ProjectsNav key={item.href} />;
          }

          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-[16px] px-4 py-2.5 text-sm font-medium text-text-soft transition",
                active
                  ? "bg-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] dark:text-slate-950"
                  : "hover:bg-bg-panel/72 hover:text-text"
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

      <div className="mt-3 rounded-[22px] border border-border/80 bg-bg-panel/52 p-3">
        <p className="inline-flex rounded-full border border-border/80 bg-bg-panel/72 px-2.5 py-1 text-xs uppercase tracking-[0.22em] text-text-muted">
          v{APP_VERSION}
        </p>
      </div>
    </aside>
  );
}
