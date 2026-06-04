import React from 'react';

/** Fixed page backdrop driven by theme CSS variables. */
export const AppPageBackground: React.FC = () => (
  <div aria-hidden className="app-page-background pointer-events-none fixed inset-0 -z-10" />
);
