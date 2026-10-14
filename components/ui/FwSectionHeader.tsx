"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FwSectionHeaderProps {
  label?: string;
  index?: string;
  children: ReactNode;
  className?: string;
}

export function FwSectionHeader({
  label,
  index,
  children,
  className,
}: FwSectionHeaderProps) {
  return (
    <h2
      className={cn(
        "font-display font-bold text-xl text-gray-900 mb-5 mt-10",
        className
      )}
    >
      <span className="fw-acc-text inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mr-3">
        {index && (
          <span className="fw-acc-bg fw-acc-text rounded-md px-2 py-0.5 text-xs font-mono">
            {index}
          </span>
        )}
        {label && <span>{label}</span>}
      </span>
      {children}
      <span className="fw-acc-bar-soft block w-24 h-1 mt-3 rounded-full" />
    </h2>
  );
}
