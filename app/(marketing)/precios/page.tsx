"use client";
import { useState } from "react";
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
      "117 frameworks completos",
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

type Provider = "stripe" | "mercadopago" | "paypal";

const PROVIDERS: { id: Provider; label: string; icon: string }[] = [
  { id: "stripe", label: "Stripe", icon: "💳" },
  { id: "mercadopago", label: "MercadoPago", icon: "🏦" },
  { id: "paypal", label: "PayPal", icon: "🅿" },
];

export default function PreciosPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider>("stripe");
  const [loading, setLoading] = useState(false);

  async function handleUpgrade(priceId: string) {
    if (!session) { router.push("/register?redirect=/precios"); return; }
    if (loading) return;

    setLoading(true);
    try {
      let endpoint = "";
      let body: Record<string, string> = {};

      // Determine tier from priceId by matching against PLANS
      const plan = PLANS.find((p) => p.priceId === priceId);
      const tier = plan?.tier ?? "pro";

      if (provider === "stripe") {
        endpoint = "/api/stripe/checkout";
        body = { priceId };
      } else if (provider === "mercadopago") {
        endpoint = "/api/mercadopago/checkout";
        body = { tier };
      } else {
        endpoint = "/api/paypal/checkout";
        body = { tier };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-5xl text-gray-900 mb-4">
          Elige tu <span className="gradient-text">nivel MEO</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto">
          Desde explorar los fundamentos hasta dominar los 117 frameworks.
        </p>
      </div>

      {/* Payment method selector */}
      <div className="flex justify-center gap-3 mb-12">
        <p className="text-sm text-gray-500 self-center mr-2">Pagar con:</p>
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              provider === p.id
                ? "bg-violet-600 text-white border-violet-600 shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-violet-300"
            }`}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {PLANS.map((plan, i) => (
          <PricingCard
            key={plan.tier}
            plan={plan}
            index={i}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>

      <p className="text-center text-gray-400 text-sm mt-8">
        Cancela cuando quieras. Sin permanencia.{" "}
        Pago seguro con{" "}
        {provider === "stripe"
          ? "Stripe"
          : provider === "mercadopago"
          ? "MercadoPago"
          : "PayPal"}
        .
      </p>
    </div>
  );
}
