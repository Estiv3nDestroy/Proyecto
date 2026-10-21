import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type BadgeTone = "slate" | "emerald" | "amber" | "red" | "indigo";

const toneStyles: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-600",
  emerald: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

export function Badge({ tone = "slate", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", toneStyles[tone])}>
      {children}
    </span>
  );
}
