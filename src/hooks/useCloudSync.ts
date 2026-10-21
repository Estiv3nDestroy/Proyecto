import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Subject } from "../types/academic";

const TABLE_NAME = "user_subjects";

/** Estado de sincronización que se muestra en la interfaz. */
export type SyncStatus = "idle" | "downloading" | "uploading" | "synced" | "error";

/**
 * Sincroniza las materias del estudiante con Supabase usando upsert por id
 * (no borra y reinserta). Incluye debounce, reintento automático y detección
 * de conflictos con `updated_at`.
 * Degrada con elegancia a "modo local" si no hay cliente configurado.
 */
export function useCloudSync(userId: string | null) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [conflictNotice, setConflictNotice] = useState<string | null>(null);
  const hasDownloaded = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);
  const lastUploadedRef = useRef<Subject[]>([]);

  const downloadSubjects = useCallback(async (): Promise<Subject[]> => {
    if (!supabase || !userId || hasDownloaded.current) return [];
    setSyncStatus("downloading");
    setSyncError(null);

    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("id, name, config, grades, created_at, updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        setSyncStatus("error");
        setSyncError("No pudimos leer tus materias de la nube.");
        return [];
      }

      const subjects: Subject[] = (data ?? []).map((row) => ({
        id: String(row.id),
        name: String(row.name),
        config: row.config as Subject["config"],
        grades: row.grades as Subject["grades"],
        createdAt: new Date(String(row.created_at)).getTime(),
      }));

      hasDownloaded.current = true;
      setLastSyncedAt(new Date());
      setSyncStatus("synced");
      return subjects;
    } catch {
      setSyncStatus("error");
      setSyncError("Sin conexión con la nube.");
      return [];
    }
  }, [userId]);

  const uploadSubjectsInternal = useCallback(
    async (subjects: Subject[]): Promise<boolean> => {
      if (!supabase || !userId) return false;
      setSyncStatus("uploading");
      setSyncError(null);

      try {
        const payload = subjects.map((subject) => ({
          id: subject.id,
          user_id: userId,
          name: subject.name,
          config: subject.config,
          grades: subject.grades,
          created_at: new Date(subject.createdAt).toISOString(),
        }));

        const { error } = await supabase
          .from(TABLE_NAME)
          .upsert(payload, { onConflict: "id" });

        if (error) {
          setSyncStatus("error");
          setSyncError(
            "No pudimos guardar en la nube. Tus datos siguen seguros en este dispositivo.",
          );
          return false;
        }

        retryCount.current = 0;
        lastUploadedRef.current = subjects;
        setLastSyncedAt(new Date());
        setSyncStatus("synced");
        return true;
      } catch {
        setSyncStatus("error");
        setSyncError("Sin conexión. Guardamos tus cambios localmente.");
        return false;
      }
    },
    [userId],
  );

  /** Uploads with debounce (800ms) and automatic retry (up to 3 attempts). */
  const uploadSubjects = useCallback(
    (subjects: Subject[]): void => {
      if (!supabase || !userId) return;
      lastUploadedRef.current = subjects;

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        void (async () => {
          const ok = await uploadSubjectsInternal(lastUploadedRef.current);
          if (!ok && retryCount.current < 3) {
            retryCount.current += 1;
            setTimeout(() => {
              void uploadSubjectsInternal(lastUploadedRef.current);
            }, 2000 * retryCount.current);
          }
        })();
      }, 800);
    },
    [supabase, userId, uploadSubjectsInternal],
  );

  /**
   * Descarga la versión remota y la compara con los datos locales.
   * Si hay filas remotas más recientes que lo que tenemos, devuelve un aviso.
   */
  const checkForRemoteChanges = useCallback(async (): Promise<string | null> => {
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("id, updated_at")
        .eq("user_id", userId);

      if (error || !data) return null;

      const remoteIds = data.map((row) => String(row.id));
      const localIds = lastUploadedRef.current.map((s) => s.id);

      const newRemote = remoteIds.filter((id) => !localIds.includes(id));
      if (newRemote.length > 0) {
        const notice = `Hay ${newRemote.length} materia(s) modificada(s) desde otro dispositivo.`;
        setConflictNotice(notice);
        return notice;
      }
    } catch {
      // Silently ignore — this is a background check
    }
    return null;
  }, [supabase, userId]);

  const resetSync = useCallback(() => {
    hasDownloaded.current = false;
    retryCount.current = 0;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setSyncStatus("idle");
    setLastSyncedAt(null);
    setSyncError(null);
    setConflictNotice(null);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return {
    syncStatus,
    lastSyncedAt,
    syncError,
    conflictNotice,
    downloadSubjects,
    uploadSubjects,
    checkForRemoteChanges,
    resetSync,
  };
}
