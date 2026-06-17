"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const WORDS = ["Visibilidad.", "Autoridad.", "Conversión."];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <span className="inline-block text-sm font-semibold text-violet-600 tracking-widest uppercase mb-6">
            Sistema MEO 2026 — 117 Frameworks
          </span>
          <h1 className="font-display text-6xl md:text-8xl font-bold text-gray-900 leading-none mb-6">
            Marketing<br /><span className="gradient-text">Engine</span><br />Optimization
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-4">
            El sistema más completo de marketing digital integrado con IA. 117 frameworks. 6 rutas guiadas. 1 metodología que lo unifica todo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {WORDS.map((word, i) => (
              <motion.span key={word} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.15 }}
                className="font-display font-bold text-2xl gradient-text">{word}</motion.span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-4 rounded-xl bg-gradient-meo text-white font-display font-bold text-lg hover:opacity-90 transition-all shadow-lg">
              Comenzar gratis →
            </Link>
            <Link href="/curso" className="px-8 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-display font-bold text-lg hover:border-violet-300 transition-all">
              Ver los 117 frameworks
            </Link>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[{ value: "117", label: "Frameworks" }, { value: "6", label: "Rutas guiadas" }, { value: "+250%", label: "ROI promedio" }].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="font-display font-bold text-4xl gradient-text">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
