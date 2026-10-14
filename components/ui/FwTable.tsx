"use client";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface FwTableProps {
  as?: "table" | "div";
  className?: string;
  headers: ReactNode[];
  rows: ReactNode[][];
}

export function FwTable({ as: Tag = "table", className, headers, rows }: FwTableProps) {
  return (
    <Tag
      className={cn(
        "w-full text-sm border-collapse my-6",
        Tag === "div" ? "not-table" : "",
        className
      )}
    >
      {Tag === "div" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {headers.map((h, i) => (
            <div key={i} className="text-xs uppercase tracking-wider text-gray-500 font-medium">
              {h}
            </div>
          ))}
          {rows.map((row, ri) =>
            row.map((cell, ci) => (
              <div key={`${ri}-${ci}`} className="pt-2 border-t border-gray-100 first:border-t-0">
                {cell}
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <thead className="text-left">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-xs uppercase tracking-wider text-gray-500 font-semibold pb-2 pr-4 border-b border-gray-200 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="group">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="pb-3 pr-4 border-b border-gray-100 text-gray-800 group-hover:bg-gray-50/50 transition-colors"
                    style={{ width: ci === 0 ? "auto" : "1fr" }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </>
      )}
    </Tag>
  );
}
