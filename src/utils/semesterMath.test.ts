import { describe, expect, it } from "vitest";
import type { Semester, Subject } from "../types/academic";
import {
  accumulatedAverage,
  creditWeightedAverage,
  getCredits,
  passingCount,
  semesterAverage,
  semesterCredits,
  semesterProgress,
  simpleAverage,
  subjectsBySemesterId,
} from "./semesterMath";
import { createDefaultConfig, createSubject } from "./subjectFactory";

function makeSubject(name: string, grades: [number | null, number | null, number | null], credits = 3, semesterId: string | null = null): Subject {
  return {
    ...createSubject(name, semesterId),
    grades: { corte1: grades[0], corte2: grades[1], corte3: grades[2] },
    credits,
  };
}

const sem2026_1: Semester = { id: "s1", name: "2026-1", isArchived: false, createdAt: 0 };
const semArchived: Semester = { id: "s3", name: "2025-2", isArchived: true, createdAt: 0 };

describe("getCredits", () => {
  it("returns subject credits when defined", () => {
    const s = makeSubject("A", [3, 3, 3], 4);
    expect(getCredits(s)).toBe(4);
  });

  it("returns default 3 when undefined", () => {
    const s: Subject = { ...makeSubject("A", [3, 3, 3]), credits: undefined };
    expect(getCredits(s)).toBe(3);
  });
});

describe("creditWeightedAverage", () => {
  it("returns 0 when no subjects have grades", () => {
    expect(creditWeightedAverage([makeSubject("A", [null, null, null])])).toBe(0);
  });

  it("returns 0 for empty array", () => {
    expect(creditWeightedAverage([])).toBe(0);
  });

  it("computes simple average when all credits equal", () => {
    const config = createDefaultConfig();
    const s1 = { ...makeSubject("A", [4, 4, 4], 3), config };
    const s2 = { ...makeSubject("B", [2, 2, 2], 3), config };
    // Both complete: s1=4, s2=2, equal credits → avg=3
    expect(creditWeightedAverage([s1, s2])).toBe(3);
  });

  it("weights by credits correctly", () => {
    const config = createDefaultConfig();
    const s1 = { ...makeSubject("A", [5, 5, 5], 4), config }; // final=5, credits=4
    const s2 = { ...makeSubject("B", [1, 1, 1], 1), config }; // final=1, credits=1
    // weighted: (5*4 + 1*1) / (4+1) = 21/5 = 4.2
    expect(creditWeightedAverage([s1, s2])).toBe(4.2);
  });

  it("ignores subjects with no grades", () => {
    const config = createDefaultConfig();
    const s1 = { ...makeSubject("A", [5, 5, 5], 3), config };
    const s2 = { ...makeSubject("B", [null, null, null], 3), config };
    expect(creditWeightedAverage([s1, s2])).toBe(5);
  });
});

describe("simpleAverage", () => {
  it("returns 0 for empty array", () => {
    expect(simpleAverage([])).toBe(0);
  });

  it("computes arithmetic mean of subjects with data", () => {
    const config = createDefaultConfig();
    const s1 = { ...makeSubject("A", [4, 4, 4], 3), config };
    const s2 = { ...makeSubject("B", [2, 2, 2], 3), config };
    expect(simpleAverage([s1, s2])).toBe(3);
  });
});

describe("subjectsBySemesterId", () => {
  it("filters subjects by semester", () => {
    const s1 = makeSubject("A", [3, null, null], 3, "s1");
    const s2 = makeSubject("B", [null, null, null], 3, "s2");
    const s3 = makeSubject("C", [4, null, null], 3, "s1");
    expect(subjectsBySemesterId([s1, s2, s3], "s1")).toEqual([s1, s3]);
  });
});

describe("semesterAverage", () => {
  it("computes credit-weighted average for a semester", () => {
    const s1 = makeSubject("A", [4, 4, 4], 3, "s1");
    const s2 = makeSubject("B", [2, 2, 2], 3, "s1");
    expect(semesterAverage([s1, s2], sem2026_1)).toBe(3);
  });
});

describe("accumulatedAverage", () => {
  it("only considers non-archived semesters", () => {
    const s1 = makeSubject("A", [5, 5, 5], 3, "s1"); // active
    const s2 = makeSubject("B", [1, 1, 1], 3, "s3"); // archived
    expect(accumulatedAverage([s1, s2], [sem2026_1, semArchived])).toBe(5);
  });
});

describe("semesterCredits", () => {
  it("sums credits of subjects with grades", () => {
    const s1 = makeSubject("A", [3, null, null], 4, "s1");
    const s2 = makeSubject("B", [null, null, null], 3, "s1");
    expect(semesterCredits([s1, s2], "s1")).toBe(4);
  });
});

describe("passingCount", () => {
  it("counts subjects with final average >= minPassing", () => {
    const s1 = makeSubject("A", [4, 4, 4], 3, "s1"); // passes (4 >= 3)
    const s2 = makeSubject("B", [2, 2, 2], 3, "s1"); // fails
    expect(passingCount([s1, s2], "s1")).toBe(1);
  });
});

describe("semesterProgress", () => {
  it("returns 0 for empty semester", () => {
    expect(semesterProgress([], "s1")).toBe(0);
  });

  it("calculates percentage of filled cuts", () => {
    const s1 = makeSubject("A", [3, null, null], 3, "s1"); // 1/3
    const s2 = makeSubject("B", [4, 4, null], 3, "s1"); // 2/3
    // total cuts = 6, filled = 3 → 50%
    expect(semesterProgress([s1, s2], "s1")).toBe(50);
  });
});
