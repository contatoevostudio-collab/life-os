"use client";

import { useRouter } from "next/navigation";
import { useEffect, type PropsWithChildren } from "react";

import { useAuth } from "@/providers/auth-provider";

export function WorkspaceGuard({ children }: PropsWithChildren) {
  const router = useRouter();
  const { loading, mode, user } = useAuth();

  useEffect(() => {
    if (!loading && mode === "supabase" && !user) {
      router.replace("/auth");
    }
  }, [loading, mode, router, user]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="glass-panel rounded-[24px] px-6 py-5 text-sm text-text-soft">
          Carregando workspace...
        </div>
      </main>
    );
  }

  if (mode === "supabase" && !user) {
    return null;
  }

  return children;
}
