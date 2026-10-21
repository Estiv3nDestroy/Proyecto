import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { evaluateAchievements, countUnlocked } from "../utils/achievements";
import type { StudySession, Subject } from "../types/academic";

const UNLOCKED_KEY = "notaminima::achievements-unlocked";

export function useAchievements(subjects: Subject[], studySessions: StudySession[]) {
  const [unlockedMap, setUnlockedMap] = useLocalStorage<Record<string, number | null>>(
    UNLOCKED_KEY,
    {},
  );

  const achievements = useMemo(
    () => evaluateAchievements(subjects, studySessions, unlockedMap),
    [subjects, studySessions, unlockedMap],
  );

  const unlockedCount = useMemo(() => countUnlocked(achievements), [achievements]);

  const newlyUnlocked = useMemo(
    () => achievements.filter((a) => {
      const wasUnlocked = unlockedMap[a.id] !== undefined && unlockedMap[a.id] !== null;
      return a.unlockedAt !== null && !wasUnlocked;
    }),
    [achievements, unlockedMap],
  );

  const syncUnlocked = useCallback(() => {
    const newMap: Record<string, number | null> = {};
    for (const a of achievements) {
      newMap[a.id] = a.unlockedAt;
    }
    setUnlockedMap(newMap);
  }, [achievements, setUnlockedMap]);

  return { achievements, unlockedCount, newlyUnlocked, syncUnlocked };
}
