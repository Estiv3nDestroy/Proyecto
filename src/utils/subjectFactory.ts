/**
 * ============================================================================
 *  FÁBRICA DE MATERIAS, CORTES Y CONFIGURACIONES POR DEFECTO
 * ============================================================================
 * Aísla la creación de entidades por defecto para que el resto del sistema
 * no dependa de valores "mágicos" repetidos en múltiples lugares.
 */

import type { AcademicConfig, CutAssessment, ScalePreset, Subject } from "../types/academic";

/** Genera un identificador único robusto (con fallback si el entorno no soporta crypto.randomUUID). */
export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Presets de escala más comunes en universidades de Latinoamérica. */
export const SCALE_PRESETS: Record<Exclude<ScalePreset, "custom">, { maxGrade: number; minPassingGrade: number; label: string }> = {
  "zero-to-five": { maxGrade: 5, minPassingGrade: 3.0, label: "Escala 0.0 – 5.0 (estándar Latam)" },
  "zero-to-ten": { maxGrade: 10, minPassingGrade: 6.0, label: "Escala 0.0 – 10.0" },
  "zero-to-hundred": { maxGrade: 100, minPassingGrade: 60, label: "Escala 0 – 100 (porcentual)" },
};

/** Crea las evaluaciones internas por defecto de un corte (Formativa 60% / Parcial 40%). */
export function createDefaultAssessments(): CutAssessment[] {
  return [
    {
      id: generateId(),
      name: "Formativa",
      weight: 60,
      grade: null,
    },
    {
      id: generateId(),
      name: "Parcial",
      weight: 40,
      grade: null,
    },
  ];
}

/** Configuración académica por defecto (escala 0.0 – 5.0, cortes 30/30/40). */
export function createDefaultConfig(): AcademicConfig {
  return {
    maxGrade: 5,
    minPassingGrade: 3.0,
    scalePreset: "zero-to-five",
    cuts: [
      { id: "corte1", label: "Corte 1", weight: 30, assessments: createDefaultAssessments() },
      { id: "corte2", label: "Corte 2", weight: 30, assessments: createDefaultAssessments() },
      { id: "corte3", label: "Corte 3", weight: 40, assessments: createDefaultAssessments() },
    ],
  };
}

/** Crea una materia nueva con configuración por defecto y notas vacías. */
export function createSubject(name: string): Subject {
  return {
    id: generateId(),
    name,
    config: createDefaultConfig(),
    grades: { corte1: null, corte2: null, corte3: null },
    createdAt: Date.now(),
  };
}
