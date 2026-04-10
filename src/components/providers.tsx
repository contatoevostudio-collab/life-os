"use client";

import type { PropsWithChildren } from "react";

import { AppStateProvider } from "@/providers/app-state-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ContextMenuProvider } from "@/providers/context-menu-provider";
import { ThemeProvider } from "@/providers/theme-provider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppStateProvider>
          <ContextMenuProvider>{children}</ContextMenuProvider>
        </AppStateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
