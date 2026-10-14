"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FwCodeBlockProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export function FwCodeBlock({ children, className, title }: FwCodeBlockProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden border border-gray-200 bg-gray-950 my-6",
        className
      )}
    >
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800 text-xs text-gray-400 font-medium">
          {title}
          <span className="text-gray-600">MDX</span>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono text-gray-200">
        {children}
      </pre>
    </div>
  );
}
