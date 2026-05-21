'use client';

import { useEffect } from 'react';
import { addRecent } from '@/lib/recent';

interface Props {
  id: number;
  name: string;
}

/**
 * Component invisible que se monta en una página de Pokémon y graba
 * la visita en localStorage para mostrar en "Vistos recientemente".
 */
export function RecentTracker({ id, name }: Props) {
  useEffect(() => {
    addRecent({ id, name });
  }, [id, name]);
  return null;
}
