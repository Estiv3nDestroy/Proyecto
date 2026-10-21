/**
 * ============================================================================
 *  SIMULADOR "¿Y SI?" — PROYECCIÓN HIPOTÉTICA EN TIEMPO REAL
 * ============================================================================
 * Permite al estudiante ajustar sliders con notas hipotéticas en los cortes
 * pendientes y ver cómo cambia la nota final. Incluye escenarios preestablecidos
 * (mejor caso, peor caso, realista).
 */

import type {
  AcademicConfig,
  GradesRecord,
  ScenarioPreset,
  WhatIfResult,
  WhatIfScenario,
} from "../types/academic";
import { calculateFinalAverage, gradeContribution, roundGrade } from "./gradeMath";

/**
 * Calcula la nota final proyectada dado un conjunto de cortes con notas
 * hipotéticas reemplazando/sumando a las notas reales ya registradas.
 */
export function simulateWhatIf(
  config: AcademicConfig,
  grades: GradesRecord,
  scenarios: WhatIfScenario[],
): WhatIfResult {
  const merged: GradesRecord = { ...grades };
  for (const scenario of scenarios) {
    merged[scenario.cutId] = scenario.hypotheticalGrade;
  }

  const projectedFinal = roundGrade(calculateFinalAverage(merged, config.cuts));
  const currentFinal = calculateCurrentFinal(config, grades);
  const deltaFromCurrent = roundGrade(projectedFinal - currentFinal);

  return {
    projectedFinal,
    wouldPass: projectedFinal >= config.minPassingGrade,
    deltaFromCurrent,
  };
}

/** Nota final actual con lo que se tiene (asumiendo 0 en cortes sin nota). */
function calculateCurrentFinal(config: AcademicConfig, grades: GradesRecord): number {
  return roundGrade(calculateFinalAverage(grades, config.cuts));
}

/**
 * Genera escenarios preestablecidos para los cortes pendientes.
 *
 * - best: nota máxima en todos los cortes pendientes
 * - worst: nota 0 en todos los cortes pendientes
 * - realistic: promedio de las notas conocidas extrapolado a los cortes pendientes
 */
export function generatePresetScenarios(
  config: AcademicConfig,
  grades: GradesRecord,
  preset: ScenarioPreset,
): WhatIfScenario[] {
  const missingCuts = config.cuts.filter((c) => grades[c.id] === null);
  const knownGrades = config.cuts
    .filter((c) => grades[c.id] !== null)
    .map((c) => grades[c.id] as number);

  const knownAverage =
    knownGrades.length > 0
      ? knownGrades.reduce((sum, g) => sum + g, 0) / knownGrades.length
      : config.minPassingGrade;

  return missingCuts.map((cut) => {
    let hypotheticalGrade: number;

    switch (preset) {
      case "best":
        hypotheticalGrade = config.maxGrade;
        break;
      case "worst":
        hypotheticalGrade = 0;
        break;
      case "realistic":
        hypotheticalGrade = roundGrade(knownAverage);
        break;
    }

    return {
      cutId: cut.id,
      hypotheticalGrade,
    };
  });
}

/** Nota sugerida para un slider, basada en el promedio actual. */
export function suggestedSliderValue(config: AcademicConfig, grades: GradesRecord): number {
  const knownGrades = config.cuts
    .filter((c) => grades[c.id] !== null)
    .map((c) => grades[c.id] as number);

  if (knownGrades.length === 0) return config.minPassingGrade;
  const avg = knownGrades.reduce((sum, g) => sum + g, 0) / knownGrades.length;
  return roundGrade(Math.min(avg, config.maxGrade));
}

/**
 * Calcula cuánto cambiaría la nota final si se asigna una nota específica
 * a un corte individual pendiente.
 */
export function simulateSingleCut(
  config: AcademicConfig,
  grades: GradesRecord,
  cutId: string,
  hypotheticalGrade: number,
): number {
  const merged: GradesRecord = { ...grades, [cutId]: hypotheticalGrade };
  return roundGrade(calculateFinalAverage(merged, config.cuts));
}

/**
 * Nota exacta necesaria en un corte pendiente para alcanzar la nota mínima.
 */
export function gradeNeededInCut(
  config: AcademicConfig,
  grades: GradesRecord,
  cutId: string,
): number | null {
  const cut = config.cuts.find((c) => c.id === cutId);
  if (!cut) return null;
  if (grades[cutId] !== null) return null;

  const knownContribution = config.cuts
    .filter((c) => grades[c.id] !== null)
    .reduce((sum, c) => sum + gradeContribution(grades[c.id] as number, c.weight), 0);

  const needed = (config.minPassingGrade - knownContribution) / (cut.weight / 100);
  return roundGrade(needed);
}
