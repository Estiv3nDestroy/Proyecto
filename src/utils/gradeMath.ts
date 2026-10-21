/**
 * ============================================================================
 *  MOTOR DE CÁLCULO ACADÉMICO (lógica pura, sin efectos secundarios)
 * ============================================================================
 *
 * FÓRMULA BASE — Promedio ponderado final:
 *
 *      Nota Final = Σ ( nota_corte_i * (peso_corte_i / 100) )   para i = 1..3
 *
 * FÓRMULA DE PROYECCIÓN — Nota necesaria en un corte pendiente:
 *
 *  Si ya conocemos la contribución de los cortes ya calificados (y/o
 *  hipotéticos), la nota "x" que falta en un corte con peso "w" debe
 *  satisfacer:
 *
 *      contribuciones_conocidas + x * (w / 100) = nota_mínima_aprobatoria
 *
 *  Despejando x:
 *
 *      x = (nota_mínima_aprobatoria - contribuciones_conocidas) / (w / 100)
 *
 *  Esta única fórmula generalizada permite resolver TODOS los escenarios
 *  del sistema:
 *    - Nota exacta necesaria en Corte 3 (conociendo Corte 1 y 2).
 *    - Nota necesaria en Corte 2 asumiendo una nota hipotética en Corte 3.
 *    - Nota "equilibrada" necesaria si se exige el mismo rendimiento en
 *      los 2 cortes restantes (se trata el peso combinado como un solo
 *      bloque objetivo).
 */

import type { CutWeight, GradesRecord, CutCalculatorResult } from "../types/academic";

/** Convierte un porcentaje (0-100) a su factor decimal (0-1). */
export function toWeightFactor(weightPercent: number): number {
  return weightPercent / 100;
}

/** Contribución ponderada de una nota puntual dentro del promedio final. */
export function gradeContribution(grade: number, weightPercent: number): number {
  return grade * toWeightFactor(weightPercent);
}

/** Suma de los pesos porcentuales de una lista de cortes. */
export function sumWeights(cuts: CutWeight[]): number {
  return cuts.reduce((total, cut) => total + cut.weight, 0);
}

/**
 * Verifica que los pesos de los 3 cortes sumen exactamente 100%.
 * Se usa una tolerancia mínima para absorber errores de punto flotante.
 */
export function isValidWeightDistribution(cuts: CutWeight[], tolerance = 0.001): boolean {
  return Math.abs(sumWeights(cuts) - 100) <= tolerance;
}

/** Determina si una nota está dentro del rango permitido [0, maxGrade]. */
export function isGradeInRange(grade: number, maxGrade: number): boolean {
  return Number.isFinite(grade) && grade >= 0 && grade <= maxGrade;
}

/**
 * Calcula la suma ponderada y el peso acumulado de los cortes que ya
 * tienen una nota registrada (no nula).
 */
export function calculateKnownContributions(
  grades: GradesRecord,
  cuts: CutWeight[],
): { weightedSum: number; weightTotal: number; count: number } {
  let weightedSum = 0;
  let weightTotal = 0;
  let count = 0;

  for (const cut of cuts) {
    const grade = grades[cut.id];
    if (grade !== null && grade !== undefined && !Number.isNaN(grade)) {
      weightedSum += gradeContribution(grade, cut.weight);
      weightTotal += cut.weight;
      count += 1;
    }
  }

  return { weightedSum, weightTotal, count };
}

/**
 * Despeja la nota "x" requerida en un corte (o bloque de cortes) para
 * alcanzar la nota mínima aprobatoria, dado lo que ya se ha acumulado
 * ponderadamente y el peso porcentual restante a cubrir.
 *
 * @param minPassingGrade Nota mínima para aprobar la materia.
 * @param accumulatedContribution Suma de contribuciones ya conocidas/asumidas.
 * @param remainingWeightPercent Peso porcentual del corte (o cortes) pendiente(s).
 * @returns La nota exacta "x" necesaria. Puede ser negativa (ya aprobó) o
 *          mayor al máximo posible (ya no es viable aprobar).
 */
export function calculateRequiredGrade(
  minPassingGrade: number,
  accumulatedContribution: number,
  remainingWeightPercent: number,
): number {
  if (remainingWeightPercent <= 0) {
    throw new Error("El peso restante debe ser mayor a cero para proyectar una nota.");
  }
  return (minPassingGrade - accumulatedContribution) / toWeightFactor(remainingWeightPercent);
}

/** Calcula el promedio final ponderado cuando los 3 cortes están completos. */
export function calculateFinalAverage(grades: GradesRecord, cuts: CutWeight[]): number {
  return cuts.reduce((total, cut) => {
    const grade = grades[cut.id] ?? 0;
    return total + gradeContribution(grade, cut.weight);
  }, 0);
}

/**
 * Promedio parcial "normalizado": reparte la suma ponderada conocida entre
 * el peso acumulado conocido, para mostrar una referencia comparable en la
 * misma escala de notas (y no una fracción del 100%).
 */
export function calculatePartialAverage(weightedSum: number, weightTotal: number): number | null {
  if (weightTotal <= 0) return null;
  return weightedSum / toWeightFactor(weightTotal);
}

/**
 * Mejor promedio final posible: asume la nota máxima en todos los cortes
 * restantes. Sirve para detectar si matemáticamente ya no hay forma de
 * aprobar la materia.
 */
export function calculateBestPossibleAverage(
  knownWeightedSum: number,
  remainingWeightPercent: number,
  maxGrade: number,
): number {
  return knownWeightedSum + gradeContribution(maxGrade, remainingWeightPercent);
}

/** Redondea una nota a 2 decimales, evitando artefactos de punto flotante. */
export function roundGrade(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * ============================================================================
 *  CALCULADORA DE CORTE (Desglose por sub-evaluaciones)
 * ============================================================================
 * Cada corte puede tener evaluaciones internas (formativas, parciales,
 * talleres, quizzes, etc.) con un peso porcentual propio. La nota del corte
 * se obtiene mediante:
 *
 *   Nota_corte = Σ ( nota_aseval_i × peso_eval_i / 100 )
 *                ...siempre que Σ peso_eval_i = 100%
 */
export function calculateCutAssessmentResult(cut: CutWeight): CutCalculatorResult {
  const assessments = cut.assessments ?? [];
  if (assessments.length === 0) {
    return { cutId: cut.id, computedGrade: null, weightTotal: 0, isComplete: false };
  }

  let weightTotal = 0;
  let weightedSum = 0;
  let isComplete = true;

  for (const assessment of assessments) {
    weightTotal += assessment.weight;
    if (assessment.grade === null) isComplete = false;
    else weightedSum += gradeContribution(assessment.grade, assessment.weight);
  }

  const hasAllWeights = Math.abs(weightTotal - 100) <= 0.001;
  return {
    cutId: cut.id,
    computedGrade: isComplete && hasAllWeights ? roundGrade(weightedSum) : null,
    weightTotal: roundGrade(weightTotal),
    isComplete: isComplete && hasAllWeights,
  };
}

/* ===========================================================================
 *  CALCULADORA POR CATEGORÍAS  (Formativa 50%, Parcial 50%, ...)
 * ===========================================================================
 *
 *  MODO SIMPLE (promedio aritmético dentro de la categoría):
 *      promedio_cat = ( n1 + n2 + ... + nk ) / k
 *
 *  MODO PONDERADO (cada nota tiene su propio peso interno):
 *      promedio_cat = Σ (ni × wi) / Σ wi
 *
 *  APORTE de la categoría al corte:
 *      aporte = promedio_cat × (porcentaje_categoria / 100)
 *
 *  NOTA DEL CORTE:
 *      corte = Σ aportes
 *
 *  ¿CUÁNTO NECESITO? (despeje para la categoría vacía con peso w):
 *      x = ( meta − Σ aportes_conocidos ) / (w / 100)
 * ========================================================================= */

/** Una nota individual dentro de una categoría. `weight` solo aplica en modo ponderado. */
export interface ScoreEntry {
  id: string;
  value: number | null;
  /** Peso interno (0-100). Se ignora en modo "simple". */
  weight: number;
}

/** Categoría de evaluación (ej. "Formativa 50%"). */
export interface GradeCategory {
  id: string;
  name: string;
  /** Porcentaje que aporta la categoría al corte (0-100). */
  percentage: number;
  scores: ScoreEntry[];
}

/** Modos de promediado disponibles dentro de una categoría. */
export type AverageMode = "simple" | "weighted";

/** Resultado del cálculo de una categoría. */
export interface CategoryResult {
  id: string;
  name: string;
  percentage: number;
  /** Promedio de las notas de la categoría (null si no hay notas válidas). */
  average: number | null;
  /** Puntos que aporta al corte: promedio × porcentaje/100. */
  contribution: number;
  /** Cantidad de notas válidas consideradas. */
  filledCount: number;
  /** True si la categoría no tiene ninguna nota registrada. */
  isEmpty: boolean;
}

/** Resultado global de la calculadora por categorías. */
export interface CategoryCalculationResult {
  categories: CategoryResult[];
  /** Suma de los porcentajes de todas las categorías. */
  percentageTotal: number;
  /** True si los porcentajes suman exactamente 100%. */
  isPercentageValid: boolean;
  /** Nota total del corte con lo registrado hasta ahora. */
  total: number;
  /** Porcentaje cubierto por categorías que sí tienen notas. */
  coveredPercentage: number;
  /** Porcentaje de categorías aún vacías (pendientes). */
  pendingPercentage: number;
}

/** Posibles desenlaces al preguntar "¿cuánto necesito?". */
export type NeededOutcome = "achievable" | "already-reached" | "impossible" | "no-pending";

/** Respuesta del modo "¿Cuánto necesito?". */
export interface NeededGradeResult {
  outcome: NeededOutcome;
  /** Nota requerida (redondeada). `null` cuando no aplica. */
  needed: number | null;
  /** Porcentaje pendiente sobre el que se despejó la nota. */
  pendingPercentage: number;
  /** Mensaje listo para mostrar al usuario. */
  message: string;
}

/** Patrón de un número suelto escrito con coma o punto decimal: "4", "2,5", "3.75". */
const SINGLE_NUMBER = /^-?\d+(?:[.,]\d+)?$/u;

/**
 * Convierte texto libre ("2.0, 3,5 4") en una lista de números válidos.
 *
 * REGLA DE DESAMBIGUACIÓN (la coma sirve para dos cosas en español):
 *  1. Primero se parte el texto por espacios, saltos de línea y `;`.
 *  2. Si el fragmento resultante es un único número (ej. "2,5"), la coma
 *     se interpreta como SEPARADOR DECIMAL → 2.5
 *  3. Si el fragmento contiene varios números (ej. "2.0,3.0"), la coma se
 *     interpreta como SEPARADOR DE LISTA → [2.0, 3.0]
 *
 * Los fragmentos no numéricos o fuera de escala se descartan y se reportan
 * para que la interfaz pueda avisar al estudiante de forma amable.
 */
export function parseScoreList(
  raw: string,
  maxGrade: number,
): { values: number[]; invalid: string[]; outOfRange: string[] } {
  const values: number[] = [];
  const invalid: string[] = [];
  const outOfRange: string[] = [];

  /** Evalúa un token ya aislado y lo clasifica. */
  const pushToken = (token: string): void => {
    const cleaned = token.trim().replace(/^[,;]+|[,;]+$/gu, "");
    if (cleaned.length === 0) return;

    const parsed = Number(cleaned.replace(",", "."));
    if (!Number.isFinite(parsed)) {
      invalid.push(cleaned);
      return;
    }
    if (parsed < 0 || parsed > maxGrade) {
      outOfRange.push(cleaned);
      return;
    }
    values.push(parsed);
  };

  const chunks = raw
    .split(/[;\s]+/u)
    .map((chunk) => chunk.trim().replace(/^[,]+|[,]+$/gu, ""))
    .filter((chunk) => chunk.length > 0);

  for (const chunk of chunks) {
    if (SINGLE_NUMBER.test(chunk)) {
      // Un solo número: la coma (si existe) es decimal → "2,5" = 2.5
      pushToken(chunk);
    } else {
      // Varios valores pegados: la coma es separador → "2.0,3.0"
      chunk.split(",").forEach(pushToken);
    }
  }

  return { values, invalid, outOfRange };
}

/** Promedio aritmético simple. Devuelve `null` si la lista está vacía (evita 0/0). */
export function averageSimple(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
}

/**
 * Promedio ponderado por los pesos internos de cada nota.
 * Si la suma de pesos es 0 (o no hay notas) devuelve `null` para evitar
 * una división por cero.
 */
export function averageWeighted(entries: ScoreEntry[]): number | null {
  const valid = entries.filter(
    (entry): entry is ScoreEntry & { value: number } =>
      entry.value !== null && Number.isFinite(entry.value) && entry.weight > 0,
  );
  if (valid.length === 0) return null;

  const weightSum = valid.reduce((total, entry) => total + entry.weight, 0);
  if (weightSum <= 0) return null;

  const weighted = valid.reduce((total, entry) => total + entry.value * entry.weight, 0);
  return weighted / weightSum;
}

/** Calcula el promedio de una categoría según el modo elegido. */
export function calculateCategoryAverage(
  category: GradeCategory,
  mode: AverageMode,
): number | null {
  if (mode === "weighted") return averageWeighted(category.scores);
  const values = category.scores
    .map((score) => score.value)
    .filter((value): value is number => value !== null && Number.isFinite(value));
  return averageSimple(values);
}

/**
 * Motor principal: evalúa todas las categorías y devuelve promedios,
 * aportes en puntos y la nota total del corte.
 */
export function calculateCategories(
  categories: GradeCategory[],
  mode: AverageMode = "simple",
): CategoryCalculationResult {
  const results: CategoryResult[] = categories.map((category) => {
    const average = calculateCategoryAverage(category, mode);
    const filledCount = category.scores.filter(
      (score) => score.value !== null && Number.isFinite(score.value),
    ).length;

    return {
      id: category.id,
      name: category.name,
      percentage: category.percentage,
      average: average === null ? null : roundGrade(average),
      contribution: average === null ? 0 : roundGrade(gradeContribution(average, category.percentage)),
      filledCount,
      isEmpty: average === null,
    };
  });

  const percentageTotal = roundGrade(
    categories.reduce((total, category) => total + category.percentage, 0),
  );
  const coveredPercentage = roundGrade(
    results.filter((result) => !result.isEmpty).reduce((total, r) => total + r.percentage, 0),
  );
  const total = roundGrade(results.reduce((sum, result) => sum + result.contribution, 0));

  return {
    categories: results,
    percentageTotal,
    isPercentageValid: Math.abs(percentageTotal - 100) <= 0.001,
    total,
    coveredPercentage,
    pendingPercentage: roundGrade(percentageTotal - coveredPercentage),
  };
}

/**
 * Modo "¿Cuánto necesito?": despeja la nota mínima que hace falta en las
 * categorías aún vacías para alcanzar la meta.
 *
 *      x = ( meta − Σ aportes_conocidos ) / (porcentaje_pendiente / 100)
 */
export function calculateNeededGrade(
  categories: GradeCategory[],
  target: number,
  maxGrade: number,
  mode: AverageMode = "simple",
): NeededGradeResult {
  const result = calculateCategories(categories, mode);
  const pending = result.pendingPercentage;

  if (pending <= 0) {
    const reached = result.total >= target;
    return {
      outcome: "no-pending",
      needed: null,
      pendingPercentage: 0,
      message: reached
        ? `Ya tienes todas las notas: tu corte queda en ${result.total.toFixed(2)} y alcanzaste la meta.`
        : `Ya tienes todas las notas: tu corte queda en ${result.total.toFixed(2)}, por debajo de la meta de ${target}.`,
    };
  }

  const needed = roundGrade(calculateRequiredGrade(target, result.total, pending));

  if (needed <= 0) {
    return {
      outcome: "already-reached",
      needed: 0,
      pendingPercentage: pending,
      message: `¡Ya aseguraste la meta! Incluso con 0 en lo que falta llegas a ${target}.`,
    };
  }

  if (needed > maxGrade) {
    return {
      outcome: "impossible",
      needed,
      pendingPercentage: pending,
      message: `Necesitas ${needed.toFixed(2)}, no es posible alcanzarlo (el máximo es ${maxGrade}).`,
    };
  }

  return {
    outcome: "achievable",
    needed,
    pendingPercentage: pending,
    message: `Necesitas sacar ${needed.toFixed(2)} en lo que falta (${pending}%) para llegar a ${target}.`,
  };
}

/** Clasificación cromática de una nota: aprobando / en riesgo / reprobando. */
export type GradeTone = "pass" | "risk" | "fail";

/** Determina el "color de resaltador" según qué tan cerca está de la meta. */
export function classifyGrade(value: number, target: number): GradeTone {
  if (value >= target) return "pass";
  if (value >= target * 0.85) return "risk";
  return "fail";
}

/** Formatea una nota con la cantidad de decimales configurada. */
export function formatGrade(value: number, decimals = 2): string {
  return value.toFixed(Math.max(0, Math.min(4, decimals)));
}
