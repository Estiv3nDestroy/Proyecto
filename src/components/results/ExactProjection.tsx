import { useState } from "react";
import { Target } from "lucide-react";
import type { AcademicConfig, CutWeight } from "../../types/academic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Alert } from "../ui/Alert";
import { calculateRequiredGrade, gradeContribution, roundGrade } from "../../utils/gradeMath";
import { cn } from "../../utils/cn";

interface ExactProjectionProps {
  config: AcademicConfig;
  knownWeightedSum: number;
  missingCut: CutWeight;
}

/**
 * Caso con un único corte pendiente: existe una única nota matemáticamente
 * exacta que se necesita para alcanzar la nota mínima aprobatoria.
 *
 *   x = (mínimo_aprobatorio - Σ contribuciones_conocidas) / (peso_pendiente / 100)
 */
export function ExactProjection({ config, knownWeightedSum, missingCut }: ExactProjectionProps) {
  const requiredGrade = roundGrade(
    calculateRequiredGrade(config.minPassingGrade, knownWeightedSum, missingCut.weight),
  );

  const alreadyPassed = requiredGrade <= 0;
  const impossible = requiredGrade > config.maxGrade;

  const [simulatedGradeText, setSimulatedGradeText] = useState(() =>
    String(Math.min(Math.max(requiredGrade, 0), config.maxGrade)),
  );
  const simulatedGrade = Number(simulatedGradeText);
  const simulatedIsValid = Number.isFinite(simulatedGrade) && simulatedGrade >= 0 && simulatedGrade <= config.maxGrade;
  const simulatedFinalAverage = simulatedIsValid
    ? roundGrade(knownWeightedSum + gradeContribution(simulatedGrade, missingCut.weight))
    : null;
  const simulatedPasses = simulatedFinalAverage !== null && simulatedFinalAverage >= config.minPassingGrade;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          <CardTitle>Nota exacta que necesitas en {missingCut.label}</CardTitle>
        </div>
        <CardDescription>
          Con tus notas registradas, este es el valor matemático exacto que debes obtener para aprobar la materia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 py-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Nota requerida en {missingCut.label}
          </span>
          <span
            className={cn(
              "text-5xl font-bold tracking-tight",
              alreadyPassed ? "text-emerald-600" : impossible ? "text-red-500" : "text-indigo-700",
            )}
          >
            {alreadyPassed ? "0.0" : impossible ? "—" : requiredGrade.toFixed(2)}
          </span>
          <span className="text-sm text-slate-500">sobre un máximo de {config.maxGrade}</span>
        </div>

        {alreadyPassed ? (
          <Alert level="success" title="¡Ya aprobaste la materia!">
            Con las notas que ya registraste, tu nota final mínima garantizada es{" "}
            <strong>{roundGrade(knownWeightedSum).toFixed(2)}</strong>, igual o superior a la mínima aprobatoria (
            {config.minPassingGrade}). Podrías sacar 0 en {missingCut.label} y aun así aprobar.
          </Alert>
        ) : impossible ? (
          <Alert level="danger" title="Matemáticamente ya no es posible aprobar">
            Incluso obteniendo la nota máxima ({config.maxGrade}) en {missingCut.label}, tu mejor promedio posible
            sería{" "}
            <strong>
              {roundGrade(knownWeightedSum + gradeContribution(config.maxGrade, missingCut.weight)).toFixed(2)}
            </strong>
            , por debajo del mínimo aprobatorio ({config.minPassingGrade}). Considera hablar con tu docente sobre
            actividades de recuperación.
          </Alert>
        ) : (
          <Alert level="info" title="Proyección viable">
            Necesitas obtener al menos <strong>{requiredGrade.toFixed(2)}</strong> en {missingCut.label} para alcanzar
            el promedio mínimo de {config.minPassingGrade}.
          </Alert>
        )}

        {!alreadyPassed && !impossible ? (
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">
              Simulador: ¿qué pasaría si obtienes otra nota en {missingCut.label}?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="range"
                min={0}
                max={config.maxGrade}
                step={config.maxGrade > 20 ? 1 : 0.1}
                value={simulatedIsValid ? simulatedGrade : 0}
                onChange={(event) => setSimulatedGradeText(event.target.value)}
                className="h-2 flex-1 cursor-pointer accent-indigo-600"
              />
              <span className="w-20 shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-center text-sm font-semibold text-slate-700">
                {simulatedIsValid ? simulatedGrade.toFixed(1) : "—"}
              </span>
            </div>
            {simulatedFinalAverage !== null ? (
              <p className="mt-3 text-sm text-slate-600">
                Tu nota final sería{" "}
                <strong className={simulatedPasses ? "text-emerald-600" : "text-red-500"}>
                  {simulatedFinalAverage.toFixed(2)}
                </strong>{" "}
                — {simulatedPasses ? "Aprobarías la materia ✅" : "No alcanzaría para aprobar ❌"}
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
