import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { AlertLevel } from "../../types/academic";
import { cn } from "../../utils/cn";

interface AlertProps {
  level: AlertLevel;
  title: string;
  children?: ReactNode;
  className?: string;
}

const levelConfig: Record<AlertLevel, { icon: typeof Info; classes: string; iconClasses: string }> = {
  success: {
    icon: CheckCircle2,
    classes: "border-emerald-200 bg-emerald-50 text-emerald-900",
    iconClasses: "text-emerald-500",
  },
  info: {
    icon: Info,
    classes: "border-sky-200 bg-sky-50 text-sky-900",
    iconClasses: "text-sky-500",
  },
  warning: {
    icon: AlertTriangle,
    classes: "border-amber-200 bg-amber-50 text-amber-900",
    iconClasses: "text-amber-500",
  },
  danger: {
    icon: XCircle,
    classes: "border-red-200 bg-red-50 text-red-900",
    iconClasses: "text-red-500",
  },
};

/** Banner de alerta reutilizable para mensajes de viabilidad y validación. */
export function Alert({ level, title, children, className }: AlertProps) {
  const { icon: Icon, classes, iconClasses } = levelConfig[level];

  return (
    <div className={cn("flex gap-3 rounded-xl border p-4", classes, className)} role="alert">
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClasses)} />
      <div className="space-y-1">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        {children ? <div className="text-sm leading-snug opacity-90">{children}</div> : null}
      </div>
    </div>
  );
}
