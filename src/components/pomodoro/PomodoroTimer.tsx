import { useEffect } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { Paper } from "../ui/Notebook";
import type { PomodoroState } from "../../hooks/usePomodoro";

interface PomodoroTimerProps {
  state: PomodoroState;
  remaining: number;
  progress: number;
  totalSeconds: number;
  subjectName: string;
  subjectMinutes: number;
  totalMinutes: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onComplete: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function PomodoroTimer({
  state,
  remaining,
  progress,
  subjectName,
  subjectMinutes,
  totalMinutes,
  onStart,
  onPause,
  onResume,
  onReset,
  onComplete,
}: PomodoroTimerProps) {
  useEffect(() => {
    if (state === "completed") {
      onComplete();
    }
  }, [state, onComplete]);

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <Paper tape="both" animate className="p-6">
      <div className="flex items-center gap-2">
        <Timer className="h-5 w-5 text-[var(--ink-soft)]" />
        <h3 className="font-hand text-2xl text-[var(--ink)]">Temporizador de estudio</h3>
      </div>
      <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
        Técnica Pomodoro para {subjectName}. 25 minutos de enfoque.
      </p>

      {/* Timer circle */}
      <div className="mt-5 flex flex-col items-center">
        <div className="relative grid h-36 w-36 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--surface-2)"
              strokeWidth="6"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <span className="text-3xl font-bold tabular-nums text-[var(--ink)]">
            {formatTime(remaining)}
          </span>
        </div>

        {/* Controls */}
        <div className="mt-4 flex gap-2">
          {state === "idle" ? (
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--paper)] transition hover:opacity-90"
            >
              <Play className="h-4 w-4" />
              Iniciar
            </button>
          ) : state === "running" ? (
            <button
              type="button"
              onClick={onPause}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--paper)] transition hover:opacity-90"
            >
              <Pause className="h-4 w-4" />
              Pausar
            </button>
          ) : state === "paused" ? (
            <button
              type="button"
              onClick={onResume}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-[var(--paper)] transition hover:opacity-90"
            >
              <Play className="h-4 w-4" />
              Continuar
            </button>
          ) : null}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </button>
        </div>

        {state === "completed" ? (
          <p className="mt-3 text-sm font-semibold text-[var(--pass)]">
            ¡Sesión completada! Buen trabajo.
          </p>
        ) : null}
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--surface-1)] p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">
            Esta materia
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--ink)]">
            {subjectMinutes}<span className="text-sm font-normal text-[var(--ink-faint)]"> min</span>
          </p>
        </div>
        <div className="rounded-xl bg-[var(--surface-1)] p-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-faint)]">
            Total estudiado
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--ink)]">
            {totalMinutes}<span className="text-sm font-normal text-[var(--ink-faint)]"> min</span>
          </p>
        </div>
      </div>
    </Paper>
  );
}
