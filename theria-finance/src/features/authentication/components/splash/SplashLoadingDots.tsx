import React from 'react';
import { motion } from 'motion/react';

const HEX_POINTS = '50,4 92,27 92,73 50,96 8,73 8,27';
const HEX_CLIP = 'polygon(25% 5%, 75% 5%, 95% 50%, 75% 95%, 25% 95%, 5% 50%)';

export const SplashLoadingDots: React.FC = () => (
  <motion.div
    className="mt-14 flex flex-col items-center sm:mt-16"
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.35, duration: 0.5 }}
    role="status"
    aria-label="Loading"
  >
    <div className="relative h-14 w-14 sm:h-16 sm:w-16">
      <motion.div
        className="absolute inset-[18%] bg-primary/10"
        style={{ clipPath: HEX_CLIP }}
        animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.94, 1, 0.94] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        aria-hidden
      />

      <svg
        viewBox="0 0 100 100"
        className="relative h-full w-full -rotate-90"
        aria-hidden
      >
        <polygon
          points={HEX_POINTS}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          opacity="0.45"
        />
        <motion.polygon
          points={HEX_POINTS}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeDasharray="48 210"
          animate={{ strokeDashoffset: [0, -258] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
        />
      </svg>

      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ clipPath: HEX_CLIP }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-transparent opacity-60" />
      </motion.div>
    </div>
  </motion.div>
);
