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
      className="relative mb-6 sm:mb-7"
    >
      <motion.div
        className="absolute -inset-5 rounded-[1.8rem] bg-primary/20 blur-2xl sm:-inset-6 sm:rounded-[2.1rem]"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.03, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative flex h-[4.8rem] w-[4.8rem] items-center justify-center overflow-hidden rounded-[1.4rem] bg-primary text-primary-foreground shadow-[0_10px_28px_-12px_rgba(59,130,246,0.45)] sm:h-[5.6rem] sm:w-[5.6rem] sm:rounded-[1.6rem]">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/18 via-transparent to-transparent"
          aria-hidden
        />
        {hasCustomLogo ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            src={logo.src}
            alt={logo.alt}
            className="relative z-[1] h-[62%] w-[62%] object-contain drop-shadow-[0_0_14px_rgba(255,255,255,0.28)]"
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
              className="text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.30)]"
              size={48}
              strokeWidth={1.65}
              aria-hidden
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
