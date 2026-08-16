import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTerry } from '../../core/state/TerryContext';
import { BuddyFace } from '../../shared/components/FinanceBuddy';
import { plainBuddyLine, renderBuddyLine } from '../../shared/lib/buddyLines';
import { cn } from '../../shared/components/ui/utils';

/** How long each dialog line stays up before Terry moves on. */
const LINE_DURATION_MS = 8000;
/** Beat before Terry pipes up after landing on a screen. */
const FIRST_LINE_DELAY_MS = 1200;

/**
 * Terry as a messenger-style floating bubble. He docks at the bottom-left,
 * mirroring the FAB, and can be dragged across to dock on the right (where he
 * rises above the FAB instead of colliding with it). Tapping him opens the
 * chat; the screen's tips surface as small dialogs that drift in beside him.
 */
export const TerryFloat: React.FC = () => {
  const { terryVisible, terrySide, setTerrySide, speech } = useTerry();
  const navigate = useNavigate();

  const [lineIndex, setLineIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  // Dismissing the dialog quiets Terry until he has something new to say.
  const [muted, setMuted] = useState(false);
  // A drag that ends on the bubble still fires its click — swallow that one.
  const draggedRef = useRef(false);

  const speechKey = speech ? `${speech.mood}|${speech.lines.join('|')}` : '';

  // New screen, new script: start over from the first line after a beat.
  useEffect(() => {
    setLineIndex(0);
    setDialogOpen(false);
    setMuted(false);
    if (!speechKey) return;
    const timer = window.setTimeout(() => setDialogOpen(true), FIRST_LINE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [speechKey]);

  // While a dialog is up, advance through the lines, then go quiet.
  useEffect(() => {
    if (!dialogOpen || !speech) return;
    const timer = window.setTimeout(() => {
      if (lineIndex < speech.lines.length - 1) {
        setLineIndex((i) => i + 1);
      } else {
        setDialogOpen(false);
      }
    }, LINE_DURATION_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speechKey stands in for the speech object
  }, [dialogOpen, lineIndex, speechKey]);

  if (!terryVisible) return null;

  const lines = speech?.lines ?? [];
  const mood = speech?.mood ?? 'happy';
  const safeIndex = lines.length > 0 ? lineIndex % lines.length : 0;
  const showDialog = dialogOpen && !muted && lines.length > 0;

  const advanceLine = () => {
    if (lines.length === 0) return;
    if (safeIndex < lines.length - 1) setLineIndex((i) => i + 1);
    else setDialogOpen(false);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const targetSide = info.point.x < window.innerWidth / 2 ? 'left' : 'right';
    setTerrySide(targetSide);
  };

  const handleBubbleClick = () => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    navigate('/chat');
  };

  const onLeft = terrySide === 'left';

  return (
    <div
      className={cn(
        'fixed z-50',
        onLeft
          ? // mirrors the FAB's dock across the screen
            'left-4 sm:left-6 bottom-nav-row'
          : // the FAB owns the right dock, so Terry floats a storey above it
            'right-4 sm:right-6 bottom-[calc(var(--nav-row-bottom)+4.5rem+env(safe-area-inset-bottom,0px))]',
      )}
    >
      {/* Remounting on a side switch resets the drag offset, so Terry pops
          into his new dock instead of keeping a stale transform. */}
      <motion.div
        key={terrySide}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 24 }}
        drag
        dragSnapToOrigin
        dragMomentum={false}
        dragElastic={0.2}
        onDragStart={() => {
          draggedRef.current = true;
        }}
        onDragEnd={handleDragEnd}
        className="relative h-14 w-14"
      >
        <AnimatePresence>
          {showDialog && (
            <motion.div
              key={`${speechKey}-${safeIndex}`}
              role="status"
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={cn(
                'absolute bottom-1 w-56 max-w-[calc(100vw-6.5rem)] sm:w-64',
                onLeft ? 'left-full ml-3' : 'right-full mr-3',
              )}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={advanceLine}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') advanceLine();
                }}
                aria-label={`Terry says: ${plainBuddyLine(lines[safeIndex])}. Tap for the next message.`}
                className="relative cursor-pointer rounded-2xl border border-border/50 bg-card px-3 py-2.5 pr-7 shadow-lg"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMuted(true);
                  }}
                  aria-label="Dismiss Terry's tip"
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>

                <p className="text-[9px] font-bold uppercase tracking-widest text-primary">
                  Terry · Your money buddy
                </p>
                <p className="mt-1 text-[12px] leading-snug text-foreground">
                  {renderBuddyLine(lines[safeIndex])}
                </p>

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

                {/* tail pointing at Terry */}
                <span
                  aria-hidden
                  className={cn(
                    'absolute bottom-3.5 h-2.5 w-2.5 rotate-45 bg-card',
                    onLeft
                      ? '-left-[5px] border-b border-l border-border/50'
                      : '-right-[5px] border-r border-t border-border/50',
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No chrome — Terry himself is the button, floating free. */}
        <motion.button
          type="button"
          onClick={handleBubbleClick}
          aria-label="Chat with Terry"
          title="Chat with Terry"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative block h-14 w-14 drop-shadow-md"
        >
          <motion.span
            // idle bob so he reads as floating, like the panel version did
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="block h-full w-full"
          >
            <BuddyFace mood={mood} />
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
};
