"use client";
import { useState } from "react";

export default function CuentaPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirm) {
      setMessage({ ok: false, text: "Las contraseñas nuevas no coinciden." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? "No pudimos cambiar la contraseña." });
        return;
      }
      setMessage({ ok: true, text: "Contraseña actualizada." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setMessage({ ok: false, text: "Error de conexión. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400";

  return (
    <div className="p-8 max-w-md">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Mi cuenta</h1>
      <p className="text-gray-500 text-sm mb-6">
        Cambia tu contraseña. Si entras con Google o enlace mágico y aún no tienes una, deja vacía la actual.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Contraseña actual" className={input} />
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nueva contraseña (mín. 8)" minLength={8} required className={input} />
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repite la nueva contraseña" minLength={8} required className={input} />
        {message && <p className={`text-xs ${message.ok ? "text-green-600" : "text-red-500"}`}>{message.text}</p>}
        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-meo text-white font-bold hover:opacity-90 disabled:opacity-50">
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
