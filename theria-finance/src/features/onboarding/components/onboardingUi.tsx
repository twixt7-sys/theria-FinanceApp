import React from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, Eraser } from 'lucide-react';
import { IconComponent } from '../../../shared/components/IconComponent';

/** Step title block shown under Terry on every page. */
export const StepHeading: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-4">
    <motion.h1
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="text-lg font-bold text-foreground sm:text-xl"
    >
      {title}
    </motion.h1>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

export const SectionLabel: React.FC<{ children: React.ReactNode; count?: number }> = ({
  children,
  count,
}) => (
  <div className="mb-2 mt-5 flex items-center justify-between first:mt-0">
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{children}</p>
    {count !== undefined && (
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
        {count} selected
      </span>
    )}
  </div>
);

/** "Pick popular" / "Clear" quick actions above template grids. */
export const QuickSelectRow: React.FC<{
  onSelectPopular: () => void;
  onClear: () => void;
}> = ({ onSelectPopular, onClear }) => (
  <div className="mb-3 flex items-center gap-2">
    <button
      type="button"
      onClick={onSelectPopular}
      className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/15"
    >
      <Sparkles size={12} />
      Pick the popular ones
    </button>
    <button
      type="button"
      onClick={onClear}
      className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Eraser size={12} />
      Clear
    </button>
  </div>
);

/** Springy check badge shown in the corner of selected cards. */
export const SelectedBadge: React.FC<{ color: string }> = ({ color }) => (
  <motion.span
    initial={{ scale: 0, rotate: -90 }}
    animate={{ scale: 1, rotate: 0 }}
    exit={{ scale: 0 }}
    transition={{ type: 'spring', stiffness: 420, damping: 20 }}
    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-md"
    style={{ backgroundColor: color }}
  >
    <Check size={11} strokeWidth={3.5} />
  </motion.span>
);

interface TemplateToggleCardProps {
  name: string;
  iconName: string;
  color: string;
  selected: boolean;
  onToggle: () => void;
  subtitle?: string;
  children?: React.ReactNode;
}

/**
 * The core interactive element of setup: a tappable card that lights up in the
 * template's own color when selected. `children` renders below the label while
 * selected (used for the starting-balance input on accounts).
 */
export const TemplateToggleCard: React.FC<TemplateToggleCardProps> = ({
  name,
  iconName,
  color,
  selected,
  onToggle,
  subtitle,
  children,
}) => (
  <motion.div
    layout
    whileTap={{ scale: 0.96 }}
    className={`relative rounded-xl border transition-colors duration-200 ${
      selected ? 'bg-card shadow-sm' : 'border-border/70 bg-card/60 hover:bg-card'
    }`}
    style={selected ? { borderColor: `${color}66`, backgroundColor: `${color}0D` } : undefined}
  >
    {selected && <SelectedBadge color={color} />}
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors"
        style={{
          backgroundColor: selected ? `${color}26` : undefined,
          color: selected ? color : undefined,
        }}
      >
        <span className={selected ? '' : 'text-muted-foreground'}>
          <IconComponent name={iconName} size={18} />
        </span>
      </span>
      <span className="min-w-0">
        <span
          className={`block truncate text-xs font-semibold ${
            selected ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          {name}
        </span>
        {subtitle && (
          <span className="block truncate text-[10px] text-muted-foreground/80">{subtitle}</span>
        )}
      </span>
    </button>
    {selected && children && <div className="px-3 pb-2.5">{children}</div>}
  </motion.div>
);

interface ChoiceChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  iconName?: string;
}

/** Small pill used for survey answers and other single-word choices. */
export const ChoiceChip: React.FC<ChoiceChipProps> = ({ label, selected, onToggle, iconName }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.94 }}
    onClick={onToggle}
    aria-pressed={selected}
    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors sm:text-xs ${
      selected
        ? 'border-primary/50 bg-primary/12 text-primary'
        : 'border-border bg-card/70 text-muted-foreground hover:bg-card hover:text-foreground'
    }`}
  >
    {iconName && <IconComponent name={iconName} size={13} />}
    {label}
    {selected && (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 20 }}
      >
        <Check size={12} strokeWidth={3} />
      </motion.span>
    )}
  </motion.button>
);
