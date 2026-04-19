import React from 'react';
import { motion } from 'motion/react';

export const SplashTitleBlock: React.FC = () => (
  <motion.div
    className="max-w-[min(100%,22rem)] text-center text-splash-foreground sm:max-w-md"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    <p className="mb-2 text-[0.62rem] font-medium uppercase tracking-[0.38em] text-emerald-400/90 sm:text-[0.68rem] sm:tracking-[0.42em]">
      Theria:
      <br />
      Finance
    </p>
    <div className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent sm:mt-5 sm:w-14" />
  </motion.div>
);
