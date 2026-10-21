import type { AcademicConfig, CalculationResult } from "../../types/academic";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface StatsOverviewProps {
  config: AcademicConfig;
  calculation: CalculationResult;
}

const statusLabels: Record<CalculationResult["status"], { label: string; tone: "slate" | "emerald" | "amber" | "red" | "indigo" }> = {
  "already-passed": { label: "Aprobada", tone: "emerald" },
  "in-progress": { label: "En curso", tone: "indigo" },
  impossible: { label: "Inviable", tone: "red" },
  "completed-passed": { label: "Aprobada", tone: "emerald" },
  "completed-failed": { label: "Reprobada", tone: "red" },
};

/** Fila de métricas clave que resume el estado actual de la materia. */
export function StatsOverview({ config, calculation }: StatsOverviewProps) {
  const statusInfo = statusLabels[calculation.status];

  const items = [
    {
      label: "Nota mínima para aprobar",
      value: config.minPassingGrade.toFixed(1),
    },
    {
      label: "Promedio parcial actual",
      value: calculation.partialAverage !== null ? calculation.partialAverage.toFixed(2) : "—",
    },
    {
      label: "Peso ya evaluado",
      value: `${calculation.knownWeightTotal.toFixed(0)}%`,
    },
    {
      label: "Peso restante",
      value: `${calculation.remainingWeightTotal.toFixed(0)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} className="px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{item.label}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{item.value}</p>
        </Card>
      ))}
      <Card className="flex flex-col justify-center px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Estado</p>
        <div className="mt-1.5">
          <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
        </div>
      </Card>
    </div>
  );
}
