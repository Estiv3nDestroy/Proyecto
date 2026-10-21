import { useState } from "react";
import { Scale, SlidersHorizontal } from "lucide-react";
import type { AcademicConfig, CutWeight } from "../../types/academic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Alert } from "../ui/Alert";
import { NumberField } from "../ui/NumberField";
import { calculateRequiredGrade, gradeContribution, roundGrade, sumWeights } from "../../utils/gradeMath";
import { parseNumericInput, validateGradeInput } from "../../utils/validation";
import { cn } from "../../utils/cn";

interface ScenarioSimulatorProps {
  config: AcademicConfig;
  knownWeightedSum: number;
  missingCuts: [CutWeight, CutWeight];
}

/**
 * Proyecta un escenario en vista de "resultado" (nota requerida y su
 * viabilidad), reutilizado tanto para el escenario equilibrado como para
 * el escenario personalizado.
 */
function ProjectionResult({
  config,
  requiredGrade,
  targetLabel,
}: {
  config: AcademicConfig;
  requiredGrade: number;
  targetLabel: string;
}) {
  const alreadyPassed = requiredGrade <= 0;
  const impossible = requiredGrade > config.maxGrade;

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 py-5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{targetLabel}</span>
      <span
        className={cn(
          "text-3xl font-bold",
          alreadyPassed ? "text-emerald-600" : impossible ? "text-red-500" : "text-indigo-700",
        )}
      >
        {alreadyPassed ? "0.0" : impossible ? "—" : requiredGrade.toFixed(2)}
      </span>
    </div>
  );
}

/**
 * Caso con DOS cortes pendientes (normalmente Corte 2 y Corte 3, sabiendo
 * solo Corte 1). Ofrece dos formas complementarias de proyectar el esfuerzo
 * restante:
 *
 *  1) Escenario equilibrado: asume el mismo rendimiento en ambos cortes
 *     restantes, tratando su peso combinado como un único bloque objetivo.
 *  2) Escenario personalizado: el estudiante fija una nota hipotética para
 *     uno de los cortes y el sistema despeja matemáticamente la nota exacta
 *     que necesitaría en el otro.
 */
export function ScenarioSimulator({ config, knownWeightedSum, missingCuts }: ScenarioSimulatorProps) {
  const [fixedCutIndex, setFixedCutIndex] = useState<0 | 1>(1);
  const fixedCut = missingCuts[fixedCutIndex];
  const solvedCut = missingCuts[fixedCutIndex === 0 ? 1 : 0];

  const [assumedGradeText, setAssumedGradeText] = useState(String(config.minPassingGrade));
  const assumedGrade = parseNumericInput(assumedGradeText);
  const assumedValidation = assumedGrade !== null ? validateGradeInput(assumedGrade, config.maxGrade) : { valid: true };

  // --- Escenario equilibrado (mismo esfuerzo en ambos cortes restantes) ---
  const combinedWeight = sumWeights(missingCuts);
  const balancedRequiredGrade = roundGrade(
    calculateRequiredGrade(config.minPassingGrade, knownWeightedSum, combinedWeight),
  );

  // --- Escenario personalizado (fijas uno, se despeja el otro) ---
  const customAccumulated =
    assumedGrade !== null && assumedValidation.valid
      ? knownWeightedSum + gradeContribution(assumedGrade, fixedCut.weight)
      : null;
  const customRequiredGrade =
    customAccumulated !== null
      ? roundGrade(calculateRequiredGrade(config.minPassingGrade, customAccumulated, solvedCut.weight))
      : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-600" />
            <CardTitle>Escenario equilibrado</CardTitle>
          </div>
          <CardDescription>
            Nota mínima que necesitarías en <strong>{missingCuts[0].label}</strong> y{" "}
            <strong>{missingCuts[1].label}</strong> si mantienes exactamente el mismo rendimiento en ambos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProjectionResult
            config={config}
            requiredGrade={balancedRequiredGrade}
            targetLabel={`Nota igual en ${missingCuts[0].label} y ${missingCuts[1].label}`}
          />
          {balancedRequiredGrade <= 0 ? (
            <Alert level="success" title="¡Ya tienes la materia asegurada!">
              Con las notas que ya registraste, incluso sacando 0 en los cortes restantes alcanzarías el mínimo
              aprobatorio.
            </Alert>
          ) : balancedRequiredGrade > config.maxGrade ? (
            <Alert level="danger" title="Imposible con rendimiento uniforme">
              Ni sacando la nota máxima ({config.maxGrade}) de forma pareja en ambos cortes alcanzarías el mínimo
              aprobatorio. Revisa el escenario personalizado para ver otras combinaciones.
            </Alert>
          ) : (
            <Alert level="info" title="Esfuerzo distribuido de forma pareja">
              Si sacas al menos <strong>{balancedRequiredGrade.toFixed(2)}</strong> en cada uno de los dos cortes
              restantes, aprobarás la materia.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
            <CardTitle>Escenario personalizado</CardTitle>
          </div>
          <CardDescription>
            Fija una nota hipotética para un corte y calcula exactamente cuánto necesitarías en el otro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {missingCuts.map((cut, index) => (
              <button
                key={cut.id}
                type="button"
                onClick={() => setFixedCutIndex(index as 0 | 1)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-medium transition",
                  fixedCutIndex === index
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300",
                )}
              >
                Fijar nota de {cut.label}
              </button>
            ))}
          </div>

          <NumberField
            label={`Nota hipotética para ${fixedCut.label}`}
            value={assumedGradeText}
            onChange={setAssumedGradeText}
            error={!assumedValidation.valid ? assumedValidation.message : null}
            suffix={`/ ${config.maxGrade}`}
          />

          {customRequiredGrade !== null ? (
            <>
              <ProjectionResult
                config={config}
                requiredGrade={customRequiredGrade}
                targetLabel={`Nota necesaria en ${solvedCut.label}`}
              />
              {customRequiredGrade <= 0 ? (
                <Alert level="success" title="¡Ya aprobarías la materia!">
                  Con esa nota hipotética en {fixedCut.label}, podrías sacar 0 en {solvedCut.label} y aun así aprobar.
                </Alert>
              ) : customRequiredGrade > config.maxGrade ? (
                <Alert level="danger" title="Combinación no viable">
                  Ni sacando la nota máxima en {solvedCut.label} alcanzarías el mínimo aprobatorio con ese supuesto en{" "}
                  {fixedCut.label}. Prueba con una nota hipotética más alta.
                </Alert>
              ) : (
                <Alert level="info" title="Proyección personalizada">
                  Si obtienes <strong>{assumedGrade?.toFixed(2)}</strong> en {fixedCut.label}, necesitarás al menos{" "}
                  <strong>{customRequiredGrade.toFixed(2)}</strong> en {solvedCut.label} para aprobar.
                </Alert>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
