import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { generateId } from "../utils/subjectFactory";
import type { StudySession } from "../types/academic";

const SESSIONS_KEY = "notaminima::study-sessions";
const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds

export type PomodoroState = "idle" | "running" | "paused" | "completed";

export function usePomodoro(subjectId: string | null) {
  const [sessions, setSessions] = useLocalStorage<StudySession[]>(SESSIONS_KEY, []);
  const [state, setState] = useState<PomodoroState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | undefined>(undefined);

  const totalSeconds = POMODORO_DURATION;
  const remaining = totalSeconds - elapsed;
  const progress = Math.min(100, (elapsed / totalSeconds) * 100);

  useEffect(() => {
    if (state === "running") {
      intervalRef.current = window.setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= totalSeconds) {
            window.clearInterval(intervalRef.current);
            setState("completed");
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [state, totalSeconds]);

  const start = useCallback(() => {
    setElapsed(0);
    setState("running");
  }, []);

  const pause = useCallback(() => setState("paused"), []);
  const resume = useCallback(() => setState("running"), []);

  const reset = useCallback(() => {
    setState("idle");
    setElapsed(0);
  }, []);

  const recordSession = useCallback(
    (durationMinutes: number) => {
      if (!subjectId || durationMinutes <= 0) return;
      const session: StudySession = {
        id: generateId(),
        subjectId,
        durationMinutes,
        date: new Date().toISOString(),
      };
      setSessions((prev) => [...prev, session]);
    },
    [subjectId, setSessions],
  );

  const completeAndRecord = useCallback(() => {
    const minutes = Math.round(elapsed / 60);
    recordSession(minutes);
    setState("idle");
    setElapsed(0);
  }, [elapsed, recordSession]);

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const subjectMinutes = sessions
    .filter((s) => s.subjectId === subjectId)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  return {
    sessions,
    state,
    elapsed,
    remaining,
    progress,
    totalSeconds,
    start,
    pause,
    resume,
    reset,
    completeAndRecord,
    totalMinutes,
    subjectMinutes,
  };
}
