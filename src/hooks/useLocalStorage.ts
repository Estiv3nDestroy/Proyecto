import { useEffect, useRef, useState } from "react";

/**
 * Hook genérico para sincronizar un estado de React con `localStorage`.
 * Maneja de forma defensiva errores de parseo o de almacenamiento (por
 * ejemplo, modo incógnito con cuota agotada) sin romper la aplicación.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const isFirstRender = useRef(true);

  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    // Evita una escritura innecesaria en el primer render si el valor
    // proviene directamente de localStorage.
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Falla silenciosa: la app sigue funcionando en memoria aunque no
      // se pueda persistir (p. ej. almacenamiento lleno o deshabilitado).
    }
  }, [key, value]);

  return [value, setValue] as const;
}
