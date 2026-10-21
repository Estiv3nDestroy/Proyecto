/**
 * ============================================================================
 *  LOGROS E INSIGNIAS
 * ============================================================================
 * Detecta qué insignias ha desbloqueado el estudiante según sus materias
 * y sesiones de estudio. No es invasivo: solo muestra lo conseguido.
 */

import type { Achievement, StudySession, Subject } from "../types/academic";
import { evaluateSubject } from "./subjectStatus";

/** Catálogo de todas las insignias disponibles. */
export const ACHIEVEMENT_CATALOG: Omit<Achievement, "unlockedAt">[] = [
  {
    id: "first-subject",
    name: "Primer paso",
    description: "Creaste tu primera materia.",
    icon: "pencil",
  },
  {
    id: "three-subjects",
    name: "Carga completa",
    description: "Tienes 3 o más materias registradas.",
    icon: "books",
  },
  {
    id: "all-cuts-complete",
    name: "Cortes al día",
    description: "Completaste los 3 cortes de al menos una materia.",
    icon: "check",
  },
  {
    id: "goal-met",
    name: "Meta cumplida",
    description: "Aprobaste al menos una materia.",
    icon: "star",
  },
  {
    id: "five-passing",
    name: "Estrella dorada",
    description: "Aprobaste 5 o más materias.",
    icon: "medal",
  },
  {
    id: "first-pomodoro",
    name: "Enfocado",
    description: "Completaste tu primera sesión de estudio.",
    icon: "timer",
  },
  {
    id: "study-marathon",
    name: "Maratonista",
    description: "Estudiaste más de 120 minutos en total.",
    icon: "fire",
  },
  {
    id: "perfectionist",
    name: "Perfeccionista",
    description: "Sacaste la nota máxima en un corte.",
    icon: "crown",
  },
];

/** Evalúa cuáles insignias están desbloqueadas. */
export function evaluateAchievements(
  subjects: Subject[],
  studySessions: StudySession[],
  existingUnlocked: Record<string, number | null> = {},
): Achievement[] {
  const unlocked: Record<string, number | null> = { ...existingUnlocked };

  const hasSubjects = subjects.length >= 1;
  const hasThree = subjects.length >= 3;
  const hasAllCuts = subjects.some((s) =>
    Object.values(s.grades).every((g) => g !== null),
  );
  const hasPassed = subjects.some((s) => {
    const eval_ = evaluateSubject(s.config, s.grades);
    return eval_.finalAverage !== null && eval_.finalAverage >= s.config.minPassingGrade;
  });
  const passingCount = subjects.filter((s) => {
    const eval_ = evaluateSubject(s.config, s.grades);
    return eval_.finalAverage !== null && eval_.finalAverage >= s.config.minPassingGrade;
  }).length;
  const hasFivePassing = passingCount >= 5;
  const hasFirstPomodoro = studySessions.length >= 1;
  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const hasMarathon = totalStudyMinutes >= 120;
  const hasPerfectScore = subjects.some((s) =>
    Object.values(s.grades).some((g) => g !== null && g >= s.config.maxGrade),
  );

  const checks: Record<string, boolean> = {
    "first-subject": hasSubjects,
    "three-subjects": hasThree,
    "all-cuts-complete": hasAllCuts,
    "goal-met": hasPassed,
    "five-passing": hasFivePassing,
    "first-pomodoro": hasFirstPomodoro,
    "study-marathon": hasMarathon,
    perfectionist: hasPerfectScore,
  };

  for (const [id, isUnlocked] of Object.entries(checks)) {
    if (isUnlocked && unlocked[id] === null) {
      unlocked[id] = Date.now();
    }
  }

  return ACHIEVEMENT_CATALOG.map((badge) => ({
    ...badge,
    unlockedAt: unlocked[badge.id] ?? null,
  }));
}

/** Cuenta cuántas insignias están desbloqueadas. */
export function countUnlocked(achievements: Achievement[]): number {
  return achievements.filter((a) => a.unlockedAt !== null).length;
}
