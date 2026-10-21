import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import type { Subject } from "../../types/academic";
import { Paper } from "../ui/Notebook";
import { downloadBackupFile, parseBackup } from "../../utils/dataTransfer";
import { cn } from "../../utils/cn";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onImport: (subjects: Subject[]) => void;
}

export function BackupModal({ isOpen, onClose, subjects, onImport }: BackupModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    downloadBackupFile(subjects);
    setSuccess("Respaldo descargado correctamente.");
    setError(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content !== "string") {
        setError("No se pudo leer el archivo.");
        return;
      }

      const result = parseBackup(content);
      if (!result.valid) {
        setError(result.error ?? "Archivo inválido.");
        setSuccess(null);
        return;
      }

      onImport(result.subjects);
      setSuccess(`Se importaron ${result.subjects.length} materia(s) correctamente.`);
      setError(null);
      onClose();
    };
    reader.onerror = () => setError("Error al leer el archivo.");
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/50" onClick={onClose} aria-hidden="true" />
      <Paper animate className="relative z-10 w-full max-w-md space-y-4 p-6">
        <h3 className="font-hand text-2xl text-[var(--ink)]">Respaldar mis datos</h3>
        <p className="text-sm text-[var(--ink-soft)]">
          Exporta todas tus materias, notas y configuración en un archivo JSON. Importa un respaldo anterior para restaurar tus datos.
        </p>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleExport}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border border-[var(--border)] p-4 text-left transition",
              "hover:bg-[var(--surface-2)]",
            )}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--hl-blue)]/20">
              <Download className="h-5 w-5 text-[var(--ink)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Exportar respaldo</p>
              <p className="text-xs text-[var(--ink-soft)]">
                Descarga un archivo con tus {subjects.length} materia(s).
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleImportClick}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border border-[var(--border)] p-4 text-left transition",
              "hover:bg-[var(--surface-2)]",
            )}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--hl-green)]/20">
              <Upload className="h-5 w-5 text-[var(--ink)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--ink)]">Importar respaldo</p>
              <p className="text-xs text-[var(--ink-soft)]">
                Selecciona un archivo JSON para restaurar.
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-[var(--fail)]/30 bg-[var(--fail)]/10 p-3 text-sm text-[var(--fail)]">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-xl border border-[var(--pass)]/30 bg-[var(--pass)]/10 p-3 text-sm text-[var(--pass)]">
            {success}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
          >
            Cerrar
          </button>
        </div>
      </Paper>
    </div>
  );
}
