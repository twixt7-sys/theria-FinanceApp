import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { motion } from 'motion/react';
import { NAV_GROUPS } from '../../routes';

const ROTATE_SPRING = { type: 'spring', stiffness: 400, damping: 28 } as const;

interface NavGroupSwitchProps {
  groupIndex: number;
  onToggle: () => void;
  reduceMotion: boolean;
}

/**
 * Deliberately white in both themes — a fixed piece of chrome (like the
 * FAB's brand green) rather than a theme-following surface, so it always
 * reads as "the control that swaps the pill", not as part of the page.
 */
export const NavGroupSwitch: React.FC<NavGroupSwitchProps> = ({
  groupIndex,
  onToggle,
  reduceMotion,
}) => {
  const nextGroup = NAV_GROUPS[(groupIndex + 1) % NAV_GROUPS.length];

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.92 }}
      aria-label={`Show ${nextGroup.label} tabs`}
      title={`Show ${nextGroup.label} tabs`}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg ring-1 ring-black/5"
    >
      <motion.span
        animate={{ rotate: groupIndex * 180 }}
        transition={reduceMotion ? { duration: 0 } : ROTATE_SPRING}
        className="flex items-center justify-center"
      >
        <ArrowLeftRight size={18} strokeWidth={2.25} />
      </motion.span>
    </motion.button>
  );
};
