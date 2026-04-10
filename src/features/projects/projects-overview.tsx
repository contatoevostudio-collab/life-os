"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ProjectPill } from "@/components/ui/project-pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { useAppState } from "@/providers/app-state-provider";

export function ProjectsOverview() {
  const { projects, tasks } = useAppState();

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Crie projetos por aqui e acompanhe cada um em um kanban próprio, com suas tarefas separadas por fase."
        eyebrow="Módulo"
        title="Projetos"
      />

      <CreateProjectCard />

      {projects.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {projects.map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id);
            const done = projectTasks.filter((task) => task.status === "done").length;
            const href = `/projects/${project.id}` as Route;

            return (
              <Card className="space-y-4" key={project.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <ProjectPill color={project.color} name={project.name} />
                    <p className="text-sm text-text-soft">
                      {projectTasks.length} tarefas no total, {done} concluídas.
                    </p>
                  </div>
                  <Link href={href}>
                    <Button>Ver kanban</Button>
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[18px] bg-bg-elevated p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">A fazer</p>
                    <p className="mt-2 text-2xl font-semibold">{projectTasks.filter((task) => task.status === "todo").length}</p>
                  </div>
                  <div className="rounded-[18px] bg-bg-elevated p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Em andamento</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {projectTasks.filter((task) => task.status === "in_progress").length}
                    </p>
                  </div>
                  <div className="rounded-[18px] bg-bg-elevated p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Concluídas</p>
                    <p className="mt-2 text-2xl font-semibold">{done}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          description="Crie seu primeiro projeto para a nova seção começar a aparecer também na sidebar."
          title="Nenhum projeto criado"
        />
      )}
    </div>
  );
}

function CreateProjectCard() {
  const { addProject } = useAppState();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#4f8a7b");

  return (
    <Card className="grid gap-4 xl:grid-cols-[1.4fr_120px_auto]">
      <Input onChange={(event) => setName(event.target.value)} placeholder="Nome do projeto" value={name} />
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
          addProject({ name: name.trim(), color });
          setName("");
          setColor("#4f8a7b");
        }}
      >
        Criar projeto
      </Button>
    </Card>
  );
}
