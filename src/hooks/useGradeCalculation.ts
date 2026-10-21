import { useMemo } from "react";
import type { AcademicConfig, GradesRecord } from "../types/academic";
import { evaluateSubject } from "../utils/subjectStatus";

/**
 * Hook que calcula, de forma reactiva (useMemo), todos los indicadores
 * académicos derivados del estado actual de una materia: promedio parcial,
 * mejor escenario posible y estado general de viabilidad.
 *
 * Delega el cálculo puro en `evaluateSubject` (utils/subjectStatus.ts) para
 * poder reutilizar exactamente la misma lógica fuera de React (por ejemplo,
 * al listar el estado rápido de varias materias en la barra lateral).
 */
export function useGradeCalculation(config: AcademicConfig, grades: GradesRecord) {
  return useMemo(() => evaluateSubject(config, grades), [config, grades]);
}
