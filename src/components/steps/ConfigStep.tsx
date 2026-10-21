import { useState } from "react";
import { Settings2 } from "lucide-react";
import type { AcademicConfig, CutId, ScalePreset } from "../../types/academic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { NumberField } from "../ui/NumberField";
import { Button } from "../ui/Button";
import { Alert } from "../ui/Alert";
import { SCALE_PRESETS } from "../../utils/subjectFactory";
import { parseNumericInput, validateCutWeights, validateMaxGrade, validateMinPassingGrade } from "../../utils/validation";
import { sumWeights } from "../../utils/gradeMath";
import { cn } from "../../utils/cn";

interface ConfigStepProps {
  config: AcademicConfig;
  onChange: (config: AcademicConfig) => void;
  onContinue: () => void;
}

/**
 * Paso 1 del asistente: define la escala de calificación, la nota mínima
 * aprobatoria y el peso porcentual de cada uno de los 3 cortes.
 */
export function ConfigStep({ config, onChange, onContinue }: ConfigStepProps) {
  const [maxGradeText, setMaxGradeText] = useState(String(config.maxGrade));
  const [minGradeText, setMinGradeText] = useState(String(config.minPassingGrade));
  const [weightTexts, setWeightTexts] = useState<Record<CutId, string>>({
    corte1: String(config.cuts[0].weight),
    corte2: String(config.cuts[1].weight),
    corte3: String(config.cuts[2].weight),
  });

  const applyPreset = (preset: Exclude<ScalePreset, "custom">) => {
    const presetData = SCALE_PRESETS[preset];
    setMaxGradeText(String(presetData.maxGrade));
    setMinGradeText(String(presetData.minPassingGrade));
    onChange({ ...config, maxGrade: presetData.maxGrade, minPassingGrade: presetData.minPassingGrade, scalePreset: preset });
  };

  const handleMaxGradeChange = (text: string) => {
    setMaxGradeText(text);
    const parsed = parseNumericInput(text);
    if (parsed !== null) {
      onChange({ ...config, maxGrade: parsed, scalePreset: "custom" });
    }
  };

  const handleMinGradeChange = (text: string) => {
    setMinGradeText(text);
    const parsed = parseNumericInput(text);
    if (parsed !== null) {
      onChange({ ...config, minPassingGrade: parsed, scalePreset: "custom" });
    }
  };

  const handleWeightChange = (cutId: CutId, text: string) => {
    setWeightTexts((previous) => ({ ...previous, [cutId]: text }));
    const parsed = parseNumericInput(text);
    if (parsed !== null) {
      const updatedCuts = config.cuts.map((cut) =>
        cut.id === cutId ? { ...cut, weight: parsed } : cut,
      ) as AcademicConfig["cuts"];
      onChange({ ...config, cuts: updatedCuts });
    }
  };

  const maxGradeValidation = validateMaxGrade(config.maxGrade);
  const minGradeValidation = maxGradeValidation.valid
    ? validateMinPassingGrade(config.minPassingGrade, config.maxGrade)
    : { valid: true };
  const weightsValidation = validateCutWeights(config.cuts);
  const totalWeight = sumWeights(config.cuts);

  const isStepValid = maxGradeValidation.valid && minGradeValidation.valid && weightsValidation.valid;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-indigo-600" />
          <CardTitle>Configuración de la materia</CardTitle>
        </div>
        <CardDescription>
          Define la escala de calificación, la nota mínima para aprobar y el peso de cada corte académico.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Escalas rápidas</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SCALE_PRESETS) as Array<Exclude<ScalePreset, "custom">>).map((presetKey) => (
              <button
                key={presetKey}
                type="button"
                onClick={() => applyPreset(presetKey)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                  config.scalePreset === presetKey
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50",
                )}
              >
                {SCALE_PRESETS[presetKey].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Nota máxima de la escala"
            value={maxGradeText}
            onChange={handleMaxGradeChange}
            error={!maxGradeValidation.valid ? maxGradeValidation.message : null}
            placeholder="Ej. 5.0"
          />
          <NumberField
            label="Nota mínima para aprobar"
            value={minGradeText}
            onChange={handleMinGradeChange}
            error={!minGradeValidation.valid ? minGradeValidation.message : null}
            placeholder="Ej. 3.0"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Peso porcentual de cada corte</p>
            <span className={cn("text-xs font-semibold", Math.abs(totalWeight - 100) < 0.001 ? "text-emerald-600" : "text-amber-600")}>
              Suma actual: {totalWeight.toFixed(1)}%
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {config.cuts.map((cut) => (
              <NumberField
                key={cut.id}
                label={cut.label}
                value={weightTexts[cut.id]}
                onChange={(text) => handleWeightChange(cut.id, text)}
                suffix="%"
                placeholder="0"
              />
            ))}
          </div>
          {!weightsValidation.valid ? (
            <p className="mt-2 text-xs font-medium text-red-500">{weightsValidation.message}</p>
          ) : null}
        </div>

        {!isStepValid ? (
          <Alert level="warning" title="Revisa la configuración">
            Corrige los campos marcados antes de continuar al registro de notas.
          </Alert>
        ) : null}

        <div className="flex justify-end pt-2">
          <Button onClick={onContinue} disabled={!isStepValid}>
            Continuar a registro de notas →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
