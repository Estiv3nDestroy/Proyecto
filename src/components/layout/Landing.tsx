import { ArrowRight, Cloud, PencilLine, Sparkles, Target } from "lucide-react";
import {
  BooksArt,
  CalculatorArt,
  GraduationArt,
  NotebookArt,
  Paper,
  PencilArt,
  PostIt,
} from "../ui/Notebook";

interface LandingProps {
  onStart: () => void;
  onLogin: () => void;
  isCloudEnabled: boolean;
}

const STEPS = [
  {
    icon: PencilLine,
    title: "Escribe tus notas",
    text: "Crea tus categorías (formativa, parcial, talleres) y escribe las notas separadas por coma.",
  },
  {
    icon: CalculatorArt,
    title: "Mira el resultado",
    text: "Calculamos el promedio de cada categoría, cuánto aporta y la nota total del corte al instante.",
    isArt: true,
  },
  {
    icon: Target,
    title: "Sabe cuánto te falta",
    text: "Deja vacío lo que aún no presentas y te decimos la nota exacta que necesitas para aprobar.",
  },
] as const;

/**
 * Pantalla de bienvenida: explica la propuesta de valor en 3 pasos y
 * permite entrar con cuenta (nube) o sin cuenta (modo local).
 */
export function Landing({ onStart, onLogin, isCloudEnabled }: LandingProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
      {/* ---------- HERO ---------- */}
      <Paper ruled margin holes torn tape="both" animate className="px-6 py-9 pl-12 sm:px-12 sm:py-14 sm:pl-20">
        <div className="grid items-center gap-8 md:grid-cols-[1.25fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--hl-yellow)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
              <Sparkles className="h-3.5 w-3.5" />
              Gratis y en español
            </span>

            <h1 className="font-hand mt-4 text-5xl leading-[1.05] text-[var(--ink)] sm:text-6xl">
              ¿Cuánto necesitas
              <br />
              <span className="marker-green">para pasar la materia?</span>
            </h1>

            <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--ink-soft)]">
              NotaMínima calcula tus cortes por categorías, te dice la nota exacta que te falta y
              proyecta tu semestre completo. Sin fórmulas en Excel, sin dolores de cabeza.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onStart}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--ink)] px-6 text-base font-semibold text-[var(--paper)] shadow-[var(--shadow-lift)] transition hover:-translate-y-0.5 hover:opacity-95 active:translate-y-0"
              >
                Empezar ahora
                <ArrowRight className="h-4 w-4" />
              </button>
              {isCloudEnabled ? (
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-[var(--ink)] px-6 text-base font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-2)]"
                >
                  <Cloud className="h-4 w-4" />
                  Entrar con mi cuenta
                </button>
              ) : null}
            </div>

            <p className="mt-3 text-xs text-[var(--ink-faint)]">
              Puedes usarla sin cuenta: tus datos se guardan en este dispositivo.
              {isCloudEnabled ? " Con cuenta, se sincronizan entre tu celular y tu computadora." : ""}
            </p>
          </div>

          {/* Collage de ilustraciones */}
          <div className="relative mx-auto hidden h-56 w-full max-w-xs md:block">
            <NotebookArt className="absolute left-2 top-0 h-40 w-40 drop-shadow-md" />
            <PencilArt className="absolute right-4 top-6 h-24 w-24 drop-shadow-md" />
            <GraduationArt className="absolute bottom-0 right-10 h-20 w-20 drop-shadow-md" />
            <PostIt tone="green" className="absolute bottom-2 left-0 w-28 text-center">
              <span className="font-hand text-2xl">¡3.0! 🎉</span>
            </PostIt>
          </div>
        </div>
      </Paper>

      {/* ---------- 3 PASOS ---------- */}
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <Paper key={step.title} animate className="p-5" style={{ animationDelay: `${index * 90}ms` }}>
            <div className="flex items-center gap-3">
              <span className="font-hand grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-xl text-[var(--paper)]">
                {index + 1}
              </span>
              {"isArt" in step && step.isArt ? (
                <CalculatorArt className="h-9 w-9" />
              ) : (
                <step.icon className="h-6 w-6 text-[var(--ink-soft)]" />
              )}
            </div>
            <h3 className="font-hand mt-3 text-2xl text-[var(--ink)]">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">{step.text}</p>
          </Paper>
        ))}
      </div>

      {/* ---------- EJEMPLO ---------- */}
      <Paper ruled margin animate className="p-5 pl-12 sm:p-7 sm:pl-16">
        <div className="flex flex-wrap items-center gap-3">
          <BooksArt className="h-12 w-16" />
          <h2 className="font-hand text-3xl text-[var(--ink)] underline-hand">Un ejemplo real</h2>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ink-faint)]">Formativa 50%</p>
            <p className="font-hand mt-1 text-2xl text-[var(--ink)]">2.0 · 3.0 · 4.0</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Promedio <strong>3.0</strong> → aporta <strong>1.5</strong>
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--ink-faint)]">Parcial 50%</p>
            <p className="font-hand mt-1 text-2xl text-[var(--ink)]">3.0</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Promedio <strong>3.0</strong> → aporta <strong>1.5</strong>
            </p>
          </div>
          <div className="rounded-xl border-2 border-[var(--pass)] bg-[var(--pass-bg)] p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--pass)]">Total del corte</p>
            <p className="mt-1 text-4xl font-bold tabular-nums text-[var(--pass)]">3.00</p>
            <p className="mt-1 text-xs font-semibold text-[var(--pass)]">¡Aprobado!</p>
          </div>
        </div>
      </Paper>
    </div>
  );
}
