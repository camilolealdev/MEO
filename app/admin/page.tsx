export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display font-bold text-3xl text-gray-900 mb-8">Panel Admin</h1>
      <div className="grid grid-cols-3 gap-4">
        {["Usuarios", "Métricas", "Contenido"].map(label => (
          <div key={label} className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-display font-bold text-xl text-gray-900">{label}</h3>
            <p className="text-gray-500 text-sm mt-1">Gestión de {label.toLowerCase()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
