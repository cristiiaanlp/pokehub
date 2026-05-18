export default function GlobalLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-brand/15 items-center justify-center mb-3">
          <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
        <div className="text-sm text-ink-dim">Cargando PokéHub…</div>
      </div>
    </div>
  );
}
