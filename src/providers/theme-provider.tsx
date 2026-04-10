"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import type { ThemeMode } from "@/types/domain";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
}

const STORAGE_KEY = "lifeos-theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(theme: ThemeMode) {
  if (theme !== "system") {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const initialTheme = storedTheme ?? "system";
    const nextResolvedTheme = resolveTheme(initialTheme);
    setThemeState(initialTheme);
    setResolvedTheme(nextResolvedTheme);
    document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      if (theme !== "system") {
        return;
      }

      const nextResolvedTheme = mediaQuery.matches ? "dark" : "light";
      setResolvedTheme(nextResolvedTheme);
      document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");
    };

    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme(nextTheme) {
        const nextResolvedTheme = resolveTheme(nextTheme);
        setThemeState(nextTheme);
        setResolvedTheme(nextResolvedTheme);
        document.documentElement.classList.toggle("dark", nextResolvedTheme === "dark");
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      }
    }),
    [resolvedTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
