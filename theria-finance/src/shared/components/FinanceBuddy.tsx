import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

export type BuddyMood = 'happy' | 'neutral' | 'concerned';

interface FinanceBuddyProps {
  lines: string[];
  mood: BuddyMood;
  name?: string;
  tagline?: string;
  /** When set, Terry gets a dismiss button in the bubble corner. */
  onDismiss?: () => void;
}

/**
 * Placeholder mascot art — swap the SVG below for final character artwork.
 * Terry's body is fixed emerald (#10B981) so he stays green whatever theme
 * accent is active.
 * Exported so Terry can appear outside the dashboard (mode switch, about page).
 */
export const BuddyFace: React.FC<{ mood: BuddyMood }> = ({ mood }) => (
  <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden>
    <style>{`
      @keyframes theria-buddy-blink {
        0%, 90%, 100% { transform: scaleY(1); }
        94% { transform: scaleY(0.1); }
      }
      @keyframes theria-buddy-look {
        0%, 40%, 100% { transform: translateX(0); }
        46%, 60% { transform: translateX(1.4px); }
        66%, 82% { transform: translateX(-1.2px); }
        88% { transform: translateX(0); }
      }
      @keyframes theria-buddy-sway {
        0%, 100% { transform: rotate(-5deg); }
        50% { transform: rotate(6deg); }
      }
      @keyframes theria-buddy-blush {
        0%, 100% { opacity: 0.45; }
        50% { opacity: 0.7; }
      }
      .theria-buddy-eyes {
        animation: theria-buddy-blink 4.4s ease-in-out infinite;
        transform-origin: 50% 45%;
        transform-box: fill-box;
      }
      .theria-buddy-pupils {
        animation: theria-buddy-look 7s ease-in-out infinite;
      }
      .theria-buddy-sprout {
        animation: theria-buddy-sway 3.4s ease-in-out infinite;
        transform-origin: 36px 17px;
      }
      .theria-buddy-blush {
        animation: theria-buddy-blush 5.2s ease-in-out infinite;
      }
    `}</style>

    {/* sprout — sways gently */}
    <g className="theria-buddy-sprout">
      <path
        d="M36 17 C36 13 36 10 36 8"
        stroke="#059669"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M36 10 C31 10 28 7 27 3 C32 3 35.5 5.5 36 10 Z" fill="#34D399" />
      <path d="M36 11 C40.5 11 43.5 8.5 44.5 5 C40 5 36.5 7 36 11 Z" fill="#6EE7B7" />
    </g>

    {/* body — hexagon with rounded points, always emerald */}
    <path
      d="M28 16 L44 16 Q50 16 52.85 21.28 L61.15 36.72 Q64 42 61.15 47.28 L52.85 62.72 Q50 68 44 68 L28 68 Q22 68 19.15 62.72 L10.85 47.28 Q8 42 10.85 36.72 L19.15 21.28 Q22 16 28 16 Z"
      fill="#10B981"
    />
    <ellipse cx="30" cy="30" rx="14" ry="9" fill="#FFFFFF" opacity="0.16" />
    <ellipse cx="36" cy="52" rx="14" ry="9.5" fill="#FFFFFF" opacity="0.22" />

    {/* eyes — blink, and occasionally glance around */}
    <g className="theria-buddy-eyes">
      <g className="theria-buddy-pupils">
        <circle cx="27" cy="38" r="4.4" fill="#0F172A" />
        <circle cx="45" cy="38" r="4.4" fill="#0F172A" />
        <circle cx="28.6" cy="36.4" r="1.5" fill="#FFFFFF" opacity="0.9" />
        <circle cx="46.6" cy="36.4" r="1.5" fill="#FFFFFF" opacity="0.9" />
      </g>
    </g>

    {/* concerned brows */}
    {mood === 'concerned' && (
      <g stroke="#0F172A" strokeWidth="2" strokeLinecap="round" opacity="0.85">
        <path d="M22.5 31.5 L30 33.5" fill="none" />
        <path d="M49.5 31.5 L42 33.5" fill="none" />
      </g>
    )}

    {/* blush — pulses softly */}
    <g className="theria-buddy-blush">
      <circle cx="21" cy="45" r="2.8" fill="#FB7185" />
      <circle cx="51" cy="45" r="2.8" fill="#FB7185" />
    </g>

    {/* mouth */}
    {mood === 'happy' && (
      <path
        d="M28 47 Q36 54 44 47"
        stroke="#0F172A"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    )}
    {mood === 'neutral' && (
      <path
        d="M31 48.5 Q36 51.5 41 48.5"
        stroke="#0F172A"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    )}
    {mood === 'concerned' && (
      <path
        d="M30 50.5 Q36 46 42 50.5"
        stroke="#0F172A"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    )}
  </svg>
);

/**
 * Lines may wrap dynamic values in **double asterisks** — those render as
 * light-green highlights so amounts and names pop out of Terry's speech.
 */
const renderBuddyLine = (line: string) =>
  line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <span key={i} className="font-semibold text-emerald-600 dark:text-emerald-400">
        {part.slice(2, -2)}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );

const plainBuddyLine = (line: string) => line.split('**').join('');

export const FinanceBuddy: React.FC<FinanceBuddyProps> = ({
  lines,
  mood,
  name = 'Terry',
  tagline = 'Your money buddy',
  onDismiss,
}) => {
  const [index, setIndex] = useState(0);
  const [bump, setBump] = useState(0);

  const linesKey = lines.join('|');
  useEffect(() => {
    setIndex(0);
  }, [linesKey]);

  if (lines.length === 0) return null;
  const safeIndex = index % lines.length;

  const handleTap = () => {
    setIndex((i) => (i + 1) % lines.length);
    setBump((b) => b + 1);
  };

  return (
    <section className="relative">
      {/* Sibling of the tap-to-cycle button — buttons must not nest */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Dismiss ${name}`}
          className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      )}
      <button
        type="button"
        onClick={handleTap}
        aria-label={`${name} says: ${plainBuddyLine(lines[safeIndex])}. Tap for the next message.`}
        className="relative flex w-full items-center gap-3.5 px-1 py-1 text-left sm:gap-4"
      >
        <div className="flex shrink-0 flex-col items-center">
          <motion.div
            // idle tilt — a slow, subtle side-to-side lean
            animate={{ rotate: [0, -2, 0, 2, 0] }}
            transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.07, rotate: -3 }}
            className="h-20 w-20 sm:h-24 sm:w-24"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-full w-full"
            >
              <motion.div
                key={bump}
                initial={bump === 0 ? false : { rotate: -10, scale: 0.9, y: 6 }}
                animate={{ rotate: 0, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 12 }}
                className="h-full w-full"
              >
                <BuddyFace mood={mood} />
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            aria-hidden
            animate={{ scaleX: [1, 0.78, 1], opacity: [0.4, 0.22, 0.4] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="mt-1.5 h-1.5 w-12 rounded-full bg-foreground/20 blur-[1px]"
          />
        </div>

        <div className="relative min-w-0 flex-1 rounded-2xl border border-border/50 bg-card px-3.5 py-3 shadow-sm">
          <span
            aria-hidden
            className="absolute -left-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-b border-l border-border/50 bg-card"
          />

          <p className="text-[9px] font-bold uppercase tracking-widest text-primary">
            {name} · {tagline}
          </p>

          <div className="mt-1 flex min-h-[2.5rem] items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={safeIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="text-[13px] leading-snug text-foreground sm:text-sm"
              >
                {renderBuddyLine(lines[safeIndex])}
              </motion.p>
            </AnimatePresence>
          </div>

          {lines.length > 1 && (
            <div className="mt-1.5 flex items-center justify-end gap-1">
              {lines.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    i === safeIndex ? 'w-3 bg-primary' : 'w-1 bg-border'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </button>
    </section>
  );
};
