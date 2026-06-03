import React from 'react';
import { motion } from 'motion/react';

export const SplashTitleBlock: React.FC = () => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
  >
    <h1 className="flex flex-col items-center">
      <span className="text-[2.85rem] font-bold leading-none tracking-[-0.045em] text-foreground sm:text-6xl">
        Theria
      </span>
      <motion.span
        className="mt-2.5 bg-gradient-to-r from-primary via-primary to-primary/65 bg-clip-text text-xl font-semibold tracking-[0.22em] uppercase text-transparent sm:mt-3 sm:text-2xl sm:tracking-[0.26em]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Finance
      </motion.span>
    </h1>
  </motion.div>
);
