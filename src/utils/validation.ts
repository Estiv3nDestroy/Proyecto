/**
 * ============================================================================
 *  CAPA DE VALIDACIÓN DE ENTRADAS
 * ============================================================================
 * Centraliza el control estricto de errores: campos vacíos, strings no
 * numéricos, rangos inválidos y sumas porcentuales incorrectas. Cada función
 * tiene una única responsabilidad y retorna un `ValidationResult` uniforme
 * para que la UI pueda reaccionar de forma consistente.
 */

import type { CutWeight, ValidationResult } from "../types/academic";
import { isGradeInRange, isValidWeightDistribution, sumWeights } from "./gradeMath";

/**
 * Convierte de forma segura un texto ingresado por el usuario en un número.
 * Retorna `null` si el texto está vacío o no representa un número válido,
 * evitando que `NaN` se propague por el resto del sistema.
 */
export function parseNumericInput(rawValue: string): number | null {
  const normalized = rawValue.trim().replace(",", ".");
  if (normalized === "") return null;

  const parsed = Number(normalized);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return null;

  return parsed;
}

/** Valida que la nota máxima de la escala sea un número razonable. */
export function validateMaxGrade(maxGrade: number): ValidationResult {
  if (!Number.isFinite(maxGrade) || maxGrade <= 0) {
    return { valid: false, message: "La nota máxima debe ser un número mayor a 0." };
  }
  if (maxGrade > 1000) {
    return { valid: false, message: "La nota máxima ingresada es demasiado alta." };
  }
  return { valid: true };
}

/** Valida que la nota mínima aprobatoria sea coherente con la escala. */
export function validateMinPassingGrade(minPassingGrade: number, maxGrade: number): ValidationResult {
  if (!Number.isFinite(minPassingGrade)) {
    return { valid: false, message: "Ingresa un valor numérico para la nota mínima." };
  }
  if (minPassingGrade <= 0) {
    return { valid: false, message: "La nota mínima aprobatoria debe ser mayor a 0." };
  }
  if (minPassingGrade >= maxGrade) {
    return {
      valid: false,
      message: `La nota mínima debe ser menor que la nota máxima de la escala (${maxGrade}).`,
    };
  }
  return { valid: true };
}

/** Valida que los 3 cortes sumen exactamente 100% y que cada peso sea razonable. */
export function validateCutWeights(cuts: CutWeight[]): ValidationResult {
  for (const cut of cuts) {
    if (!Number.isFinite(cut.weight) || cut.weight <= 0) {
      return { valid: false, message: `El peso de "${cut.label}" debe ser mayor a 0%.` };
    }
    if (cut.weight > 100) {
      return { valid: false, message: `El peso de "${cut.label}" no puede superar el 100%.` };
    }
  }

  if (!isValidWeightDistribution(cuts)) {
    const total = sumWeights(cuts);
    return {
      valid: false,
      message: `Los porcentajes deben sumar exactamente 100%. Actualmente suman ${total.toFixed(1)}%.`,
    };
  }

  return { valid: true };
}

/** Valida una nota puntual ingresada por el usuario contra la escala vigente. */
export function validateGradeInput(grade: number | null, maxGrade: number): ValidationResult {
  if (grade === null) {
    return { valid: false, message: "Debes ingresar un valor numérico para la nota." };
  }
  if (!isGradeInRange(grade, maxGrade)) {
    return {
      valid: false,
      message: `La nota debe estar entre 0 y ${maxGrade}.`,
    };
  }
  return { valid: true };
}

/** Valida que el nombre de la materia no esté vacío. */
export function validateSubjectName(name: string): ValidationResult {
  if (name.trim().length === 0) {
    return { valid: false, message: "El nombre de la materia no puede estar vacío." };
  }
  if (name.trim().length > 60) {
    return { valid: false, message: "El nombre de la materia es demasiado largo (máx. 60 caracteres)." };
  }
  return { valid: true };
}
