import React, { useState } from 'react';
import {
  Plus,
  Target,
  PiggyBank,
  Wallet,
  Send,
  FolderPlus,
  TrendingUp,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  SIMPLE_MODE_FAB_ACTION_LABELS,
  type SimpleModeFabAction,
} from '../lib/simpleModeFabGuides';
import { cn } from './ui/utils';

export type SimpleModeFabGuideConfig = {
  message: string;
  emphasisAction: SimpleModeFabAction;
};

/** Solid expanding rings — no fills or gradients. */
function FabPulseRings({
  rounded = 'rounded-full',
  ringClassName = 'border-2 border-blue-500',
  ringCount = 2,
  duration = 2.1,
}: {
  rounded?: string;
  ringClassName?: string;
  ringCount?: number;
  duration?: number;
}) {
  return (
    <div className={cn('pointer-events-none absolute inset-0', rounded)} aria-hidden>
      {Array.from({ length: ringCount }, (_, i) => (
        <motion.span
          key={i}
          className={cn('absolute inset-0 box-border', rounded, ringClassName)}
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{
            scale: [1, 1.42, 1.42],
            opacity: [0.55, 0.22, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay: i * (duration / ringCount),
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

function FabGuideTooltip({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 4 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="pointer-events-auto absolute right-[5.25rem] bottom-2 z-10 max-w-[11rem] sm:max-w-[12.5rem]"
    >
      <div className="relative rounded-lg border border-border/50 bg-card/55 px-2.5 py-2 pr-7 shadow-sm backdrop-blur-sm">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
          aria-label="Dismiss tip"
        >
          <X size={11} strokeWidth={2} />
        </button>
        <p className="text-[10px] font-normal leading-snug tracking-tight text-muted-foreground">
          {message}
        </p>
        <span
          className="absolute -right-[5px] bottom-3.5 h-2 w-2 rotate-45 border-r border-t border-border/50 bg-card/55 backdrop-blur-sm"
          aria-hidden
        />
      </div>
    </motion.div>
  );
}

interface FloatingActionButtonProps {
  onAddStream: () => void;
  onAddRequest: () => void;
  onAddAccount: () => void;
  onAddBudget: () => void;
  onAddSavings: () => void;
  onAddCategory: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  simpleModeGuide?: SimpleModeFabGuideConfig | null;
  onGuideActionUsed?: () => void;
  onGuideDismiss?: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddStream,
  onAddRequest,
  onAddAccount,
  onAddBudget,
  onAddSavings,
  onAddCategory,
  isOpen = false,
  onToggle,
  simpleModeGuide = null,
  onGuideActionUsed,
  onGuideDismiss,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isFabOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));
  const hasGuide = Boolean(simpleModeGuide?.message);
  const showTooltip = hasGuide && !isFabOpen;
  const showMainPulse = hasGuide && !isFabOpen;
  const emphasisLabel = simpleModeGuide
    ? SIMPLE_MODE_FAB_ACTION_LABELS[simpleModeGuide.emphasisAction]
    : null;

  const dismissGuide = () => onGuideDismiss?.();

  const primaryActions = [
    {
      icon: Wallet,
      label: 'Add Account',
      action: onAddAccount,
      button: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800',
      fabAction: 'account' as SimpleModeFabAction,
    },
    {
      icon: FolderPlus,
      label: 'Add Category',
      action: onAddCategory,
      button: 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800',
      fabAction: 'category' as SimpleModeFabAction,
    },
    {
      icon: TrendingUp,
      label: 'Add Stream',
      action: onAddStream,
      button: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
      fabAction: 'stream' as SimpleModeFabAction,
    },
    {
      icon: Send,
      label: 'Add Record',
      action: onAddRequest,
      button: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
      fabAction: 'record' as SimpleModeFabAction,
    },
  ];

  const secondaryActions = [
    {
      icon: Target,
      label: 'Add Budget',
      action: onAddBudget,
      button: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700',
      fabAction: 'budget' as SimpleModeFabAction,
    },
    {
      icon: PiggyBank,
      label: 'Add Savings',
      action: onAddSavings,
      button: 'bg-pink-500 hover:bg-pink-600 active:bg-pink-700',
      fabAction: 'savings' as SimpleModeFabAction,
    },
  ];

  const handleAction = (action: () => void, label: string) => {
    if (emphasisLabel === label) {
      onGuideActionUsed?.();
    }
    action();
    if (isOpen === undefined) {
      setInternalIsOpen(false);
    } else if (isOpen) {
      onToggle?.();
    }
  };

  const isEmphasized = (label: string) =>
    Boolean(emphasisLabel && emphasisLabel === label && hasGuide);

  return (
    <>
      <AnimatePresence>
        {isFabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            style={{ marginTop: 'var(--top-nav-height, 60px)', marginBottom: 'var(--bottom-nav-height, 60px)' }}
            onClick={() => {
              if (isOpen === undefined) {
                setInternalIsOpen(false);
              } else {
                onToggle?.();
              }
            }}
          />
        )}
      </AnimatePresence>

      <div className="fixed right-4 z-50 flex flex-col items-end sm:right-6 bottom-[calc(6rem+env(safe-area-inset-bottom,0px))]">
        <AnimatePresence>
          {isFabOpen && (
            <>
              <div className="mb-3 mr-2 flex flex-col items-end gap-2">
                {primaryActions.map((item, index) => {
                  const Icon = item.icon;
                  const emphasized = isEmphasized(item.label);

                  return (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      transition={{
                        delay: index * 0.04,
                        type: 'spring',
                        stiffness: 420,
                        damping: 28,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAction(item.action, item.label)}
                      className="group relative flex items-center gap-2"
                      title={item.label}
                    >
                      <div
                        className={cn(
                          'relative rounded-lg border px-3 py-1.5 text-[11px] font-medium shadow-sm transition-colors',
                          emphasized
                            ? 'border-blue-500/50 bg-card text-foreground'
                            : 'border-border bg-card text-muted-foreground group-hover:border-border group-hover:bg-muted group-hover:text-foreground',
                        )}
                      >
                        {item.label}
                      </div>
                      <div className="relative h-9 w-9 shrink-0">
                        {emphasized && (
                          <FabPulseRings
                            ringClassName="border-2 border-blue-500"
                            duration={2}
                          />
                        )}
                        <div
                          className={cn(
                            'relative flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md transition-colors',
                            item.button,
                            emphasized && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background',
                          )}
                        >
                          <Icon size={16} />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="absolute bottom-0 right-16 flex items-center gap-2"
              >
                {secondaryActions.map((item, index) => {
                  const Icon = item.icon;
                  const emphasized = isEmphasized(item.label);

                  return (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.04 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAction(item.action, item.label)}
                      className={cn(
                        'relative flex items-center gap-2 overflow-visible rounded-xl px-3 py-2 text-white shadow-md transition-colors',
                        item.button,
                        emphasized && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background',
                      )}
                      title={item.label}
                    >
                      {emphasized && (
                        <FabPulseRings
                          rounded="rounded-xl"
                          ringClassName="border-2 border-blue-500"
                          duration={2}
                        />
                      )}
                      <Icon size={16} className="relative z-[1]" />
                      <span className="relative z-[1] text-xs font-semibold">{item.label}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="relative flex items-center justify-end">
          <AnimatePresence>
            {showTooltip && simpleModeGuide && (
              <FabGuideTooltip
                key={simpleModeGuide.message}
                message={simpleModeGuide.message}
                onDismiss={dismissGuide}
              />
            )}
          </AnimatePresence>

          <div className="relative flex h-14 w-14 items-center justify-center">
            {showMainPulse && <FabPulseRings ringCount={2} duration={2.2} />}

            <motion.button
              type="button"
              onClick={handleToggle}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              animate={{ rotate: isFabOpen ? 45 : 0 }}
              transition={{ rotate: { type: 'spring', stiffness: 400, damping: 25 } }}
              className={cn(
                'relative z-[1] flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-shadow',
                isFabOpen
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 hover:shadow-xl',
                showMainPulse && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background',
              )}
              aria-label={hasGuide ? simpleModeGuide?.message : 'Open quick actions'}
            >
              <Plus size={24} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
};
