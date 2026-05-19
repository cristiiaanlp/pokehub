// Badge catalog — single source of truth shared by server + client.

export interface BadgeMeta {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tone: string;
}

export const BADGES: Record<string, BadgeMeta> = {
  pioneer: {
    id: 'pioneer',
    name: 'Pionero',
    description: 'Cuenta creada en los primeros días',
    emoji: '🚩',
    tone: 'bg-brand/15 text-brand-glow border-brand/30',
  },
  first_team: {
    id: 'first_team',
    name: 'Primer Equipo',
    description: 'Guardaste tu primer equipo',
    emoji: '⚔️',
    tone: 'bg-accent-green/15 text-accent-green border-accent-green/30',
  },
  team_published: {
    id: 'team_published',
    name: 'Compartido',
    description: 'Publicaste un equipo en /community',
    emoji: '🌍',
    tone: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/30',
  },
  team_featured: {
    id: 'team_featured',
    name: 'Destacado',
    description: 'Un admin destacó uno de tus equipos',
    emoji: '🏆',
    tone: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/30',
  },
  typemaster_silver: {
    id: 'typemaster_silver',
    name: 'TypeMaster · Plata',
    description: '500 puntos en TypeMaster',
    emoji: '🥈',
    tone: 'bg-white/10 text-ink border-white/20',
  },
  typemaster_gold: {
    id: 'typemaster_gold',
    name: 'TypeMaster · Oro',
    description: '1000 puntos en TypeMaster',
    emoji: '🥇',
    tone: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/30',
  },
  daily_quiz_streak_7: {
    id: 'daily_quiz_streak_7',
    name: 'Racha semanal',
    description: '7 días seguidos del Daily Meta Quiz',
    emoji: '🔥',
    tone: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  },
  favorite_collector: {
    id: 'favorite_collector',
    name: 'Coleccionista',
    description: '20 pokémon en favoritos',
    emoji: '❤️',
    tone: 'bg-accent-red/15 text-accent-red border-accent-red/30',
  },
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Mariposa social',
    description: 'Tu primer comentario en /community',
    emoji: '💬',
    tone: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  liked_10: {
    id: 'liked_10',
    name: 'Popular',
    description: 'Un equipo tuyo alcanzó 10 likes',
    emoji: '⭐',
    tone: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/30',
  },
};

export function badgeMeta(id: string): BadgeMeta | null {
  return BADGES[id] ?? null;
}
