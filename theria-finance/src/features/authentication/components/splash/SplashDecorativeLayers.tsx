import React from 'react';
import { motion } from 'motion/react';

export const SplashDecorativeLayers: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 90% 60% at 50% 0%, color-mix(in srgb, var(--primary) 8%, transparent), transparent 62%)',
      }}
    />

    <motion.div
      className="absolute -left-[18%] top-[12%] h-[min(72vw,20rem)] w-[min(72vw,20rem)] rounded-full blur-[88px]"
      style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 14%, transparent)' }}
      animate={{ x: [0, 24, 0], y: [0, 18, 0], scale: [1, 1.06, 1] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -right-[12%] bottom-[8%] h-[min(68vw,18rem)] w-[min(68vw,18rem)] rounded-full blur-[88px]"
      style={{ backgroundColor: 'hsl(199 89% 48% / 0.08)' }}
      animate={{ x: [0, -20, 0], y: [0, -14, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
    />

    <motion.div
      className="absolute left-1/2 top-1/2 h-[min(55vw,14rem)] w-[min(55vw,14rem)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[72px]"
      style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 6%, transparent)' }}
      animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.92, 1.08, 0.92] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
    />

    <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/35" />

    <div
      className="absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage: `
          linear-gradient(color-mix(in srgb, var(--foreground) 12%, transparent) 1px, transparent 1px),
          linear-gradient(90deg, color-mix(in srgb, var(--foreground) 12%, transparent) 1px, transparent 1px)
        `,
        backgroundSize: '36px 36px',
        maskImage: 'radial-gradient(ellipse 75% 65% at 50% 48%, black 15%, transparent 72%)',
      }}
    />
  </div>
);
