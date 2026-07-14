import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from './ui/utils';

interface PickerRowProps {
  icon: React.ReactNode;
  label: string;
  /** Current selection — when empty the placeholder is shown muted. */
  value?: string;
  placeholder?: string;
  /** Accent hex applied to the icon chip and border once a value is set. */
  color?: string;
  onClick: () => void;
  /** Replaces the default chevron (e.g. a toggle switch or clear button). */
  trailing?: React.ReactNode;
  className?: string;
}

/**
 * Tappable settings-style row: icon chip, label over value, chevron.
 * Used across the add modals so every field reads the same way.
 */
export const PickerRow: React.FC<PickerRowProps> = ({
  icon,
  label,
  value,
  placeholder = 'Choose',
  color,
  onClick,
  trailing,
  className,
}) => {
  const filled = Boolean(value);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-left shadow-sm transition-colors hover:bg-muted',
        className,
      )}
      style={
        filled && color
          ? { borderColor: `${color}55`, backgroundColor: `${color}0D` }
          : undefined
      }
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        style={filled && color ? { backgroundColor: `${color}20`, color } : undefined}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            'truncate text-sm',
            filled ? 'font-semibold text-foreground' : 'text-muted-foreground/60',
          )}
        >
          {value || placeholder}
        </span>
      </span>
      {trailing ?? <ChevronRight size={16} className="shrink-0 text-muted-foreground/50" />}
    </button>
  );
};

/**
 * Vertical bento cell version of PickerRow: icon chip on top, label, value.
 * Meant for half-width cells inside a 2-column bento grid.
 */
export const PickerTile: React.FC<PickerRowProps> = ({
  icon,
  label,
  value,
  placeholder = 'Choose',
  color,
  onClick,
  trailing,
  className,
}) => {
  const filled = Boolean(value);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-full min-h-[5.75rem] w-full flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-2 py-2.5 text-center shadow-sm transition-colors hover:bg-muted',
        className,
      )}
      style={
        filled && color
          ? { borderColor: `${color}55`, backgroundColor: `${color}0D` }
          : undefined
      }
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        style={filled && color ? { backgroundColor: `${color}20`, color } : undefined}
      >
        {icon}
      </span>
      <span className="mt-0.5 text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'w-full truncate text-xs leading-tight',
          filled ? 'font-semibold text-foreground' : 'text-muted-foreground/60',
        )}
      >
        {value || placeholder}
      </span>
      {trailing && <span className="mt-1 flex items-center justify-center">{trailing}</span>}
    </button>
  );
};
