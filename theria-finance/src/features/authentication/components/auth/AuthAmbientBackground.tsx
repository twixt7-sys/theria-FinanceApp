import React from 'react';

export const AuthAmbientBackground: React.FC = () => (
  <div className="pointer-events-none absolute inset-0" aria-hidden>
    <div className="absolute -left-24 -top-40 h-[22rem] w-[22rem] rounded-full bg-primary/12 blur-3xl dark:bg-primary/18" />
    <div className="absolute -bottom-48 -right-28 h-[26rem] w-[26rem] rounded-full bg-emerald-400/8 blur-3xl dark:bg-emerald-500/12" />
    <div className="absolute left-1/2 top-[12%] h-56 w-56 -translate-x-1/2 rounded-full bg-cyan-500/6 blur-3xl dark:bg-cyan-400/10" />
  </div>
);
