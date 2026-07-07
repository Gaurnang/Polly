export function Spinner({ size = "md", className = "" }) {
  const s = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div className={`${s} ${className} border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin`} />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08080f]">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    </div>
  );
}
