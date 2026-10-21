import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import type { SheetStyle } from "../../hooks/useNotebookStyle";

/* ==========================================================================
   PIEZAS VISUALES DEL "CUADERNO UNIVERSITARIO PREMIUM"
   Componentes pequeños y reutilizables. Todo el papel se dibuja con CSS
   (ver index.css); aquí solo se componen las piezas.
   ========================================================================== */

interface PaperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Dibuja las líneas horizontales del cuaderno (legacy: usa sheetStyle). */
  ruled?: boolean;
  /** Estilo de hoja explícito. Si se pasa, sobreescribe `ruled`. */
  sheetStyle?: SheetStyle;
  /** Dibuja el margen rojo vertical. */
  margin?: boolean;
  /** Dibuja los agujeros de las argollas. */
  holes?: boolean;
  /** Bordes ligeramente irregulares, como hoja recortada. */
  torn?: boolean;
  /** Cinta adhesiva decorativa en las esquinas superiores. */
  tape?: "none" | "left" | "right" | "both";
  /** Animación de entrada. */
  animate?: boolean;
}

/** Hoja de papel: la superficie base de toda la interfaz. */
export function Paper({
  children,
  ruled = false,
  sheetStyle,
  margin = false,
  holes = false,
  torn = false,
  tape = "none",
  animate = false,
  className,
  ...props
}: PaperProps) {
  const activeStyle = sheetStyle ?? (ruled ? "ruled" : undefined);
  const sheetClass = activeStyle ? `paper-${activeStyle}` : undefined;

  return (
    <div
      className={cn(
        "paper",
        sheetClass,
        margin && "paper-margin",
        holes && "paper-holes",
        torn && "paper-torn",
        animate && "animate-paper-in",
        className,
      )}
      {...props}
    >
      {(tape === "left" || tape === "both") && <span className="washi washi-tl" aria-hidden="true" />}
      {(tape === "right" || tape === "both") && <span className="washi washi-tr" aria-hidden="true" />}
      {children}
    </div>
  );
}

/** Nota adhesiva (post-it) para avisos y consejos. */
export function PostIt({
  children,
  tone = "yellow",
  className,
}: {
  children: ReactNode;
  tone?: "yellow" | "pink" | "green" | "blue";
  className?: string;
}) {
  const toneClass = {
    yellow: "postit",
    pink: "postit postit-pink",
    green: "postit postit-green",
    blue: "postit postit-blue",
  }[tone];

  return <div className={cn(toneClass, "p-3.5 text-sm leading-snug", className)}>{children}</div>;
}

/** Sello rotado tipo "APROBADO" / "EN RIESGO" / "REPROBADO". */
export function Stamp({
  tone,
  children,
  className,
}: {
  tone: "pass" | "risk" | "fail";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn("stamp animate-stamp-in", `stamp-${tone}`, className)}
      role="status"
    >
      {children}
    </span>
  );
}

/** Barra de progreso con estética de regla escolar. */
export function RulerBar({
  value,
  max = 100,
  tone = "pass",
  label,
  className,
}: {
  value: number;
  max?: number;
  tone?: "pass" | "risk" | "fail" | "ink";
  label?: string;
  className?: string;
}) {
  const percent = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  const fillColor = {
    pass: "var(--pass)",
    risk: "var(--risk)",
    fail: "var(--fail)",
    ink: "var(--ink-soft)",
  }[tone];

  return (
    <div
      className={cn("ruler-track h-3 w-full", className)}
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progreso"}
    >
      <div className="ruler-fill" style={{ width: `${percent}%`, background: fillColor }} />
    </div>
  );
}

/**
 * Número que "cuenta" suavemente hasta su valor final.
 * Respeta `prefers-reduced-motion` saltando directamente al resultado.
 */
export function CountUp({
  value,
  decimals = 2,
  duration = 650,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }

    const from = fromRef.current;
    const delta = value - from;
    if (Math.abs(delta) < 0.0001) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + delta * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return <span className={className}>{display.toFixed(decimals)}</span>;
}

/** Confeti discreto de papel cuando se supera la meta. */
export function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  const colors = ["var(--hl-green)", "var(--hl-yellow)", "var(--hl-pink)", "var(--hl-blue)"];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 14 }).map((_, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={{
            left: `${6 + index * 6.7}%`,
            background: colors[index % colors.length],
            animationDelay: `${index * 55}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ==========================================================================
   ILUSTRACIONES SVG INLINE (sin imágenes externas que puedan romperse)
   ========================================================================== */

/** Lápiz amarillo clásico. */
export function PencilArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Lápiz">
      <g transform="rotate(35 32 32)">
        <rect x="27" y="6" width="10" height="34" rx="1.5" fill="#f5c542" />
        <rect x="27" y="6" width="3.4" height="34" fill="#e0ab26" />
        <rect x="27" y="40" width="10" height="5" fill="#f3e4c0" />
        <path d="M27 45h10l-5 9z" fill="#f7d9b8" />
        <path d="M30.5 50.6 32 54l1.5-3.4z" fill="#3b3b3b" />
        <rect x="27" y="1.5" width="10" height="5" rx="1" fill="#9fb4c9" />
        <rect x="27" y="-1" width="10" height="4" rx="1.4" fill="#f08fa4" />
      </g>
    </svg>
  );
}

/** Cuaderno con argollas. */
export function NotebookArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Cuaderno">
      <rect x="12" y="8" width="42" height="48" rx="4" fill="var(--paper)" stroke="var(--border)" strokeWidth="2" />
      <path d="M20 8v48" stroke="var(--rule-margin)" strokeWidth="1.6" opacity="0.6" />
      <g stroke="var(--rule-line)" strokeWidth="2" strokeLinecap="round">
        <path d="M25 20h23M25 28h23M25 36h23M25 44h14" />
      </g>
      <g fill="var(--ink-soft)">
        <circle cx="12" cy="16" r="3.2" />
        <circle cx="12" cy="30" r="3.2" />
        <circle cx="12" cy="44" r="3.2" />
      </g>
    </svg>
  );
}

/** Birrete de graduación. */
export function GraduationArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Birrete de graduación">
      <path d="M32 12 4 24l28 12 28-12z" fill="var(--ink)" />
      <path d="M14 30v12c0 4 8 8 18 8s18-4 18-8V30l-18 8z" fill="var(--ink-soft)" />
      <path d="M58 24v16" stroke="var(--rule-margin)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="58" cy="42" r="3.4" fill="var(--rule-margin)" />
    </svg>
  );
}

/** Calculadora de bolsillo. */
export function CalculatorArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Calculadora">
      <rect x="14" y="6" width="36" height="52" rx="5" fill="var(--ink)" />
      <rect x="19" y="12" width="26" height="11" rx="2" fill="var(--hl-green)" />
      <g fill="var(--paper)" opacity="0.9">
        <rect x="19" y="28" width="7" height="6" rx="1.6" />
        <rect x="28.5" y="28" width="7" height="6" rx="1.6" />
        <rect x="38" y="28" width="7" height="6" rx="1.6" />
        <rect x="19" y="37" width="7" height="6" rx="1.6" />
        <rect x="28.5" y="37" width="7" height="6" rx="1.6" />
        <rect x="38" y="37" width="7" height="6" rx="1.6" />
        <rect x="19" y="46" width="16.5" height="6" rx="1.6" />
      </g>
      <rect x="38" y="46" width="7" height="6" rx="1.6" fill="var(--rule-margin)" />
    </svg>
  );
}

/** Borrador rosa. */
export function EraserArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Borrador">
      <g transform="rotate(-18 32 32)">
        <rect x="14" y="24" width="36" height="18" rx="3" fill="#f08fa4" />
        <rect x="14" y="24" width="36" height="7" rx="3" fill="#f9bcc8" />
        <rect x="36" y="24" width="14" height="18" rx="3" fill="#dcdfe6" />
      </g>
    </svg>
  );
}

/** Pila de libros para estados vacíos. */
export function BooksArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 64" className={className} role="img" aria-label="Libros">
      <rect x="10" y="42" width="76" height="12" rx="2.5" fill="var(--ink-soft)" />
      <rect x="16" y="30" width="64" height="12" rx="2.5" fill="var(--rule-margin)" opacity="0.75" />
      <rect x="22" y="18" width="52" height="12" rx="2.5" fill="var(--hl-blue)" />
      <g stroke="var(--paper)" strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <path d="M70 46h8M64 34h8M58 22h8" />
      </g>
    </svg>
  );
}

/** Sacapuntas metálico. */
export function SharpenerArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Sacapuntas">
      <rect x="10" y="22" width="44" height="30" rx="6" fill="var(--ink-soft)" />
      <rect x="10" y="22" width="44" height="8" rx="4" fill="var(--ink-faint)" opacity="0.7" />
      <path d="M28 30 L36 30 L40 44 L24 44 Z" fill="var(--paper)" opacity="0.9" />
      <path d="M32 30 L32 44" stroke="var(--rule-margin)" strokeWidth="1.5" />
      <rect x="16" y="14" width="8" height="6" rx="1.5" fill="var(--rule-margin)" />
    </svg>
  );
}

/** Regla de 30 cm. */
export function RulerArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 32" className={className} role="img" aria-label="Regla">
      <rect x="4" y="8" width="88" height="16" rx="2" fill="var(--hl-yellow)" opacity="0.85" />
      <rect x="4" y="8" width="88" height="16" rx="2" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <g stroke="var(--ink)" strokeWidth="1.2" strokeLinecap="round">
        {Array.from({ length: 15 }).map((_, i) => (
          <path key={i} d={`M${10 + i * 6} 8 v${i % 5 === 0 ? 8 : 5}`} />
        ))}
      </g>
    </svg>
  );
}

/** Taza de café humeante. */
export function CoffeeArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Taza de café">
      <path d="M40 14 Q42 10 40 6 Q38 2 40 0" stroke="var(--ink-faint)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M46 16 Q48 12 46 8" stroke="var(--ink-faint)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />
      <path d="M14 26 h28 v14 a14 14 0 0 1-28 0z" fill="var(--ink)" />
      <path d="M42 30 h6 a5 5 0 0 1 0 10 h-6" fill="none" stroke="var(--ink)" strokeWidth="3" />
      <ellipse cx="28" cy="26" rx="14" ry="3" fill="var(--ink-soft)" opacity="0.6" />
    </svg>
  );
}

/** Post-it grande decorativo con texto manuscrito. */
export function StickyNoteArt({
  className,
  text = "¡Tú puedes!",
  tone = "yellow",
}: {
  className?: string;
  text?: string;
  tone?: "yellow" | "green" | "pink" | "blue";
}) {
  return (
    <PostIt tone={tone} className={className}>
      <span className="font-hand text-2xl">{text}</span>
    </PostIt>
  );
}

/* ==========================================================================
   SKELETON DE CARGA (renglones simulando papel en blanco)
   ========================================================================== */

/** Bloque skeleton con N renglones que simulan texto cargando. */
export function Skeleton({ lines = 4, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

/** Tarjeta skeleton para grids de carga. */
export function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn("skeleton-block", className)} aria-hidden="true" />;
}
