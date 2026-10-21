import { BarChart3 } from "lucide-react";
import type { AcademicConfig, CalculationResult, GradesRecord } from "../../types/academic";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { StatsOverview } from "./StatsOverview";
import { ExactProjection } from "./ExactProjection";
import { ScenarioSimulator } from "./ScenarioSimulator";
import { FinalSummary } from "./FinalSummary";

interface ResultsPanelProps {
  config: AcademicConfig;
  grades: GradesRecord;
  calculation: CalculationResult;
  onBack: () => void;
  onRestart: () => void;
}

/**
 * Paso 3 del asistente: interpreta cuántos cortes faltan por calificar y
 * decide qué tipo de proyección mostrar (exacta, de escenarios o resumen
 * final), delegando el cálculo matemático en cada subcomponente especializado.
 */
export function ResultsPanel({ config, grades, calculation, onBack, onRestart }: ResultsPanelProps) {
  const missingCuts = config.cuts.filter((cut) => grades[cut.id] === null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-900">Resultados y proyección</h2>
      </div>

      <StatsOverview config={config} calculation={calculation} />

      {missingCuts.length === 0 ? (
        <FinalSummary config={config} calculation={calculation} />
      ) : missingCuts.length === 1 ? (
        <ExactProjection config={config} knownWeightedSum={calculation.knownWeightedSum} missingCut={missingCuts[0]} />
      ) : missingCuts.length === 2 ? (
        <ScenarioSimulator
          config={config}
          knownWeightedSum={calculation.knownWeightedSum}
          missingCuts={[missingCuts[0], missingCuts[1]]}
        />
      ) : (
        <Alert level="info" title="Aún no has registrado notas">
          Vuelve al paso anterior e ingresa al menos la nota del Corte 1 para generar una proyección.
        </Alert>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          ← Editar notas
        </Button>
        <Button variant="secondary" onClick={onRestart}>
          Reiniciar materia
        </Button>
      </div>
    </div>
  );
}
