import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';

/**
 * Splash brand mark — replace with your asset (e.g. put `logo.svg` in `public/` and set `src: '/logo.svg'`).
 * Leave `src` empty to use the built-in green mark below.
 */
export const SPLASH_BRAND_LOGO: { src: string; alt: string } = {
  src: '',
  alt: 'Theria: Finance',
};

export const SplashScreen: React.FC = () => {
  const hasCustomLogo = Boolean(SPLASH_BRAND_LOGO.src?.trim());

  return (
    <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-[#050807] text-white">
      {/* Depth: soft emerald pools + cool neutral */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(16,185,129,0.18),transparent_55%)]" />
        <div className="absolute -left-[20%] top-1/4 h-[min(90vw,28rem)] w-[min(90vw,28rem)] rounded-full bg-emerald-500/[0.07] blur-[100px]" />
        <div className="absolute -right-[15%] bottom-[10%] h-[min(85vw,26rem)] w-[min(85vw,26rem)] rounded-full bg-teal-600/[0.06] blur-[110px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* Hairline grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, black 20%, transparent 75%)',
        }}
        aria-hidden
      />

      <div
        className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 sm:px-10"
        style={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
          paddingLeft: 'max(1.25rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(1.25rem, env(safe-area-inset-right, 0px))',
        }}
      >
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
                src={SPLASH_BRAND_LOGO.src}
                alt={SPLASH_BRAND_LOGO.alt}
                className="relative z-[1] h-[62%] w-[62%] object-contain drop-shadow-[0_0_20px_rgba(52,211,153,0.35)]"
                draggable={false}
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
        <motion.div
          className="max-w-[min(100%,22rem)] text-center sm:max-w-md"
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

        <motion.div
          className="mt-12 flex flex-col items-center gap-3 sm:mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          aria-hidden
        >
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1 w-1 rounded-full bg-emerald-400/90 shadow-[0_0_10px_rgba(52,211,153,0.65)]"
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
      </div>
    </div>
  );
};
