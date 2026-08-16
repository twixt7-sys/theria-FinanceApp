import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router';
import { navGroupIndexForScreen, pathFor, type Screen } from '../../routes';
import { FloatingActionButton, type FloatingActionButtonProps } from '../../../shared/components/FloatingActionButton';
import { NavGroupSwitch } from './NavGroupSwitch';
import { NavPill } from './NavPill';

interface BottomNavProps {
  screen: Screen;
  /** Null on screens where the FAB makes no sense (e.g. chat) — the switch
   *  and pill still render, just without a third slot. */
  fab: FloatingActionButtonProps | null;
}

const HIDE_TRANSITION = { duration: 0.18, ease: 'easeOut' } as const;

/**
 * Switch, pill, and FAB render as one literal group here — not three
 * independently-positioned fixed elements — so they share a single centered
 * row at the bottom of the screen instead of drifting apart across widths.
 * Only the switch and pill fade when the FAB's menu opens; the FAB itself
 * stays put so its expanded actions remain reachable in place.
 */
export const BottomNav: React.FC<BottomNavProps> = ({ screen, fab }) => {
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

  const fabOpen = Boolean(fab?.isOpen);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      {/* Fades page content out before it reaches the floating row. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-0 right-0 h-20 bg-gradient-to-t from-slate-300/55 via-slate-200/25 to-transparent dark:from-black/35 dark:via-black/20 dark:to-transparent"
      />

      <div className="relative flex items-center justify-center gap-1 px-3 pb-nav-row">
        <motion.div
          animate={{
            opacity: fabOpen ? 0 : 1,
            y: fabOpen ? 12 : 0,
            scale: fabOpen ? 0.94 : 1,
          }}
          transition={reduceMotion ? { duration: 0 } : HIDE_TRANSITION}
          style={{ pointerEvents: fabOpen ? 'none' : 'auto' }}
          aria-hidden={fabOpen}
          className="flex items-center gap-1"
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
        </motion.div>

        {fab && <FloatingActionButton {...fab} />}
      </div>
    </div>
  );
};
