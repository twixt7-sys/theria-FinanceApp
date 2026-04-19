import React from 'react';
import { TrendingUp } from 'lucide-react';

export const AuthMobileBrand: React.FC = () => (
  <div className="mb-6 text-center lg:hidden">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 text-primary-foreground shadow-md ring-4 ring-primary/12">
      <TrendingUp size={24} strokeWidth={2} aria-hidden />
    </div>
    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-primary">Theria</p>
    <p className="mt-1 text-sm text-muted-foreground">Clarity for your finances</p>
  </div>
);
