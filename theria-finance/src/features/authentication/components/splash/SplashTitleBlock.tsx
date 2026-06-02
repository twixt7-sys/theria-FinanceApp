import React from 'react';
import { motion } from 'motion/react';

export const SplashTitleBlock: React.FC = () => (
  <motion.div
    className="max-w-[min(100%,22rem)] text-center text-foreground sm:max-w-md"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.34em] text-primary/90 sm:text-[0.66rem] sm:tracking-[0.38em]">
      Theria Finance
    </p>
    <p className="text-xs text-muted-foreground">Smart money, clean decisions.</p>
    <div className="mx-auto mt-4 h-px w-14 bg-gradient-to-r from-transparent via-primary/45 to-transparent sm:w-16" />
  </motion.div>
);
