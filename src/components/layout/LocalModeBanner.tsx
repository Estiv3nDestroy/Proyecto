import { Cloud, Upload } from "lucide-react";

interface LocalModeBannerProps {
  onLogin: () => void;
  onDismiss: () => void;
}

/**
 * Banner que explica qué se pierde si no se inicia sesión, con botón para
 * migrar los datos locales a la cuenta al registrarse.
 */
export function LocalModeBanner({ onLogin, onDismiss }: LocalModeBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--risk)]/40 bg-[var(--risk-bg)] px-4 py-2.5">
      <Cloud className="h-5 w-5 shrink-0 text-[var(--risk)]" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[var(--risk)]">
          Modo local: tus datos solo viven en este dispositivo.
        </p>
        <p className="hidden text-[11px] text-[var(--ink-soft)] sm:block">
          Si cambias de celular o borras el navegador, se pierden. Inicia sesión para
          sincronizarlos en la nube.
        </p>
      </div>
      <button
        type="button"
        onClick={onLogin}
        className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[var(--ink)] px-3 text-xs font-semibold text-[var(--paper)] transition hover:opacity-90"
      >
        <Upload className="h-3.5 w-3.5" />
        Migrar a la nube
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
        aria-label="Cerrar aviso"
      >
        ×
      </button>
    </div>
  );
}
