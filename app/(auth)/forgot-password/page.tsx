"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No pudimos procesar la solicitud.");
        return;
      }
      setSent(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Revisa tu email</h2>
        <p className="text-gray-500 text-sm">
          Si <strong>{email}</strong> tiene una cuenta, te enviamos un enlace para crear una nueva contraseña. Vence en 1 hora.
        </p>
        <Link href="/login" className="inline-block mt-6 text-sm text-violet-600 font-medium hover:underline">Volver a iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Recuperar contraseña</h1>
      <p className="text-gray-500 text-sm mb-6">Te enviaremos un enlace para crear una nueva.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400" />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-meo text-white font-bold hover:opacity-90 disabled:opacity-50">
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-6">
        <Link href="/login" className="text-violet-600 font-medium hover:underline">Volver a iniciar sesión</Link>
      </p>
    </div>
  );
}
