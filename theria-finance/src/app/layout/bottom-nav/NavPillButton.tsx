import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { accentVars, isModuleAccentKey } from '../../../shared/theme/moduleAccents';
import type { NavItem } from '../../routes';

const ACTIVE_SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const;
const LABEL_TRANSITION = { duration: 0.18, ease: 'easeOut' } as const;

interface NavPillButtonProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  reduceMotion: boolean;
}

/**
 * One pill slot. Inactive buttons are icon-only 44px targets; the active
 * button grows to show its label on a sliding accent-filled pill shared
 * (via `layoutId`) with whichever button was previously active, so the
 * highlight glides between destinations instead of popping.
 */
export const NavPillButton: React.FC<NavPillButtonProps> = ({
  item,
  isActive,
  onClick,
  reduceMotion,
}) => {
  const Icon = item.icon;
  // NAV_HOME_ITEM and every NAV_GROUPS entry share ids with MODULE_ACCENT_KEYS
  // by construction, so this narrows safely without a second lookup table.
  const accentKey = isModuleAccentKey(item.id) ? item.id : 'home';

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-current={isActive ? 'page' : undefined}
      aria-label={item.label}
      title={item.label}
      onClick={onClick}
      style={accentVars(accentKey)}
      className="relative flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full"
    >
      {isActive && (
        <motion.span
          layoutId="nav-active-pill"
          transition={reduceMotion ? { duration: 0 } : ACTIVE_SPRING}
          className="absolute inset-0 rounded-full module-accent-solid shadow-sm"
        />
      )}
      <span
        className="relative z-10 flex min-w-0 items-center justify-center gap-1.5 px-2.5 text-muted-foreground"
        style={isActive ? { color: 'var(--module-accent-fg)' } : undefined}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
        <AnimatePresence initial={false}>
          {isActive && (
            <motion.span
              key="label"
              initial={reduceMotion ? false : { opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, width: 0 }}
              transition={reduceMotion ? { duration: 0 } : LABEL_TRANSITION}
              className="overflow-hidden whitespace-nowrap text-xs font-semibold"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  );
};
