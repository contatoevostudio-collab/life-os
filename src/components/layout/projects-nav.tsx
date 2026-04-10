"use client";

import type { Route } from "next";
import Link from "next/link";
import { ChevronDown, FolderKanban, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ProjectPill } from "@/components/ui/project-pill";
import { cn } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";

interface ProjectsNavProps {
  onNavigate?: () => void;
}

export function ProjectsNav({ onNavigate }: ProjectsNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { projects } = useAppState();
  const [open, setOpen] = useState(pathname.startsWith("/projects"));

  useEffect(() => {
    if (pathname.startsWith("/projects")) {
      setOpen(true);
    }
  }, [pathname]);

  const rootActive = pathname === "/projects" || pathname.startsWith("/projects/");

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center rounded-[18px] text-sm font-medium transition",
          rootActive
            ? "bg-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] dark:text-slate-950"
            : "text-text-soft hover:bg-bg-elevated hover:text-text"
        )}
        data-context="project"
      >
        <button
          className="flex flex-1 items-center gap-3 px-4 py-3 text-left"
          onClick={() => {
            setOpen(true);
            onNavigate?.();
            router.push("/projects");
          }}
          type="button"
        >
          <FolderKanban className="size-4" />
          <span className="flex-1">Projetos</span>
        </button>
        <button
          className="mr-2 inline-flex size-8 items-center justify-center rounded-[12px] transition hover:bg-black/5 dark:hover:bg-white/10"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <ChevronDown className={cn("size-4 transition", open ? "rotate-180" : "")} />
        </button>
      </div>

      {open ? (
        <div className="space-y-2 pl-4">
          <Link
            className={cn(
              "flex items-center gap-2 rounded-[16px] px-3 py-2 text-sm transition",
              pathname === "/projects"
                ? "bg-bg-elevated text-text"
                : "text-text-soft hover:bg-bg-elevated hover:text-text"
            )}
            href="/projects"
            onClick={onNavigate}
          >
            <Plus className="size-4" />
            Criar projeto
          </Link>

          {projects.map((project) => {
            const href = `/projects/${project.id}` as Route;
            const active = pathname === href;

            return (
              <Link
                className={cn(
                  "flex items-center rounded-[16px] px-3 py-2 transition",
                  active ? "bg-bg-elevated" : "hover:bg-bg-elevated"
                )}
                data-context="project"
                data-project-id={project.id}
                href={href}
                key={project.id}
                onClick={onNavigate}
              >
                <ProjectPill className="border-0 bg-transparent px-0 py-0" color={project.color} name={project.name} />
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
