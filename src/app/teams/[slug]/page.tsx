'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { TeamCard } from '@/components/meta/TeamCard';
import { TeamSocial } from '@/components/teams/TeamSocial';
import { fetchPublicTeamBySlug } from '@/lib/sync/cloud';
import type { SavedTeam } from '@/stores/teamStore';
import type { SampleTeam, SampleTeamMember } from '@/lib/champions/data';
import { artworkFor } from '@/lib/pokeapi';
import { useTeamStore } from '@/stores/teamStore';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight,
  TrophyIcon,
  SaveIcon,
  CheckIcon,
} from '@/components/ui/Icon';

function savedToSample(t: SavedTeam): SampleTeam {
  const members: SampleTeamMember[] = t.members.map((m) => ({
    name: m.name,
    speciesId: m.pokemonId,
    item: m.item,
    ability: m.ability,
    nature: m.nature,
    teraType: undefined,
    moves: m.moves ?? [],
  }));
  return {
    id: t.id,
    name: t.name,
    author: 'Trainer',
    tournament: 'Equipo compartido',
    format: 'gen9ou',
    game: 'sv',
    date: new Date(t.updatedAt).toLocaleDateString(),
    archetype: 'Custom',
    description: undefined,
    members,
  };
}

export default function PublicTeamPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [team, setTeam] = useState<SavedTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [imported, setImported] = useState(false);
  const setSaved = useTeamStore((s) => s.setSaved);
  const saved = useTeamStore((s) => s.saved);

  useEffect(() => {
    fetchPublicTeamBySlug(slug).then((t) => {
      setTeam(t);
      setLoading(false);
    });
  }, [slug]);

  const importToMyTeams = () => {
    if (!team) return;
    if (saved.some((s) => s.id === team.id)) {
      setImported(true);
      return;
    }
    const copy: SavedTeam = {
      ...team,
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: `${team.name} (importado)`,
      isPublic: false,
      shareSlug: undefined,
      updatedAt: Date.now(),
      createdAt: Date.now(),
    };
    setSaved([copy, ...saved]);
    setImported(true);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-ink-dim">
        Cargando equipo…
      </div>
    );
  }

  if (!team) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="card-base p-10 text-center">
          <div className="text-5xl mb-3">🤷</div>
          <h1 className="font-display text-2xl font-bold">Equipo no encontrado</h1>
          <p className="text-ink-dim mt-2">
            El enlace puede estar caducado o el equipo ha dejado de ser
            público.
          </p>
          <Link href="/team-builder" className="inline-block mt-6">
            <Button variant="primary" size="md">
              Crear mi propio equipo
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 lg:py-12 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base p-6 relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-brand-glow font-semibold mb-2">
            <TrophyIcon className="w-3.5 h-3.5" />
            Equipo compartido
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {team.name}
          </h1>
          <p className="text-ink-dim mt-2 text-sm">
            6 Pokémon · actualizado {new Date(team.updatedAt).toLocaleDateString()}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant={imported ? 'secondary' : 'primary'}
              size="md"
              onClick={importToMyTeams}
            >
              {imported ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Añadido a mis equipos
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4" />
                  Importar a mis equipos
                </>
              )}
            </Button>
            <Link href="/team-builder">
              <Button variant="ghost" size="md">
                Ir al Team Builder
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <TeamCard team={savedToSample(team)} expanded />

      <TeamSocial teamId={team.id} />

      <div className="text-center text-xs text-ink-faint pt-4">
        ¿Quieres compartir el tuyo? Crea un equipo en{' '}
        <Link href="/team-builder" className="text-brand-glow hover:text-brand-hover">
          Team Builder
        </Link>{' '}
        y dale al botón compartir.
      </div>
    </div>
  );
}
