import { cn } from "@/lib/utils";

const variants = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
  info: "border-blue-200 bg-blue-50 text-blue-700"
};

type StatusBadgeProps = {
  children: React.ReactNode;
  variant?: keyof typeof variants;
};

export function StatusBadge({
  children,
  variant = "neutral"
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium",
        variants[variant]
      )}
    >
      {children}
    </span>
  );
}
