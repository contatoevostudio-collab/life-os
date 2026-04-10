"use client";

import Link from "next/link";
import { ChevronDown, FolderKanban, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ProjectPill } from "@/components/ui/project-pill";
import { cn } from "@/lib/utils";
import { useAppState } from "@/providers/app-state-provider";

interface ProjectsNavProps {
  onNavigate?: () => void;
}

export function ProjectsNav({ onNavigate }: ProjectsNavProps) {
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
      <button
        className={cn(
          "flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-sm font-medium transition",
          rootActive
            ? "bg-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] dark:text-slate-950"
            : "text-text-soft hover:bg-bg-elevated hover:text-text"
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <FolderKanban className="size-4" />
        <span className="flex-1">Projetos</span>
        <ChevronDown className={cn("size-4 transition", open ? "rotate-180" : "")} />
      </button>

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
            const href = `/projects/${project.id}`;
            const active = pathname === href;

            return (
              <Link
                className={cn(
                  "flex items-center rounded-[16px] px-3 py-2 transition",
                  active ? "bg-bg-elevated" : "hover:bg-bg-elevated"
                )}
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
