import { useCallback, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type ThemeMode = "light" | "dark";

const THEME_KEY = "notaminima::theme";

/**
 * Gestiona el "Cuaderno Diurno / Nocturno".
 * Guarda la preferencia del usuario y, si nunca la ha elegido, respeta la
 * configuración del sistema operativo.
 */
export function useTheme() {
  const prefersDark =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [theme, setTheme] = useLocalStorage<ThemeMode>(THEME_KEY, prefersDark ? "dark" : "light");

  // Aplica la clase `dark` en <html> para activar las variables CSS
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#161d2b" : "#fffdf6");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, [setTheme]);

  return { theme, toggleTheme, isDark: theme === "dark" };
}
