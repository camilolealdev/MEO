"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import type { LearningPath } from "@/lib/content";

export function PathsShowcase({ paths }: { paths: LearningPath[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paths.map((path, i) => (
        <motion.div key={path.slug}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ delay: i * 0.08 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group"
        >
          <div className={`h-2 w-12 rounded-full bg-gradient-to-r ${path.color} mb-4`} />
          <h3 className="font-display font-bold text-xl text-gray-900 mb-2">{path.name}</h3>
          <p className="text-gray-500 text-sm mb-4 leading-relaxed">{path.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{path.frameworks.length} frameworks</span>
            <Link href={`/learn/ruta/${path.slug}`} className="text-sm font-semibold text-violet-600 hover:text-violet-700 group-hover:underline">
              Ver ruta →
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
