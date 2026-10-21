import { useState } from "react";
import { ArrowRight, Calendar, Calculator, GraduationCap, Sparkles } from "lucide-react";
import { Paper } from "../ui/Notebook";

interface OnboardingProps {
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Calculator,
    title: "Calcula tus notas por categoría",
    text: "Crea categorías como formativa, parcial o talleres. Escribe las notas separadas por coma y la app calcula el promedio y el aporte de cada una.",
  },
  {
    icon: GraduationCap,
    title: "Descubre cuánto necesitas para aprobar",
    text: "Deja vacía la nota que aún no tienes y la app te dice la nota mínima exacta que necesitas. Si es imposible, te avisa a tiempo.",
  },
  {
    icon: Calendar,
    title: "Organiza tu semestre completo",
    text: "Crea materias, asigna cortes, agenda tus entregas, pon metas y lleva un historial de tu promedio. Todo en un solo cuaderno digital.",
  },
] as const;

/**
 * Onboarding de 3 pasos para la primera vez. Se puede saltar en cualquier momento.
 */
export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-6 shadow-[var(--shadow-lift)]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--hl-yellow)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
            <Sparkles className="h-3.5 w-3.5" />
            Bienvenido a NotaMínima
          </span>
          <button
            type="button"
            onClick={onComplete}
            className="text-xs font-semibold text-[var(--ink-soft)] underline decoration-dotted underline-offset-2 transition hover:text-[var(--ink)]"
          >
            Saltar
          </button>
        </div>

        <Paper animate className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <span className="font-hand grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-xl text-[var(--paper)]">
              {step + 1}
            </span>
            <current.icon className="h-8 w-8 text-[var(--ink-soft)]" />
          </div>
          <h2 className="font-hand text-2xl leading-tight text-[var(--ink)]">{current.title}</h2>
          <p className="text-sm leading-relaxed text-[var(--ink-soft)]">{current.text}</p>
        </Paper>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={
                  i === step
                    ? "h-2 w-6 rounded-full bg-[var(--ink)] transition"
                    : "h-2 w-2 rounded-full bg-[var(--border)] transition"
                }
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => (isLast ? onComplete() : setStep((s) => s + 1))}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--ink)] px-5 text-sm font-semibold text-[var(--paper)] transition hover:opacity-90"
          >
            {isLast ? "Empezar a usar" : "Siguiente"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
