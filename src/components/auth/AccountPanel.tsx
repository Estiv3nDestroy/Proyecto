import { useState } from "react";
import { AlertTriangle, KeyRound, Loader2, Mail, Trash2, User } from "lucide-react";
import type { AuthUser } from "../../hooks/useAuth";
import { Paper } from "../ui/Notebook";

interface AccountPanelProps {
  user: AuthUser;
  onRename: (name: string) => Promise<boolean>;
  onResetPassword: (email: string) => Promise<boolean>;
  onDeleteAccount: () => Promise<boolean>;
  onClose: () => void;
}

/**
 * Panel "Mi cuenta": cambiar nombre, recuperar contraseña y eliminar cuenta.
 */
export function AccountPanel({
  user,
  onRename,
  onResetPassword,
  onDeleteAccount,
  onClose,
}: AccountPanelProps) {
  const [name, setName] = useState(user.name ?? "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);

  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveName = async () => {
    setIsSavingName(true);
    setNameMessage(null);
    const ok = await onRename(name.trim());
    setIsSavingName(false);
    setNameMessage(ok ? "Nombre actualizado." : "No pudimos guardar el nombre.");
  };

  const handleResetPassword = async () => {
    setIsSendingReset(true);
    setResetMessage(null);
    const ok = await onResetPassword(user.email);
    setIsSendingReset(false);
    setResetMessage(
      ok
        ? "Te enviamos un correo para restablecer tu contraseña."
        : "No pudimos enviar el correo.",
    );
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDeleteAccount();
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md space-y-4 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-6 shadow-[var(--shadow-lift)]">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--ink)] text-lg font-bold text-[var(--paper)]">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h2 className="font-hand text-2xl text-[var(--ink)]">Mi cuenta</h2>
            <p className="truncate text-xs text-[var(--ink-soft)]">{user.email}</p>
          </div>
        </div>

        {/* Cambiar nombre */}
        <Paper className="space-y-3 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <User className="h-4 w-4 text-[var(--ink-soft)]" />
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--rule-margin)]"
            placeholder="Tu nombre"
          />
          <button
            type="button"
            onClick={handleSaveName}
            disabled={isSavingName || name.trim() === (user.name ?? "")}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--ink)] px-4 text-sm font-semibold text-[var(--paper)] transition hover:opacity-90 disabled:opacity-50"
          >
            {isSavingName ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Guardar nombre
          </button>
          {nameMessage ? (
            <p className="text-xs font-medium text-[var(--ink-soft)]">{nameMessage}</p>
          ) : null}
        </Paper>

        {/* Recuperar contraseña */}
        <Paper className="space-y-3 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
            <KeyRound className="h-4 w-4 text-[var(--ink-soft)]" />
            Contraseña
          </label>
          <p className="text-xs text-[var(--ink-soft)]">
            Te enviaremos un correo a <strong>{user.email}</strong> con un enlace para
            crear una contraseña nueva.
          </p>
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={isSendingReset}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-2)] disabled:opacity-50"
          >
            {isSendingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Enviar correo de recuperación
          </button>
          {resetMessage ? (
            <p className="text-xs font-medium text-[var(--ink-soft)]">{resetMessage}</p>
          ) : null}
        </Paper>

        {/* Eliminar cuenta */}
        <Paper className="space-y-3 border-[var(--fail)]/30 p-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-[var(--fail)]">
            <AlertTriangle className="h-4 w-4" />
            Zona peligrosa
          </label>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--fail)] px-4 text-sm font-semibold text-[var(--fail)] transition hover:bg-[var(--fail-bg)]"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar mi cuenta y mis datos
            </button>
          ) : (
            <div className="space-y-3">
              <p className="rounded-lg bg-[var(--fail-bg)] px-3 py-2 text-xs font-medium text-[var(--fail)]">
                Esto borrará todas tus materias y notas de forma permanente. No se puede
                deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--fail)] px-4 text-sm font-semibold text-[var(--paper)] transition hover:opacity-90 disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Sí, borrar todo
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </Paper>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
