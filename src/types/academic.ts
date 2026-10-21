/**
 * ============================================================================
 *  TIPOS DEL DOMINIO ACADÉMICO
 * ============================================================================
 * Este archivo centraliza el modelo de datos del sistema de proyección de
 * notas y la nueva calculadora de cortes.
 */

/** Identificador de cada corte académico del semestre. */
export type CutId = "corte1" | "corte2" | "corte3";

/** Peso porcentual (0-100) de un corte dentro de la nota final. */
export interface CutWeight {
  id: CutId;
  label: string;
  /** Porcentaje que aporta este corte a la nota final (0-100). */
  weight: number;
  /** Sub-evaluaciones opcionales (formativas, parciales, talleres, etc.) */
  assessments?: CutAssessment[];
}

/** Evaluación interna de un corte (para la calculadora detallada). */
export interface CutAssessment {
  id: string;
  /** Nombre editable (ej. "Formativa", "Parcial", "Laboratorios"). */
  name: string;
  /** Peso porcentual dentro del corte (0-100). */
  weight: number;
  /** Nota ingresada (0 hasta la escala máxima). */
  grade: number | null;
}

/** Notas del corte. `null` indica que aún no se registra. */
export type GradesRecord = Record<CutId, number | null>;

/** Escala de calificación más usada en universidades. */
export type ScalePreset = "zero-to-five" | "zero-to-ten" | "zero-to-hundred" | "custom";

/** Configuración académica de una materia. */
export interface AcademicConfig {
  maxGrade: number;
  minPassingGrade: number;
  scalePreset: ScalePreset;
  cuts: [CutWeight, CutWeight, CutWeight];
}

/** Una materia completa: configuración + notas ingresadas. */
export interface Subject {
  id: string;
  name: string;
  config: AcademicConfig;
  grades: GradesRecord;
  createdAt: number;
  /** Créditos académicos de la materia (para promedio ponderado). Default: 3. */
  credits?: number;
  /** ID del semestre al que pertenece. Si es null/undefined, es "general". */
  semesterId?: string | null;
}

/** Un semestre académico (ej. "2026-1", "2026-2"). */
export interface Semester {
  id: string;
  name: string;
  isArchived: boolean;
  createdAt: number;
}

/** Nivel de riesgo de una materia para el plan de estudio. */
export type RiskLevel = "green" | "yellow" | "red";

/** Item de agenda: examen, entrega o presentación con fecha. */
export interface AgendaItem {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  type: "exam" | "assignment" | "presentation" | "other";
  isDone: boolean;
}

/** Sesión de estudio registrada por el temporizador Pomodoro. */
export interface StudySession {
  id: string;
  subjectId: string;
  durationMinutes: number;
  date: string;
}

/** Meta académica: por materia o global. */
export interface Goal {
  id: string;
  subjectId: string | null;
  targetGrade: number;
}

/** Insignia/logro desbloqueable. */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
}

/** Foto del promedio en un momento dado (para el historial). */
export interface GradeSnapshot {
  id: string;
  date: string;
  semesterId: string | null;
  average: number;
  subjectCount: number;
}

/** Escenario hipotético para el simulador "¿y si?". */
export interface WhatIfScenario {
  cutId: CutId;
  hypotheticalGrade: number;
}

/** Resultado del simulador "¿y si?". */
export interface WhatIfResult {
  projectedFinal: number;
  wouldPass: boolean;
  deltaFromCurrent: number;
}

/** Tipo de escenario preestablecido. */
export type ScenarioPreset = "best" | "worst" | "realistic";

/** Resultado de una validación genérica dentro del sistema. */
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/** Severidad para alertas visuales. */
export type AlertLevel = "success" | "info" | "warning" | "danger";

/** Estado global de viabilidad de aprobación de la materia. */
export type FeasibilityStatus =
  | "already-passed"
  | "in-progress"
  | "impossible"
  | "completed-passed"
  | "completed-failed";

/** Resultado consolidado del motor de cálculo para una materia. */
export interface CalculationResult {
  knownCutsCount: number;
  knownWeightedSum: number;
  knownWeightTotal: number;
  remainingWeightTotal: number;
  partialAverage: number | null;
  finalAverage: number | null;
  bestPossibleAverage: number;
  status: FeasibilityStatus;
}

/** Resultado de la calculadora de cortes (desglose interno). */
export interface CutCalculatorResult {
  cutId: CutId;
  /** Nota consolidada del corte (sólo cuando las sub-notas suman 100%). */
  computedGrade: number | null;
  /** Suma actual de los porcentajes de las sub-evaluaciones. */
  weightTotal: number;
  /** Si las sub-notas están completas y suman 100%. */
  isComplete: boolean;
}
