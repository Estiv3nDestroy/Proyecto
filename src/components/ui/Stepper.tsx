import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
}

/** Indicador visual de progreso del asistente (wizard) de 3 pasos. */
export function Stepper({ steps, currentIndex, onStepClick }: StepperProps) {
  return (
    <ol className="flex w-full items-center">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isClickable = Boolean(onStepClick) && index <= currentIndex;

        return (
          <li key={step.id} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => onStepClick?.(index)}
              className={cn(
                "flex items-center gap-2 text-left",
                isClickable ? "cursor-pointer" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isCompleted && "bg-indigo-600 text-white",
                  isActive && "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500",
                  !isCompleted && !isActive && "bg-slate-100 text-slate-400",
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  isActive ? "text-slate-900" : "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 ? (
              <div className={cn("mx-3 h-0.5 flex-1 rounded-full", isCompleted ? "bg-indigo-600" : "bg-slate-200")} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
