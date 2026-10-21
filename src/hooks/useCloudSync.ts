import { useCallback, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Subject } from "../types/academic";

const TABLE_NAME = "user_subjects";

/** Estado de sincronización que se muestra en la interfaz. */
export type SyncStatus = "idle" | "downloading" | "uploading" | "synced" | "error";

/**
 * Sincroniza las materias del estudiante con Supabase para que lo que
 * escriba en el celular aparezca en la computadora y viceversa.
 * Degrada con elegancia a "modo local" si no hay cliente configurado.
 */
export function useCloudSync(userId: string | null) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const hasDownloaded = useRef(false);

  const downloadSubjects = useCallback(async (): Promise<Subject[]> => {
    if (!supabase || !userId || hasDownloaded.current) return [];
    setSyncStatus("downloading");
    setSyncError(null);

    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select("id, name, config, grades, created_at")
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

  const uploadSubjects = useCallback(
    async (subjects: Subject[]): Promise<boolean> => {
      if (!supabase || !userId) return false;
      setSyncStatus("uploading");
      setSyncError(null);

      try {
        await supabase.from(TABLE_NAME).delete().eq("user_id", userId);

        if (subjects.length > 0) {
          const payload = subjects.map((subject) => ({
            id: subject.id,
            user_id: userId,
            name: subject.name,
            config: subject.config,
            grades: subject.grades,
            created_at: new Date(subject.createdAt).toISOString(),
          }));
          const { error } = await supabase.from(TABLE_NAME).insert(payload);
          if (error) {
            setSyncStatus("error");
            setSyncError("No pudimos guardar en la nube. Tus datos siguen seguros en este dispositivo.");
            return false;
          }
        }

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

  const resetSync = useCallback(() => {
    hasDownloaded.current = false;
    setSyncStatus("idle");
    setLastSyncedAt(null);
    setSyncError(null);
  }, []);

  return { syncStatus, lastSyncedAt, syncError, downloadSubjects, uploadSubjects, resetSync };
}
