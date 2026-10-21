import { useMemo, useState } from "react";
import { Bell, Calendar, Check, Plus, Trash2 } from "lucide-react";
import type { AgendaItem, Subject } from "../../types/academic";
import { Paper, PostIt } from "../ui/Notebook";
import { cn } from "../../utils/cn";

interface AgendaPanelProps {
  items: AgendaItem[];
  subjects: Subject[];
  onAdd: (item: Omit<AgendaItem, "id" | "isDone">) => void;
  onToggleDone: (id: string) => void;
  onRemove: (id: string) => void;
}

type SortMode = "urgency" | "date";

const TYPE_LABELS: Record<AgendaItem["type"], string> = {
  exam: "Examen",
  assignment: "Entrega",
  presentation: "Presentación",
  other: "Otro",
};

const TYPE_ICONS: Record<AgendaItem["type"], string> = {
  exam: "📝",
  assignment: "📦",
  presentation: "🎤",
  other: "📌",
};

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatCountdown(days: number): string {
  if (days < 0) return "Vencido";
  if (days === 0) return "¡Hoy!";
  if (days === 1) return "Mañana";
  if (days < 7) return `En ${days} días`;
  if (days < 30) return `En ${Math.ceil(days / 7)} sem.`;
  return `En ${Math.ceil(days / 30)} mes(es)`;
}

export function AgendaPanel({ items, subjects, onAdd, onToggleDone, onRemove }: AgendaPanelProps) {
  const [sortMode, setSortMode] = useState<SortMode>("urgency");
  const [showForm, setShowForm] = useState(false);
  const [formSubject, setFormSubject] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formType, setFormType] = useState<AgendaItem["type"]>("exam");

  const sortedItems = useMemo(() => {
    const visible = items.filter((item) => !item.isDone);
    if (sortMode === "urgency") {
      return [...visible].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
    }
    return [...visible].sort((a, b) => a.date.localeCompare(b.date));
  }, [items, sortMode]);

  const doneItems = useMemo(() => items.filter((item) => item.isDone), [items]);

  const handleAdd = () => {
    if (!formTitle.trim() || !formDate || !formSubject) return;
    onAdd({
      subjectId: formSubject,
      title: formTitle.trim(),
      date: formDate,
      type: formType,
    });
    setFormTitle("");
    setFormDate("");
    setShowForm(false);
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const subjectName = (id: string) => subjects.find((s) => s.id === id)?.name ?? "Sin materia";

  return (
    <div className="space-y-4">
      <Paper margin animate className="p-4 pl-12 sm:pl-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--ink-soft)]" />
            <h3 className="font-hand text-2xl text-[var(--ink)]">Agenda de entregas</h3>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setSortMode("urgency")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                sortMode === "urgency"
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
              )}
            >
              Urgencia
            </button>
            <button
              type="button"
              onClick={() => setSortMode("date")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold transition",
                sortMode === "date"
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
              )}
            >
              Fecha
            </button>
          </div>
        </div>
      </Paper>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--paper)] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Agregar evento
        </button>
        <button
          type="button"
          onClick={requestNotificationPermission}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] transition hover:bg-[var(--surface-2)]"
        >
          <Bell className="h-4 w-4" />
          Activar recordatorios
        </button>
      </div>

      {showForm ? (
        <Paper animate className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none"
            >
              <option value="">Selecciona materia...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as AgendaItem["type"])}
              className="rounded-lg border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none"
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Título (ej. Parcial final)"
              className="rounded-lg border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none"
            />
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="rounded-lg border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!formTitle.trim() || !formDate || !formSubject}
            className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--paper)] transition hover:opacity-90 disabled:opacity-50"
          >
            Guardar evento
          </button>
        </Paper>
      ) : null}

      {sortedItems.length === 0 && doneItems.length === 0 ? (
        <PostIt tone="yellow">
          No tienes eventos en la agenda. Agrega exámenes, entregas y presentaciones para mantener un control de fechas.
        </PostIt>
      ) : null}

      {sortedItems.length > 0 ? (
        <div className="space-y-2">
          {sortedItems.map((item) => {
            const days = daysUntil(item.date);
            const isUrgent = days >= 0 && days <= 3;
            const isOverdue = days < 0;
            return (
              <Paper
                key={item.id}
                animate
                className={cn(
                  "flex items-center gap-3 p-3",
                  isOverdue && "border-[var(--fail)]/30",
                )}
              >
                <button
                  type="button"
                  onClick={() => onToggleDone(item.id)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-[var(--border)] transition hover:border-[var(--pass)] hover:bg-[var(--pass)]/10"
                  aria-label="Marcar como hecho"
                >
                  <Check className="h-3.5 w-3.5 text-[var(--ink-faint)]" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{TYPE_ICONS[item.type]}</span>
                    <span className="truncate text-sm font-semibold text-[var(--ink)]">{item.title}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                    {subjectName(item.subjectId)} · {TYPE_LABELS[item.type]}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className="text-xs font-bold"
                    style={{
                      color: isOverdue
                        ? "var(--fail)"
                        : isUrgent
                          ? "var(--risk)"
                          : "var(--ink-soft)",
                    }}
                  >
                    {formatCountdown(days)}
                  </p>
                  <p className="text-[10px] text-[var(--ink-faint)]">
                    {new Date(item.date + "T00:00:00").toLocaleDateString("es", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="rounded-lg p-1.5 text-[var(--ink-faint)] transition hover:text-[var(--fail)]"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </Paper>
            );
          })}
        </div>
      ) : null}

      {doneItems.length > 0 ? (
        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold text-[var(--ink-faint)] transition hover:text-[var(--ink-soft)]">
            Completados ({doneItems.length})
          </summary>
          <div className="mt-2 space-y-1.5">
            {doneItems.map((item) => (
              <Paper key={item.id} className="flex items-center gap-3 p-2.5 opacity-60">
                <Check className="h-4 w-4 shrink-0 text-[var(--pass)]" />
                <span className="flex-1 truncate text-sm text-[var(--ink-soft)] line-through">
                  {item.title} · {subjectName(item.subjectId)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="rounded p-1 text-[var(--ink-faint)] hover:text-[var(--fail)]"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Paper>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
