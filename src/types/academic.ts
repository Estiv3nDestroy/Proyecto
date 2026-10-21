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
}

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
