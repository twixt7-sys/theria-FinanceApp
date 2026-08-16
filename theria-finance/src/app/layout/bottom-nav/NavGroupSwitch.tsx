import React from 'react';
import { ArrowLeftRight } from '@/shared/icons';
import { motion } from 'motion/react';
import { NAV_GROUPS } from '../../routes';

const ROTATE_SPRING = { type: 'spring', stiffness: 400, damping: 28 } as const;

interface NavGroupSwitchProps {
  groupIndex: number;
  onToggle: () => void;
  reduceMotion: boolean;
}

/**
 * Deliberately monochrome rather than a theme-following surface — dark
 * chrome on a light page, light chrome on a dark page — so it always reads
 * as high-contrast, fixed chrome ("the control that swaps the pill"), never
 * blending into the background the way a card-toned button would.
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
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg ring-1 ring-black/5 dark:bg-white dark:text-neutral-900"
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
