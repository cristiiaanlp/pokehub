'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface Props {
  duration: number; // seconds
  running: boolean;
  resetKey: any;
  onExpire?: () => void;
}

export function TimerBar({ duration, running, resetKey, onExpire }: Props) {
  const progress = useMotionValue(1);
  const widthPct = useTransform(progress, (v) => `${v * 100}%`);
  const expiredRef = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    progress.set(1);
    if (!running) return;
    const controls = animate(progress, 0, {
      duration,
      ease: 'linear',
      onComplete: () => {
        if (!expiredRef.current) {
          expiredRef.current = true;
          onExpire?.();
        }
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, running, duration]);

  const color = useTransform(progress, (v) => {
    if (v > 0.5) return '#10B981';
    if (v > 0.25) return '#FACC15';
    return '#EF4444';
  });

  return (
    <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ width: widthPct, backgroundColor: color }}
      />
    </div>
  );
}
