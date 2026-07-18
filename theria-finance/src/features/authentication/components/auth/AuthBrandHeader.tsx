import React from 'react';
import { motion } from 'motion/react';
import { BuddyFace } from '../../../../shared/components/FinanceBuddy';
import { BRAND_SLOGAN, TheriaLogoMark } from '../../../../shared/components/TheriaBrandLogo';

/**
 * Brand hero for the auth screen. Uses the clean, gradient-free logomark — the
 * same treatment as the app icon — sized up so the logo is the anchor of the
 * page now that the headline copy is gone.
 */
export const AuthBrandHeader: React.FC = () => (
  <motion.div
    className="mb-9 flex flex-col items-center text-center"
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <TheriaLogoMark variant="flat" className="relative h-20 w-auto sm:h-24" />
    </div>

    <div className="mt-4 flex items-baseline gap-1.5">
      <span className="text-xl font-bold leading-none tracking-tight text-foreground sm:text-2xl">
        Theria
      </span>
      <span className="text-xl font-semibold leading-none tracking-tight text-primary sm:text-2xl">
        Finance
      </span>
    </div>

    <div className="mt-3 flex items-center gap-2">
      <motion.div
        className="h-8 w-8 shrink-0"
        animate={{ y: [0, -3, 0], rotate: [0, -3, 0, 3, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <BuddyFace mood="happy" />
      </motion.div>
      <p className="text-[13px] leading-snug text-muted-foreground">{BRAND_SLOGAN}</p>
    </div>
  </motion.div>
);
