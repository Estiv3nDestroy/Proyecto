/**
 * ============================================================================
 *  EXPORTACIÓN E IMPORTACIÓN DE DATOS (RESPALDO JSON)
 * ============================================================================
 * Permite al estudiante exportar todos sus datos en un archivo JSON y
 * reimportarlos, validando la estructura antes de aplicarlos.
 */

import type { Subject } from "../types/academic";
import { generateId } from "./subjectFactory";

/** Estructura del archivo de respaldo. */
export interface BackupData {
  version: number;
  exportedAt: string;
  subjects: Subject[];
}

const BACKUP_VERSION = 1;

/** Genera el objeto de respaldo a partir de las materias actuales. */
export function createBackup(subjects: Subject[]): BackupData {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    subjects: subjects.map((s) => ({ ...s })),
  };
}

/** Convierte el respaldo a string JSON para descargar. */
export function serializeBackup(subjects: Subject[]): string {
  return JSON.stringify(createBackup(subjects), null, 2);
}

/** Resultado de validación de importación. */
export interface ImportResult {
  valid: boolean;
  subjects: Subject[];
  error?: string;
}

/**
 * Valida y parsea un archivo de respaldo importado.
 * Comprueba versión, estructura y cada materia.
 */
export function parseBackup(rawJson: string): ImportResult {
  let data: unknown;

  try {
    data = JSON.parse(rawJson);
  } catch {
    return { valid: false, subjects: [], error: "El archivo no es JSON válido." };
  }

  if (typeof data !== "object" || data === null) {
    return { valid: false, subjects: [], error: "El archivo no tiene la estructura esperada." };
  }

  const backup = data as Partial<BackupData>;

  if (backup.version !== BACKUP_VERSION) {
    return {
      valid: false,
      subjects: [],
      error: `Versión del archivo (${backup.version}) no soportada. La versión actual es ${BACKUP_VERSION}.`,
    };
  }

  if (!Array.isArray(backup.subjects)) {
    return { valid: false, subjects: [], error: "El archivo no contiene lista de materias." };
  }

  const subjects: Subject[] = [];
  for (let i = 0; i < backup.subjects.length; i++) {
    const item = backup.subjects[i];
    const validation = validateImportedSubject(item, i);
    if (!validation.valid) {
      return { valid: false, subjects: [], error: validation.error };
    }
    subjects.push(validation.subject as Subject);
  }

  return { valid: true, subjects };
}

interface SubjectValidation {
  valid: boolean;
  subject?: Subject;
  error?: string;
}

function validateImportedSubject(item: unknown, index: number): SubjectValidation {
  if (typeof item !== "object" || item === null) {
    return { valid: false, error: `Materia #${index + 1}: no es un objeto válido.` };
  }

  const s = item as Partial<Subject>;

  if (typeof s.id !== "string" || s.id.length === 0) {
    return { valid: false, error: `Materia #${index + 1}: ID inválido.` };
  }
  if (typeof s.name !== "string" || s.name.trim().length === 0) {
    return { valid: false, error: `Materia #${index + 1}: nombre inválido.` };
  }
  if (typeof s.createdAt !== "number") {
    return { valid: false, error: `Materia #${index + 1}: fecha de creación inválida.` };
  }
  if (typeof s.config !== "object" || s.config === null) {
    return { valid: false, error: `Materia #${index + 1}: configuración inválida.` };
  }
  if (typeof s.grades !== "object" || s.grades === null) {
    return { valid: false, error: `Materia #${index + 1}: notas inválidas.` };
  }

  const config = s.config as Subject["config"];
  if (typeof config.maxGrade !== "number" || config.maxGrade <= 0) {
    return { valid: false, error: `Materia #${index + 1}: nota máxima inválida.` };
  }
  if (typeof config.minPassingGrade !== "number") {
    return { valid: false, error: `Materia #${index + 1}: nota mínima inválida.` };
  }
  if (!Array.isArray(config.cuts) || config.cuts.length !== 3) {
    return { valid: false, error: `Materia #${index + 1}: debe tener 3 cortes.` };
  }

  const grades = s.grades as Subject["grades"];
  for (const cutId of ["corte1", "corte2", "corte3"] as const) {
    const g = grades[cutId];
    if (g !== null && typeof g !== "number") {
      return { valid: false, error: `Materia #${index + 1}: nota de ${cutId} inválida.` };
    }
  }

  return {
    valid: true,
    subject: {
      id: s.id,
      name: s.name,
      config,
      grades,
      createdAt: s.createdAt,
      credits: typeof s.credits === "number" ? s.credits : undefined,
      semesterId: typeof s.semesterId === "string" ? s.semesterId : undefined,
    },
  };
}

/** Genera un ID nuevo para materias importadas que tienen conflictos de ID. */
export function assignNewIds(subjects: Subject[]): Subject[] {
  return subjects.map((s) => ({ ...s, id: generateId() }));
}

/** Descarga un archivo JSON en el navegador. */
export function downloadBackupFile(subjects: Subject[]): void {
  const content = serializeBackup(subjects);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `notaminima-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
