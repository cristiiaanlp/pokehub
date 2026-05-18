import {
  GridIcon,
  UsersIcon,
  TrendingUpIcon,
  SparklesIcon,
  HeartIcon,
  HomeIcon,
  GamepadIcon,
} from '@/components/ui/Icon';
import type { ComponentType, SVGProps } from 'react';

export interface NavItem {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
}

export const NAV_LINKS: NavItem[] = [
  { href: '/', label: 'Inicio', Icon: HomeIcon },
  { href: '/pokedex', label: 'Pokédex', Icon: GridIcon },
  { href: '/typemaster', label: 'TypeMaster', Icon: GamepadIcon, badge: 'NEW' },
  { href: '/team-builder', label: 'Team Builder', Icon: UsersIcon },
  { href: '/meta', label: 'Meta Hub', Icon: TrendingUpIcon },
  { href: '/casual', label: 'Casual', Icon: SparklesIcon },
  { href: '/favorites', label: 'Favoritos', Icon: HeartIcon },
];
