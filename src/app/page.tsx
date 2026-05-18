import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { StatsShowcase } from '@/components/landing/StatsShowcase';
import { CTA } from '@/components/landing/CTA';
import { ChampionsBanner } from '@/components/landing/ChampionsBanner';
import { DailyPokemon } from '@/components/landing/DailyPokemon';

export default function HomePage() {
  return (
    <>
      <Hero />
      <DailyPokemon />
      <ChampionsBanner />
      <Features />
      <StatsShowcase />
      <CTA />
    </>
  );
}
