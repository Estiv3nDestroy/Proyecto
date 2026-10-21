import { describe, expect, it } from "vitest";
import {
  averageSimple,
  averageWeighted,
  calculateCategories,
  calculateNeededGrade,
  calculateRequiredGrade,
  classifyGrade,
  parseScoreList,
  roundGrade,
  type GradeCategory,
} from "./gradeMath";

/** Utilidad para construir categorías de prueba sin repetir código. */
const makeCategory = (
  id: string,
  name: string,
  percentage: number,
  values: (number | null)[],
  weights: number[] = [],
): GradeCategory => ({
  id,
  name,
  percentage,
  scores: values.map((value, index) => ({
    id: `${id}-${index}`,
    value,
    weight: weights[index] ?? 0,
  })),
});

describe("averageSimple", () => {
  it("promedia correctamente 2.0, 3.0 y 4.0 → 3.0", () => {
    expect(averageSimple([2, 3, 4])).toBe(3);
  });

  it("devuelve null con lista vacía (evita división por cero)", () => {
    expect(averageSimple([])).toBeNull();
  });

  it("soporta una sola nota", () => {
    expect(averageSimple([4.5])).toBe(4.5);
  });
});

describe("averageWeighted", () => {
  it("pondera cada nota por su peso interno", () => {
    // 4.0×20% + 3.0×30% + 2.0×50% = 0.8 + 0.9 + 1.0 = 2.7 sobre 100 → 2.7
    const result = averageWeighted([
      { id: "a", value: 4, weight: 20 },
      { id: "b", value: 3, weight: 30 },
      { id: "c", value: 2, weight: 50 },
    ]);
    expect(roundGrade(result ?? 0)).toBe(2.7);
  });

  it("devuelve null si todos los pesos son 0 (división por cero)", () => {
    expect(averageWeighted([{ id: "a", value: 4, weight: 0 }])).toBeNull();
  });

  it("ignora notas vacías", () => {
    const result = averageWeighted([
      { id: "a", value: 5, weight: 50 },
      { id: "b", value: null, weight: 50 },
    ]);
    expect(result).toBe(5);
  });

  it("devuelve null con lista vacía", () => {
    expect(averageWeighted([])).toBeNull();
  });
});

describe("parseScoreList", () => {
  it("acepta coma y punto como separador decimal", () => {
    const { values } = parseScoreList("2,5 3.5", 5);
    expect(values).toEqual([2.5, 3.5]);
  });

  it("separa por comas, espacios y saltos de línea", () => {
    const { values } = parseScoreList("2.0, 3.0\n4.0;5.0", 5);
    expect(values).toEqual([2, 3, 4, 5]);
  });

  it("reporta texto inválido sin romper el cálculo", () => {
    const { values, invalid } = parseScoreList("3.0, hola, 4.0", 5);
    expect(values).toEqual([3, 4]);
    expect(invalid).toEqual(["hola"]);
  });

  it("rechaza notas fuera de la escala", () => {
    const { values, outOfRange } = parseScoreList("3.0, 7.5, -1", 5);
    expect(values).toEqual([3]);
    expect(outOfRange).toEqual(["7.5", "-1"]);
  });

  it("devuelve listas vacías con cadena vacía", () => {
    const { values, invalid } = parseScoreList("   ", 5);
    expect(values).toEqual([]);
    expect(invalid).toEqual([]);
  });
});

describe("calculateCategories — ejemplo del enunciado", () => {
  const categories: GradeCategory[] = [
    makeCategory("f", "Formativa", 50, [2, 3, 4]),
    makeCategory("p", "Parcial", 50, [3]),
  ];

  it("Formativa 50% con 2.0, 3.0, 4.0 → promedio 3.0 y aporta 1.5", () => {
    const result = calculateCategories(categories, "simple");
    const formativa = result.categories[0];
    expect(formativa.average).toBe(3);
    expect(formativa.contribution).toBe(1.5);
  });

  it("Parcial 50% con 3.0 → aporta 1.5", () => {
    const result = calculateCategories(categories, "simple");
    expect(result.categories[1].contribution).toBe(1.5);
  });

  it("el total del corte es 3.0", () => {
    expect(calculateCategories(categories, "simple").total).toBe(3);
  });

  it("valida que los porcentajes sumen 100%", () => {
    const result = calculateCategories(categories, "simple");
    expect(result.percentageTotal).toBe(100);
    expect(result.isPercentageValid).toBe(true);
  });
});

describe("calculateCategories — casos borde", () => {
  it("detecta cuando la suma de porcentajes ≠ 100%", () => {
    const result = calculateCategories(
      [makeCategory("a", "Taller", 30, [4]), makeCategory("b", "Quiz", 40, [3])],
      "simple",
    );
    expect(result.percentageTotal).toBe(70);
    expect(result.isPercentageValid).toBe(false);
  });

  it("maneja una lista de categorías totalmente vacía", () => {
    const result = calculateCategories([], "simple");
    expect(result.total).toBe(0);
    expect(result.percentageTotal).toBe(0);
    expect(result.isPercentageValid).toBe(false);
  });

  it("una categoría sin notas aporta 0 y queda marcada como vacía", () => {
    const result = calculateCategories([makeCategory("a", "Parcial", 100, [])], "simple");
    expect(result.categories[0].isEmpty).toBe(true);
    expect(result.categories[0].contribution).toBe(0);
    expect(result.pendingPercentage).toBe(100);
  });

  it("calcula correctamente el porcentaje cubierto y el pendiente", () => {
    const result = calculateCategories(
      [makeCategory("a", "Formativa", 60, [4]), makeCategory("b", "Parcial", 40, [])],
      "simple",
    );
    expect(result.coveredPercentage).toBe(60);
    expect(result.pendingPercentage).toBe(40);
  });
});

describe("calculateNeededGrade — modo ¿Cuánto necesito?", () => {
  it("con Formativa 50% en 3.0 y Parcial 50% vacío, meta 3.5 → pide 4.0", () => {
    const categories = [
      makeCategory("f", "Formativa", 50, [2, 3, 4]), // promedio 3.0 → aporta 1.5
      makeCategory("p", "Parcial", 50, []), // vacío
    ];
    const result = calculateNeededGrade(categories, 3.5, 5, "simple");
    expect(result.outcome).toBe("achievable");
    expect(result.needed).toBe(4);
    expect(result.pendingPercentage).toBe(50);
  });

  it("avisa cuando la meta ya está asegurada (nota requerida ≤ 0)", () => {
    const categories = [
      makeCategory("f", "Formativa", 80, [5]), // aporta 4.0
      makeCategory("p", "Parcial", 20, []),
    ];
    const result = calculateNeededGrade(categories, 3, 5, "simple");
    expect(result.outcome).toBe("already-reached");
    expect(result.needed).toBe(0);
  });

  it("avisa cuando es matemáticamente imposible", () => {
    const categories = [
      makeCategory("f", "Formativa", 70, [1]), // aporta 0.7
      makeCategory("p", "Parcial", 30, []),
    ];
    const result = calculateNeededGrade(categories, 3.5, 5, "simple");
    expect(result.outcome).toBe("impossible");
    expect(result.message).toContain("no es posible");
  });

  it("informa cuando ya no quedan categorías pendientes", () => {
    const categories = [makeCategory("f", "Formativa", 100, [3])];
    const result = calculateNeededGrade(categories, 3.5, 5, "simple");
    expect(result.outcome).toBe("no-pending");
    expect(result.needed).toBeNull();
  });
});

describe("calculateRequiredGrade", () => {
  it("despeja correctamente la nota faltante", () => {
    // meta 3.0, acumulado 1.5, pendiente 50% → (3.0-1.5)/0.5 = 3.0
    expect(calculateRequiredGrade(3, 1.5, 50)).toBe(3);
  });

  it("lanza error si el peso pendiente es cero (evita división por cero)", () => {
    expect(() => calculateRequiredGrade(3, 1.5, 0)).toThrow();
  });
});

describe("classifyGrade", () => {
  it("marca como aprobado cuando alcanza la meta", () => {
    expect(classifyGrade(3, 3)).toBe("pass");
  });

  it("marca en riesgo cuando está cerca de la meta", () => {
    expect(classifyGrade(2.7, 3)).toBe("risk");
  });

  it("marca reprobando cuando está lejos", () => {
    expect(classifyGrade(1.5, 3)).toBe("fail");
  });
});
