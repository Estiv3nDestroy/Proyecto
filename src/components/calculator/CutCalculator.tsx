import { useState } from "react";
import { Calculator, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { AcademicConfig, CutId } from "../../types/academic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { Badge } from "../ui/Badge";
import { calculateCutAssessmentResult } from "../../utils/gradeMath";
import { generateId } from "../../utils/subjectFactory";
import { cn } from "../../utils/cn";

interface CutCalculatorProps {
  config: AcademicConfig;
  onChange: (config: AcademicConfig) => void;
}

/**
 * Panel detallado para desglosar cada uno de los 3 cortes en sus evaluaciones
 * internas (formativas, parciales, talleres, etc.) y calcular la nota
 * consolidada del cote actual.
 */
export function CutCalculator({ config, onChange }: CutCalculatorProps) {
  const [expandedCutId, setExpandedCutId] = useState<CutId>("corte1");

  const toggleCut = (cutId: CutId) => {
    setExpandedCutId((current) => (current === cutId ? current : cutId));
  };

  const updateCutAssessments = (cutId: CutId, assessments: AcademicConfig["cuts"][number]["assessments"]) => {
    const updatedCuts = config.cuts.map((cut) =>
      cut.id === cutId ? { ...cut, assessments } : cut,
    ) as AcademicConfig["cuts"];
    onChange({ ...config, cuts: updatedCuts });
  };

  const addAssessment = (cutId: CutId) => {
    const cut = config.cuts.find((c) => c.id === cutId);
    if (!cut) return;
    const assessments = cut.assessments ?? [];
    const newAssessment = { id: generateId(), name: `Evaluación ${assessments.length + 1}`, weight: 10, grade: null };
    updateCutAssessments(cutId, [...assessments, newAssessment]);
  };

  const removeAssessment = (cutId: CutId, assessmentId: string) => {
    const cut = config.cuts.find((c) => c.id === cutId);
    if (!cut) return;
    const assessments = (cut.assessments ?? []).filter((item) => item.id !== assessmentId);
    updateCutAssessments(cutId, assessments);
  };

  const updateAssessment = (
    cutId: CutId,
    assessmentId: string,
    patch: Partial<{ name: string; weight: number; grade: number | null }>,
  ) => {
    const cut = config.cuts.find((c) => c.id === cutId);
    if (!cut) return;
    const assessments = (cut.assessments ?? []).map((item) =>
      item.id === assessmentId ? { ...item, ...patch } : item,
    );
    updateCutAssessments(cutId, assessments);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-indigo-600" />
          <CardTitle>Calculadora de Cortes</CardTitle>
        </div>
        <CardDescription>
          Desglosa cada cote en sus evaluaciones internas (formativas, parciales, talleres...)
          y descubre la nota consolidada automáticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {config.cuts.map((cut) => {
          const isExpanded = expandedCutId === cut.id;
          const result = calculateCutAssessmentResult(cut);
          const assessments = cut.assessments ?? [];

          return (
            <div key={cut.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 shadow-sm">
              {/* Cabecera del acordeón */}
              <button
                type="button"
                onClick={() => toggleCut(cut.id)}
                className="flex w-full items-center justify-between gap-3 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-bold text-sm">
                    {cut.weight}%
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">{cut.label}</p>
                    <p className="text-xs text-slate-500">
                      {assessments.length} evaluaciones configuradas
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.isComplete && (
                    <Badge tone={result.computedGrade && result.computedGrade >= config.minPassingGrade ? "emerald" : "amber"}>
                      Nota calculada: <strong className="ml-1">{result.computedGrade?.toFixed(2)}</strong>
                    </Badge>
                  )}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </button>

              {/* Contenido del acordeón */}
              {isExpanded ? (
                <div className="space-y-3 border-t border-slate-100 p-4">
                  {assessments.length === 0 ? (
                    <p className="py-3 text-center text-sm text-slate-400">
                      Añade evaluaciones para calcular la nota definitiva de este corte.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {assessments.map((assessment) => (
                        <div key={assessment.id} className="grid grid-cols-12 items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-3">
                          <input
                            type="text"
                            value={assessment.name}
                            onChange={(event) => updateAssessment(cut.id, assessment.id, { name: event.target.value })}
                            className="col-span-12 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium outline-none focus:border-indigo-400 sm:col-span-5"
                          />
                          <div className="col-span-4 sm:col-span-3 space-y-0.5">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Peso</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={assessment.weight}
                                onChange={(event) =>
                                  updateAssessment(cut.id, assessment.id, {
                                    weight: Math.max(0, Math.min(100, Number(event.target.value))),
                                  })
                                }
                                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 pr-7 text-xs outline-none focus:border-indigo-400"
                                min={0}
                                max={100}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
                            </div>
                          </div>
                          <div className="col-span-6 sm:col-span-3 space-y-0.5">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Nota</label>
                            <input
                              type="number"
                              value={assessment.grade ?? ""}
                              onChange={(event) =>
                                updateAssessment(cut.id, assessment.id, {
                                  grade: event.target.value === "" ? null : Math.max(0, Math.min(config.maxGrade, Number(event.target.value))),
                                })
                              }
                              placeholder={`0 - ${config.maxGrade}`}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-indigo-400"
                              min={0}
                              max={config.maxGrade}
                              step={0.1}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAssessment(cut.id, assessment.id)}
                            className="col-span-2 sm:col-span-1 flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            aria-label="Eliminar evaluación"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <Button variant="outline" size="sm" onClick={() => addAssessment(cut.id)}>
                      <Plus className="h-4 w-4" />
                      Añadir evaluación
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-medium", result.weightTotal === 100 ? "text-emerald-600" : "text-amber-600")}>
                        Peso acumulado: {result.weightTotal}%
                      </span>
                      {result.weightTotal !== 100 && result.weightTotal > 0 && (
                        <span className="text-[10px] text-slate-400">(Debe llegar exactamente a 100%)</span>
                      )}
                    </div>
                  </div>

                  {result.isComplete && (
                    <Alert level="success" title={`Nota calculada para ${cut.label}: ${result.computedGrade?.toFixed(2)}`}>
                      Estás viendo la nota consolidada de este corte. Puedes imprimirla o copiarla al campo de notas del
                      corte principal.
                    </Alert>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
