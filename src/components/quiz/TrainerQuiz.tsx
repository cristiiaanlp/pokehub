'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TRAINER_QUIZ, computeTrainerResult } from '@/lib/trainer-quiz';
import { ArrowRight, SparklesIcon } from '@/components/ui/Icon';

export function TrainerQuiz() {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const pick = (optIdx: number) => {
    const newAnswers = [...answers, optIdx];
    setAnswers(newAnswers);
    if (currentIdx === TRAINER_QUIZ.length - 1) {
      // último — calcula y redirige a /quiz/trainer-type/[arch]
      const arch = computeTrainerResult(newAnswers);
      router.push(`/quiz/trainer-type/${arch}`);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const back = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const currentQ = TRAINER_QUIZ[currentIdx];
  const progress = ((currentIdx + 1) / TRAINER_QUIZ.length) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-widest text-brand-glow">
          Pregunta {currentIdx + 1} / {TRAINER_QUIZ.length}
        </span>
        {currentIdx > 0 && (
          <button onClick={back} className="text-ink-faint hover:text-ink">
            ← Anterior
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand to-brand-glow"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="card-base p-6 space-y-4 relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
          <div className="relative space-y-5">
            <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug">
              {currentQ.q}
            </h2>
            <div className="space-y-2">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  className="w-full text-left p-4 rounded-xl glass hover:bg-white/[0.08] hover:ring-2 hover:ring-brand/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center font-mono text-xs font-bold shrink-0 group-hover:bg-brand group-hover:text-white transition-colors">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-sm font-medium flex-1">{opt.text}</span>
                    <ArrowRight className="w-4 h-4 text-ink-faint group-hover:text-brand-glow group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="text-[10px] text-ink-faint text-center inline-flex items-center gap-1 justify-center w-full">
        <SparklesIcon className="w-3 h-3" />
        Sin login, sin datos guardados — solo diversión
      </p>
    </div>
  );
}
