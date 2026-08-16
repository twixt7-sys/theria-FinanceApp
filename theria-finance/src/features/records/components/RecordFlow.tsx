import React from 'react';
import { ArrowLeft, ArrowLeftRight, ArrowRight, Target, Wallet } from '@/shared/icons';
import { AnimatePresence, motion } from 'motion/react';
import { IconComponent } from '../../../shared/components/IconComponent';
import { cn } from '../../../shared/components/ui/utils';

export type RecordType = 'income' | 'expense' | 'transfer';

export interface FlowNodeSpec {
  /** Decides the fallback icon and default placeholder. */
  kind: 'account' | 'stream';
  /** Lucide icon name of the chosen item. */
  iconName?: string;
  /** Name of the chosen item — its presence is what marks the node as filled. */
  name?: string;
  /** Accent hex of the chosen item; fills the circle. */
  color?: string;
  /** Overrides the placeholder shown while nothing is chosen. */
  placeholder?: string;
  onClick: () => void;
}

/** Direction and colour of the connector, one per record type. */
const CONNECTOR = {
  income: { Icon: ArrowLeft, color: '#10B981', label: 'Money in' },
  expense: { Icon: ArrowRight, color: '#EF4444', label: 'Money out' },
  transfer: { Icon: ArrowLeftRight, color: '#3B82F6', label: 'Between accounts' },
} as const;

const FALLBACK = {
  account: { Icon: Wallet, placeholder: 'Choose account' },
  stream: { Icon: Target, placeholder: 'Choose stream' },
} as const;

const FlowCircle: React.FC<FlowNodeSpec> = ({
  kind,
  iconName,
  name,
  color,
  placeholder,
  onClick,
}) => {
  const filled = Boolean(name);
  const fallback = FALLBACK[kind];
  const caption = name || placeholder || fallback.placeholder;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={filled ? `${caption} — change` : caption}
      className="group flex min-w-0 flex-1 flex-col items-center gap-2 focus:outline-none"
    >
      <motion.span
        layout
        whileTap={{ scale: 0.93 }}
        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
        className={cn(
          'flex h-16 w-16 shrink-0 items-center justify-center rounded-full transition-colors duration-200',
          filled
            ? 'text-white'
            : 'border-2 border-dashed border-muted-foreground/25 text-muted-foreground/70 group-hover:border-primary/40 group-hover:text-foreground group-focus-visible:border-primary',
        )}
        style={
          filled && color
            ? { backgroundColor: color, boxShadow: `0 6px 16px -6px ${color}99` }
            : undefined
        }
      >
        {filled && iconName ? (
          <IconComponent name={iconName} size={25} />
        ) : (
          <fallback.Icon size={24} strokeWidth={2} />
        )}
      </motion.span>

      <span
        className={cn(
          'w-full truncate px-0.5 text-center text-[11px] leading-tight transition-colors',
          filled ? 'font-semibold text-foreground' : 'text-muted-foreground/60',
        )}
      >
        {caption}
      </span>
    </button>
  );
};

interface RecordFlowProps {
  type: RecordType;
  left: FlowNodeSpec;
  right: FlowNodeSpec;
}

/**
 * The record as a sentence: where the money leaves, which way it moves, where
 * it lands. The connector carries the type — direction and colour both — so the
 * two endpoints stay identical in weight no matter which type is active.
 */
export const RecordFlow: React.FC<RecordFlowProps> = ({ type, left, right }) => {
  const { Icon, color, label } = CONNECTOR[type];

  return (
    <div className="flex items-start justify-center gap-1 py-1">
      <FlowCircle {...left} />

      <div className="flex h-16 w-11 shrink-0 items-center justify-center" aria-hidden>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={type}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            style={{ color }}
            title={label}
          >
            <Icon size={26} strokeWidth={2.5} />
          </motion.span>
        </AnimatePresence>
      </div>

      <FlowCircle {...right} />
    </div>
  );
};
