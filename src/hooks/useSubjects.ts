import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { createSubject } from "../utils/subjectFactory";
import type { AcademicConfig, GradesRecord, Subject } from "../types/academic";

const STORAGE_KEY = "notas-universitarias::subjects";
const SELECTED_KEY = "notas-universitarias::selected-id";

/**
 * Hook responsable del ciclo de vida (CRUD) de las materias del estudiante,
 * con persistencia automática en `localStorage`. Mantiene también cuál
 * materia está seleccionada actualmente en la interfaz.
 */
export function useSubjects() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>(STORAGE_KEY, []);
  const [selectedId, setSelectedId] = useLocalStorage<string | null>(SELECTED_KEY, null);
  const [lastError, setLastError] = useState<string | null>(null);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedId) ?? null,
    [subjects, selectedId],
  );

  const addSubject = useCallback(
    (name: string) => {
      const subject = createSubject(name.trim());
      setSubjects((previous) => [...previous, subject]);
      setSelectedId(subject.id);
      setLastError(null);
      return subject;
    },
    [setSubjects, setSelectedId],
  );

  const removeSubject = useCallback(
    (id: string) => {
      setSubjects((previous) => previous.filter((subject) => subject.id !== id));
      setSelectedId((currentId) => (currentId === id ? null : currentId));
    },
    [setSubjects, setSelectedId],
  );

  const updateSubjectConfig = useCallback(
    (id: string, config: AcademicConfig) => {
      setSubjects((previous) =>
        previous.map((subject) => (subject.id === id ? { ...subject, config } : subject)),
      );
    },
    [setSubjects],
  );

  const updateSubjectGrades = useCallback(
    (id: string, grades: GradesRecord) => {
      setSubjects((previous) =>
        previous.map((subject) => (subject.id === id ? { ...subject, grades } : subject)),
      );
    },
    [setSubjects],
  );

  const renameSubject = useCallback(
    (id: string, name: string) => {
      setSubjects((previous) =>
        previous.map((subject) => (subject.id === id ? { ...subject, name } : subject)),
      );
    },
    [setSubjects],
  );

  /** Permite reemplazar la lista completa de materias desde una fuente externa (nube/compartido). */
  const setSubjectsFromExternal = useCallback(
    (newSubjects: Subject[]) => {
      // Compatibilidad con materias creadas antes de las evaluaciones internas.
      const migrated: Subject[] = newSubjects.map((subject) => {
        const cuts = subject.config.cuts.map((cut) => {
          if (!cut.assessments) {
            return {
              ...cut,
              assessments: [
                { id: `${cut.id}-ases1`, name: "Formativa", weight: 60, grade: null },
                { id: `${cut.id}-ases2`, name: "Parcial", weight: 40, grade: null },
              ],
            };
          }
          return cut;
        });

        // Asegura que siempre tengamos exactamente 3 cortes válidos
        const safeCuts: AcademicConfig["cuts"] = [
          cuts.find((c) => c.id === "corte1") ?? cuts[0],
          cuts.find((c) => c.id === "corte2") ?? cuts[1],
          cuts.find((c) => c.id === "corte3") ?? cuts[2],
        ];

        return {
          ...subject,
          config: {
            ...subject.config,
            cuts: safeCuts,
          },
        };
      });
      setSubjects(migrated);
    },
    [setSubjects],
  );

  return {
    subjects,
    selectedSubject,
    selectedId,
    lastError,
    selectSubject: setSelectedId,
    addSubject,
    removeSubject,
    updateSubjectConfig,
    updateSubjectGrades,
    renameSubject,
    setSubjectsFromExternal,
  };
}
