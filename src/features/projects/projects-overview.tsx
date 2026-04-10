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
  const activeProjects = projects.filter((project) =>
    tasks.some((task) => task.projectId === project.id && task.status === "in_progress")
  ).length;

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Projetos com mais identidade, progresso visível e leitura operacional sem precisar entrar no kanban."
        eyebrow="Módulo"
        title="Projetos"
        action={<Badge>{projects.length} projetos</Badge>}
      />

      <Card className="editorial-surface grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-sm text-text-soft">Centro de projetos</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">Cada projeto precisa comunicar contexto rápido.</h3>
          <p className="mt-2 max-w-xl text-sm leading-7 text-text-soft">
            A leitura abaixo já mostra avanço, volume de atividades e o próximo sinal operacional sem depender do kanban.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setFullModalOpen(true)}>Projeto completo</Button>
            <Button onClick={() => setQuickModalOpen(true)} variant="secondary">
              Projeto rápido
            </Button>
          </div>
        </div>
        <div className="rounded-[24px] border border-border bg-bg-elevated/82 p-5">
          <p className="text-sm text-text-soft">Leitura rápida</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-border/80 bg-bg-panel/76 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Projetos ativos</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{activeProjects}</p>
            </div>
            <div className="rounded-[18px] border border-border/80 bg-bg-panel/76 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Atividades totais</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{tasks.filter((task) => task.projectId).length}</p>
            </div>
          </div>
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
  const todo = tasks.filter((task) => task.projectId === project.id && task.status === "todo").length;
  const inProgress = tasks.filter((task) => task.projectId === project.id && task.status === "in_progress").length;
  const completion = projectTasks ? Math.round((done / projectTasks) * 100) : 0;
  const nextTask =
    tasks.find((task) => task.projectId === project.id && task.status === "in_progress") ??
    tasks.find((task) => task.projectId === project.id && task.status === "todo");

  return (
    <Card
      className="editorial-surface space-y-5 overflow-hidden"
      data-context="project"
      data-project-id={project.id}
      style={{ boxShadow: `0 18px 42px ${project.color}14` }}
    >
      <div
        className="h-1.5 rounded-full"
        style={{ background: `linear-gradient(90deg, ${project.color}, transparent)` }}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <ProjectPill color={project.color} name={project.name} />
          <p className="max-w-lg text-sm leading-7 text-text-soft">{project.description ?? "Projeto sem descrição."}</p>
          <p className="text-sm text-text-muted">{projectTasks} atividades no total, {done} concluídas.</p>
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
      <div className="grid gap-3 md:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[22px] border border-border bg-bg-elevated/88 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Progresso</p>
            <p className="text-sm text-text-soft">{completion}%</p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-bg-panel/72">
            <div
              className="h-full rounded-full"
              style={{ background: project.color, width: `${completion}%` }}
            />
          </div>
        </div>
        <div className="rounded-[22px] border border-border bg-bg-elevated/88 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Próximo foco</p>
          <p className="mt-2 text-sm font-medium">
            {nextTask ? nextTask.title : "Nenhuma atividade ativa neste projeto"}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {nextTask ? (nextTask.status === "in_progress" ? "Em andamento agora" : "Próxima atividade pendente") : "Crie uma atividade para começar"}
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[22px] border border-border bg-bg-elevated/88 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">A fazer</p>
          <p className="mt-2 text-2xl font-semibold">{todo}</p>
        </div>
        <div className="rounded-[22px] border border-border bg-bg-elevated/88 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Em andamento</p>
          <p className="mt-2 text-2xl font-semibold">{inProgress}</p>
        </div>
        <div className="rounded-[22px] border border-border bg-bg-elevated/88 p-4">
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
