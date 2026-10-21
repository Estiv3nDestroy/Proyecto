import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string | null;
  suffix?: string;
}

/**
 * Campo numérico controlado con validación visual integrada. Se maneja el
 * valor como `string` para permitir estados intermedios (ej. "3." mientras
 * el usuario escribe decimales) sin perder precisión ni forzar NaN.
 */
export function NumberField({
  label,
  value,
  onChange,
  hint,
  error,
  suffix,
  className,
  ...props
}: NumberFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:ring-2 focus:ring-indigo-500/40",
            error ? "border-red-300 focus:border-red-400" : "border-slate-300 focus:border-indigo-400",
            suffix ? "pr-12" : "",
            className,
          )}
          {...props}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>
      {error ? (
        <span className="block text-xs font-medium text-red-500">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}
