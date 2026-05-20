'use client';

import { useState } from 'react';
import { QuickCoach } from './QuickCoach';
import { AiCoach } from './AiCoach';
import { BrainIcon, SparklesIcon } from '@/components/ui/Icon';

interface Props {
  aiEnabled: boolean;
}

type Tab = 'quick' | 'ai';

export function CoachTabs({ aiEnabled }: Props) {
  const [tab, setTab] = useState<Tab>('quick');

  return (
    <div className="space-y-5">
      {aiEnabled && (
        <div className="card-base p-1.5 flex items-center gap-1">
          <button
            onClick={() => setTab('quick')}
            className={`flex-1 h-10 px-3 rounded-md text-xs font-bold uppercase tracking-wide inline-flex items-center justify-center gap-1.5 ${
              tab === 'quick'
                ? 'bg-brand text-white shadow-glow'
                : 'text-ink-soft hover:text-ink hover:bg-white/[0.04]'
            }`}
          >
            <BrainIcon className="w-3.5 h-3.5" />
            Análisis instantáneo
          </button>
          <button
            onClick={() => setTab('ai')}
            className={`flex-1 h-10 px-3 rounded-md text-xs font-bold uppercase tracking-wide inline-flex items-center justify-center gap-1.5 ${
              tab === 'ai'
                ? 'bg-brand text-white shadow-glow'
                : 'text-ink-soft hover:text-ink hover:bg-white/[0.04]'
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            Pro · Claude
          </button>
        </div>
      )}

      {tab === 'quick' ? <QuickCoach /> : <AiCoach />}
    </div>
  );
}
