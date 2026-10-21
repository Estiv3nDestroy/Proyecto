/**
 * ============================================================================
 *  EVALUACIÓN DE RIESGO ACADÉMICO POR MATERIA
 * ============================================================================
 * Clasifica cada materia en verde / amarillo / rojo según su estado actual
 * y genera un mensaje corto y amable para el estudiante.
 */

import type { RiskLevel, Subject } from "../types/academic";
import { evaluateSubject } from "./subjectStatus";
import { calculateRequiredGrade, roundGrade } from "./gradeMath";

export interface RiskAssessment {
  level: RiskLevel;
  message: string;
  /** Nota necesaria en el siguiente corte pendiente para aprobar (si aplica). */
  neededGrade: number | null;
  /** Es viable o no aprobar la materia. */
  isViable: boolean;
}

/**
 * Evalúa el nivel de riesgo de una materia:
 *
 * - VERDE: Ya aprobada, o matemáticamente asegurada.
 * - AMARILLO: En progreso, viable, pero necesita esfuerzo.
 * - ROJO: Imposible aprobar, o en progreso con riesgo alto.
 */
export function assessRisk(subject: Subject): RiskAssessment {
  const evaluation = evaluateSubject(subject.config, subject.grades);
  const { status, knownWeightedSum, bestPossibleAverage } = evaluation;
  const { minPassingGrade, maxGrade } = subject.config;

  // Ya completó la materia
  if (status === "completed-passed") {
    return {
      level: "green",
      message: `¡Aprobaste con ${evaluation.finalAverage?.toFixed(2)}! Descansa, ya está.`,
      neededGrade: null,
      isViable: true,
    };
  }

  if (status === "completed-failed") {
    return {
      level: "red",
      message: `Reprobaste con ${evaluation.finalAverage?.toFixed(2)}. Habla con tu profe sobre opciones.`,
      neededGrade: null,
      isViable: false,
    };
  }

  // Matemáticamente asegurada (aun con 0 en lo que falta aprueba)
  if (status === "already-passed") {
    return {
      level: "green",
      message: "Vas tan bien que incluso con 0 en lo que falta apruebas. ¡Tranquilo!",
      neededGrade: null,
      isViable: true,
    };
  }

  // Imposible: ni con la nota máxima se alcanza el mínimo
  if (status === "impossible") {
    return {
      level: "red",
      message: `Aunque saques ${maxGrade} en lo que falta, no llegas a ${minPassingGrade}. Habla con tu profe cuanto antes.`,
      neededGrade: null,
      isViable: false,
    };
  }

  // En progreso: calcular qué necesita en el siguiente corte pendiente
  const missingCuts = subject.config.cuts.filter((c) => subject.grades[c.id] === null);
  if (missingCuts.length === 0) {
    return {
      level: evaluation.finalAverage !== null && evaluation.finalAverage >= minPassingGrade ? "green" : "red",
      message: evaluation.finalAverage !== null && evaluation.finalAverage >= minPassingGrade
        ? "Materia completada y aprobada."
        : "Materia completada pero no aprobada.",
      neededGrade: null,
      isViable: evaluation.finalAverage !== null && evaluation.finalAverage >= minPassingGrade,
    };
  }

  const nextCut = missingCuts[0];
  let neededGrade: number | null = null;
  try {
    neededGrade = roundGrade(
      calculateRequiredGrade(minPassingGrade, knownWeightedSum, nextCut.weight),
    );
  } catch {
    neededGrade = null;
  }

  // Determinar nivel de riesgo en progreso
  const margin = bestPossibleAverage - minPassingGrade;

  if (neededGrade !== null && neededGrade <= 0) {
    return {
      level: "green",
      message: "Ya aseguraste la materia. Lo que viene es bonus.",
      neededGrade: 0,
      isViable: true,
    };
  }

  if (neededGrade !== null && neededGrade > maxGrade) {
    return {
      level: "red",
      message: `Necesitas ${neededGrade.toFixed(2)} en ${nextCut.label}, pero el máximo es ${maxGrade}. Va a estar difícil.`,
      neededGrade,
      isViable: false,
    };
  }

  // Amarillo si necesita más del 80% del máximo para aprobar
  const threshold = maxGrade * 0.8;
  if (neededGrade !== null && neededGrade > threshold) {
    return {
      level: "yellow",
      message: `Necesitas ${neededGrade.toFixed(2)} en ${nextCut.label}. Está difícil pero se puede.`,
      neededGrade,
      isViable: true,
    };
  }

  // Verde si el margen es holgado, amarillo si está ajustado
  if (margin >= maxGrade * 0.3) {
    return {
      level: "green",
      message: `Vas bien. Necesitas ${neededGrade?.toFixed(2)} en ${nextCut.label} para aprobar.`,
      neededGrade,
      isViable: true,
    };
  }

  return {
    level: "yellow",
    message: `Vas mejorando. Necesitas ${neededGrade?.toFixed(2)} en ${nextCut.label}. ¡Tú puedes!`,
    neededGrade,
    isViable: true,
  };
}

/** Color CSS asociado a cada nivel de riesgo. */
export const RISK_COLORS: Record<RiskLevel, string> = {
  green: "var(--pass)",
  yellow: "var(--risk)",
  red: "var(--fail)",
};

/** Etiqueta corta para cada nivel. */
export const RISK_LABELS: Record<RiskLevel, string> = {
  green: "Sin riesgo",
  yellow: "Atención",
  red: "Crítico",
};
