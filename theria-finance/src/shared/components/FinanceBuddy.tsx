import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

export type BuddyMood = 'happy' | 'neutral' | 'concerned';

interface FinanceBuddyProps {
  lines: string[];
  mood: BuddyMood;
  name?: string;
  tagline?: string;
}

/**
 * Placeholder mascot art — swap the SVG below for final character artwork.
 * The body uses var(--primary) so the buddy recolors with the active theme.
 */
const BuddyFace: React.FC<{ mood: BuddyMood }> = ({ mood }) => (
  <svg viewBox="0 0 72 72" className="h-full w-full" aria-hidden>
    <style>{`
      @keyframes theria-buddy-blink {
        0%, 90%, 100% { transform: scaleY(1); }
        94% { transform: scaleY(0.1); }
      }
      .theria-buddy-eyes {
        animation: theria-buddy-blink 4.4s ease-in-out infinite;
        transform-origin: 50% 45%;
        transform-box: fill-box;
      }
    `}</style>

    {/* sprout */}
    <path
      d="M36 17 C36 13 36 10 36 8"
      stroke="#059669"
      strokeWidth="2.4"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M36 10 C31 10 28 7 27 3 C32 3 35.5 5.5 36 10 Z" fill="#34D399" />
    <path d="M36 11 C40.5 11 43.5 8.5 44.5 5 C40 5 36.5 7 36 11 Z" fill="#6EE7B7" />

    {/* body */}
    <circle cx="36" cy="42" r="26" fill="var(--primary)" />
    <ellipse cx="30" cy="30" rx="14" ry="9" fill="#FFFFFF" opacity="0.16" />
    <ellipse cx="36" cy="52" rx="14" ry="9.5" fill="#FFFFFF" opacity="0.22" />

    {/* eyes */}
    <g className="theria-buddy-eyes">
      <circle cx="27" cy="38" r="4.4" fill="#0F172A" />
      <circle cx="45" cy="38" r="4.4" fill="#0F172A" />
      <circle cx="28.6" cy="36.4" r="1.5" fill="#FFFFFF" opacity="0.9" />
      <circle cx="46.6" cy="36.4" r="1.5" fill="#FFFFFF" opacity="0.9" />
    </g>

    {/* concerned brows */}
    {mood === 'concerned' && (
      <g stroke="#0F172A" strokeWidth="2" strokeLinecap="round" opacity="0.85">
        <path d="M22.5 31.5 L30 33.5" fill="none" />
        <path d="M49.5 31.5 L42 33.5" fill="none" />
      </g>
    )}

    {/* blush */}
    <circle cx="21" cy="45" r="2.8" fill="#FB7185" opacity="0.45" />
    <circle cx="51" cy="45" r="2.8" fill="#FB7185" opacity="0.45" />

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

export const FinanceBuddy: React.FC<FinanceBuddyProps> = ({
  lines,
  mood,
  name = 'Terry',
  tagline = 'Your money buddy',
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
      <button
        type="button"
        onClick={handleTap}
        aria-label={`${name} says: ${lines[safeIndex]}. Tap for the next message.`}
        className="relative flex w-full items-center gap-3.5 px-1 py-1 text-left sm:gap-4"
      >
        <div className="flex shrink-0 flex-col items-center">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="h-20 w-20 sm:h-24 sm:w-24"
          >
            <motion.div
              key={bump}
              initial={bump === 0 ? false : { rotate: -8, scale: 0.92 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 12 }}
              className="h-full w-full"
            >
              <BuddyFace mood={mood} />
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
                {lines[safeIndex]}
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
