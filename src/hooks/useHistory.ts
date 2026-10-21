import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { generateId } from "../utils/subjectFactory";
import { creditWeightedAverage } from "../utils/semesterMath";
import type { GradeSnapshot, Subject } from "../types/academic";

const HISTORY_KEY = "notaminima::history";

export function useHistory(subjects: Subject[]) {
  const [snapshots, setSnapshots] = useLocalStorage<GradeSnapshot[]>(HISTORY_KEY, []);

  const takeSnapshot = useCallback(
    (semesterId: string | null) => {
      const relevant = semesterId
        ? subjects.filter((s) => s.semesterId === semesterId)
        : subjects;
      const average = creditWeightedAverage(relevant);
      const snapshot: GradeSnapshot = {
        id: generateId(),
        date: new Date().toISOString(),
        semesterId,
        average,
        subjectCount: relevant.length,
      };
      setSnapshots((prev) => [...prev, snapshot]);
      return snapshot;
    },
    [subjects, setSnapshots],
  );

  const clearHistory = useCallback(() => setSnapshots([]), [setSnapshots]);

  return { snapshots, takeSnapshot, clearHistory };
}
