import { useEffect, useRef, useState, type ReactNode } from "react";
import { Palette, X } from "lucide-react";
import {
  HIGHLIGHTER_COLORS,
  HIGHLIGHTER_LABELS,
  INK_COLORS,
  INK_LABELS,
  SHEET_STYLE_LABELS,
  type HighlighterColor,
  type InkColor,
  type SheetStyle,
} from "../../hooks/useNotebookStyle";
import { Paper } from "./Notebook";
import { cn } from "../../utils/cn";

interface StyleSettingsProps {
  sheet: SheetStyle;
  highlighter: HighlighterColor;
  ink: InkColor;
  onSheetChange: (s: SheetStyle) => void;
  onHighlighterChange: (h: HighlighterColor) => void;
  onInkChange: (i: InkColor) => void;
}

const SHEET_ICONS: Record<SheetStyle, ReactNode> = {
  ruled: <div className="h-6 w-7 rounded border border-[var(--border)] bg-[var(--paper)]" style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 5px, var(--rule-line-active) 5px 6px)" }} />,
  grid: <div className="h-6 w-7 rounded border border-[var(--border)] bg-[var(--paper)]" style={{ backgroundImage: "linear-gradient(to right, var(--rule-line-active) 1px, transparent 1px), linear-gradient(to bottom, var(--rule-line-active) 1px, transparent 1px)", backgroundSize: "8px 8px" }} />,
  dotted: <div className="h-6 w-7 rounded border border-[var(--border)] bg-[var(--paper)]" style={{ backgroundImage: "radial-gradient(circle, var(--rule-line-active) 1px, transparent 1px)", backgroundSize: "7px 7px" }} />,
  kraft: <div className="h-6 w-7 rounded border border-[var(--border)] bg-[#d8c9a8]" />,
};

/**
 * Popover para personalizar el cuaderno: estilo de hoja, color de
 * resaltador y color de tinta. Se abre desde la cabecera.
 */
export function StyleSettings({
  sheet,
  highlighter,
  ink,
  onSheetChange,
  onHighlighterChange,
  onInkChange,
}: StyleSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", escHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", escHandler);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--border)] text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
        aria-label="Personalizar cuaderno"
        aria-expanded={isOpen}
        title="Personalizar cuaderno"
      >
        <Palette className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-72 animate-slide-down">
          <Paper className="overflow-visible p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-hand text-xl text-[var(--ink)]">Personalizar cuaderno</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-[var(--ink-faint)] transition hover:bg-[var(--surface-2)]"
                aria-label="Cerrar personalización"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Estilo de hoja */}
            <div className="mb-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--ink-faint)]">
                Estilo de hoja
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(SHEET_STYLE_LABELS) as SheetStyle[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSheetChange(s)}
                    className={cn(
                      "flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg border text-[10px] font-semibold transition",
                      sheet === s
                        ? "border-[var(--ink)] bg-[var(--surface-2)] text-[var(--ink)]"
                        : "border-[var(--border)] text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
                    )}
                    aria-pressed={sheet === s}
                  >
                    {SHEET_ICONS[s]}
                    {SHEET_STYLE_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Color de resaltador */}
            <div className="mb-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--ink-faint)]">
                Color de resaltador
              </p>
              <div className="flex gap-2">
                {(Object.keys(HIGHLIGHTER_COLORS) as HighlighterColor[]).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onHighlighterChange(h)}
                    className={cn(
                      "h-11 w-11 rounded-full border-2 transition",
                      highlighter === h
                        ? "border-[var(--ink)] ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--paper)]"
                        : "border-[var(--border)] hover:scale-110",
                    )}
                    style={{ backgroundColor: HIGHLIGHTER_COLORS[h] }}
                    aria-label={`Resaltador ${HIGHLIGHTER_LABELS[h]}`}
                    aria-pressed={highlighter === h}
                    title={HIGHLIGHTER_LABELS[h]}
                  />
                ))}
              </div>
            </div>

            {/* Color de tinta */}
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--ink-faint)]">
                Color de tinta
              </p>
              <div className="flex gap-2">
                {(Object.keys(INK_COLORS) as InkColor[]).map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onInkChange(i)}
                    className={cn(
                      "h-11 w-11 rounded-full border-2 transition",
                      ink === i
                        ? "border-[var(--ink)] ring-2 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--paper)]"
                        : "border-[var(--border)] hover:scale-110",
                    )}
                    style={{ backgroundColor: INK_COLORS[i] }}
                    aria-label={`Tinta ${INK_LABELS[i]}`}
                    aria-pressed={ink === i}
                    title={INK_LABELS[i]}
                  />
                ))}
              </div>
            </div>
          </Paper>
        </div>
      ) : null}
    </div>
  );
}
