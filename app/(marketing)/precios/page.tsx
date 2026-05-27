"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PricingCard, type Plan } from "@/components/marketing/PricingCard";

const PLANS: Plan[] = [
  {
    tier: "free",
    name: "Explorer",
    price: "$0",
    period: "/mes",
    description: "Comienza a explorar el sistema MEO sin costo.",
    cta: "Comenzar gratis",
    features: [
      "8 frameworks core MEO",
      "Introducción al sistema (cap. 1-5)",
      "Ruta de bienvenida guiada",
      "Acceso a la comunidad básica",
    ],
  },
  {
    tier: "pro",
    name: "Practitioner",
    price: "$29",
    period: "/mes",
    description: "El sistema MEO completo para profesionales.",
    cta: "Activar Practitioner",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    highlighted: true,
    features: [
      "116 frameworks completos",
      "6 rutas guiadas temáticas",
      "Quizzes de comprensión",
      "Certificados por ruta",
      "Tracking de progreso",
      "Actualizaciones mensuales",
    ],
  },
  {
    tier: "agency",
    name: "Orchestrator",
    price: "$79",
    period: "/mes",
    description: "Para agencias y consultores que ofrecen MEO como servicio.",
    cta: "Activar Orchestrator",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AGENCY,
    features: [
      "Todo de Practitioner",
      "20 planes por industria",
      "PDFs descargables de cada framework",
      "Plantillas de propuesta para clientes",
      "Casos de éxito detallados",
      "Acceso anticipado a nuevos frameworks",
      "Soporte prioritario",
    ],
  },
];

export default function PreciosPage() {
  const { data: session } = useSession();
  const router = useRouter();

  async function handleUpgrade(priceId: string) {
    if (!session) { router.push("/register?redirect=/precios"); return; }
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h1 className="font-display font-bold text-5xl text-gray-900 mb-4">
          Elige tu <span className="gradient-text">nivel MEO</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto">
          Desde explorar los fundamentos hasta dominar los 116 frameworks.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {PLANS.map((plan, i) => (
          <PricingCard key={plan.tier} plan={plan} index={i} onUpgrade={handleUpgrade} />
        ))}
      </div>
      <p className="text-center text-gray-400 text-sm mt-8">
        Cancela cuando quieras. Sin permanencia. Pago seguro con Stripe.
      </p>
    </div>
  );
}
