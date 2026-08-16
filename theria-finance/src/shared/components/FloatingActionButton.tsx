import React, { useState } from 'react';
import {
  Plus,
  Target,
  PiggyBank,
  Wallet,
  Send,
  Waves,
  X,
} from '@/shared/icons';
import { motion, AnimatePresence } from 'motion/react';
import {
  SIMPLE_MODE_FAB_ACTION_LABELS,
  type SimpleModeFabAction,
} from '../lib/simpleModeFabGuides';
import { accentVars, type ModuleAccentKey } from '../theme/moduleAccents';
import { cn } from './ui/utils';

export type SimpleModeFabGuideConfig = {
  message: string;
  emphasisAction: SimpleModeFabAction;
};

/** When set, the FAB skips the quick-actions menu and runs a single action. */
export type DirectFabAction = {
  label: string;
  onClick: () => void;
  accentKey: ModuleAccentKey;
};

/** Solid expanding rings — no fills or gradients. */
function FabPulseRings({
  rounded = 'rounded-full',
  ringClassName = 'border-2 border-[var(--fab-emphasis)]',
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="pointer-events-auto absolute bottom-full right-0 z-10 mb-3 max-w-[11rem] sm:max-w-[12.5rem]"
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
          className="absolute -bottom-[5px] right-5 h-2 w-2 rotate-45 border-b border-r border-border/50 bg-card/55 backdrop-blur-sm"
          aria-hidden
        />
      </div>
    </motion.div>
  );
}

export interface FloatingActionButtonProps {
  onAddStream: () => void;
  onAddRequest: () => void;
  onAddAccount: () => void;
  onAddBudget: () => void;
  onAddSavings: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  simpleModeGuide?: SimpleModeFabGuideConfig | null;
  onGuideActionUsed?: () => void;
  onGuideDismiss?: () => void;
  directAction?: DirectFabAction | null;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onAddStream,
  onAddRequest,
  onAddAccount,
  onAddBudget,
  onAddSavings,
  isOpen = false,
  onToggle,
  simpleModeGuide = null,
  onGuideActionUsed,
  onGuideDismiss,
  directAction = null,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isFabOpen = directAction ? false : isOpen !== undefined ? isOpen : internalIsOpen;
  const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));
  const hasGuide = Boolean(simpleModeGuide?.message);
  const showTooltip = hasGuide && !isFabOpen;
  const showMainPulse = hasGuide && !isFabOpen;
  const emphasisLabel = simpleModeGuide
    ? SIMPLE_MODE_FAB_ACTION_LABELS[simpleModeGuide.emphasisAction]
    : null;

  const dismissGuide = () => onGuideDismiss?.();

  // Category creation is not a FAB action — every entity modal (Account,
  // Stream, Record, Budget, Savings) already embeds AddCategoryModal inline.
  const primaryActions = [
    {
      icon: Wallet,
      label: 'Add Account',
      action: onAddAccount,
      accentKey: 'accounts' as ModuleAccentKey,
      fabAction: 'account' as SimpleModeFabAction,
    },
    {
      icon: Waves,
      label: 'Add Stream',
      action: onAddStream,
      accentKey: 'streams' as ModuleAccentKey,
      fabAction: 'stream' as SimpleModeFabAction,
    },
    {
      icon: Send,
      label: 'Add Record',
      action: onAddRequest,
      accentKey: 'records' as ModuleAccentKey,
      fabAction: 'record' as SimpleModeFabAction,
    },
  ];

  const secondaryActions = [
    {
      icon: Target,
      label: 'Add Budget',
      action: onAddBudget,
      accentKey: 'budget' as ModuleAccentKey,
      fabAction: 'budget' as SimpleModeFabAction,
    },
    {
      icon: PiggyBank,
      label: 'Add Savings',
      action: onAddSavings,
      accentKey: 'savings' as ModuleAccentKey,
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

      {/* Positioning is the parent's job now (BottomNav groups the switch,
          pill, and FAB into one centered row) — this is just local layout
          for the button and its expanding menu. z-50 keeps the whole thing
          — button, primary menu, secondary menu — above the z-40 scrim, so
          the expanding actions never render dimmed/blurred underneath it. */}
      <div className="relative z-50 flex flex-col items-end">
        {/* pointer-events is keyed off the live isFabOpen value, not the
            AnimatePresence-frozen snapshot the exiting children render from
            — so even if an exit animation's DOM never gets cleaned up (seen
            intermittently), it can't linger as an invisible click-blocker
            over whatever's on the page underneath it. */}
        <div style={{ pointerEvents: isFabOpen ? undefined : 'none' }}>
          <AnimatePresence>
            {isFabOpen && (
              <>
                {/* Absolutely positioned, like secondaryActions below, so this
                    menu never affects the wrapper's box height — it now sits
                    as a flex child of BottomNav's centered row, and a growing
                    wrapper would make that row recompute its height and
                    re-center the switch/pill/FAB on every open/close. */}
                <div className="absolute bottom-full right-0 mb-3 flex flex-col items-end gap-2">
                  {primaryActions.map((item, index) => {
                    const Icon = item.icon;
                    const emphasized = isEmphasized(item.label);

                    return (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, x: -10, scale: 1, transition: { delay: index * 0.04, duration: 0.2, ease: 'easeOut' } }}
                        exit={{ opacity: 0, y: 12, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } }}
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
                              ? 'border-[var(--fab-emphasis)]/50 bg-card text-foreground'
                              : 'border-border bg-card text-muted-foreground group-hover:border-border group-hover:bg-muted group-hover:text-foreground',
                          )}
                        >
                          {item.label}
                        </div>
                        <div className="relative h-9 w-9 shrink-0">
                          {emphasized && <FabPulseRings duration={2} />}
                          <div
                            style={accentVars(item.accentKey)}
                            className={cn(
                              'relative flex h-9 w-9 items-center justify-center rounded-full shadow-md module-accent-solid',
                              emphasized && 'ring-2 ring-[var(--fab-emphasis)] ring-offset-2 ring-offset-background',
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
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
                  exit={{ opacity: 0, x: 12, transition: { duration: 0.15, ease: 'easeIn' } }}
                  className="absolute bottom-0 right-16 flex items-center gap-2"
                >
                  {secondaryActions.map((item, index) => {
                    const Icon = item.icon;
                    const emphasized = isEmphasized(item.label);

                    return (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, y: -5, scale: 1, transition: { delay: index * 0.04, duration: 0.2, ease: 'easeOut' } }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15, ease: 'easeIn' } }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAction(item.action, item.label)}
                        style={accentVars(item.accentKey)}
                        className={cn(
                          'relative flex items-center gap-2 overflow-visible rounded-xl px-3 py-2 shadow-md module-accent-solid',
                          emphasized && 'ring-2 ring-[var(--fab-emphasis)] ring-offset-2 ring-offset-background',
                        )}
                        title={item.label}
                      >
                        {emphasized && <FabPulseRings rounded="rounded-xl" duration={2} />}
                        <Icon size={16} className="relative z-[1]" />
                        <span className="relative z-[1] text-xs font-semibold">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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
          {/*
          <AnimatePresence>
            {directAction && !showTooltip && (
              <motion.button
                key={directAction.label}
                type="button"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onClick={() => handleAction(directAction.onClick, directAction.label)}
                className="mr-2 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                {directAction.label}
              </motion.button>
            )}
          </AnimatePresence>
          */}

          <div data-tour="fab" className="relative flex h-14 w-14 items-center justify-center">
            {showMainPulse && <FabPulseRings ringCount={2} duration={2.2} />}
            <motion.button
              type="button"
              onClick={
                directAction
                  ? () => handleAction(directAction.onClick, directAction.label)
                  : handleToggle
              }
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              animate={{ rotate: isFabOpen ? 45 : 0 }}
              transition={{ rotate: { type: 'spring', stiffness: 400, damping: 25 } }}
              // Sourced from moduleAccents so the FAB is blue on Records, yellow on
              // Streams, etc. — and cross-fades between them via transition-colors
              // instead of hard-cutting, since it's a CSS variable, not a class swap.
              style={isFabOpen ? undefined : accentVars(directAction ? directAction.accentKey : 'home')}
              className={cn(
                'relative z-[1] flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-shadow transition-colors',
                isFabOpen
                  ? 'bg-destructive text-white hover:bg-destructive/90'
                  : 'module-accent-solid hover:shadow-xl',
                showMainPulse && 'ring-2 ring-[var(--fab-emphasis)] ring-offset-2 ring-offset-background',
              )}
              aria-label={
                directAction?.label ?? (hasGuide ? simpleModeGuide?.message : 'Open quick actions')
              }
            >
              <Plus size={24} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
};
