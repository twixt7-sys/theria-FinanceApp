import React from 'react';

/** Full-bleed depth, glow pools, and vignette — purely decorative. */
export const SplashDecorativeLayers: React.FC = () => (
  <>
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 80% at 50% -20%, var(--splash-radial-glow), transparent 55%)',
        }}
      />
      <div
        className="absolute -left-[20%] top-1/4 h-[min(90vw,28rem)] w-[min(90vw,28rem)] rounded-full blur-[100px]"
        style={{ backgroundColor: 'var(--splash-pool-emerald)' }}
      />
      <div
        className="absolute -right-[15%] bottom-[10%] h-[min(85vw,26rem)] w-[min(85vw,26rem)] rounded-full blur-[110px]"
        style={{ backgroundColor: 'var(--splash-pool-teal)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
    </div>

    <div
      className="pointer-events-none absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage: `
          linear-gradient(var(--splash-grid-line) 1px, transparent 1px),
          linear-gradient(90deg, var(--splash-grid-line) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, black 20%, transparent 75%)',
      }}
      aria-hidden
    />
  </>
);
