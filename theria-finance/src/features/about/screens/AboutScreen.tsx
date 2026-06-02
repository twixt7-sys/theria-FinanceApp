import React from 'react';
import { Code2, Heart, Sparkles, Users } from 'lucide-react';
import { IconComponent } from '../../../shared/components/IconComponent';

const TEAM = [
  { name: 'Theria Core Team', role: 'Product & Design', initial: 'T' },
  { name: 'Engineering', role: 'Mobile & Frontend', initial: 'E' },
];

export const AboutScreen: React.FC = () => {
  return (
    <div className="space-y-5 pb-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-card to-card p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
            <IconComponent name="DollarSign" size={28} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">About</p>
            <h1 className="text-xl font-bold text-foreground">Theria Finance</h1>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              A personal finance companion built to make budgeting, tracking streams, and managing accounts feel calm, clear, and intentional.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles size={18} />
          </div>
          <h2 className="text-sm font-semibold text-foreground">The project</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Theria helps you organize money flows—records, budgets, savings goals, and categories—in one cohesive experience designed for everyday use.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Code2 size={18} />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Built with care</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            React, TypeScript, and motion-driven UI—crafted as a side project with attention to detail, accessibility, and a polished mobile-first layout.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Developers</h2>
        </div>
        <ul className="space-y-3">
          {TEAM.map((member) => (
            <li
              key={member.name}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-white shadow-md">
                {member.initial}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-medium text-foreground">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Heart size={12} className="shrink-0 text-pink-500" fill="currentColor" />
          Made with passion for smarter personal finance.
        </p>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Version 1.0 · Theria Finance App
      </p>
    </div>
  );
};
