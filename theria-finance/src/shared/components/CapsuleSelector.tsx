import React from 'react';
import { motion } from 'motion/react';
import { cn } from './ui/utils';

export interface CapsuleOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  /** Accent used for the sliding pill when this option is active. */
  color?: string;
}

interface CapsuleSelectorProps<T extends string> {
  /** Unique per instance — namespaces the sliding-pill layout animation. */
  id: string;
  options: CapsuleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  /** Show only the option icons; labels become accessible names. */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Single horizontal capsule segmented control with a sliding colored pill.
 * The active option's label sits on the pill in white; inactive options stay muted.
 */
export function CapsuleSelector<T extends string>({
  id,
  options,
  value,
  onChange,
  size = 'md',
  iconOnly = false,
  className,
}: CapsuleSelectorProps<T>) {
  return (
    <div
      className={cn(
        'flex w-full rounded-full border border-border bg-muted/40 p-1 shadow-sm',
        className,
      )}
      role="tablist"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={option.label}
            title={iconOnly ? option.label : undefined}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative min-w-0 flex-1 select-none rounded-full font-semibold transition-colors',
              size === 'sm' ? 'h-8 px-1 text-[11px]' : 'h-10 px-2 text-xs',
              active ? 'text-white' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 rounded-full shadow-md"
                style={{ backgroundColor: option.color ?? 'var(--primary)' }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5 truncate px-1">
              {option.icon}
              {!iconOnly && <span className="truncate">{option.label}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
