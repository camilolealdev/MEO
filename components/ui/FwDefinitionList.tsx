"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FwDefinitionListProps {
  items: { label: string; value: ReactNode }[];
  variant?: "inline" | "stacked";
  className?: string;
}

export function FwDefinitionList({
  items,
  variant = "stacked",
  className,
}: FwDefinitionListProps) {
  return (
    <div
      className={cn(
        "my-6 rounded-xl border border-gray-200 bg-gray-50/40 p-4",
        variant === "inline" && "grid grid-cols-2 gap-4",
        className
      )}
    >
      {variant === "inline" ? (
        items.map((item) => (
          <div key={item.label} className="text-sm">
            <span className="text-gray-500 block truncate">{item.label}</span>
            <span className="text-gray-900 font-semibold">{item.value}</span>
          </div>
        ))
      ) : (
        <dl className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-baseline gap-3">
              <dt className="text-sm text-gray-500 uppercase tracking-wider w-1/3 shrink-0">
                {item.label}
              </dt>
              <dd className="text-sm text-gray-900 font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
