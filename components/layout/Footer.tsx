import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 py-12 mt-20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-display font-bold text-xl gradient-text">MEO</span>
        <p className="text-sm text-gray-400">© {new Date().getFullYear()} Marketing Engine Optimization. Todos los derechos reservados.</p>
        <div className="flex gap-6 text-sm text-gray-500">
          <Link href="/precios" className="hover:text-gray-900">Precios</Link>
          <Link href="/curso" className="hover:text-gray-900">Frameworks</Link>
          <Link href="/login" className="hover:text-gray-900">Acceder</Link>
        </div>
      </div>
      <p className="max-w-6xl mx-auto px-6 mt-6 text-xs text-gray-400 text-center">
        Los nombres de modelos, marcas y herramientas citados pertenecen a sus respectivos titulares; MEO no tiene afiliación con ellos. Contenido educativo, no asesoría legal ni financiera. Las cifras de terceros pueden no estar verificadas.
      </p>
    </footer>
  );
}
