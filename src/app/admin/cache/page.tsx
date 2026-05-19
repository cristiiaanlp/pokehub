import { CachePanel } from '@/components/admin/CachePanel';

export const dynamic = 'force-dynamic';

export default function AdminCachePage() {
  return (
    <div className="space-y-5">
      <div className="card-base p-5">
        <h2 className="font-display text-lg font-bold mb-1">
          Control de caché
        </h2>
        <p className="text-sm text-ink-dim leading-relaxed">
          Las rutas dinámicas se sirven con caché de 24h por defecto. Si
          quieres forzar que la próxima visita re-fetche los datos en vivo
          (útil cuando Pikalytics o Smogon publican algo nuevo y no quieres
          esperar al refresh automático), pulsa el botón correspondiente.
        </p>
      </div>
      <CachePanel />
    </div>
  );
}
