"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import type { Session } from "@supabase/supabase-js";

import { demoUser } from "@/lib/mock-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types/domain";

interface AuthContextValue {
  user: UserProfile | null;
  session: Session | null;
  mode: "demo" | "supabase";
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) {
      setUser(demoUser);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setSession(data.session);
        setUser({
          id: data.session.user.id,
          email: data.session.user.email ?? "",
          fullName:
            data.session.user.user_metadata.full_name ??
            data.session.user.email?.split("@")[0] ??
            "Usuário"
        });
      }

      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession?.user) {
        setUser(null);
        return;
      }

      setUser({
        id: nextSession.user.id,
        email: nextSession.user.email ?? "",
        fullName:
          nextSession.user.user_metadata.full_name ??
          nextSession.user.email?.split("@")[0] ??
          "Usuário"
      });
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      mode: supabase ? "supabase" : "demo",
      async signIn(email, password) {
        if (!supabase) {
          setUser({ ...demoUser, email });
          return {};
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message };
      },
      async signUp(email, password, fullName) {
        if (!supabase) {
          setUser({ ...demoUser, email, fullName });
          return {};
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        return { error: error?.message };
      },
      async signOut() {
        if (!supabase) {
          setUser(demoUser);
          return;
        }

        await supabase.auth.signOut();
      }
    }),
    [loading, session, supabase, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
