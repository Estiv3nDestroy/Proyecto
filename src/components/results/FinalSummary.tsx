import { PartyPopper, Frown } from "lucide-react";
import type { AcademicConfig, CalculationResult } from "../../types/academic";
import { Card, CardContent } from "../ui/Card";
import { cn } from "../../utils/cn";

interface FinalSummaryProps {
  config: AcademicConfig;
  calculation: CalculationResult;
}

/** Vista final cuando los 3 cortes ya tienen nota registrada. */
export function FinalSummary({ config, calculation }: FinalSummaryProps) {
  const passed = calculation.status === "completed-passed";
  const finalAverage = calculation.finalAverage ?? 0;

  return (
    <Card
      className={cn(
        "overflow-hidden border-2",
        passed ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60",
      )}
    >
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        {passed ? (
          <PartyPopper className="h-10 w-10 text-emerald-500" />
        ) : (
          <Frown className="h-10 w-10 text-red-400" />
        )}
        <h2 className={cn("text-2xl font-bold", passed ? "text-emerald-700" : "text-red-600")}>
          {passed ? "¡Felicidades, aprobaste la materia!" : "No alcanzaste la nota mínima"}
        </h2>
        <p className="text-sm text-slate-500">
          Nota final ponderada obtenida con los 3 cortes registrados.
        </p>
        <span className={cn("text-6xl font-extrabold tracking-tight", passed ? "text-emerald-600" : "text-red-500")}>
          {finalAverage.toFixed(2)}
        </span>
        <p className="text-sm text-slate-500">
          Nota mínima requerida: <strong>{config.minPassingGrade}</strong> · Escala 0 – {config.maxGrade}
        </p>
      </CardContent>
    </Card>
  );
}
