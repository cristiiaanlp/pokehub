import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { StatsShowcase } from '@/components/landing/StatsShowcase';
import { CTA } from '@/components/landing/CTA';
import { ChampionsBanner } from '@/components/landing/ChampionsBanner';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ChampionsBanner />
      <Features />
      <StatsShowcase />
      <CTA />
    </>
  );
}
