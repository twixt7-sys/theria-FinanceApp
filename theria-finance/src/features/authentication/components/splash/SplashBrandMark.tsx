import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import type { SplashBrandLogo } from './types';

type SplashBrandMarkProps = {
  logo: SplashBrandLogo;
};

export const SplashBrandMark: React.FC<SplashBrandMarkProps> = ({ logo }) => {
  const hasCustomLogo = Boolean(logo.src?.trim());

  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="relative mb-9 sm:mb-11"
    >
      <motion.div
        className="absolute -inset-6 rounded-[2.25rem] bg-emerald-500/20 blur-2xl sm:-inset-8 sm:rounded-[2.75rem]"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.03, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center overflow-hidden rounded-[1.65rem] bg-zinc-950/80 shadow-[0_0_0_1px_rgba(16,185,129,0.12)_inset,0_24px_48px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:h-[7rem] sm:w-[7rem] sm:rounded-[2rem]">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.12] via-transparent to-transparent"
          aria-hidden
        />
        {hasCustomLogo ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            src={logo.src}
            alt={logo.alt}
            className="relative z-[1] h-[62%] w-[62%] object-contain drop-shadow-[0_0_20px_rgba(52,211,153,0.35)]"
            draggable={false}
            decoding="async"
          />
        ) : (
          <motion.div
            className="relative z-[1] flex items-center justify-center"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <TrendingUp
              className="text-emerald-400 drop-shadow-[0_0_28px_rgba(52,211,153,0.45)]"
              size={60}
              strokeWidth={1.65}
              aria-hidden
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
