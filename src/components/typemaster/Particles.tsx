'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Props {
  trigger: any; // change this prop to retrigger
  color?: string;
  count?: number;
  size?: number;
}

export function Particles({
  trigger,
  color = '#10B981',
  count = 14,
  size = 6,
}: Props) {
  const seeds = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const dist = 70 + Math.random() * 50;
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        delay: Math.random() * 0.04,
        rotate: Math.random() * 360,
        scale: 0.6 + Math.random() * 0.7,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, count]);

  return (
    <div
      key={String(trigger)}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {seeds.map((s, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: s.x,
            y: s.y,
            scale: s.scale,
            opacity: 0,
            rotate: s.rotate,
          }}
          transition={{
            duration: 0.7,
            delay: s.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute rounded-sm"
          style={{
            width: size,
            height: size,
            background: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      ))}
    </div>
  );
}
