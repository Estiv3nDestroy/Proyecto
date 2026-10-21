import { useCallback, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Eraser,
  HelpCircle,
  Plus,
  RotateCcw,
  Save,
  Scale,
  Sigma,
  Target,
  Trash2,
} from "lucide-react";
import {
  calculateCategories,
  calculateNeededGrade,
  classifyGrade,
  formatGrade,
  parseScoreList,
  type AverageMode,
  type GradeCategory,
} from "../../utils/gradeMath";
import { generateId } from "../../utils/subjectFactory";
import { CalculatorArt, Confetti, CountUp, Paper, PostIt, RulerBar, Stamp } from "../ui/Notebook";
import { cn } from "../../utils/cn";

/** Escalas de calificación soportadas. */
const SCALES = [
  { id: "5", max: 5, label: "0 – 5", defaultTarget: 3 },
  { id: "10", max: 10, label: "0 – 10", defaultTarget: 6 },
  { id: "100", max: 100, label: "0 – 100", defaultTarget: 60 },
] as const;

interface CategoryCalculatorProps {
  /** Guarda la nota obtenida dentro de un corte de la materia activa. */
  onSaveToCut?: (grade: number) => void;
  /** Nombre de la materia activa (solo informativo). */
  subjectName?: string;
  /** Aviso al usuario (toast). */
  onNotify?: (text: string, tone?: "success" | "info" | "error") => void;
}

/** Estado interno serializable, usado también para deshacer. */
interface CalcState {
  categories: GradeCategory[];
  rawInputs: Record<string, string>;
}

const createInitialState = (): CalcState => {
  const formativaId = generateId();
  const parcialId = generateId();
  return {
    categories: [
      { id: formativaId, name: "Formativa", percentage: 50, scores: [] },
      { id: parcialId, name: "Parcial", percentage: 50, scores: [] },
    ],
    rawInputs: { [formativaId]: "", [parcialId]: "" },
  };
};

/**
 * CALCULADORA DE NOTAS POR CATEGORÍA
 * ----------------------------------
 * El estudiante crea categorías (Formativa 50%, Parcial 50%...), escribe sus
 * notas separadas por coma o espacio y ve en tiempo real el promedio de cada
 * una, cuántos puntos aporta al corte y la nota total.
 */
export function CategoryCalculator({ onSaveToCut, subjectName, onNotify }: CategoryCalculatorProps) {
  const [state, setState] = useState<CalcState>(createInitialState);
  const [mode, setMode] = useState<AverageMode>("simple");
  const [scaleId, setScaleId] = useState<(typeof SCALES)[number]["id"]>("5");
  const [decimals, setDecimals] = useState(2);
  const [targetText, setTargetText] = useState("3");
  const [showHelp, setShowHelp] = useState(false);
  const historyRef = useRef<CalcState[]>([]);

  const scale = SCALES.find((item) => item.id === scaleId) ?? SCALES[0];
  const maxGrade = scale.max;
  const target = Number(targetText.replace(",", ".")) || scale.defaultTarget;

  /** Guarda una instantánea antes de cada cambio para poder deshacer. */
  const commit = useCallback((updater: (previous: CalcState) => CalcState) => {
    setState((previous) => {
      historyRef.current = [...historyRef.current.slice(-19), previous];
      return updater(previous);
    });
  }, []);

  const undo = () => {
    const last = historyRef.current.pop();
    if (last) {
      setState(last);
      onNotify?.("Se deshizo el último cambio.", "info");
    } else {
      onNotify?.("No hay nada que deshacer.", "info");
    }
  };

  const resetAll = () => {
    commit(() => createInitialState());
    onNotify?.("Calculadora limpia, lista para empezar.", "info");
  };

  /* -------------------- Gestión de categorías -------------------- */

  const addCategory = () => {
    const id = generateId();
    commit((previous) => ({
      categories: [
        ...previous.categories,
        { id, name: `Categoría ${previous.categories.length + 1}`, percentage: 0, scores: [] },
      ],
      rawInputs: { ...previous.rawInputs, [id]: "" },
    }));
  };

  const removeCategory = (id: string) => {
    commit((previous) => {
      const rawInputs = { ...previous.rawInputs };
      delete rawInputs[id];
      return { categories: previous.categories.filter((c) => c.id !== id), rawInputs };
    });
  };

  const patchCategory = (id: string, patch: Partial<GradeCategory>) => {
    commit((previous) => ({
      ...previous,
      categories: previous.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  /** Convierte el texto libre de notas en entradas tipadas. */
  const handleScoresText = (id: string, text: string) => {
    const { values } = parseScoreList(text, maxGrade);
    commit((previous) => ({
      rawInputs: { ...previous.rawInputs, [id]: text },
      categories: previous.categories.map((category) => {
        if (category.id !== id) return category;
        // Conserva los pesos internos previos (modo ponderado) por posición.
        const scores = values.map((value, index) => ({
          id: category.scores[index]?.id ?? generateId(),
          value,
          weight: category.scores[index]?.weight ?? 0,
        }));
        return { ...category, scores };
      }),
    }));
  };

  /** Botón "+": añade una nota vacía lista para escribir su peso. */
  const addScoreSlot = (id: string) => {
    commit((previous) => ({
      ...previous,
      categories: previous.categories.map((category) =>
        category.id === id
          ? { ...category, scores: [...category.scores, { id: generateId(), value: null, weight: 0 }] }
          : category,
      ),
    }));
  };

  const patchScoreWeight = (categoryId: string, scoreId: string, weight: number) => {
    commit((previous) => ({
      ...previous,
      categories: previous.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              scores: category.scores.map((score) =>
                score.id === scoreId ? { ...score, weight } : score,
              ),
            }
          : category,
      ),
    }));
  };

  /* -------------------- Cálculos (funciones puras) -------------------- */

  const result = useMemo(
    () => calculateCategories(state.categories, mode),
    [state.categories, mode],
  );

  const needed = useMemo(
    () => calculateNeededGrade(state.categories, target, maxGrade, mode),
    [state.categories, target, maxGrade, mode],
  );

  /** Problemas de formato detectados en lo que el usuario escribió. */
  const inputIssues = useMemo(() => {
    const issues: string[] = [];
    for (const category of state.categories) {
      const raw = state.rawInputs[category.id] ?? "";
      if (!raw.trim()) continue;
      const { invalid, outOfRange } = parseScoreList(raw, maxGrade);
      if (invalid.length > 0) {
        issues.push(`En "${category.name}" ignoramos: ${invalid.join(", ")} (no son números).`);
      }
      if (outOfRange.length > 0) {
        issues.push(
          `En "${category.name}" ignoramos: ${outOfRange.join(", ")} (fuera de la escala 0–${maxGrade}).`,
        );
      }
    }
    return issues;
  }, [state, maxGrade]);

  const totalTone = classifyGrade(result.total, target);
  const reachedGoal = result.total >= target && result.coveredPercentage > 0;

  /* -------------------- Acciones -------------------- */

  const buildSummary = (): string => {
    const lines = [
      `📘 NotaMínima — Resumen${subjectName ? ` de ${subjectName}` : ""}`,
      `Escala 0–${maxGrade} · Meta ${formatGrade(target, decimals)} · Modo ${mode === "simple" ? "simple" : "ponderado"}`,
      "",
    ];
    for (const category of result.categories) {
      const avg = category.average === null ? "sin notas" : formatGrade(category.average, decimals);
      lines.push(
        `• ${category.name} (${category.percentage}%) → promedio ${avg} → aporta ${formatGrade(category.contribution, decimals)}`,
      );
    }
    lines.push("", `TOTAL DEL CORTE: ${formatGrade(result.total, decimals)}`);
    if (needed.outcome === "achievable" || needed.outcome === "impossible") {
      lines.push(needed.message);
    }
    return lines.join("\n");
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      onNotify?.("Resumen copiado al portapapeles.", "success");
    } catch {
      onNotify?.("Tu navegador bloqueó el portapapeles.", "error");
    }
  };

  const saveToCut = () => {
    if (!onSaveToCut) return;
    if (!result.isPercentageValid) {
      onNotify?.("Los porcentajes deben sumar 100% antes de guardar.", "error");
      return;
    }
    onSaveToCut(result.total);
    onNotify?.(`Nota ${formatGrade(result.total, decimals)} guardada en la materia.`, "success");
  };

  /* -------------------- Interfaz -------------------- */

  return (
    <div className="space-y-4">
      {/* ---------- Encabezado + ajustes ---------- */}
      <Paper tape="left" animate className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalculatorArt className="h-11 w-11 shrink-0" />
            <div>
              <h2 className="font-hand text-3xl leading-none text-[var(--ink)]">Calculadora de notas</h2>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                Escribe tus notas separadas por coma y mira el resultado al instante.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowHelp((show) => !show)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 text-xs font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
            aria-expanded={showHelp}
          >
            <HelpCircle className="h-4 w-4" />
            ¿Cómo funciona?
          </button>
        </div>

        {showHelp ? (
          <PostIt tone="blue" className="mt-4 animate-slide-down">
            <p className="font-semibold">Ejemplo rápido</p>
            <p className="mt-1 text-[13px]">
              <strong>Formativa 50%</strong> con notas <code>2.0, 3.0, 4.0</code> → promedio <strong>3.0</strong> →
              aporta <strong>1.5</strong>.<br />
              <strong>Parcial 50%</strong> con nota <code>3.0</code> → aporta <strong>1.5</strong>.<br />
              Total del corte = <strong>3.0</strong> ✅
            </p>
          </PostIt>
        ) : null}

        {/* Ajustes: escala, meta, decimales y modo */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
              Escala
            </span>
            <select
              value={scaleId}
              onChange={(event) => {
                const next = event.target.value as (typeof SCALES)[number]["id"];
                setScaleId(next);
                const found = SCALES.find((s) => s.id === next);
                if (found) setTargetText(String(found.defaultTarget));
              }}
              className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm font-semibold text-[var(--ink)]"
            >
              {SCALES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
              Meta
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={targetText}
              onChange={(event) => setTargetText(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm font-semibold text-[var(--ink)]"
              aria-label="Nota meta para aprobar"
            />
          </label>

          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
              Decimales
            </span>
            <select
              value={decimals}
              onChange={(event) => setDecimals(Number(event.target.value))}
              className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm font-semibold text-[var(--ink)]"
            >
              {[0, 1, 2, 3].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
              Modo
            </span>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1">
              <button
                type="button"
                onClick={() => setMode("simple")}
                className={cn(
                  "flex min-h-9 items-center justify-center gap-1 rounded-lg text-[11px] font-bold transition",
                  mode === "simple" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-soft)]",
                )}
                aria-pressed={mode === "simple"}
              >
                <Sigma className="h-3.5 w-3.5" /> Simple
              </button>
              <button
                type="button"
                onClick={() => setMode("weighted")}
                className={cn(
                  "flex min-h-9 items-center justify-center gap-1 rounded-lg text-[11px] font-bold transition",
                  mode === "weighted" ? "bg-[var(--ink)] text-[var(--paper)]" : "text-[var(--ink-soft)]",
                )}
                aria-pressed={mode === "weighted"}
              >
                <Scale className="h-3.5 w-3.5" /> Ponderado
              </button>
            </div>
          </div>
        </div>

        {/* Validación de porcentajes */}
        {!result.isPercentageValid ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border-2 border-dashed border-[var(--fail)] bg-[var(--fail-bg)] px-4 py-3 text-sm text-[var(--fail)]">
            <Target className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Los porcentajes suman <strong>{result.percentageTotal}%</strong>. Ajústalos para que sumen
              exactamente <strong>100%</strong>.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-xs font-semibold text-[var(--pass)]">
            ✓ Los porcentajes suman 100%. Todo en orden.
          </p>
        )}
      </Paper>

      {/* ---------- Categorías ---------- */}
      <div className="space-y-3">
        {state.categories.map((category) => {
          const categoryResult = result.categories.find((item) => item.id === category.id);
          const average = categoryResult?.average ?? null;
          const contribution = categoryResult?.contribution ?? 0;
          const tone = average === null ? "ink" : classifyGrade(average, target);

          return (
            <Paper key={category.id} ruled margin holes animate className="p-4 pl-12 sm:pl-16 sm:p-5 sm:pl-16">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={category.name}
                  onChange={(event) => patchCategory(category.id, { name: event.target.value })}
                  className="field-paper font-hand min-w-0 flex-1 text-2xl"
                  aria-label="Nombre de la categoría"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={category.percentage}
                    onChange={(event) =>
                      patchCategory(category.id, {
                        percentage: Math.max(0, Math.min(100, Number(event.target.value) || 0)),
                      })
                    }
                    className="field-paper w-16 text-right text-lg font-bold"
                    min={0}
                    max={100}
                    aria-label={`Porcentaje de ${category.name}`}
                  />
                  <span className="text-lg font-bold text-[var(--ink-soft)]">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeCategory(category.id)}
                  className="ml-1 grid h-11 w-11 place-items-center rounded-lg text-[var(--ink-faint)] transition hover:bg-[var(--fail-bg)] hover:text-[var(--fail)]"
                  aria-label={`Eliminar categoría ${category.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Entrada de notas */}
              <div className="mt-3">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
                  Notas (sepáralas con coma o espacio)
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={state.rawInputs[category.id] ?? ""}
                    onChange={(event) => handleScoresText(category.id, event.target.value)}
                    placeholder="Ej: 2.0, 3.0, 4.0"
                    className="field-paper min-h-11 flex-1 text-lg"
                    aria-label={`Notas de ${category.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => addScoreSlot(category.id)}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
                    aria-label="Añadir espacio para otra nota"
                    title="Añadir otra nota"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Pesos internos (solo en modo ponderado) */}
              {mode === "weighted" && category.scores.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2 animate-slide-down">
                  {category.scores.map((score, index) => (
                    <div
                      key={score.id}
                      className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5"
                    >
                      <span className="text-xs font-semibold text-[var(--ink-soft)]">
                        N{index + 1}: {score.value === null ? "—" : formatGrade(score.value, decimals)}
                      </span>
                      <input
                        type="number"
                        value={score.weight}
                        onChange={(event) =>
                          patchScoreWeight(category.id, score.id, Math.max(0, Number(event.target.value) || 0))
                        }
                        className="w-12 rounded border border-[var(--border)] bg-[var(--paper)] px-1 py-0.5 text-right text-xs"
                        min={0}
                        aria-label={`Peso de la nota ${index + 1}`}
                      />
                      <span className="text-xs text-[var(--ink-faint)]">%</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Resultado de la categoría */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-[var(--border)] pt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
                    Promedio
                  </span>
                  <span
                    className={cn(
                      "font-hand text-3xl leading-none",
                      average === null && "text-[var(--ink-faint)]",
                      tone === "pass" && "marker-green",
                      tone === "risk" && "marker",
                      tone === "fail" && "marker-pink",
                    )}
                  >
                    {average === null ? "—" : <CountUp value={average} decimals={decimals} />}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-faint)]">
                    Aporta
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-[var(--ink)]">
                    <CountUp value={contribution} decimals={decimals} />
                  </span>
                  <span className="text-xs text-[var(--ink-faint)]">
                    pts de {formatGrade((maxGrade * category.percentage) / 100, decimals)}
                  </span>
                </div>
              </div>

              <RulerBar
                className="mt-2"
                value={contribution}
                max={(maxGrade * category.percentage) / 100 || 1}
                tone={tone === "ink" ? "ink" : tone}
                label={`Aporte de ${category.name}`}
              />
            </Paper>
          );
        })}

        <button
          type="button"
          onClick={addCategory}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] text-sm font-semibold text-[var(--ink-soft)] transition hover:border-[var(--ink-faint)] hover:bg-[var(--surface-2)]"
        >
          <Plus className="h-4 w-4" />
          Añadir categoría
        </button>
      </div>

      {/* ---------- Avisos de formato ---------- */}
      {inputIssues.length > 0 ? (
        <PostIt tone="pink" className="animate-slide-down">
          <p className="font-semibold">Revisamos lo que escribiste</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[13px]">
            {inputIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </PostIt>
      ) : null}

      {/* ---------- Resultado total ---------- */}
      <Paper tape="both" animate className="relative p-5 text-center sm:p-7">
        <Confetti active={reachedGoal} />

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
          Nota total del corte
        </p>

        <div className="mt-2 flex items-center justify-center gap-4">
          <span
            className={cn(
              "text-6xl font-bold tabular-nums sm:text-7xl",
              totalTone === "pass" && "text-[var(--pass)]",
              totalTone === "risk" && "text-[var(--risk)]",
              totalTone === "fail" && "text-[var(--fail)]",
            )}
          >
            <CountUp value={result.total} decimals={decimals} />
          </span>
          {result.coveredPercentage > 0 ? (
            <Stamp tone={totalTone}>
              {totalTone === "pass" ? "Aprobado" : totalTone === "risk" ? "En riesgo" : "Reprobado"}
            </Stamp>
          ) : null}
        </div>

        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          sobre {maxGrade} · meta {formatGrade(target, decimals)}
        </p>

        <RulerBar
          className="mx-auto mt-4 max-w-md"
          value={result.total}
          max={maxGrade}
          tone={totalTone}
          label="Nota total del corte"
        />

        <p className="mt-2 text-xs text-[var(--ink-faint)]">
          Llevas evaluado el <strong>{result.coveredPercentage}%</strong> del corte
          {result.pendingPercentage > 0 ? ` · falta el ${result.pendingPercentage}%` : " · ¡completo!"}
        </p>

        {/* Modo "¿Cuánto necesito?" */}
        {result.pendingPercentage > 0 ? (
          <div
            className={cn(
              "mx-auto mt-5 max-w-lg rounded-xl border-2 px-4 py-3.5 text-sm font-medium",
              needed.outcome === "achievable" && "border-[var(--risk)] bg-[var(--risk-bg)] text-[var(--risk)]",
              needed.outcome === "already-reached" && "border-[var(--pass)] bg-[var(--pass-bg)] text-[var(--pass)]",
              needed.outcome === "impossible" && "border-[var(--fail)] bg-[var(--fail-bg)] text-[var(--fail)]",
              needed.outcome === "no-pending" && "border-[var(--border)] bg-[var(--surface-2)] text-[var(--ink-soft)]",
            )}
            role="status"
          >
            <p className="mb-1 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide">
              <Target className="h-3.5 w-3.5" /> ¿Cuánto necesito?
            </p>
            {needed.needed !== null && needed.outcome === "achievable" ? (
              <p className="font-hand text-4xl leading-tight">{formatGrade(needed.needed, decimals)}</p>
            ) : null}
            <p className="mt-0.5">{needed.message}</p>
          </div>
        ) : null}

        {/* Acciones */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={copySummary}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[var(--ink)] px-4 text-sm font-semibold text-[var(--paper)] transition hover:opacity-90"
          >
            <Copy className="h-4 w-4" /> Copiar resumen
          </button>
          {onSaveToCut ? (
            <button
              type="button"
              onClick={saveToCut}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-[var(--pass)] px-4 text-sm font-semibold text-[var(--pass)] transition hover:bg-[var(--pass-bg)]"
            >
              <Save className="h-4 w-4" /> Guardar en la materia
            </button>
          ) : null}
          <button
            type="button"
            onClick={undo}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
          >
            <RotateCcw className="h-4 w-4" /> Deshacer
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
          >
            <Eraser className="h-4 w-4" /> Limpiar
          </button>
        </div>

        {reachedGoal ? (
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--pass)]">
            <Check className="h-4 w-4" /> ¡Vas por encima de la meta! Sigue así.
          </p>
        ) : null}
      </Paper>
    </div>
  );
}
