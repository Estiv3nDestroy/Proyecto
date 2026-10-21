import { Cloud, Database, Eye, Shield, Smartphone, X } from "lucide-react";

interface PrivacyScreenProps {
  onClose: () => void;
}

/**
 * Pantalla de privacidad corta y honesta: qué se guarda, dónde y por qué.
 */
export function PrivacyScreen({ onClose }: PrivacyScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-6 shadow-[var(--shadow-lift)]">
        <div className="flex items-center justify-between">
          <h2 className="font-hand text-2xl text-[var(--ink)]">Tu privacidad</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ink-soft)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Si no inicias sesión</p>
              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                Todas tus materias y notas se guardan <strong>solo en este dispositivo</strong>
                (en el almacenamiento del navegador). Si borras los datos del navegador o
                cambias de celular, se pierden.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <Cloud className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ink-soft)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Si inicias sesión</p>
              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                Tus materias se sincronizan en una base de datos segura (Supabase) para que
                las veas desde cualquier dispositivo. Solo tú puedes ver tus datos: ningún
                otro usuario tiene acceso.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ink-soft)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Qué guardamos</p>
              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                Solo: tu correo electrónico, tu nombre (opcional) y las materias con sus
                notas y configuración. No guardamos fotos, contactos ni ubicación.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ink-soft)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Control total</p>
              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                Puedes exportar tus datos como JSON en cualquier momento y eliminar tu
                cuenta y todos tus datos cuando quieras desde "Mi cuenta".
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <Eye className="mt-0.5 h-5 w-5 shrink-0 text-[var(--ink-soft)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Sin rastreo ni publicidad</p>
              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                No usamos cookies de seguimiento ni vendemos tus datos. Esta app es gratis
                y sin anuncios.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-[var(--ink)] py-2.5 text-sm font-semibold text-[var(--paper)] transition hover:opacity-90"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
