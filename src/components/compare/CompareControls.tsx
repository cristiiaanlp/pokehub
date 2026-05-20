'use client';

import { useState } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { PokemonSelectModal } from '@/components/common/PokemonSelectModal';
import { artworkFor } from '@/lib/pokeapi';
import { PlusIcon, XIcon } from '@/components/ui/Icon';

const MAX = 6;

export function CompareControls({ currentIds }: { currentIds: number[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pickerOpen, setPickerOpen] = useState(false);

  const updateUrl = (ids: number[]) => {
    if (ids.length === 0) {
      router.push(pathname);
    } else {
      router.push(`${pathname}?ids=${ids.join(',')}`);
    }
  };

  const add = (id: number) => {
    if (currentIds.includes(id)) return;
    if (currentIds.length >= MAX) return;
    updateUrl([...currentIds, id]);
  };

  const remove = (id: number) => {
    updateUrl(currentIds.filter((x) => x !== id));
  };

  const clear = () => updateUrl([]);

  return (
    <>
      <div className="card-base p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-sm">
            Pokémon en la comparativa
            <span className="text-ink-faint font-mono text-xs ml-2">
              {currentIds.length}/{MAX}
            </span>
          </h2>
          {currentIds.length > 0 && (
            <button
              onClick={clear}
              className="text-xs text-ink-faint hover:text-accent-red"
            >
              Vaciar
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {currentIds.map((id) => (
            <div
              key={id}
              className="card-base p-2 text-center relative group"
            >
              <button
                onClick={() => remove(id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-accent-red/15 text-accent-red opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center"
                aria-label="Quitar"
              >
                <XIcon className="w-3 h-3" />
              </button>
              <img
                src={artworkFor(id)}
                alt={`#${id}`}
                className="w-14 h-14 mx-auto object-contain"
              />
              <div className="text-[10px] font-mono text-ink-faint mt-0.5">
                #{String(id).padStart(4, '0')}
              </div>
            </div>
          ))}
          {currentIds.length < MAX && (
            <button
              onClick={() => setPickerOpen(true)}
              className="card-base card-hover p-2 text-center border-dashed border-2 border-white/[0.08] hover:border-brand/30 flex flex-col items-center justify-center gap-1 min-h-[88px]"
            >
              <PlusIcon className="w-5 h-5 text-brand-glow" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">
                Añadir
              </span>
            </button>
          )}
        </div>
        {currentIds.length === 0 && (
          <p className="text-xs text-ink-dim mt-3 text-center">
            Añade entre 2 y 6 Pokémon para comparar sus stats y tipos.
          </p>
        )}
      </div>

      <PokemonSelectModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(p) => {
          add(p.id);
          setPickerOpen(false);
        }}
        title="Añadir Pokémon a la comparativa"
      />
    </>
  );
}
