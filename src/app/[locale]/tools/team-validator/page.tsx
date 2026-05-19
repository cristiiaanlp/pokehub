import type { Metadata } from 'next';
import { TeamValidatorTool } from '@/components/tools/TeamValidatorTool';

export const metadata: Metadata = {
  title: 'Team Validator · PokéHub',
  description:
    'Comprueba si tu equipo es legal en VGC Reg G/H, Smogon OU/Ubers o Monotype. Detecta species clause, item clause, restricted, banlist y movesets incompletos.',
};

export default function TeamValidatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12">
      <header className="mb-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-brand-glow font-bold mb-1">
          Herramienta
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold">
          Team Validator
        </h1>
        <p className="text-sm text-ink-dim mt-2 max-w-2xl">
          Comprueba si tu equipo guardado es legal en el formato que vas a
          jugar. Detecta restringidos, banlist, species clause, item clause y
          movesets incompletos.
        </p>
      </header>
      <TeamValidatorTool />
    </div>
  );
}
