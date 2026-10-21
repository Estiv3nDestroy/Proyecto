import { useState } from "react";
import { Pencil } from "lucide-react";
import type { AcademicConfig, GradesRecord, Subject } from "../../types/academic";
import { Stepper } from "../ui/Stepper";
import { ConfigStep } from "../steps/ConfigStep";
import { GradesStep } from "../steps/GradesStep";
import { ResultsPanel } from "../results/ResultsPanel";
import { useGradeCalculation } from "../../hooks/useGradeCalculation";
import { validateSubjectName } from "../../utils/validation";

interface SubjectWorkspaceProps {
  subject: Subject;
  onConfigChange: (config: AcademicConfig) => void;
  onGradesChange: (grades: GradesRecord) => void;
  onRename: (name: string) => void;
  onResetGrades: () => void;
}

const STEPS = [
  { id: "config", label: "Configuración" },
  { id: "grades", label: "Notas" },
  { id: "results", label: "Resultados" },
];

/**
 * Orquesta el asistente de 3 pasos para una materia específica. Se remonta
 * por completo (ver `key={subject.id}` en App.tsx) cada vez que el usuario
 * cambia de materia, evitando fugas de estado entre materias distintas.
 */
export function SubjectWorkspace({ subject, onConfigChange, onGradesChange, onRename, onResetGrades }: SubjectWorkspaceProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(subject.name);
  const [nameError, setNameError] = useState<string | null>(null);

  const calculation = useGradeCalculation(subject.config, subject.grades);

  const commitName = () => {
    const validation = validateSubjectName(nameDraft);
    if (!validation.valid) {
      setNameError(validation.message ?? "Nombre inválido.");
      return;
    }
    onRename(nameDraft.trim());
    setIsEditingName(false);
    setNameError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && commitName()}
              onBlur={commitName}
              className="rounded-lg border border-indigo-300 px-3 py-1.5 text-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameDraft(subject.name);
              setIsEditingName(true);
            }}
            className="group flex items-center gap-2"
          >
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{subject.name}</h1>
            <Pencil className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
          </button>
        )}
      </div>
      {nameError ? <p className="-mt-4 text-xs font-medium text-red-500">{nameError}</p> : null}

      <Stepper steps={STEPS} currentIndex={stepIndex} onStepClick={setStepIndex} />

      {stepIndex === 0 ? (
        <ConfigStep config={subject.config} onChange={onConfigChange} onContinue={() => setStepIndex(1)} />
      ) : stepIndex === 1 ? (
        <GradesStep
          config={subject.config}
          grades={subject.grades}
          onChange={onGradesChange}
          onBack={() => setStepIndex(0)}
          onContinue={() => setStepIndex(2)}
        />
      ) : (
        <ResultsPanel
          config={subject.config}
          grades={subject.grades}
          calculation={calculation}
          onBack={() => setStepIndex(1)}
          onRestart={() => {
            onResetGrades();
            setStepIndex(1);
          }}
        />
      )}
    </div>
  );
}
