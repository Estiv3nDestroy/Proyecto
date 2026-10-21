import type { ReactNode } from "react";
import { Cloud, CloudOff, CloudUpload, LogOut, Menu, UserCircle2 } from "lucide-react";
import type { AuthUser } from "../../hooks/useAuth";
import type { SyncStatus } from "../../hooks/useCloudSync";
import { NotebookArt } from "../ui/Notebook";
import { cn } from "../../utils/cn";

interface NavbarProps {
  user: AuthUser | null;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  onToggleMobileSidebar: () => void;
  /** Espacio para acciones extra (ej. el interruptor de tema). */
  rightSlot?: ReactNode;
}

/**
 * Cabecera de la aplicación con estética de cuaderno: marca, estado de
 * sincronización en la nube y menú de sesión. Totalmente responsive.
 */
export function Navbar({
  user,
  syncStatus,
  lastSyncedAt,
  onLogout,
  onOpenAuthModal,
  onToggleMobileSidebar,
  rightSlot,
}: NavbarProps) {
  const syncLabel = (): string => {
    if (!user) return "Modo local";
    switch (syncStatus) {
      case "downloading":
        return "Leyendo tu nube…";
      case "uploading":
        return "Guardando…";
      case "synced":
        return lastSyncedAt
          ? `Guardado ${lastSyncedAt.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}`
          : "Sincronizado";
      case "error":
        return "Sin conexión";
      default:
        return "Nube lista";
    }
  };

  const SyncIcon = !user
    ? CloudOff
    : syncStatus === "error"
      ? CloudOff
      : syncStatus === "uploading" || syncStatus === "downloading"
        ? CloudUpload
        : Cloud;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--paper)]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 lg:px-8">
        {/* Marca */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)] lg:hidden"
            aria-label="Abrir lista de materias"
          >
            <Menu className="h-5 w-5" />
          </button>

          <NotebookArt className="h-9 w-9 shrink-0" />
          <div className="min-w-0">
            <h1 className="font-hand truncate text-2xl leading-none text-[var(--ink)]">NotaMínima</h1>
            <p className="hidden text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-faint)] sm:block">
              Tu cuaderno de notas
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold md:inline-flex",
              !user
                ? "border-[var(--border)] bg-[var(--surface-2)] text-[var(--ink-faint)]"
                : syncStatus === "error"
                  ? "border-[var(--fail)] bg-[var(--fail-bg)] text-[var(--fail)]"
                  : "border-[var(--pass)] bg-[var(--pass-bg)] text-[var(--pass)]",
            )}
          >
            <SyncIcon className="h-3.5 w-3.5" />
            {syncLabel()}
          </span>

          {rightSlot}

          {user ? (
            <>
              <span className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] py-1 pl-1 pr-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--ink)] text-xs font-bold text-[var(--paper)]">
                  {(user.name ?? user.email).charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[110px] truncate text-xs font-semibold text-[var(--ink)] sm:block">
                  {user.name ?? user.email.split("@")[0]}
                </span>
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="grid h-11 w-11 place-items-center rounded-xl text-[var(--ink-faint)] transition hover:bg-[var(--fail-bg)] hover:text-[var(--fail)]"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[var(--ink)] px-3.5 text-sm font-semibold text-[var(--paper)] transition hover:opacity-90"
            >
              <UserCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
