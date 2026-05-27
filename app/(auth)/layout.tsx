export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="font-display font-bold text-3xl gradient-text">MEO</span>
        </div>
        {children}
      </div>
    </div>
  );
}
