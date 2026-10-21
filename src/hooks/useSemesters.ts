import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { createSemester } from "../utils/subjectFactory";
import type { Semester } from "../types/academic";

const SEMESTERS_KEY = "notaminima::semesters";
const ACTIVE_KEY = "notaminima::active-semester";

export function useSemesters() {
  const [semesters, setSemesters] = useLocalStorage<Semester[]>(SEMESTERS_KEY, []);
  const [activeSemesterId, setActiveSemesterId] = useLocalStorage<string | null>(ACTIVE_KEY, null);

  const activeSemester = useMemo(
    () => semesters.find((s) => s.id === activeSemesterId) ?? null,
    [semesters, activeSemesterId],
  );

  const addSemester = useCallback(
    (name: string): Semester => {
      const semester = createSemester(name.trim());
      setSemesters((prev) => [...prev, semester]);
      setActiveSemesterId(semester.id);
      return semester;
    },
    [setSemesters, setActiveSemesterId],
  );

  const renameSemester = useCallback(
    (id: string, name: string) => {
      setSemesters((prev) =>
        prev.map((s) => (s.id === id ? { ...s, name } : s)),
      );
    },
    [setSemesters],
  );

  const archiveSemester = useCallback(
    (id: string) => {
      setSemesters((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isArchived: !s.isArchived } : s)),
      );
    },
    [setSemesters],
  );

  const deleteSemester = useCallback(
    (id: string) => {
      setSemesters((prev) => prev.filter((s) => s.id !== id));
      setActiveSemesterId((current) => (current === id ? null : current));
    },
    [setSemesters, setActiveSemesterId],
  );

  const selectSemester = useCallback(
    (id: string | null) => setActiveSemesterId(id),
    [setActiveSemesterId],
  );

  return {
    semesters,
    activeSemester,
    activeSemesterId,
    addSemester,
    renameSemester,
    archiveSemester,
    deleteSemester,
    selectSemester,
  };
}
