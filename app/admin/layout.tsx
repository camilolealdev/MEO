import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") redirect("/dashboard");
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
