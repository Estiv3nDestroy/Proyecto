import { useMemo } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Subject } from "../../types/academic";
import { evaluateSubject } from "../../utils/subjectStatus";
import { classifyGrade, formatGrade, roundGrade } from "../../utils/gradeMath";
import { BooksArt, CountUp, Paper, RulerBar, Stamp } from "../ui/Notebook";

interface SubjectsDashboardProps {
  subjects: Subject[];
  onSelectSubject: (id: string) => void;
}

const TONE_COLOR: Record<"pass" | "risk" | "fail", string> = {
  pass: "var(--pass)",
  risk: "var(--risk)",
  fail: "var(--fail)",
};

/**
 * Panel general: promedio acumulado del semestre, comparación contra la meta
 * y gráfico de barras con el desempeño de cada materia.
 */
export function SubjectsDashboard({ subjects, onSelectSubject }: SubjectsDashboardProps) {
  const data = useMemo(() => {
    const rows = subjects.map((subject) => {
      const evaluation = evaluateSubject(subject.config, subject.grades);
      const value = evaluation.finalAverage ?? evaluation.partialAverage ?? 0;
      return {
        id: subject.id,
        name: subject.name.length > 14 ? `${subject.name.slice(0, 13)}…` : subject.name,
        fullName: subject.name,
        nota: roundGrade(value),
        meta: subject.config.minPassingGrade,
        max: subject.config.maxGrade,
        hasData: evaluation.knownCutsCount > 0,
        tone: classifyGrade(value, subject.config.minPassingGrade),
      };
    });

    const withData = rows.filter((row) => row.hasData);
    const accumulated =
      withData.length > 0
        ? roundGrade(withData.reduce((sum, row) => sum + row.nota, 0) / withData.length)
        : 0;
    const target =
      subjects.length > 0
        ? roundGrade(
            subjects.reduce((sum, s) => sum + s.config.minPassingGrade, 0) / subjects.length,
          )
        : 3;
    const maxScale = subjects[0]?.config.maxGrade ?? 5;

    return {
      rows,
      withDataCount: withData.length,
      accumulated,
      target,
      maxScale,
      passing: withData.filter((row) => row.tone === "pass").length,
      atRisk: withData.filter((row) => row.tone !== "pass").length,
    };
  }, [subjects]);

  if (subjects.length === 0) {
    return (
      <Paper animate className="p-10 text-center">
        <BooksArt className="mx-auto h-16 w-24" />
        <h3 className="font-hand mt-3 text-3xl text-[var(--ink)]">Aún no hay materias</h3>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Crea tu primera materia en el panel lateral para ver aquí tu resumen del semestre.
        </p>
      </Paper>
    );
  }

  const accumulatedTone = classifyGrade(data.accumulated, data.target);

  return (
    <div className="space-y-4">
      {/* Resumen superior */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Paper tape="left" animate className="p-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">
            Promedio acumulado
          </p>
          <p
            className="mt-1 text-5xl font-bold tabular-nums"
            style={{ color: TONE_COLOR[accumulatedTone] }}
          >
            <CountUp value={data.accumulated} decimals={2} />
          </p>
          <RulerBar
            className="mt-3"
            value={data.accumulated}
            max={data.maxScale}
            tone={accumulatedTone}
            label="Promedio acumulado del semestre"
          />
          <p className="mt-2 text-xs text-[var(--ink-soft)]">
            Meta del semestre: {formatGrade(data.target, 1)}
          </p>
        </Paper>

        <Paper animate className="p-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">
            Materias registradas
          </p>
          <p className="mt-1 text-5xl font-bold tabular-nums text-[var(--ink)]">{subjects.length}</p>
          <p className="mt-3 text-xs text-[var(--ink-soft)]">
            {data.withDataCount} con notas · {subjects.length - data.withDataCount} sin empezar
          </p>
        </Paper>

        <Paper tape="right" animate className="flex flex-col items-center justify-center gap-2 p-5 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">
            Estado general
          </p>
          {data.withDataCount === 0 ? (
            <p className="text-sm text-[var(--ink-soft)]">Registra notas para ver tu estado.</p>
          ) : (
            <>
              <Stamp tone={data.atRisk === 0 ? "pass" : data.passing === 0 ? "fail" : "risk"}>
                {data.atRisk === 0 ? "Todo al día" : data.passing === 0 ? "Alerta" : "Atención"}
              </Stamp>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                {data.passing} aprobando · {data.atRisk} por mejorar
              </p>
            </>
          )}
        </Paper>
      </div>

      {/* Gráfico de evolución */}
      <Paper ruled margin animate className="p-5 pl-12 sm:pl-16">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[var(--ink-soft)]" />
          <h3 className="font-hand text-2xl text-[var(--ink)]">Comparación por materia</h3>
        </div>
        <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
          La línea punteada marca la nota mínima para aprobar.
        </p>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.rows} margin={{ top: 8, right: 8, left: -22, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, data.maxScale]}
                tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--surface-2)" }}
                contentStyle={{
                  background: "var(--paper)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--ink)",
                }}
                formatter={(value) => [formatGrade(Number(value) || 0, 2), "Nota"]}
                labelFormatter={(label) =>
                  data.rows.find((row) => row.name === String(label))?.fullName ?? String(label)
                }
              />
              <ReferenceLine y={data.target} stroke="var(--rule-margin)" strokeDasharray="5 4" />
              <Bar dataKey="nota" radius={[6, 6, 0, 0]} maxBarSize={52}>
                {data.rows.map((row) => (
                  <Cell key={row.id} fill={TONE_COLOR[row.tone]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Paper>

      {/* Listado rápido */}
      <Paper animate className="divide-y divide-[var(--border)] p-2">
        {data.rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => onSelectSubject(row.id)}
            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[var(--surface-2)]"
          >
            <span className="flex items-center gap-2 truncate text-sm font-semibold text-[var(--ink)]">
              <TrendingUp className="h-4 w-4 shrink-0" style={{ color: TONE_COLOR[row.tone] }} />
              {row.fullName}
            </span>
            <span
              className="shrink-0 text-lg font-bold tabular-nums"
              style={{ color: row.hasData ? TONE_COLOR[row.tone] : "var(--ink-faint)" }}
            >
              {row.hasData ? formatGrade(row.nota, 2) : "—"}
            </span>
          </button>
        ))}
      </Paper>
    </div>
  );
}
