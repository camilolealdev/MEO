"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, BookOpen, TrendingUp, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/mi-ruta", icon: BookOpen, label: "Mi Ruta" },
  { href: "/progreso", icon: TrendingUp, label: "Progreso" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 border-r border-gray-100 flex flex-col bg-white">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="font-display font-bold text-2xl gradient-text">MEO</Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                active ? "bg-violet-50 text-violet-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")}>
              <Icon className="w-4 h-4" />{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-meo flex items-center justify-center text-white text-xs font-bold">
            {session?.user?.name?.[0] ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name ?? "Usuario"}</p>
            <p className="text-xs text-gray-400 capitalize">{(session?.user as any)?.tier ?? "free"}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 px-4 py-2 w-full text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50">
          <LogOut className="w-4 h-4" />Salir
        </button>
      </div>
    </aside>
  );
}
