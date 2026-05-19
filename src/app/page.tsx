import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { StatsShowcase } from '@/components/landing/StatsShowcase';
import { CTA } from '@/components/landing/CTA';
import { ChampionsBanner } from '@/components/landing/ChampionsBanner';
import { DailyPokemon } from '@/components/landing/DailyPokemon';
import { FeaturedTeamsStrip } from '@/components/landing/FeaturedTeamsStrip';

// 5min revalidate so featured changes appear without a full deploy.
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <Hero />
      <DailyPokemon />
      <ChampionsBanner />
      <FeaturedTeamsStrip />
      <Features />
      <StatsShowcase />
      <CTA />
    </>
  );
}
