"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FwStatBlockProps {
  value: ReactNode;
  label: string;
  accent?: boolean;
  className?: string;
}

export function FwStatBlock({ value, label, accent = false, className }: FwStatBlockProps) {
  return (
    <div
      className={cn(
        "rounded-xl px-4 py-3 border text-center",
        accent
          ? "bg-violet-50/40 border-violet-200"
          : "bg-gray-50/70 border-gray-200",
        className
      )}
    >
      <div
        className={cn(
          "text-2xl font-display font-bold",
          accent ? "text-violet-700" : "text-gray-900"
        )}
      >
        {value}
      </div>
      <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">
        {label}
      </div>
    </div>
  );
}
