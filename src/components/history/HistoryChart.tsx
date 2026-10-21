import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GradeSnapshot, Subject } from "../../types/academic";
import { Paper } from "../ui/Notebook";
import { evaluateSubject } from "../../utils/subjectStatus";
import { roundGrade } from "../../utils/gradeMath";

interface HistoryChartProps {
  snapshots: GradeSnapshot[];
  subjects: Subject[];
  onTakeSnapshot: () => void;
}

export function HistoryChart({ snapshots, subjects, onTakeSnapshot }: HistoryChartProps) {
  const chartData = useMemo(() => {
    // Build per-subject history from snapshots + current state
    const currentData = subjects.map((subject) => {
      const eval_ = evaluateSubject(subject.config, subject.grades);
      const value = eval_.finalAverage ?? eval_.partialAverage;
      return {
        name: subject.name.length > 12 ? `${subject.name.slice(0, 11)}…` : subject.name,
        nota: value !== null ? roundGrade(value) : null,
      };
    });

    // History from snapshots
    const historyPoints = snapshots.map((snap) => ({
      date: new Date(snap.date).toLocaleDateString("es", { day: "numeric", month: "short" }),
      promedio: snap.average,
    }));

    return { currentData, historyPoints };
  }, [snapshots, subjects]);

  const hasSnapshots = chartData.historyPoints.length > 0;

  return (
    <div className="space-y-4">
      <Paper margin animate className="p-4 pl-12 sm:pl-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--ink-soft)]" />
            <h3 className="font-hand text-2xl text-[var(--ink)]">Historial y evolución</h3>
          </div>
          <button
            type="button"
            onClick={onTakeSnapshot}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
          >
            Guardar punto actual
          </button>
        </div>
        <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
          Guarda puntos de tu promedio a lo largo del tiempo para ver cómo evolucionas.
        </p>
      </Paper>

      {hasSnapshots ? (
        <Paper ruled margin animate className="p-5 pl-12 sm:pl-16">
          <h4 className="mb-3 text-sm font-semibold text-[var(--ink)]">Evolución del promedio</h4>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.historyPoints} margin={{ top: 8, right: 8, left: -22, bottom: 4 }}>
                <defs>
                  <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--ink-soft)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--ink-soft)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--paper)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--ink)",
                  }}
                  formatter={(value) => [String(Number(value).toFixed(2)), "Promedio"]}
                />
                <Area
                  type="monotone"
                  dataKey="promedio"
                  stroke="var(--ink-soft)"
                  strokeWidth={2}
                  fill="url(#avgGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Paper>
      ) : (
        <Paper animate className="p-6 text-center">
          <p className="text-sm text-[var(--ink-soft)]">
            Aún no has guardado puntos de tu promedio. Pulsa "Guardar punto actual" para empezar a registrar tu evolución.
          </p>
        </Paper>
      )}

      {/* Current state chart */}
      {subjects.length > 0 ? (
        <Paper ruled margin animate className="p-5 pl-12 sm:pl-16">
          <h4 className="mb-3 text-sm font-semibold text-[var(--ink)]">Notas actuales por materia</h4>
          <div className="space-y-2">
            {chartData.currentData.map((row, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs font-medium text-[var(--ink-soft)]">
                  {row.name}
                </span>
                <div className="relative h-5 flex-1 rounded-full bg-[var(--surface-2)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${row.nota !== null ? (row.nota / (subjects[0]?.config.maxGrade ?? 5)) * 100 : 0}%`,
                      background: "var(--ink-soft)",
                    }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums text-[var(--ink)]">
                  {row.nota !== null ? row.nota.toFixed(2) : "—"}
                </span>
              </div>
            ))}
          </div>
        </Paper>
      ) : null}
    </div>
  );
}
