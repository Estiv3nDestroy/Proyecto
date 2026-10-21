import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]",
  secondary:
    "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-[0.98]",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:scale-[0.98]",
  ghost: "text-slate-600 hover:bg-slate-100 active:scale-[0.98]",
  danger: "bg-red-50 text-red-600 hover:bg-red-100 active:scale-[0.98]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
