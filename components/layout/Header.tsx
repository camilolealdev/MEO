"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-2xl gradient-text">MEO</Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/curso" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Frameworks</Link>
          <Link href="/precios" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Precios</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Dashboard</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-gray-500 hover:text-gray-700">Salir</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Iniciar sesión</Link>
              <Link href="/register" className="px-4 py-2 rounded-lg bg-gradient-meo text-white text-sm font-bold hover:opacity-90">Comenzar gratis</Link>
            </>
          )}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
