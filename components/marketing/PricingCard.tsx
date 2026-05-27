"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  priceId?: string;
  highlighted?: boolean;
  tier: "free" | "pro" | "agency";
}

interface PricingCardProps {
  plan: Plan;
  index: number;
  onUpgrade?: (priceId: string) => void;
}

export function PricingCard({ plan, index, onUpgrade }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "relative rounded-2xl p-8 border flex flex-col",
        plan.highlighted ? "tier-gradient-border shadow-2xl shadow-violet-100 scale-105" : "border-gray-200 bg-white"
      )}
    >
      {plan.highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-meo text-white text-sm font-bold whitespace-nowrap">
          Más popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="font-display font-bold text-2xl text-gray-900 mb-1">{plan.name}</h3>
        <p className="text-gray-500 text-sm">{plan.description}</p>
      </div>
      <div className="mb-8">
        <span className="font-display font-bold text-5xl text-gray-900">{plan.price}</span>
        <span className="text-gray-500 ml-1">{plan.period}</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map(feature => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
            <Check className="w-4 h-4 text-lime-500 mt-0.5 shrink-0" />{feature}
          </li>
        ))}
      </ul>
      <button
        onClick={() => plan.priceId && onUpgrade?.(plan.priceId)}
        className={cn("w-full py-3 rounded-xl font-display font-bold text-base transition-all",
          plan.highlighted ? "bg-gradient-meo text-white hover:opacity-90 shadow-lg" : "border-2 border-gray-200 text-gray-700 hover:border-violet-300")}
      >
        {plan.cta}
      </button>
    </motion.div>
  );
}
