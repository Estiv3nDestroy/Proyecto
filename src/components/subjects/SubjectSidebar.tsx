import { useState } from "react";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import type { Subject } from "../../types/academic";
import { evaluateSubject } from "../../utils/subjectStatus";
import { validateSubjectName } from "../../utils/validation";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";

interface SubjectSidebarProps {
  subjects: Subject[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

const statusTone: Record<string, "slate" | "emerald" | "amber" | "red" | "indigo"> = {
  "already-passed": "emerald",
  "in-progress": "indigo",
  impossible: "red",
  "completed-passed": "emerald",
  "completed-failed": "red",
};

const statusDot: Record<string, string> = {
  "already-passed": "bg-emerald-500",
  "in-progress": "bg-indigo-500",
  impossible: "bg-red-500",
  "completed-passed": "bg-emerald-500",
  "completed-failed": "bg-red-500",
};

/** Barra lateral con el listado de materias del estudiante (persistidas localmente). */
export function SubjectSidebar({ subjects, selectedId, onSelect, onAdd, onRemove }: SubjectSidebarProps) {
  const [newSubjectName, setNewSubjectName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const validation = validateSubjectName(newSubjectName);
    if (!validation.valid) {
      setError(validation.message ?? "Nombre inválido.");
      return;
    }
    onAdd(newSubjectName.trim());
    setNewSubjectName("");
    setError(null);
  };

  return (
    <aside className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-2 px-1">
        <BookOpen className="h-5 w-5 text-indigo-600" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Mis materias</h2>
      </div>

      <div className="space-y-2 px-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={newSubjectName}
            onChange={(event) => {
              setNewSubjectName(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleAdd();
            }}
            placeholder="Ej. Cálculo Diferencial"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
          />
          <Button size="sm" onClick={handleAdd} aria-label="Añadir materia">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto px-1 pb-2">
        {subjects.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-slate-400">
            Aún no tienes materias. Añade la primera para comenzar.
          </p>
        ) : (
          subjects.map((subject) => {
            const result = evaluateSubject(subject.config, subject.grades);
            const isSelected = subject.id === selectedId;
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => onSelect(subject.id)}
                className={cn(
                  "group flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition",
                  isSelected
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50",
                )}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", statusDot[result.status])} />
                  <span className="truncate text-sm font-medium text-slate-800">{subject.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge tone={statusTone[result.status]}>
                    {result.finalAverage !== null
                      ? result.finalAverage.toFixed(1)
                      : result.partialAverage !== null
                        ? `${result.partialAverage.toFixed(1)}*`
                        : "—"}
                  </Badge>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (window.confirm(`¿Eliminar "${subject.name}"? Esta acción no se puede deshacer.`)) {
                        onRemove(subject.id);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.stopPropagation();
                        onRemove(subject.id);
                      }
                    }}
                    className="rounded-md p-1 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                    aria-label={`Eliminar ${subject.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
