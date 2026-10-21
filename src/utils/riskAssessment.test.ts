import { describe, expect, it } from "vitest";
import type { Subject } from "../types/academic";
import { assessRisk, RISK_LABELS } from "./riskAssessment";
import { createSubject } from "./subjectFactory";

function withGrades(name: string, grades: [number | null, number | null, number | null]): Subject {
  return {
    ...createSubject(name),
    grades: { corte1: grades[0], corte2: grades[1], corte3: grades[2] },
  };
}

function withConfig(name: string, maxGrade: number, minPassing: number, weights: [number, number, number], grades: [number | null, number | null, number | null]): Subject {
  const s = createSubject(name);
  s.config.maxGrade = maxGrade;
  s.config.minPassingGrade = minPassing;
  s.config.cuts[0].weight = weights[0];
  s.config.cuts[1].weight = weights[1];
  s.config.cuts[2].weight = weights[2];
  s.grades = { corte1: grades[0], corte2: grades[1], corte3: grades[2] };
  return s;
}

describe("assessRisk", () => {
  it("returns green for completed and passed", () => {
    const s = withGrades("A", [4, 4, 4]); // final=4 >= 3
    const result = assessRisk(s);
    expect(result.level).toBe("green");
    expect(result.isViable).toBe(true);
  });

  it("returns red for completed and failed", () => {
    const s = withGrades("A", [1, 1, 1]); // final=1 < 3
    const result = assessRisk(s);
    expect(result.level).toBe("red");
    expect(result.isViable).toBe(false);
  });

  it("returns green when already-passed (even with 0 in remaining)", () => {
    // corte1=5 with weight 30 → contribution = 5*0.3 = 1.5
    // minPassing = 3. Even with 0 in corte2(30%) + corte3(40%): worst = 1.5
    // That's < 3, so NOT already-passed. Let's make it truly already-passed:
    // Need worst >= minPassing. Use maxGrade=5, minPassing=1
    const s = withConfig("A", 5, 1, [100, 0, 0], [5, null, null]);
    // corte1=5, weight=100% → already have 5, minPassing=1 → even with 0 everywhere, 5 >= 1
    const result = assessRisk(s);
    expect(result.level).toBe("green");
  });

  it("returns red when impossible", () => {
    // corte1=0, weight=30 → contribution=0
    // remaining=70%, maxGrade=5 → best = 5*0.7 = 3.5
    // minPassing=4 → 3.5 < 4 → impossible
    const s = withConfig("A", 5, 4, [30, 30, 40], [0, null, null]);
    const result = assessRisk(s);
    expect(result.level).toBe("red");
    expect(result.isViable).toBe(false);
  });

  it("returns yellow when needed grade is high but achievable", () => {
    // Build up to a scenario where needed grade is achievable but high (yellow):
    // corte1=8, weight=40 → contribution=8*0.4=3.2
    // next cut = corte2, weight=30: need = (6-3.2)/0.3 = 9.33
    // maxGrade=10, 9.33 > 10*0.8=8 → yellow
    const s7 = withConfig("A", 10, 6, [40, 30, 30], [8, null, null]);
    const result = assessRisk(s7);
    expect(result.level).toBe("yellow");
    expect(result.isViable).toBe(true);
    expect(result.neededGrade).toBe(9.33);
  });

  it("returns green when margin is comfortable", () => {
    // corte1=4, weight=50 → contribution=4*0.5=2
    // needed in corte2 = (3-2)/0.3 = 3.33
    // maxGrade*0.8 = 4 → 3.33 < 4 → not yellow by threshold
    // margin = best - min = (2 + 5*0.5) - 3 = 1.5
    // maxGrade*0.3 = 1.5 → 1.5 >= 1.5 → green
    const s3 = withConfig("A", 5, 3, [50, 30, 20], [4, null, null]);
    const result = assessRisk(s3);
    expect(result.level).toBe("green");
    expect(result.neededGrade).toBe(3.33);
  });

  it("includes a friendly message", () => {
    const s = withGrades("A", [4, 4, 4]);
    const result = assessRisk(s);
    expect(result.message).toContain("Aprobaste");
  });

  it("RISK_LABELS has all three levels", () => {
    expect(RISK_LABELS.green).toBeDefined();
    expect(RISK_LABELS.yellow).toBeDefined();
    expect(RISK_LABELS.red).toBeDefined();
  });
});
