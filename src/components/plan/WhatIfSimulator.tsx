import { useMemo, useState } from "react";
import { SlidersHorizontal, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import type { AcademicConfig, GradesRecord, ScenarioPreset } from "../../types/academic";
import { Paper, RulerBar } from "../ui/Notebook";
import {
  generatePresetScenarios,
  gradeNeededInCut,
  simulateWhatIf,
  suggestedSliderValue,
} from "../../utils/whatIfSimulation";
import { formatGrade } from "../../utils/gradeMath";
import { cn } from "../../utils/cn";

interface WhatIfSimulatorProps {
  config: AcademicConfig;
  grades: GradesRecord;
}

const PRESET_BUTTONS: { preset: ScenarioPreset; label: string; icon: typeof Sparkles }[] = [
  { preset: "best", label: "Mejor caso", icon: TrendingUp },
  { preset: "realistic", label: "Realista", icon: Sparkles },
  { preset: "worst", label: "Peor caso", icon: TrendingDown },
];

export function WhatIfSimulator({ config, grades }: WhatIfSimulatorProps) {
  const missingCuts = config.cuts.filter((c) => grades[c.id] === null);

  const initialSliders = useMemo(() => {
    const suggested = suggestedSliderValue(config, grades);
    return Object.fromEntries(
      missingCuts.map((c) => [c.id, suggested]),
    ) as Record<string, number>;
  }, [config, grades, missingCuts]);

  const [sliderValues, setSliderValues] = useState<Record<string, number>>(initialSliders);

  // Reset sliders when the subject changes
  const sliderKey = missingCuts.map((c) => c.id).join(",");
  const [lastKey, setLastKey] = useState(sliderKey);
  if (sliderKey !== lastKey) {
    setSliderValues(initialSliders);
    setLastKey(sliderKey);
  }

  if (missingCuts.length === 0) {
    return (
      <Paper animate className="p-5 text-center">
        <p className="text-sm text-[var(--ink-soft)]">
          Ya tienes todas las notas registradas. No hay cortes pendientes para simular.
        </p>
      </Paper>
    );
  }

  const scenarios = missingCuts.map((cut) => ({
    cutId: cut.id,
    hypotheticalGrade: sliderValues[cut.id] ?? 0,
  }));

  const result = simulateWhatIf(config, grades, scenarios);

  const applyPreset = (preset: ScenarioPreset) => {
    const presetScenarios = generatePresetScenarios(config, grades, preset);
    const newValues = { ...sliderValues };
    for (const s of presetScenarios) {
      newValues[s.cutId] = s.hypotheticalGrade;
    }
    setSliderValues(newValues);
  };

  const deltaTone = result.deltaFromCurrent > 0 ? "pass" : result.deltaFromCurrent < 0 ? "fail" : "ink";

  return (
    <Paper margin animate className="space-y-4 p-5 pl-12 sm:pl-16">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-[var(--ink-soft)]" />
        <h3 className="font-hand text-2xl text-[var(--ink)]">Simulador "¿Y si?"</h3>
      </div>
      <p className="text-xs text-[var(--ink-soft)]">
        Mueve los sliders para ver cómo cambiaría tu nota final si sacaras distintas calificaciones en los cortes pendientes.
      </p>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESET_BUTTONS.map(({ preset, label, icon: Icon }) => (
          <button
            key={preset}
            type="button"
            onClick={() => applyPreset(preset)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {missingCuts.map((cut) => {
          const value = sliderValues[cut.id] ?? 0;
          const needed = gradeNeededInCut(config, grades, cut.id);
          return (
            <div key={cut.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--ink)]">{cut.label}</span>
                <span className="text-lg font-bold tabular-nums text-[var(--ink)]">
                  {formatGrade(value)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={config.maxGrade}
                step={0.1}
                value={value}
                onChange={(e) =>
                  setSliderValues((prev) => ({
                    ...prev,
                    [cut.id]: Number(e.target.value),
                  }))
                }
                className="slider-whatif mt-2 w-full"
                aria-label={`Nota hipotética para ${cut.label}`}
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--ink-faint)]">
                <span>0</span>
                {needed !== null && needed <= config.maxGrade && needed > 0 ? (
                  <span className="font-semibold text-[var(--ink-soft)]">
                    Necesitas: {formatGrade(needed)}
                  </span>
                ) : null}
                <span>{config.maxGrade}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Result */}
      <div className="rounded-xl border-2 border-dashed border-[var(--rule-margin)] p-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">
          Nota final proyectada
        </p>
        <p
          className="mt-1 text-4xl font-bold tabular-nums"
          style={{
            color: result.wouldPass ? "var(--pass)" : "var(--fail)",
          }}
        >
          {formatGrade(result.projectedFinal)}
        </p>
        <div className="mt-2 flex items-center justify-center gap-3 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1 font-semibold",
              result.wouldPass ? "text-[var(--pass)]" : "text-[var(--fail)]",
            )}
          >
            {result.wouldPass ? "Aprobarías" : "No aprobarías"}
          </span>
          <span className="text-[var(--ink-faint)]">·</span>
          <span
            className="font-semibold"
            style={{
              color: deltaTone === "pass" ? "var(--pass)" : deltaTone === "fail" ? "var(--fail)" : "var(--ink-soft)",
            }}
          >
            {result.deltaFromCurrent > 0 ? "+" : ""}
            {formatGrade(result.deltaFromCurrent)} vs. actual
          </span>
        </div>
        <RulerBar
          className="mt-3"
          value={result.projectedFinal}
          max={config.maxGrade}
          tone={result.wouldPass ? "pass" : "fail"}
          label="Nota proyectada"
        />
      </div>
    </Paper>
  );
}
