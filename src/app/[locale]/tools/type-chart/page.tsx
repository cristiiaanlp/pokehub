import type { Metadata } from 'next';
import { TypeChartTool } from '@/components/tools/TypeChartTool';

export const metadata: Metadata = {
  title: 'Tabla de tipos interactiva · PokéHub',
  description:
    'Tabla de efectividades de tipos Pokémon Gen 9 completa, interactiva con hover y filtros. Encuentra rápidamente qué tipo es supereficaz contra cuál.',
};

export default function TypeChartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Herramienta
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Tabla de tipos interactiva
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Pasa el ratón sobre cualquier celda para ver la multiplicación de
          daño. Click en un tipo para filtrar fila/columna. Datos de Gen 9
          actualizada (incluye Hada).
        </p>
      </header>
      <TypeChartTool />
    </div>
  );
}
