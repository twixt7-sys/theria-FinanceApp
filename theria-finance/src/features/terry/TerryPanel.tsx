import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTerry } from '../../core/state/TerryContext';
import { FinanceBuddy } from '../../shared/components/FinanceBuddy';
import type { TerryContent } from './terryLines';

/**
 * Terry's ambient panel: visibility, the reveal animation and the dismiss
 * button, in one place. Screens supply only what he should say.
 */
interface TerryPanelProps {
  content: TerryContent;
  /** Show Terry even when hidden — the dashboard keeps him while editing layout. */
  forceVisible?: boolean;
  /** Hides the dismiss button when Terry must stay put. */
  dismissible?: boolean;
}

export const TerryPanel: React.FC<TerryPanelProps> = ({
  content,
  forceVisible = false,
  dismissible = true,
}) => {
  const { terryVisible, setTerryVisible } = useTerry();

  return (
    <AnimatePresence initial={false}>
      {(terryVisible || forceVisible) && (
        <motion.div
          key="terry-buddy"
          initial={{ opacity: 0, height: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, height: 'auto', y: 0, scale: 1 }}
          exit={{ opacity: 0, height: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <FinanceBuddy
            lines={content.lines}
            mood={content.mood}
            onDismiss={dismissible ? () => setTerryVisible(false) : undefined}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
