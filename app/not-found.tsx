import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <p className="font-display font-bold text-6xl gradient-text mb-2">404</p>
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Página no encontrada</h1>
      <p className="text-gray-500 mb-6 max-w-md">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg bg-gradient-meo text-white font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Volver al inicio →
      </Link>
    </div>
  );
}
