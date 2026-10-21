import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { generateId } from "../utils/subjectFactory";
import type { Goal } from "../types/academic";

const GOALS_KEY = "notaminima::goals";

export function useGoals() {
  const [goals, setGoals] = useLocalStorage<Goal[]>(GOALS_KEY, []);

  const addGoal = useCallback(
    (subjectId: string | null, targetGrade: number): Goal => {
      const existing = goals.find((g) => g.subjectId === subjectId);
      if (existing) {
        const updated = { ...existing, targetGrade };
        setGoals((prev) => prev.map((g) => (g.id === existing.id ? updated : g)));
        return updated;
      }
      const goal: Goal = {
        id: generateId(),
        subjectId,
        targetGrade,
      };
      setGoals((prev) => [...prev, goal]);
      return goal;
    },
    [goals, setGoals],
  );

  const removeGoal = useCallback(
    (id: string) => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    },
    [setGoals],
  );

  const getGoal = useCallback(
    (subjectId: string | null): Goal | null =>
      goals.find((g) => g.subjectId === subjectId) ?? null,
    [goals],
  );

  const globalGoal = goals.find((g) => g.subjectId === null) ?? null;
  const subjectGoals = goals.filter((g) => g.subjectId !== null);

  return { goals, globalGoal, subjectGoals, addGoal, removeGoal, getGoal };
}
