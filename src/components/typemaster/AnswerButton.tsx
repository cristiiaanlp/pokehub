'use client';

import { motion } from 'framer-motion';
import { TypeBadge, TYPE_HEX } from '@/components/ui/TypeBadge';
import { CheckIcon, XIcon } from '@/components/ui/Icon';
import type { PokemonType } from '@/types/pokemon';
import { formatMultiplier } from '@/lib/typemaster/question-gen';
import { cn } from '@/lib/utils';

type OptionState = 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim';

interface Props {
  index: number;
  state: OptionState;
  disabled: boolean;
  onClick: () => void;
  data:
    | { kind: 'type'; type: PokemonType }
    | { kind: 'multiplier'; value: number };
}

export function AnswerButton({ index, state, disabled, onClick, data }: Props) {
  const isType = data.kind === 'type';
  const bg = isType ? TYPE_HEX(data.type) : '#3B82F6';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: state === 'idle' ? 0.97 : 1 }}
      animate={
        state === 'wrong'
          ? { x: [0, -8, 8, -6, 6, 0] }
          : state === 'correct'
          ? { scale: [1, 1.04, 1] }
          : {}
      }
      transition={{ duration: state === 'wrong' ? 0.4 : 0.35 }}
      className={cn(
        'group relative h-20 sm:h-24 rounded-2xl border-2 overflow-hidden flex items-center justify-center text-center font-display font-bold text-lg sm:text-xl transition-colors disabled:cursor-not-allowed select-none px-3',
        state === 'idle' && 'border-white/[0.08] glass hover:border-white/[0.20] hover:bg-white/[0.06]',
        state === 'correct' && 'border-accent-green bg-accent-green/15 text-ink shadow-[0_0_40px_-5px_rgba(16,185,129,0.6)]',
        state === 'wrong' && 'border-accent-red bg-accent-red/15 text-ink',
        state === 'reveal' && 'border-accent-green/60 bg-accent-green/10 text-ink',
        state === 'dim' && 'border-white/[0.05] glass opacity-30'
      )}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-30 group-disabled:opacity-0 transition-opacity"
        style={{
          background: `radial-gradient(circle at center, ${bg}40 0%, transparent 70%)`,
        }}
      />
      <div className="absolute top-2 left-2.5 text-[10px] font-mono font-bold text-ink-faint">
        {String.fromCharCode(65 + index)}
      </div>
      <div className="relative flex items-center gap-2">
        {isType ? (
          <span className="capitalize">{data.type}</span>
        ) : (
          <span>{formatMultiplier(data.value)}</span>
        )}
      </div>
      {state === 'correct' && (
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent-green text-white flex items-center justify-center"
        >
          <CheckIcon className="w-4 h-4" />
        </motion.div>
      )}
      {state === 'wrong' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent-red text-white flex items-center justify-center"
        >
          <XIcon className="w-4 h-4" />
        </motion.div>
      )}
      {state === 'reveal' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent-green/70 text-white flex items-center justify-center"
        >
          <CheckIcon className="w-4 h-4" />
        </motion.div>
      )}
    </motion.button>
  );
}
