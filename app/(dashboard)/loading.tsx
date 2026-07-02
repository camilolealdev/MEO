export default function DashboardLoading() {
  return (
    <div className="p-8 max-w-5xl animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-40 bg-gray-100 rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-white rounded-xl border border-gray-100" />
        ))}
      </div>
    </div>
  );
}
