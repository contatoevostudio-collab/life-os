"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, mode } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("demo@lifeos.app");
  const [password, setPassword] = useState("123456");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = isSignUp
      ? await signUp(email, password, fullName || "Usuário Life OS")
      : await signIn(email, password);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage(mode === "demo" ? "Entrando em modo demo." : "Autenticação realizada.");
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md rounded-[30px] p-8">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
            Life OS
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em]">
            Entrar no seu sistema pessoal
          </h1>
          <p className="text-sm text-text-soft">
            {mode === "demo"
              ? "Sem Supabase configurado, o app entra em modo demonstrativo."
              : "Use Supabase Auth para acessar sua área pessoal."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSignUp ? (
            <Input
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Nome completo"
              value={fullName}
            />
          ) : null}
          <Input
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-mail"
            type="email"
            value={email}
          />
          <Input
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Senha"
            type="password"
            value={password}
          />
          {message ? <p className="text-sm text-text-soft">{message}</p> : null}
          <Button className="w-full" type="submit">
            {isSignUp ? "Criar conta" : "Entrar"}
          </Button>
        </form>

        <button
          className="mt-4 text-sm text-text-soft transition hover:text-text"
          onClick={() => setIsSignUp((current) => !current)}
          type="button"
        >
          {isSignUp ? "Já tenho conta" : "Criar nova conta"}
        </button>
      </Card>
    </main>
  );
}
