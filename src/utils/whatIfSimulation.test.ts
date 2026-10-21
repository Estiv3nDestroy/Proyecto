import { describe, expect, it } from "vitest";
import type { AcademicConfig, GradesRecord } from "../types/academic";
import {
  generatePresetScenarios,
  gradeNeededInCut,
  simulateSingleCut,
  simulateWhatIf,
  suggestedSliderValue,
} from "./whatIfSimulation";
import { createDefaultConfig } from "./subjectFactory";

function makeConfig(maxGrade = 5, minPassing = 3, weights: [number, number, number] = [30, 30, 40]): AcademicConfig {
  const config = createDefaultConfig();
  config.maxGrade = maxGrade;
  config.minPassingGrade = minPassing;
  config.cuts[0].weight = weights[0];
  config.cuts[1].weight = weights[1];
  config.cuts[2].weight = weights[2];
  return config;
}

function makeGrades(g1: number | null, g2: number | null, g3: number | null): GradesRecord {
  return { corte1: g1, corte2: g2, corte3: g3 };
}

describe("simulateWhatIf", () => {
  it("projects final grade with hypothetical cut grades", () => {
    const config = makeConfig();
    const grades = makeGrades(3, null, null);
    // Set corte2=4, corte3=5 hypothetically
    const result = simulateWhatIf(config, grades, [
      { cutId: "corte2", hypotheticalGrade: 4 },
      { cutId: "corte3", hypotheticalGrade: 5 },
    ]);
    // final = 3*0.3 + 4*0.3 + 5*0.4 = 0.9+1.2+2 = 4.1
    expect(result.projectedFinal).toBe(4.1);
    expect(result.wouldPass).toBe(true);
  });

  it("calculates delta from current", () => {
    const config = makeConfig();
    const grades = makeGrades(3, null, null);
    // current (with 0s) = 3*0.3 = 0.9
    // projected with corte2=4, corte3=5 = 4.1
    const result = simulateWhatIf(config, grades, [
      { cutId: "corte2", hypotheticalGrade: 4 },
      { cutId: "corte3", hypotheticalGrade: 5 },
    ]);
    expect(result.deltaFromCurrent).toBe(3.2);
  });

  it("detects would not pass", () => {
    const config = makeConfig(5, 3);
    const grades = makeGrades(1, null, null);
    const result = simulateWhatIf(config, grades, [
      { cutId: "corte2", hypotheticalGrade: 1 },
      { cutId: "corte3", hypotheticalGrade: 1 },
    ]);
    // final = 1*0.3 + 1*0.3 + 1*0.4 = 1 < 3
    expect(result.wouldPass).toBe(false);
  });
});

describe("simulateSingleCut", () => {
  it("calculates final with one hypothetical cut", () => {
    const config = makeConfig();
    const grades = makeGrades(3, 4, null);
    // Set corte3=5: final = 3*0.3 + 4*0.3 + 5*0.4 = 0.9+1.2+2 = 4.1
    const result = simulateSingleCut(config, grades, "corte3", 5);
    expect(result).toBe(4.1);
  });
});

describe("generatePresetScenarios", () => {
  it("best case uses maxGrade", () => {
    const config = makeConfig(5, 3);
    const grades = makeGrades(3, null, null);
    const scenarios = generatePresetScenarios(config, grades, "best");
    expect(scenarios).toHaveLength(2);
    expect(scenarios[0].hypotheticalGrade).toBe(5);
    expect(scenarios[1].hypotheticalGrade).toBe(5);
  });

  it("worst case uses 0", () => {
    const config = makeConfig();
    const grades = makeGrades(3, null, null);
    const scenarios = generatePresetScenarios(config, grades, "worst");
    expect(scenarios.every((s) => s.hypotheticalGrade === 0)).toBe(true);
  });

  it("realistic uses average of known grades", () => {
    const config = makeConfig();
    const grades = makeGrades(4, null, null);
    const scenarios = generatePresetScenarios(config, grades, "realistic");
    // known average = 4
    expect(scenarios[0].hypotheticalGrade).toBe(4);
  });

  it("returns empty array when no missing cuts", () => {
    const config = makeConfig();
    const grades = makeGrades(3, 3, 3);
    expect(generatePresetScenarios(config, grades, "best")).toHaveLength(0);
  });
});

describe("suggestedSliderValue", () => {
  it("returns minPassing when no known grades", () => {
    const config = makeConfig(5, 3);
    const grades = makeGrades(null, null, null);
    expect(suggestedSliderValue(config, grades)).toBe(3);
  });

  it("returns average of known grades", () => {
    const config = makeConfig(5, 3);
    const grades = makeGrades(4, 2, null);
    // avg of known = (4+2)/2 = 3
    expect(suggestedSliderValue(config, grades)).toBe(3);
  });
});

describe("gradeNeededInCut", () => {
  it("calculates needed grade in a pending cut", () => {
    const config = makeConfig(5, 3, [30, 30, 40]);
    const grades = makeGrades(3, null, null);
    // known contribution = 3*0.3 = 0.9
    // needed in corte2 = (3 - 0.9) / 0.3 = 7
    expect(gradeNeededInCut(config, grades, "corte2")).toBe(7);
  });

  it("returns null for a cut that already has a grade", () => {
    const config = makeConfig();
    const grades = makeGrades(3, 4, null);
    expect(gradeNeededInCut(config, grades, "corte1")).toBeNull();
  });

  it("returns null for unknown cutId", () => {
    const config = makeConfig();
    const grades = makeGrades(null, null, null);
    expect(gradeNeededInCut(config, grades, "corte4" as never)).toBeNull();
  });
});
