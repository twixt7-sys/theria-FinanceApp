import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'motion/react';
import { CheckCircle2, AlertTriangle, Info } from '@/shared/icons';
import type { AppNotification, NotificationType } from '../lib/notificationsStore';

/** How far (px) a row must travel to commit a swipe action on release. */
const SWIPE_THRESHOLD = 96;
/** A flick this fast commits even if the drag was short. */
const VELOCITY_THRESHOLD = 500;

export interface SwipeHint {
  /** Icon + label shown in the track behind the card as it slides that way. */
  icon: React.ReactNode;
  label: string;
  /** Tailwind background for the revealed track. */
  className: string;
}

interface SwipeableNotificationProps {
  note: AppNotification;
  /** Reveal shown when dragging right; omit to disable that direction. */
  rightHint?: SwipeHint;
  /** Reveal shown when dragging left; omit to disable that direction. */
  leftHint?: SwipeHint;
  onSwipe: (direction: 'left' | 'right') => void;
  onClick?: () => void;
}

const toneFor = (type: NotificationType) => {
  switch (type) {
    case 'warning':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: <AlertTriangle className="text-amber-500" size={18} />,
      };
    case 'success':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: <CheckCircle2 className="text-emerald-600" size={18} />,
      };
    default:
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: <Info className="text-blue-600" size={18} />,
      };
  }
};

export const SwipeableNotification: React.FC<SwipeableNotificationProps> = ({
  note,
  rightHint,
  leftHint,
  onSwipe,
  onClick,
}) => {
  const tone = toneFor(note.type);
  const x = useMotionValue(0);
  const draggedRef = useRef(false);

  // The track behind the card fades in as the card uncovers it, and only the
  // side actually being dragged toward is shown.
  const rightOpacity = useTransform(x, [0, 40, SWIPE_THRESHOLD], [0, 0.6, 1]);
  const leftOpacity = useTransform(x, [0, -40, -SWIPE_THRESHOLD], [0, 0.6, 1]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const past = (dir: 'left' | 'right') =>
      dir === 'right'
        ? offset.x > SWIPE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD
        : offset.x < -SWIPE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD;

    // The card always springs back to origin (dragSnapToOrigin). A committed
    // swipe fires its action: items that leave this list animate out via the
    // parent's AnimatePresence; items that only change state (mark-as-seen)
    // stay and re-render in their dimmed state.
    if (rightHint && past('right')) onSwipe('right');
    else if (leftHint && past('left')) onSwipe('left');
  };

  const handleClick = () => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    onClick?.();
  };

  return (
    <div className="relative">
      {/* Revealed action tracks sit behind the card. */}
      {rightHint && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className={`pointer-events-none absolute inset-0 flex items-center justify-start gap-2 rounded-xl px-5 text-sm font-semibold text-white ${rightHint.className}`}
        >
          {rightHint.icon}
          <span>{rightHint.label}</span>
        </motion.div>
      )}
      {leftHint && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className={`pointer-events-none absolute inset-0 flex items-center justify-end gap-2 rounded-xl px-5 text-sm font-semibold text-white ${leftHint.className}`}
        >
          <span>{leftHint.label}</span>
          {leftHint.icon}
        </motion.div>
      )}

      <motion.div
        style={{ x }}
        drag="x"
        dragSnapToOrigin
        dragMomentum={false}
        dragElastic={0.12}
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={() => {
          draggedRef.current = true;
        }}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        className={`relative cursor-grab touch-pan-y rounded-xl border ${tone.border} ${tone.bg} dark:bg-card dark:border-border p-3.5 shadow-sm active:cursor-grabbing ${
          note.read || note.seen ? 'opacity-70' : ''
        }`}
      >
        {/* Icon is vertically centered against the whole card, not top-aligned. */}
        <div className="flex items-center gap-2.5">
          <div className="shrink-0">{tone.icon}</div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                {!note.read && !note.seen && (
                  <span
                    aria-hidden
                    className="inline-block size-2 shrink-0 rounded-full bg-primary"
                  />
                )}
                {note.title}
              </p>
              <span className="shrink-0 text-xs text-muted-foreground">{note.time}</span>
            </div>
            <p className="text-xs text-muted-foreground">{note.message}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
