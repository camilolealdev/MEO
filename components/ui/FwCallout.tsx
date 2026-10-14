"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type CalloutVariant = "principle" | "practice" | "note" | "warning" | "kpi";

interface FwCalloutProps {
  variant?: CalloutVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CONFIG: Record<
  CalloutVariant,
  { label: string; bg: string; border: string; text: string; labelColor: string }
> = {
  principle: {
    label: "Principio",
    bg: "bg-violet-50/60",
    border: "border-violet-200",
    text: "text-violet-900",
    labelColor: "text-violet-600",
  },
  practice: {
    label: "Práctica",
    bg: "bg-lime-50/70",
    border: "border-lime-200",
    text: "text-lime-900",
    labelColor: "text-lime-600",
  },
  note: {
    label: "Nota",
    bg: "bg-cyan-50/60",
    border: "border-cyan-200",
    text: "text-cyan-900",
    labelColor: "text-cyan-600",
  },
  warning: {
    label: "Importante",
    bg: "bg-amber-50/70",
    border: "border-amber-200",
    text: "text-amber-900",
    labelColor: "text-amber-600",
  },
  kpi: {
    label: "KPI",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-900",
    labelColor: "text-gray-500",
  },
};

export function FwCallout({ variant = "note", children, className }: FwCalloutProps) {
  const cfg = VARIANT_CONFIG[variant];
  return (
    <div
      className={cn(
        "relative rounded-xl px-5 py-4 my-6 border",
        cfg.bg,
        cfg.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0",
            cfg.labelColor,
            "bg-white/70 ring-1 ring-inset ring-white/50"
          )}
        >
          {cfg.label}
        </span>
        <div className={cn("text-sm leading-relaxed", cfg.text)}>
          {children}
        </div>
      </div>
    </div>
  );
}
