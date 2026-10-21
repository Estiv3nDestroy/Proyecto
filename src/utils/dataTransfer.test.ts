import { describe, expect, it } from "vitest";
import type { Subject } from "../types/academic";
import { assignNewIds, createBackup, parseBackup, serializeBackup } from "./dataTransfer";
import { createSubject } from "./subjectFactory";

function makeTestSubjects(): Subject[] {
  const s1 = createSubject("Cálculo");
  s1.grades = { corte1: 4, corte2: 3.5, corte3: null };
  s1.credits = 4;
  return [s1];
}

describe("createBackup", () => {
  it("creates a backup with version and subjects", () => {
    const subjects = makeTestSubjects();
    const backup = createBackup(subjects);
    expect(backup.version).toBe(1);
    expect(backup.subjects).toHaveLength(1);
    expect(backup.exportedAt).toBeDefined();
  });

  it("clones subjects (no mutation)", () => {
    const subjects = makeTestSubjects();
    const backup = createBackup(subjects);
    backup.subjects[0].name = "Changed";
    expect(subjects[0].name).toBe("Cálculo");
  });
});

describe("serializeBackup", () => {
  it("produces valid JSON string", () => {
    const subjects = makeTestSubjects();
    const json = serializeBackup(subjects);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.subjects).toHaveLength(1);
  });
});

describe("parseBackup", () => {
  it("parses a valid backup", () => {
    const subjects = makeTestSubjects();
    const json = serializeBackup(subjects);
    const result = parseBackup(json);
    expect(result.valid).toBe(true);
    expect(result.subjects).toHaveLength(1);
    expect(result.subjects[0].name).toBe("Cálculo");
  });

  it("rejects invalid JSON", () => {
    const result = parseBackup("not json");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("JSON válido");
  });

  it("rejects wrong version", () => {
    const subjects = makeTestSubjects();
    const backup = createBackup(subjects);
    backup.version = 999;
    const result = parseBackup(JSON.stringify(backup));
    expect(result.valid).toBe(false);
    expect(result.error).toContain("versión");
  });

  it("rejects missing subjects array", () => {
    const result = parseBackup(JSON.stringify({ version: 1, exportedAt: "x" }));
    expect(result.valid).toBe(false);
    expect(result.error).toContain("lista de materias");
  });

  it("rejects subject with invalid name", () => {
    const subjects = makeTestSubjects();
    const backup = createBackup(subjects);
    backup.subjects[0].name = "";
    const result = parseBackup(JSON.stringify(backup));
    expect(result.valid).toBe(false);
    expect(result.error).toContain("nombre inválido");
  });

  it("rejects subject with invalid config", () => {
    const subjects = makeTestSubjects();
    const backup = createBackup(subjects);
    const configHack = backup.subjects[0].config as unknown as Record<string, unknown>;
    configHack.maxGrade = "not a number";
    const result = parseBackup(JSON.stringify(backup));
    expect(result.valid).toBe(false);
  });

  it("preserves credits and semesterId", () => {
    const s = createSubject("Test");
    s.credits = 5;
    s.semesterId = "sem-1";
    const json = serializeBackup([s]);
    const result = parseBackup(json);
    expect(result.valid).toBe(true);
    expect(result.subjects[0].credits).toBe(5);
    expect(result.subjects[0].semesterId).toBe("sem-1");
  });
});

describe("assignNewIds", () => {
  it("assigns new unique IDs", () => {
    const subjects = makeTestSubjects();
    const originalId = subjects[0].id;
    const reassigned = assignNewIds(subjects);
    expect(reassigned[0].id).not.toBe(originalId);
  });
});
