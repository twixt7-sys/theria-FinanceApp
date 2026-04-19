import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

const PILL_LABELS = ['Accounts', 'Budgets', 'Savings', 'Insights'] as const;

export const AuthMarketingAside: React.FC = () => (
  <motion.section
    className="mb-8 hidden max-w-md flex-col justify-center lg:mb-0 lg:flex lg:pr-4"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/50 bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
      <ShieldCheck className="shrink-0 text-primary" size={14} aria-hidden />
      Private by default · demo-friendly
    </div>
    <h2 className="mt-6 text-4xl font-semibold leading-[1.15] tracking-tight text-foreground lg:text-[2.75rem]">
      Money, organized the way you think.
    </h2>
    <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
      Theria connects accounts, streams, and goals so you always know where you stand.
    </p>
    <div className="mt-6 flex flex-wrap gap-2">
      {PILL_LABELS.map((label) => (
        <span
          key={label}
          className="rounded-full border border-border/60 bg-muted/35 px-3 py-1 text-xs font-medium text-foreground/85"
        >
          {label}
        </span>
      ))}
    </div>
  </motion.section>
);
