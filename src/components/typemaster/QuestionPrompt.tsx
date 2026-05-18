'use client';

import { motion } from 'framer-motion';
import { TypeBadge, TYPE_HEX } from '@/components/ui/TypeBadge';
import type { QuizQuestion } from '@/lib/typemaster/question-gen';

const KIND_LABEL: Record<QuizQuestion['kind'], string> = {
  'super-effective-against': 'SUPER-EFICAZ',
  resists: 'RESISTE',
  'immune-to': 'INMUNE',
  'multiplier-exact': 'MULTIPLICADOR',
};

const KIND_TONE: Record<QuizQuestion['kind'], string> = {
  'super-effective-against': 'text-accent-red bg-accent-red/15',
  resists: 'text-accent-green bg-accent-green/15',
  'immune-to': 'text-ink bg-white/10',
  'multiplier-exact': 'text-accent-yellow bg-accent-yellow/15',
};

export function QuestionPrompt({
  question,
  questionIndex,
}: {
  question: QuizQuestion;
  questionIndex: number;
}) {
  const def = question.display.defenderTypes;
  const atk = question.display.attackerType;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="text-center space-y-4"
    >
      <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.25em] font-semibold">
        <span className={`px-2 py-1 rounded-md ${KIND_TONE[question.kind]}`}>
          {KIND_LABEL[question.kind]}
        </span>
        <span className="text-ink-faint">Pregunta #{questionIndex + 1}</span>
      </div>

      <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight max-w-3xl mx-auto px-2">
        {question.prompt}
      </h2>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {atk && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-ink-faint">
              Atacante
            </span>
            <TypeBadge type={atk} size="md" />
          </div>
        )}
        {def && def.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-ink-faint">
              Defensor
            </span>
            <div className="flex gap-1">
              {def.map((t) => (
                <TypeBadge key={t} type={t} size="md" />
              ))}
            </div>
          </div>
        )}
      </div>

      {question.hint && (
        <div className="text-xs text-ink-faint">{question.hint}</div>
      )}
    </motion.div>
  );
}
