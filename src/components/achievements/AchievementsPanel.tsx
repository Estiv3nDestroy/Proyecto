import { Award, Lock } from "lucide-react";
import type { Achievement } from "../../types/academic";
import { Paper } from "../ui/Notebook";
import { cn } from "../../utils/cn";

interface AchievementsPanelProps {
  achievements: Achievement[];
  unlockedCount: number;
}

const ICON_MAP: Record<string, string> = {
  pencil: "✏️",
  books: "📚",
  check: "✅",
  star: "⭐",
  medal: "🏅",
  timer: "⏱️",
  fire: "🔥",
  crown: "👑",
};

export function AchievementsPanel({ achievements, unlockedCount }: AchievementsPanelProps) {
  return (
    <div className="space-y-4">
      <Paper margin animate className="p-4 pl-12 sm:pl-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[var(--ink-soft)]" />
            <h3 className="font-hand text-2xl text-[var(--ink)]">Logros e insignias</h3>
          </div>
          <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-bold text-[var(--ink)]">
            {unlockedCount} / {achievements.length}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
          Pequeños reconocimientos por tu esfuerzo. Sin presión, ¡solo celebrar!
        </p>
      </Paper>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((badge) => {
          const isUnlocked = badge.unlockedAt !== null;
          return (
            <Paper
              key={badge.id}
              animate
              className={cn(
                "relative flex items-center gap-3 p-4 transition",
                isUnlocked ? "border-[var(--pass)]/30" : "opacity-60",
              )}
            >
              <div
                className={cn(
                  "grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl",
                  isUnlocked ? "bg-[var(--hl-yellow)]/30" : "bg-[var(--surface-2)] grayscale",
                )}
              >
                {isUnlocked ? (
                  <span>{ICON_MAP[badge.icon] ?? "🏆"}</span>
                ) : (
                  <Lock className="h-5 w-5 text-[var(--ink-faint)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[var(--ink)]">{badge.name}</p>
                <p className="mt-0.5 text-xs text-[var(--ink-soft)]">{badge.description}</p>
                {isUnlocked && badge.unlockedAt ? (
                  <p className="mt-1 text-[10px] font-semibold text-[var(--pass)]">
                    Desbloqueado {new Date(badge.unlockedAt).toLocaleDateString("es", { day: "numeric", month: "short" })}
                  </p>
                ) : null}
              </div>
            </Paper>
          );
        })}
      </div>
    </div>
  );
}
