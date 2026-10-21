import { useState } from "react";
import { Target, TrendingUp } from "lucide-react";
import type { Goal, Subject } from "../../types/academic";
import { Paper, RulerBar } from "../ui/Notebook";
import { evaluateSubject } from "../../utils/subjectStatus";
import { formatGrade } from "../../utils/gradeMath";
import { cn } from "../../utils/cn";

interface GoalsPanelProps {
  subjects: Subject[];
  globalGoal: Goal | null;
  subjectGoals: Goal[];
  onSetGlobalGoal: (target: number) => void;
  onSetSubjectGoal: (subjectId: string, target: number) => void;
  onRemoveGoal: (id: string) => void;
}

export function GoalsPanel({
  subjects,
  globalGoal,
  subjectGoals,
  onSetGlobalGoal,
  onSetSubjectGoal,
  onRemoveGoal,
}: GoalsPanelProps) {
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [globalEdit, setGlobalEdit] = useState(false);
  const [globalValue, setGlobalValue] = useState("");

  const maxScale = subjects[0]?.config.maxGrade ?? 5;

  const handleSetGlobal = () => {
    const value = Number(globalValue);
    if (Number.isFinite(value) && value > 0 && value <= maxScale) {
      onSetGlobalGoal(value);
      setGlobalEdit(false);
      setGlobalValue("");
    }
  };

  const handleSetSubject = (subjectId: string) => {
    const value = Number(editValue);
    const subject = subjects.find((s) => s.id === subjectId);
    if (subject && Number.isFinite(value) && value > 0 && value <= subject.config.maxGrade) {
      onSetSubjectGoal(subjectId, value);
      setEditingSubjectId(null);
      setEditValue("");
    }
  };

  return (
    <div className="space-y-4">
      <Paper margin animate className="p-4 pl-12 sm:pl-16">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-[var(--ink-soft)]" />
          <h3 className="font-hand text-2xl text-[var(--ink)]">Metas académicas</h3>
        </div>
        <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
          Fija metas por materia y una meta global para tu semestre. Te avisamos cómo vas.
        </p>
      </Paper>

      {/* Global goal */}
      <Paper tape="left" animate className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">
              Meta global del semestre
            </p>
            {globalGoal ? (
              <p className="mt-1 text-4xl font-bold tabular-nums text-[var(--ink)]">
                {formatGrade(globalGoal.targetGrade)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-[var(--ink-soft)]">Sin meta definida</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setGlobalEdit((e) => !e);
              setGlobalValue(globalGoal ? String(globalGoal.targetGrade) : "");
            }}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
          >
            {globalGoal ? "Cambiar" : "Definir"}
          </button>
        </div>

        {globalEdit ? (
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              max={maxScale}
              value={globalValue}
              onChange={(e) => setGlobalValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetGlobal()}
              className="w-24 rounded-lg border border-[var(--border)] bg-[var(--paper)] px-3 py-1.5 text-sm text-[var(--ink)] outline-none"
              placeholder={`/${maxScale}`}
            />
            <button
              type="button"
              onClick={handleSetGlobal}
              className="rounded-lg bg-[var(--ink)] px-3 py-1.5 text-sm font-semibold text-[var(--paper)]"
            >
              Guardar
            </button>
            {globalGoal ? (
              <button
                type="button"
                onClick={() => {
                  onRemoveGoal(globalGoal.id);
                  setGlobalEdit(false);
                }}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-[var(--fail)]"
              >
                Quitar
              </button>
            ) : null}
          </div>
        ) : null}
      </Paper>

      {/* Subject goals */}
      <div className="space-y-2">
        {subjects.length === 0 ? (
          <Paper animate className="p-6 text-center text-sm text-[var(--ink-soft)]">
            Crea materias para fijar metas individuales.
          </Paper>
        ) : (
          subjects.map((subject) => {
            const goal = subjectGoals.find((g) => g.subjectId === subject.id);
            const evaluation = evaluateSubject(subject.config, subject.grades);
            const current = evaluation.finalAverage ?? evaluation.partialAverage;
            const target = goal?.targetGrade ?? subject.config.minPassingGrade;
            const progress = current !== null ? current : 0;
            const isOnTrack = current !== null && current >= target;
            const margin = current !== null ? target - current : target;

            return (
              <Paper key={subject.id} animate className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-[var(--ink)]">
                    {subject.name}
                  </span>
                  {editingSubjectId === subject.id ? (
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max={subject.config.maxGrade}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSetSubject(subject.id)}
                        className="w-20 rounded-lg border border-[var(--border)] bg-[var(--paper)] px-2 py-1 text-xs text-[var(--ink)] outline-none"
                        placeholder={`/${subject.config.maxGrade}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleSetSubject(subject.id)}
                        className="rounded bg-[var(--ink)] px-2 py-1 text-xs font-semibold text-[var(--paper)]"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubjectId(subject.id);
                        setEditValue(goal ? String(goal.targetGrade) : "");
                      }}
                      className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
                    >
                      Meta: {goal ? formatGrade(goal.targetGrade) : "—"}
                    </button>
                  )}
                </div>

                {goal ? (
                  <div className="mt-3">
                    <RulerBar
                      value={progress}
                      max={subject.config.maxGrade}
                      tone={isOnTrack ? "pass" : margin <= subject.config.maxGrade * 0.1 ? "risk" : "ink"}
                      label={`Progreso de ${subject.name}`}
                    />
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-[var(--ink-faint)]">
                        Actual: {current !== null ? formatGrade(current) : "—"}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-semibold",
                          isOnTrack ? "text-[var(--pass)]" : "text-[var(--risk)]",
                        )}
                      >
                        <TrendingUp className="h-3 w-3" />
                        {isOnTrack
                          ? "¡Vas bien!"
                          : current !== null
                            ? `Te falta ${formatGrade(margin)}`
                            : "Registra notas para medir"}
                      </span>
                    </div>
                  </div>
                ) : null}
              </Paper>
            );
          })
        )}
      </div>
    </div>
  );
}
