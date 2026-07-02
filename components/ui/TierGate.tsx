"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lock } from "lucide-react";
import { TIER_LABELS } from "@/lib/tiers";

interface TierGateProps {
  requiredTier: "pro" | "agency";
  children: React.ReactNode;
}

export function TierGate({ requiredTier, children }: TierGateProps) {
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none" aria-hidden>
        {children}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl border border-dashed border-violet-300"
      >
        <Lock className="w-8 h-8 text-violet-500 mb-3" />
        <p className="font-display font-bold text-gray-900 text-lg mb-1">
          Contenido {TIER_LABELS[requiredTier]}
        </p>
        <p className="text-gray-500 text-sm mb-4 text-center max-w-xs">
          Accede a este framework con el plan {TIER_LABELS[requiredTier]}
        </p>
        <Link href="/precios" className="px-5 py-2 rounded-lg bg-gradient-meo text-white font-semibold text-sm hover:opacity-90 transition-opacity">
          Ver planes →
        </Link>
      </motion.div>
    </div>
  );
}
