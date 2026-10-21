import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

/** Usuario autenticado dentro de la aplicación. */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

/** Traduce los errores de Supabase a mensajes cercanos en español. */
function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (message.includes("Email rate limit")) return "Demasiados intentos. Espera unos minutos.";
  if (message.includes("already registered")) return "Este correo ya tiene cuenta. Inicia sesión.";
  if (message.includes("at least")) return "La contraseña debe tener al menos 6 caracteres.";
  if (message.includes("Failed to fetch")) return "Sin conexión. Revisa tu internet e inténtalo de nuevo.";
  return message;
}

/**
 * Hook central de autenticación.
 * Si no hay credenciales de Supabase configuradas (`.env`), la app funciona
 * en modo local y este hook lo informa mediante `isCloudEnabled`.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isCloudEnabled = isSupabaseConfigured();

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    const client = supabase;

    client.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user;
      if (sessionUser) {
        setUser({
          id: sessionUser.id,
          email: sessionUser.email ?? "",
          name: (sessionUser.user_metadata?.name as string | undefined) ?? undefined,
        });
      }
      setIsLoading(false);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      const current = session?.user;
      setUser(
        current
          ? {
              id: current.id,
              email: current.email ?? "",
              name: (current.user_metadata?.name as string | undefined) ?? undefined,
            }
          : null,
      );
      setIsLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string): Promise<boolean> => {
      setAuthError(null);
      if (!supabase) {
        setAuthError("La nube no está configurada. Puedes seguir usando la app en modo local.");
        return false;
      }
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name } },
      });
      if (error) {
        setAuthError(translateAuthError(error.message));
        return false;
      }
      return true;
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    if (!supabase) {
      setAuthError("La nube no está configurada. Puedes seguir usando la app en modo local.");
      return false;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setAuthError(translateAuthError(error.message));
      return false;
    }
    return true;
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    setAuthError(null);
    if (!supabase) {
      setAuthError("La nube no está configurada.");
      return false;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });
    if (error) {
      setAuthError(translateAuthError(error.message));
      return false;
    }
    return true;
  }, []);

  const updateName = useCallback(async (name: string): Promise<boolean> => {
    setAuthError(null);
    if (!supabase) return false;
    const { error } = await supabase.auth.updateUser({ data: { name } });
    if (error) {
      setAuthError(translateAuthError(error.message));
      return false;
    }
    setUser((prev) => (prev ? { ...prev, name } : prev));
    return true;
  }, []);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    setAuthError(null);
    if (!supabase || !user) return false;
    // Delete all user data first
    await supabase.from("user_subjects").delete().eq("user_id", user.id);
    // Sign out — actual user row deletion must be done via Supabase dashboard
    // or a server-side function with service role key
    await supabase.auth.signOut();
    setUser(null);
    return true;
  }, [supabase, user]);

  return {
    user,
    isLoading,
    authError,
    isCloudEnabled,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateName,
    deleteAccount,
  };
}
