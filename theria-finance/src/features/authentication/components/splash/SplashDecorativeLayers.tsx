import React from 'react';

/** Full-bleed depth, glow pools, and vignette — purely decorative. */
export const SplashDecorativeLayers: React.FC = () => (
  <>
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 110% 75% at 50% -15%, rgba(34,197,94,0.12), transparent 58%)',
        }}
      />
      <div
        className="absolute -left-[20%] top-1/4 h-[min(90vw,24rem)] w-[min(90vw,24rem)] rounded-full blur-[95px]"
        style={{ backgroundColor: 'rgba(34,197,94,0.10)' }}
      />
      <div
        className="absolute -right-[15%] bottom-[10%] h-[min(85vw,22rem)] w-[min(85vw,22rem)] rounded-full blur-[95px]"
        style={{ backgroundColor: 'rgba(14,165,233,0.08)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/30" />
    </div>

    <div
      className="pointer-events-none absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(148,163,184,0.18) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148,163,184,0.18) 1px, transparent 1px)
        `,
        backgroundSize: '42px 42px',
        maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, black 20%, transparent 75%)',
      }}
      aria-hidden
    />
  </>
);
