"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No pudimos cambiar la contraseña.");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500 text-sm">El enlace no es válido.</p>
        <Link href="/forgot-password" className="inline-block mt-4 text-sm text-violet-600 font-medium hover:underline">Solicitar uno nuevo</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Contraseña actualizada</h2>
        <Link href="/login" className="inline-block mt-4 text-sm text-violet-600 font-medium hover:underline">Iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">Nueva contraseña</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nueva contraseña (mín. 8)" minLength={8} required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400" />
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" minLength={8} required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400" />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-meo text-white font-bold hover:opacity-90 disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
