import { useState } from "react";
import { ClipboardList, Lock } from "lucide-react";
import type { AcademicConfig, CutId, GradesRecord } from "../../types/academic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { NumberField } from "../ui/NumberField";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { parseNumericInput, validateGradeInput } from "../../utils/validation";

interface GradesStepProps {
  config: AcademicConfig;
  grades: GradesRecord;
  onChange: (grades: GradesRecord) => void;
  onBack: () => void;
  onContinue: () => void;
}

/**
 * Paso 2 del asistente: registro de las notas ya obtenidas. Los cortes se
 * habilitan de forma secuencial (Corte 2 requiere Corte 1 válido, etc.)
 * porque, en la práctica académica, las notas se publican en ese orden.
 */
export function GradesStep({ config, grades, onChange, onBack, onContinue }: GradesStepProps) {
  const [texts, setTexts] = useState<Record<CutId, string>>({
    corte1: grades.corte1 !== null ? String(grades.corte1) : "",
    corte2: grades.corte2 !== null ? String(grades.corte2) : "",
    corte3: grades.corte3 !== null ? String(grades.corte3) : "",
  });

  const handleGradeChange = (cutId: CutId, text: string) => {
    const parsed = parseNumericInput(text);
    const validation = parsed !== null ? validateGradeInput(parsed, config.maxGrade) : { valid: true };
    const nextValue = parsed !== null && validation.valid ? parsed : null;

    const changedIndex = config.cuts.findIndex((cut) => cut.id === cutId);
    const updatedGrades: GradesRecord = { ...grades, [cutId]: nextValue };

    // Si la nota de este corte queda vacía/ inválida, los cortes posteriores
    // dependen de ella (se bloquean en la UI), así que también se limpian
    // para que los cálculos nunca usen una nota "fantasma" de un corte que
    // visualmente ya no está disponible para edición.
    if (nextValue === null) {
      for (let i = changedIndex + 1; i < config.cuts.length; i += 1) {
        updatedGrades[config.cuts[i].id] = null;
      }
    }

    setTexts((previous) => {
      const next = { ...previous, [cutId]: text };
      if (nextValue === null) {
        for (let i = changedIndex + 1; i < config.cuts.length; i += 1) {
          next[config.cuts[i].id] = "";
        }
      }
      return next;
    });

    onChange(updatedGrades);
  };

  const isUnlocked = (index: number): boolean => {
    if (index === 0) return true;
    const previousCut = config.cuts[index - 1];
    return grades[previousCut.id] !== null;
  };

  const firstCutValid = grades.corte1 !== null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-600" />
          <CardTitle>Registro de calificaciones</CardTitle>
        </div>
        <CardDescription>
          Ingresa únicamente las notas de los cortes que ya finalizaste. Deja en blanco los que aún no tienes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {config.cuts.map((cut, index) => {
            const unlocked = isUnlocked(index);
            const rawText = texts[cut.id];
            const parsed = parseNumericInput(rawText);
            const validation =
              rawText.trim() !== "" && parsed !== null ? validateGradeInput(parsed, config.maxGrade) : { valid: true };
            const hasEmptyError = rawText.trim() !== "" && parsed === null;

            return (
              <div key={cut.id} className="relative">
                <NumberField
                  label={`${cut.label} (peso ${cut.weight}%)`}
                  value={rawText}
                  onChange={(text) => handleGradeChange(cut.id, text)}
                  disabled={!unlocked}
                  placeholder={unlocked ? `0 – ${config.maxGrade}` : "Bloqueado"}
                  error={hasEmptyError ? "Valor no numérico." : !validation.valid ? validation.message : null}
                  hint={unlocked ? undefined : "Completa el corte anterior primero."}
                  className={!unlocked ? "bg-slate-50 text-slate-400" : undefined}
                />
                {!unlocked ? (
                  <Lock className="absolute right-3.5 top-9 h-4 w-4 text-slate-300" />
                ) : null}
              </div>
            );
          })}
        </div>

        {!firstCutValid ? (
          <Alert level="info" title="Comienza registrando el Corte 1">
            Necesitamos al menos la nota del primer corte para empezar a proyectar tu rendimiento.
          </Alert>
        ) : null}

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>
            ← Volver a configuración
          </Button>
          <Button onClick={onContinue} disabled={!firstCutValid}>
            Ver resultados y proyección →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
