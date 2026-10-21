import { useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

/** Estilo de la hoja del cuaderno. */
export type SheetStyle = "ruled" | "grid" | "dotted" | "kraft";

/** Color del resaltador (trazo de marcador). */
export type HighlighterColor = "yellow" | "green" | "pink" | "blue";

/** Color de la tinta principal. */
export type InkColor = "blue" | "black" | "green";

interface NotebookStyle {
  sheet: SheetStyle;
  highlighter: HighlighterColor;
  ink: InkColor;
}

const STYLE_KEY = "notaminima::notebook-style";

const DEFAULT_STYLE: NotebookStyle = {
  sheet: "ruled",
  highlighter: "yellow",
  ink: "blue",
};

export const SHEET_STYLE_LABELS: Record<SheetStyle, string> = {
  ruled: "Rayado",
  grid: "Cuadriculado",
  dotted: "Puntos",
  kraft: "Kraft",
};

export const HIGHLIGHTER_LABELS: Record<HighlighterColor, string> = {
  yellow: "Amarillo",
  green: "Verde",
  pink: "Rosa",
  blue: "Azul",
};

export const INK_LABELS: Record<InkColor, string> = {
  blue: "Azul",
  black: "Negro",
  green: "Verde",
};

/** Color visual de cada resaltador (para el selector). */
export const HIGHLIGHTER_COLORS: Record<HighlighterColor, string> = {
  yellow: "#ffe9a8",
  green: "#b9f6c3",
  pink: "#ffc9d8",
  blue: "#bfe3ff",
};

/** Color visual de cada tinta (para el selector). */
export const INK_COLORS: Record<InkColor, string> = {
  blue: "#1e3a5f",
  black: "#2b2b2b",
  green: "#1d5e2e",
};

/**
 * Gestiona las preferencias estéticas del cuaderno: estilo de hoja, color de
 * resaltador y color de tinta. Aplica los atributos `data-*` en <html> para
 * que el CSS pueda reaccionar sin acoplar componentes individuales.
 */
export function useNotebookStyle() {
  const [style, setStyle] = useLocalStorage<NotebookStyle>(STYLE_KEY, DEFAULT_STYLE);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-sheet", style.sheet);
    root.setAttribute("data-hl", style.highlighter);
    root.setAttribute("data-ink", style.ink);
  }, [style]);

  const setSheet = useCallback(
    (sheet: SheetStyle) => setStyle((prev) => ({ ...prev, sheet })),
    [setStyle],
  );

  const setHighlighter = useCallback(
    (highlighter: HighlighterColor) => setStyle((prev) => ({ ...prev, highlighter })),
    [setStyle],
  );

  const setInk = useCallback(
    (ink: InkColor) => setStyle((prev) => ({ ...prev, ink })),
    [setStyle],
  );

  return { style, setSheet, setHighlighter, setInk };
}
