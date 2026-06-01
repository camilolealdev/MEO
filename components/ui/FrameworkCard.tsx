"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FrameworkMeta } from "@/lib/content";
import { Clock } from "lucide-react";

const TIER_COLORS = {
  free: "text-lime-600 bg-lime-50 border-lime-200",
  pro: "text-violet-600 bg-violet-50 border-violet-200",
  agency: "text-cyan-600 bg-cyan-50 border-cyan-200",
};

const TIER_LABELS = {
  free: "Explorer",
  pro: "Practitioner",
  agency: "Orchestrator",
};

const TIER_ORDER = { free: 0, pro: 1, agency: 2 };

interface FrameworkCardProps {
  framework: FrameworkMeta;
  userTier: "free" | "pro" | "agency";
  completed?: boolean;
  index?: number;
}

export function FrameworkCard({ framework, userTier, completed = false, index = 0 }: FrameworkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 6) * 0.05 }}
      className={cn(
        "relative group rounded-xl p-5 border bg-white transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5",
        completed && "tier-gradient-border"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl font-display font-bold text-gray-100 select-none">
          #{String(framework.number).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2">
          {completed && (
            <span className="w-5 h-5 rounded-full bg-lime-400 flex items-center justify-center text-white text-xs">✓</span>
          )}
          <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", TIER_COLORS[framework.tier])}>
            {TIER_LABELS[framework.tier]}
          </span>
        </div>
      </div>
      <h3 className="font-display font-bold text-gray-900 text-lg leading-tight mb-2">
        {framework.title}
      </h3>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {framework.estimatedMinutes} min
        </span>
        <span className="capitalize">{framework.category.replace(/-/g, " ")}</span>
      </div>
      <Link
        href={`/learn/${framework.slug}`}
        className="mt-4 flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700"
      >
        {completed ? "Repasar framework" : "Comenzar"} →
      </Link>
    </motion.div>
  );
}
