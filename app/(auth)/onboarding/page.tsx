"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

const PROFILES = [
  { id: "seo-total", icon: "🔍", label: "Profesional SEO", desc: "Posicionamiento orgánico" },
  { id: "agencias", icon: "🏢", label: "Agencia / Consultor", desc: "Servicios a clientes" },
  { id: "ecommerce", icon: "🛒", label: "Ecommerce", desc: "Escalar ventas online" },
  { id: "startups", icon: "🚀", label: "Startup / Emprendedor", desc: "Crecer rápido" },
  { id: "enterprise", icon: "🏗️", label: "Empresa Grande", desc: "Marketing corporativo" },
  { id: "ia-futuro", icon: "🤖", label: "Innovador / IA", desc: "Frameworks avanzados" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">¿Cuál es tu perfil?</h1>
      <p className="text-gray-500 text-sm mb-6">Te recomendamos la ruta MEO ideal.</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {PROFILES.map(p => (
          <motion.button key={p.id} whileTap={{ scale: 0.97 }} onClick={() => setSelected(p.id)}
            className={`text-left p-4 rounded-xl border-2 transition-all ${selected === p.id ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-gray-300"}`}>
            <div className="text-2xl mb-1">{p.icon}</div>
            <div className="font-semibold text-sm text-gray-900">{p.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
          </motion.button>
        ))}
      </div>
      <button onClick={() => selected && router.push(`/dashboard?path=${selected}`)}
        disabled={!selected}
        className="w-full py-3 rounded-xl bg-gradient-meo text-white font-bold disabled:opacity-40 hover:opacity-90 transition-opacity">
        Comenzar mi ruta →
      </button>
    </div>
  );
}
