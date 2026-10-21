/**
 * ============================================================================
 *  EVALUACIÓN PURA DE UNA MATERIA (sin dependencias de React)
 * ============================================================================
 * Esta función concentra la regla de negocio que determina, a partir de la
 * configuración y las notas registradas, los indicadores clave de una
 * materia. Al ser una función pura puede reutilizarse tanto dentro de un
 * hook memoizado (detalle de la materia seleccionada) como en bucles de
 * renderizado (resumen rápido en la barra lateral de materias).
 */

import type { AcademicConfig, CalculationResult, FeasibilityStatus, GradesRecord } from "../types/academic";
import {
  calculateBestPossibleAverage,
  calculateFinalAverage,
  calculateKnownContributions,
  calculatePartialAverage,
  roundGrade,
} from "./gradeMath";

/**
 * Deriva el estado de viabilidad académica a partir del promedio mejor-caso
 * y, cuando aplica, del promedio final ya consolidado.
 */
function resolveFeasibilityStatus(params: {
  knownCutsCount: number;
  bestPossibleAverage: number;
  worstPossibleAverage: number;
  minPassingGrade: number;
  finalAverage: number | null;
}): FeasibilityStatus {
  const { knownCutsCount, bestPossibleAverage, worstPossibleAverage, minPassingGrade, finalAverage } = params;

  if (knownCutsCount === 3 && finalAverage !== null) {
    return finalAverage >= minPassingGrade ? "completed-passed" : "completed-failed";
  }

  // Si incluso en el peor escenario (0 en los cortes pendientes) ya se
  // alcanza la nota mínima, la materia está matemáticamente asegurada.
  if (worstPossibleAverage >= minPassingGrade) {
    return "already-passed";
  }

  if (bestPossibleAverage < minPassingGrade) {
    return "impossible";
  }

  return "in-progress";
}

/**
 * Calcula todos los indicadores académicos derivados del estado actual de
 * una materia: promedio parcial, mejor escenario posible y estado general
 * de viabilidad.
 */
export function evaluateSubject(config: AcademicConfig, grades: GradesRecord): CalculationResult {
  const { weightedSum, weightTotal, count } = calculateKnownContributions(grades, config.cuts);
  const remainingWeightTotal = roundGrade(100 - weightTotal);
  const partialAverage = calculatePartialAverage(weightedSum, weightTotal);

  const finalAverage = count === 3 ? calculateFinalAverage(grades, config.cuts) : null;

  const bestPossibleAverage =
    count === 3 && finalAverage !== null
      ? finalAverage
      : calculateBestPossibleAverage(weightedSum, remainingWeightTotal, config.maxGrade);

  const status = resolveFeasibilityStatus({
    knownCutsCount: count,
    bestPossibleAverage,
    worstPossibleAverage: weightedSum,
    minPassingGrade: config.minPassingGrade,
    finalAverage,
  });

  return {
    knownCutsCount: count,
    knownWeightedSum: roundGrade(weightedSum),
    knownWeightTotal: weightTotal,
    remainingWeightTotal,
    partialAverage: partialAverage !== null ? roundGrade(partialAverage) : null,
    finalAverage: finalAverage !== null ? roundGrade(finalAverage) : null,
    bestPossibleAverage: roundGrade(bestPossibleAverage),
    status,
  };
}
