import React from 'react';
import { motion } from 'motion/react';
import { BRAND_SLOGAN, TheriaLogoMark } from '../../../../shared/components/TheriaBrandLogo';

/**
 * Brand hero for the auth screen. Uses the clean, gradient-free logomark — the
 * same treatment as the app icon — sized up so the logo is the anchor of the
 * page now that the headline copy is gone.
 */
export const AuthBrandHeader: React.FC = () => (
  <motion.div
    className="mb-7 flex flex-col items-center text-center"
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
      />
      <TheriaLogoMark variant="flat" className="relative h-16 w-auto sm:h-[4.5rem]" />
    </div>

    <div className="mt-3.5 flex items-baseline gap-1.5">
      <span className="text-xl font-bold leading-none tracking-tight text-foreground sm:text-2xl">
        Theria
      </span>
      <span className="text-xl font-semibold leading-none tracking-tight text-primary sm:text-2xl">
        Finance
      </span>
    </div>

    <p className="mt-2.5 text-[13px] leading-snug text-muted-foreground">{BRAND_SLOGAN}</p>
  </motion.div>
);
