/**
 * ============================================================================
 *  CÁLCULOS DE SEMESTRE Y PROMEDIO PONDERADO POR CRÉDITOS
 * ============================================================================
 * Funciones puras para calcular promedios a nivel semestre y acumulado,
 * ponderando por los créditos de cada materia.
 */

import type { Semester, Subject } from "../types/academic";
import { evaluateSubject } from "./subjectStatus";
import { roundGrade } from "./gradeMath";

/** Créditos por defecto si una materia no los tiene definidos. */
export const DEFAULT_CREDITS = 3;

/** Obtiene los créditos de una materia (con fallback al default). */
export function getCredits(subject: Subject): number {
  return subject.credits ?? DEFAULT_CREDITS;
}

/** Materiaias que pertenecen a un semestre específico (o sin semestre si semesterId es null). */
export function subjectsInSemester(subjects: Subject[], semesterId: string | null): Subject[] {
  return subjects.filter((s) => (s.semesterId ?? null) === semesterId);
}

/** Materias que pertenecen a un semestre por su ID. */
export function subjectsBySemesterId(subjects: Subject[], semesterId: string): Subject[] {
  return subjects.filter((s) => s.semesterId === semesterId);
}

/** Valor numérico representativo de una materia: final si está completa, parcial si no. */
export function subjectRepresentativeValue(subject: Subject): number | null {
  const evaluation = evaluateSubject(subject.config, subject.grades);
  return evaluation.finalAverage ?? evaluation.partialAverage;
}

/**
 * Promedio simple (aritmético) de un conjunto de materias.
 * Solo considera materias que tienen al menos una nota.
 */
export function simpleAverage(subjects: Subject[]): number {
  const withData = subjects.filter((s) => subjectRepresentativeValue(s) !== null);
  if (withData.length === 0) return 0;
  const sum = withData.reduce((acc, s) => acc + (subjectRepresentativeValue(s) ?? 0), 0);
  return roundGrade(sum / withData.length);
}

/**
 * Promedio ponderado por créditos de cada materia.
 * Solo considera materias que tienen al menos una nota registrada.
 *
 *   promedio_ponderado = Σ (nota_i × créditos_i) / Σ créditos_i
 */
export function creditWeightedAverage(subjects: Subject[]): number {
  const withData = subjects
    .filter((s) => subjectRepresentativeValue(s) !== null)
    .map((s) => ({ value: subjectRepresentativeValue(s) ?? 0, credits: getCredits(s) }));

  if (withData.length === 0) return 0;

  const totalCredits = withData.reduce((sum, item) => sum + item.credits, 0);
  if (totalCredits <= 0) return 0;

  const weightedSum = withData.reduce((sum, item) => sum + item.value * item.credits, 0);
  return roundGrade(weightedSum / totalCredits);
}

/** Promedio ponderado por créditos de un semestre específico. */
export function semesterAverage(subjects: Subject[], semester: Semester): number {
  const semesterSubjects = subjectsBySemesterId(subjects, semester.id);
  return creditWeightedAverage(semesterSubjects);
}

/**
 * Promedio acumulado ponderado por créditos de todos los semestres
 * no archivados (activos).
 */
export function accumulatedAverage(subjects: Subject[], semesters: Semester[]): number {
  const activeSemesterIds = semesters.filter((s) => !s.isArchived).map((s) => s.id);
  const activeSubjects = subjects.filter(
    (s) => s.semesterId && activeSemesterIds.includes(s.semesterId),
  );
  return creditWeightedAverage(activeSubjects);
}

/** Total de créditos de materias con notas en un semestre. */
export function semesterCredits(subjects: Subject[], semesterId: string): number {
  return subjectsBySemesterId(subjects, semesterId)
    .filter((s) => subjectRepresentativeValue(s) !== null)
    .reduce((sum, s) => sum + getCredits(s), 0);
}

/** Cuenta cuántas materias están aprobando en un semestre. */
export function passingCount(subjects: Subject[], semesterId: string): number {
  return subjectsBySemesterId(subjects, semesterId).filter((s) => {
    const value = subjectRepresentativeValue(s);
    return value !== null && value >= s.config.minPassingGrade;
  }).length;
}

/** Progreso del semestre: porcentaje de cortes con nota sobre el total de cortes. */
export function semesterProgress(subjects: Subject[], semesterId: string): number {
  const semesterSubjects = subjectsBySemesterId(subjects, semesterId);
  if (semesterSubjects.length === 0) return 0;
  const totalCuts = semesterSubjects.length * 3;
  const filledCuts = semesterSubjects.reduce(
    (sum, s) => sum + Object.values(s.grades).filter((g) => g !== null).length,
    0,
  );
  return totalCuts === 0 ? 0 : Math.round((filledCuts / totalCuts) * 100);
}
