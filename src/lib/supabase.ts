/**
 * ============================================================================
 *  CLIENTE SUPABASE (Autenticación + Sincronización en la nube)
 * ============================================================================
 * Las credenciales se leen EXCLUSIVAMENTE de variables de entorno Vite
 * (`.env`), nunca se escriben en el código fuente. Consulta `.env.example`.
 *
 * Si las variables no están definidas, la aplicación sigue funcionando
 * perfectamente en "modo local" (los datos se guardan solo en el navegador),
 * y la interfaz lo comunica con claridad al usuario.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/** Indica si existen credenciales válidas para habilitar la nube. */
export const isSupabaseConfigured = (): boolean =>
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;

/**
 * Cliente de Supabase. Se crea solo si hay credenciales; en caso contrario
 * exponemos `null` y los hooks degradan a modo local sin lanzar errores.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/** Nombre de la aplicación (configurable por entorno). */
export const APP_NAME: string = import.meta.env.VITE_APP_NAME ?? "NotaMínima";
