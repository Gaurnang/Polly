import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-violet-600 hover:bg-violet-500 text-white glow-btn",
  secondary: "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10",
  danger: "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25",
  ghost: "hover:bg-white/5 text-slate-400 hover:text-slate-200",
  outline: "border border-violet-500/40 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/60",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
  xl: "px-8 py-4 text-lg rounded-2xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
