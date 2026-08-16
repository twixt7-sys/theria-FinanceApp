import React from 'react';
import { motion } from 'motion/react';
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
 *
 * The pill itself is a fixed 264px — sized for the widest case (one active
 * button expanded to show its label, capped in NavPillButton so a long name
 * can't blow the budget) — so it never resizes as the active tab or group
 * changes, and `justify-between` spaces its slots evenly across that fixed
 * width instead of a hand-tuned gap. Tight enough, together with the switch
 * and FAB, to still fit a 375px phone as one centered row.
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
      className="flex h-14 w-[264px] max-w-full shrink-0 items-center justify-between rounded-full border border-border bg-card/90 px-2 shadow-lg backdrop-blur-md"
    >
      <NavPillButton
        item={NAV_HOME_ITEM}
        isActive={atHome}
        onClick={() => onNavigate('home')}
        reduceMotion={reduceMotion}
      />

      <div className="h-6 w-px shrink-0 bg-border/70" aria-hidden />

      {/* Deliberately not wrapped in AnimatePresence: toggling the switch
          always pairs a group swap with a Home navigation (see BottomNav),
          and that much larger page-level re-render can interrupt
          AnimatePresence's exit-completion callback for the old group,
          leaving it stuck on screen forever since mode="wait" never sees
          it finish. A plain keyed swap has no such lifecycle to break —
          the old group's DOM just goes away, and the new one still gets
          its entrance stagger below (which needs no exit tracking at all). */}
      <div key={group.id} className="flex min-w-0 flex-1 items-center justify-between gap-1">
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
      </div>
    </div>
  );
};
