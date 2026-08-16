import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router';
import { navGroupIndexForScreen, pathFor, type Screen } from '../../routes';
import { NavGroupSwitch } from './NavGroupSwitch';
import { NavPill } from './NavPill';

interface BottomNavProps {
  screen: Screen;
  /** While the FAB's quick-actions menu is open, the nav hides so its
   *  expanded actions are the only reachable targets in that area. */
  fabOpen: boolean;
}

const HIDE_TRANSITION = { duration: 0.18, ease: 'easeOut' } as const;

export const BottomNav: React.FC<BottomNavProps> = ({ screen, fabOpen }) => {
  const navigate = useNavigate();
  const reduceMotion = Boolean(useReducedMotion());

  const activeGroupIndex = navGroupIndexForScreen(screen);
  const [groupIndex, setGroupIndex] = useState(() => Math.max(activeGroupIndex, 0));

  // Deep-linking or navigating into a screen owned by the other group swaps
  // the pill to show it. Manual switching while on Home or a utility screen
  // (activeGroupIndex === -1 there) is left alone.
  useEffect(() => {
    if (activeGroupIndex >= 0) setGroupIndex(activeGroupIndex);
  }, [activeGroupIndex]);

  const go = (target: Screen) => navigate(pathFor(target));
  const toggleGroup = () => setGroupIndex((index) => (index + 1) % 2);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      {/* Fades page content out before it reaches the floating row. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-slate-300/55 via-slate-200/25 to-transparent dark:from-black/35 dark:via-black/20 dark:to-transparent"
      />

      <motion.div
        animate={{
          opacity: fabOpen ? 0 : 1,
          y: fabOpen ? 12 : 0,
          scale: fabOpen ? 0.94 : 1,
        }}
        transition={reduceMotion ? { duration: 0 } : HIDE_TRANSITION}
        style={{ pointerEvents: fabOpen ? 'none' : 'auto' }}
        aria-hidden={fabOpen}
        className="relative flex items-center gap-2 px-4 pb-nav-row"
      >
        <NavGroupSwitch
          groupIndex={groupIndex}
          onToggle={toggleGroup}
          reduceMotion={reduceMotion}
        />
        <NavPill
          screen={screen}
          groupIndex={groupIndex}
          onNavigate={go}
          reduceMotion={reduceMotion}
        />
        {/* The FAB is a fixed-position sibling rendered by AppShell, aligned
            to the same .bottom-nav-row offset so it reads as this row's
            rightmost slot without needing to be a literal DOM child. */}
      </motion.div>
    </div>
  );
};
