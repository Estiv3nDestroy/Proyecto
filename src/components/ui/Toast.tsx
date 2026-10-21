import { useCallback, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "../../utils/cn";

export type ToastTone = "success" | "info" | "error";

export interface ToastMessage {
  id: number;
  text: string;
  tone: ToastTone;
}

/** Hook mínimo para mostrar confirmaciones efímeras sin dependencias extra. */
export function useToasts() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (text: string, tone: ToastTone = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, text, tone }]);
      window.setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  return { toasts, notify, dismiss };
}

const toneStyles: Record<ToastTone, { icon: typeof Info; classes: string }> = {
  success: { icon: CheckCircle2, classes: "border-[var(--pass)] bg-[var(--pass-bg)] text-[var(--pass)]" },
  info: { icon: Info, classes: "border-[var(--ink-soft)] bg-[var(--surface-2)] text-[var(--ink)]" },
  error: { icon: AlertTriangle, classes: "border-[var(--fail)] bg-[var(--fail-bg)] text-[var(--fail)]" },
};

/** Contenedor de avisos, anclado abajo en móvil y abajo-derecha en escritorio. */
export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-3 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:items-end"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const { icon: Icon, classes } = toneStyles[toast.tone];
        return (
          <div
            key={toast.id}
            className={cn(
              "animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border-2 px-4 py-3 shadow-[var(--shadow-lift)]",
              classes,
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1 text-sm font-medium leading-snug">{toast.text}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
