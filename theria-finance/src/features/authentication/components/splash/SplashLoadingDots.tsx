import React from 'react';
import { motion } from 'motion/react';

const DOT_INDICES = [0, 1, 2] as const;

export const SplashLoadingDots: React.FC = () => (
  <motion.div
    className="mt-8 flex flex-col items-center gap-3 sm:mt-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5, duration: 0.45 }}
    aria-hidden
  >
    <div className="flex items-center gap-1.5">
      {DOT_INDICES.map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary/85 shadow-[0_0_10px_rgba(59,130,246,0.35)]"
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1, 0.85] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.18,
          }}
        />
      ))}
    </div>
  </motion.div>
);
