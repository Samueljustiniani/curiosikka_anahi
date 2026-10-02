export default function PanelLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="h-10 w-56 rounded-2xl bg-ink/8" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-[1.5rem]" />
        ))}
      </div>
      <div className="skeleton h-80 rounded-[1.5rem]" />
    </div>
  );
}
