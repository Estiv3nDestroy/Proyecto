import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { Subject } from "../../types/academic";
import { Paper } from "../ui/Notebook";
import { assessRisk, RISK_COLORS, RISK_LABELS } from "../../utils/riskAssessment";
import { formatGrade } from "../../utils/gradeMath";
interface StudyPlanProps {
  subjects: Subject[];
  onSelectSubject: (id: string) => void;
}

const RISK_ICONS: Record<string, typeof CheckCircle2> = {
  green: CheckCircle2,
  yellow: AlertTriangle,
  red: ShieldAlert,
};

export function StudyPlan({ subjects, onSelectSubject }: StudyPlanProps) {
  const assessments = useMemo(
    () =>
      subjects.map((subject) => ({
        subject,
        risk: assessRisk(subject),
      })),
    [subjects],
  );

  const sorted = useMemo(
    () =>
      [...assessments].sort((a, b) => {
        const order = { red: 0, yellow: 1, green: 2 };
        return order[a.risk.level] - order[b.risk.level];
      }),
    [assessments],
  );

  if (subjects.length === 0) {
    return (
      <Paper animate className="p-10 text-center">
        <h3 className="font-hand text-3xl text-[var(--ink)]">No hay materias para analizar</h3>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Crea materias y registra notas para ver tu plan de estudio personalizado.
        </p>
      </Paper>
    );
  }

  return (
    <div className="space-y-3">
      <Paper margin animate className="p-4 pl-12 sm:pl-16">
        <h3 className="font-hand text-2xl text-[var(--ink)]">Plan de estudio inteligente</h3>
        <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
          Te decimos qué necesitas en cada corte pendiente y qué tan urgente es cada materia.
        </p>
      </Paper>

      {sorted.map(({ subject, risk }) => {
        const Icon = RISK_ICONS[risk.level];
        return (
          <Paper
            key={subject.id}
            animate
            className="cursor-pointer p-4 transition hover:shadow-[var(--shadow-lift)]"
            onClick={() => onSelectSubject(subject.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onSelectSubject(subject.id)}
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                style={{ background: `${RISK_COLORS[risk.level]}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: RISK_COLORS[risk.level] }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="truncate text-sm font-bold text-[var(--ink)]">{subject.name}</h4>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: `${RISK_COLORS[risk.level]}20`,
                      color: RISK_COLORS[risk.level],
                    }}
                  >
                    {RISK_LABELS[risk.level]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{risk.message}</p>
                {risk.neededGrade !== null && risk.isViable ? (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-[var(--ink-faint)]">Necesitas:</span>
                    <span
                      className="rounded-lg px-2 py-0.5 font-bold tabular-nums"
                      style={{
                        background: `${RISK_COLORS[risk.level]}15`,
                        color: RISK_COLORS[risk.level],
                      }}
                    >
                      {formatGrade(risk.neededGrade)}
                    </span>
                    <span className="text-[var(--ink-faint)]">
                      en el siguiente corte · Mínimo: {formatGrade(subject.config.minPassingGrade)}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </Paper>
        );
      })}
    </div>
  );
}
