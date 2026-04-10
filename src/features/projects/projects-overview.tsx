"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ProjectPill } from "@/components/ui/project-pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { useAppState } from "@/providers/app-state-provider";
import { ProjectComposerModal } from "@/features/projects/project-composer-modal";

export function ProjectsOverview() {
  const { projects, tasks } = useAppState();
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [fullModalOpen, setFullModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Crie projetos por aqui e acompanhe cada um em um kanban próprio, com suas tarefas separadas por fase."
        eyebrow="Módulo"
        title="Projetos"
        action={<Badge>{projects.length} projetos</Badge>}
      />

      <Card className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div>
          <label className="mb-2 block text-sm text-text-soft">Projetos</label>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setFullModalOpen(true)}>Adicionar projeto</Button>
            <Button onClick={() => setQuickModalOpen(true)} variant="secondary">
              Projeto rápido
            </Button>
          </div>
        </div>
        <div className="rounded-[20px] border border-border bg-bg-elevated/70 p-4">
          <p className="text-sm text-text-soft">Organize por projeto</p>
          <p className="mt-1 text-sm text-text-muted">
            Cada projeto ganha sua própria página, tarefas separadas e identidade visual por cor.
          </p>
        </div>
      </Card>

      {projects.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {projects.map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id);
            const done = projectTasks.filter((task) => task.status === "done").length;

            return (
              <ProjectCard done={done} key={project.id} project={project} projectTasks={projectTasks.length} />
            );
          })}
        </div>
      ) : (
        <EmptyState
          description="Crie seu primeiro projeto para a nova seção começar a aparecer também na sidebar."
          title="Nenhum projeto criado"
        />
      )}

      <ProjectComposerModal mode="quick" onClose={() => setQuickModalOpen(false)} open={quickModalOpen} />
      <ProjectComposerModal mode="full" onClose={() => setFullModalOpen(false)} open={fullModalOpen} />
    </div>
  );
}

function ProjectCard({
  project,
  projectTasks,
  done
}: {
  project: { id: string; name: string; color: string; description?: string | null };
  projectTasks: number;
  done: number;
}) {
  const { updateProject, tasks } = useAppState();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [color, setColor] = useState(project.color);
  const href = `/projects/${project.id}` as Route;

  return (
    <Card
      className="space-y-4 overflow-hidden"
      data-context="project"
      data-project-id={project.id}
      style={{ boxShadow: `0 18px 42px ${project.color}14` }}
    >
      <div
        className="h-1.5 rounded-full"
        style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <ProjectPill color={project.color} name={project.name} />
          <p className="text-sm text-text-soft">{project.description ?? "Projeto sem descrição."}</p>
          <p className="text-sm text-text-muted">{projectTasks} tarefas no total, {done} concluídas.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEditing((current) => !current)} variant="ghost">
            {editing ? "Fechar" : "Editar"}
          </Button>
          <Link href={href}>
            <Button>Ver kanban</Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[18px] border border-border bg-bg-elevated/80 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">A fazer</p>
          <p className="mt-2 text-2xl font-semibold">{tasks.filter((task) => task.projectId === project.id && task.status === "todo").length}</p>
        </div>
        <div className="rounded-[18px] border border-border bg-bg-elevated/80 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Em andamento</p>
          <p className="mt-2 text-2xl font-semibold">
            {tasks.filter((task) => task.projectId === project.id && task.status === "in_progress").length}
          </p>
        </div>
        <div className="rounded-[18px] border border-border bg-bg-elevated/80 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Concluídas</p>
          <p className="mt-2 text-2xl font-semibold">{done}</p>
        </div>
      </div>
      {editing ? (
        <div className="grid gap-3 rounded-[20px] border border-border bg-bg-elevated/70 p-4 md:grid-cols-[1fr_110px_auto]">
          <Input onChange={(event) => setName(event.target.value)} value={name} />
          <Input
            aria-label="Cor do projeto"
            className="h-11 rounded-[16px] px-2"
            onChange={(event) => setColor(event.target.value)}
            type="color"
            value={color}
          />
          <Button
            onClick={() => {
              if (!name.trim()) return;
              updateProject(project.id, { name: name.trim(), color });
              setEditing(false);
            }}
          >
            Salvar
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
