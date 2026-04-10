"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppState } from "@/providers/app-state-provider";

interface ProjectComposerModalProps {
  open: boolean;
  onClose: () => void;
  mode: "quick" | "full";
}

const emptyState = {
  name: "",
  color: "#4f8a7b",
  description: ""
};

export function ProjectComposerModal({ open, onClose, mode }: ProjectComposerModalProps) {
  const { addProject } = useAppState();
  const [form, setForm] = useState(emptyState);

  useEffect(() => {
    if (!open) return;
    setForm(emptyState);
  }, [open]);

  if (!open) {
    return null;
  }

  function submit() {
    if (!form.name.trim()) return;

    addProject({
      name: form.name.trim(),
      color: form.color,
      description: mode === "full" ? form.description.trim() || null : null
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <Card className="animate-fade-in w-full max-w-xl space-y-5 overflow-hidden rounded-[30px]">
        <div className="h-1.5 bg-[linear-gradient(90deg,rgba(79,138,123,1),rgba(79,138,123,0.15))]" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-soft">{mode === "quick" ? "Criação rápida" : "Projeto completo"}</p>
            <h3 className="text-2xl font-semibold tracking-[-0.04em]">
              {mode === "quick" ? "Adicionar projeto" : "Adicionar projeto detalhado"}
            </h3>
            <p className="mt-2 text-sm text-text-soft">
              {mode === "quick"
                ? "Registro enxuto para começar sem interrupção."
                : "Inclui campo de descrição para dar contexto ao projeto."}
            </p>
          </div>
          <button
            className="inline-flex size-10 items-center justify-center rounded-[14px] border border-border text-text-soft transition hover:bg-bg-elevated"
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm text-text-soft">Nome</label>
            <Input
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nome do projeto"
              value={form.name}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_120px]">
            <div>
              <label className="mb-2 block text-sm text-text-soft">Cor</label>
              <Input
                aria-label="Cor do projeto"
                className="h-11 rounded-[16px] px-2"
                onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))}
                type="color"
                value={form.color}
              />
            </div>
            {mode === "full" ? (
              <div className="md:col-span-1">
                <label className="mb-2 block text-sm text-text-soft">Descrição</label>
                <Textarea
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Objetivo, contexto e observações"
                  value={form.description}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="ghost">
            Cancelar
          </Button>
          <Button onClick={submit}>{mode === "quick" ? "Criar rápido" : "Criar projeto"}</Button>
        </div>
      </Card>
    </div>
  );
}
