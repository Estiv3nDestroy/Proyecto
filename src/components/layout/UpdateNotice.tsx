import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

interface UpdateNoticeProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

/**
 * Aviso "Hay una versión nueva" que aparece cuando el service worker
 * detecta una actualización. Permite actualizar sin perder datos (los
 * datos viven en localStorage / Supabase, no en el SW).
 */
export function UpdateNotice({ onUpdate, onDismiss }: UpdateNoticeProps) {
  return (
    <div className="animate-toast-in fixed inset-x-3 top-16 z-[60] mx-auto flex max-w-sm items-center gap-3 rounded-xl border-2 border-[var(--ink)] bg-[var(--paper)] px-4 py-3 shadow-[var(--shadow-lift)]">
      <RefreshCw className="h-5 w-5 shrink-0 text-[var(--ink)]" />
      <div className="flex-1">
        <p className="text-sm font-bold text-[var(--ink)]">Hay una versión nueva</p>
        <p className="text-xs text-[var(--ink-soft)]">
          Tus datos están seguros. Actualiza para ver las mejoras.
        </p>
      </div>
      <button
        type="button"
        onClick={onUpdate}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[var(--ink)] px-3 text-xs font-semibold text-[var(--paper)] transition hover:opacity-90"
      >
        Actualizar
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="grid h-9 w-9 place-items-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
        aria-label="Recordarme después"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Hook que registra el service worker y expone el estado de actualización.
 */
export function useServiceWorkerUpdate() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !import.meta.env.PROD) return;

    let sw: ServiceWorkerRegistration | null = null;

    const register = async () => {
      try {
        sw = await navigator.serviceWorker.register("./sw.js");
        setRegistration(sw);
        if (sw.waiting) setNeedsUpdate(true);

        sw.addEventListener("updatefound", () => {
          const installing = sw?.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setNeedsUpdate(true);
            }
          });
        });

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      } catch {
        // SW no soportado o falló — la app sigue funcionando
      }
    };

    void register();

    return () => {
      sw?.removeEventListener("updatefound", () => setNeedsUpdate(false));
    };
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  return { needsUpdate, applyUpdate, dismissUpdate: () => setNeedsUpdate(false) };
}
