import React from 'react';
import { BuddyFace } from './FinanceBuddy';
import { useTerry } from '../../core/state/TerryContext';
import { cn } from './ui/utils';

/**
 * Very small hexagon-with-eyes button that shows/hides Terry.
 * Full-color when Terry is on, dimmed + grayscale when he's hidden.
 */
export const TerryToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { terryVisible, toggleTerry } = useTerry();

  return (
    <button
      type="button"
      onClick={toggleTerry}
      aria-pressed={terryVisible}
      aria-label={terryVisible ? 'Hide Terry' : 'Show Terry'}
      title={terryVisible ? 'Hide Terry' : 'Show Terry'}
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card/70 shadow-sm transition-all hover:scale-110 active:scale-95',
        terryVisible ? 'opacity-100' : 'opacity-50 grayscale',
        className,
      )}
    >
      <span className="h-5 w-5">
        <BuddyFace mood="happy" />
      </span>
    </button>
  );
};
