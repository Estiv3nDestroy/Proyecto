import { useState } from "react";
import { Archive, ChevronDown, Plus, Trash2 } from "lucide-react";
import type { Semester } from "../../types/academic";
import { Paper } from "../ui/Notebook";
import { cn } from "../../utils/cn";

interface SemesterSelectorProps {
  semesters: Semester[];
  activeSemesterId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (name: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

export function SemesterSelector({
  semesters,
  activeSemesterId,
  onSelect,
  onAdd,
  onArchive,
  onDelete,
  onRename,
}: SemesterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const active = semesters.find((s) => s.id === activeSemesterId);

  const handleAdd = () => {
    if (newName.trim().length === 0) return;
    onAdd(newName.trim());
    setNewName("");
  };

  const handleRenameCommit = () => {
    if (editingId && editName.trim().length > 0) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--paper)] px-3 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-2)]"
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {active ? active.name : "Sin semestre"}
          {active?.isArchived ? " (archivado)" : ""}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition", isOpen && "rotate-180")} />
      </button>

      {isOpen ? (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <Paper className="absolute left-0 right-0 top-full z-40 mt-1 max-h-80 overflow-y-auto p-3 shadow-[var(--shadow-lift)]">
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition",
                activeSemesterId === null
                  ? "bg-[var(--surface-2)] text-[var(--ink)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
              )}
            >
              General (sin semestre)
            </button>

            {semesters.map((sem) => (
              <div
                key={sem.id}
                className={cn(
                  "group flex items-center gap-1 rounded-lg px-2 py-1.5 transition",
                  activeSemesterId === sem.id ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]",
                )}
              >
                {editingId === sem.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleRenameCommit}
                    onKeyDown={(e) => e.key === "Enter" && handleRenameCommit()}
                    className="min-w-0 flex-1 rounded border border-[var(--border)] bg-[var(--paper)] px-2 py-1 text-sm text-[var(--ink)] outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(sem.id);
                      setIsOpen(false);
                    }}
                    onDoubleClick={() => {
                      setEditingId(sem.id);
                      setEditName(sem.name);
                    }}
                    className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[var(--ink)]"
                  >
                    {sem.name}
                    {sem.isArchived ? " (archivado)" : ""}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onArchive(sem.id)}
                  className="rounded p-1 text-[var(--ink-faint)] opacity-0 transition hover:text-[var(--ink-soft)] group-hover:opacity-100"
                  aria-label={`Archivar ${sem.name}`}
                  title={sem.isArchived ? "Desarchivar" : "Archivar"}
                >
                  <Archive className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`¿Eliminar el semestre "${sem.name}"?`)) onDelete(sem.id);
                  }}
                  className="rounded p-1 text-[var(--ink-faint)] opacity-0 transition hover:text-[var(--fail)] group-hover:opacity-100"
                  aria-label={`Eliminar ${sem.name}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            <div className="mt-2 flex gap-2 border-t border-[var(--border)] pt-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Ej. 2026-1"
                className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--paper)] px-2.5 py-1.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--rule-margin)]"
              />
              <button
                type="button"
                onClick={handleAdd}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--ink)] text-[var(--paper)] transition hover:opacity-90"
                aria-label="Crear semestre"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </Paper>
        </>
      ) : null}
    </div>
  );
}
