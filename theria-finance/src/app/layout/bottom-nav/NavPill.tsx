import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { NAV_GROUPS, NAV_HOME_ITEM, type Screen } from '../../routes';
import { NavPillButton } from './NavPillButton';

const ITEM_SPRING = { type: 'spring', stiffness: 420, damping: 30 } as const;

interface NavPillProps {
  screen: Screen;
  groupIndex: number;
  onNavigate: (screen: Screen) => void;
  reduceMotion: boolean;
}

/**
 * Home is pinned as the first slot and never swaps; the other three slots
 * are whichever NAV_GROUPS entry is currently selected. Both groups hold
 * exactly three items, so the pill's width doesn't jump when it swaps.
 */
export const NavPill: React.FC<NavPillProps> = ({
  screen,
  groupIndex,
  onNavigate,
  reduceMotion,
}) => {
  const group = NAV_GROUPS[groupIndex];
  const atHome = screen === 'home';

  return (
    <div
      role="tablist"
      aria-label="Primary navigation"
      data-tour="bottom-nav"
      className="flex h-14 min-w-0 items-center gap-1 rounded-full border border-border bg-card/90 px-1.5 shadow-lg backdrop-blur-md"
    >
      <NavPillButton
        item={NAV_HOME_ITEM}
        isActive={atHome}
        onClick={() => onNavigate('home')}
        reduceMotion={reduceMotion}
      />

      <div className="h-6 w-px shrink-0 bg-border/70" aria-hidden />

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={group.id}
          className="flex min-w-0 items-center gap-1"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
        >
          {group.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={reduceMotion ? false : { opacity: 0, y: 6, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                ...ITEM_SPRING,
                delay: reduceMotion ? 0 : index * 0.03,
              }}
            >
              <NavPillButton
                item={item}
                isActive={screen === item.id}
                onClick={() => onNavigate(item.id)}
                reduceMotion={reduceMotion}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
