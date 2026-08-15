import React, { useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { AlertTriangle, Info, Edit3, Trash2, Plus, type LucideIcon } from '@/shared/icons';
import { cn } from './ui/utils';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'add' | 'update' | 'delete';

export interface AlertProps {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: (id: string) => void;
}

/* ------------------------------------------------------------------ */
/* Per-type configuration: colors, icon, timing, and motion "degree".  */
/* ------------------------------------------------------------------ */

type MotionDegree = 'celebrate' | 'pop' | 'shake' | 'pulse';

interface TypeConfig {
  degree: MotionDegree;
  duration: number;
  accentText: string;
  accentBg: string;
  accentBar: string;
  ring: string;
  icon?: LucideIcon;
  drawn?: 'check' | 'x';
}

const TYPE_CONFIG: Record<AlertType, TypeConfig> = {
  success: {
    degree: 'celebrate',
    duration: 1600,
    accentText: 'text-primary',
    accentBg: 'bg-primary/15',
    accentBar: 'bg-primary',
    ring: 'border-primary',
    drawn: 'check',
  },
  add: {
    degree: 'celebrate',
    duration: 1500,
    accentText: 'text-primary',
    accentBg: 'bg-primary/15',
    accentBar: 'bg-primary',
    ring: 'border-primary',
    icon: Plus,
  },
  update: {
    degree: 'pop',
    duration: 1500,
    accentText: 'text-blue-500 dark:text-blue-400',
    accentBg: 'bg-blue-500/15',
    accentBar: 'bg-blue-500',
    ring: 'border-blue-500',
    icon: Edit3,
  },
  delete: {
    degree: 'pop',
    duration: 1600,
    accentText: 'text-destructive',
    accentBg: 'bg-destructive/15',
    accentBar: 'bg-destructive',
    ring: 'border-destructive',
    icon: Trash2,
  },
  info: {
    degree: 'pop',
    duration: 2200,
    accentText: 'text-sky-500 dark:text-sky-400',
    accentBg: 'bg-sky-500/15',
    accentBar: 'bg-sky-500',
    ring: 'border-sky-500',
    icon: Info,
  },
  warning: {
    degree: 'pulse',
    duration: 2600,
    accentText: 'text-amber-500 dark:text-amber-400',
    accentBg: 'bg-amber-500/15',
    accentBar: 'bg-amber-500',
    ring: 'border-amber-500',
    icon: AlertTriangle,
  },
  error: {
    degree: 'shake',
    duration: 2800,
    accentText: 'text-destructive',
    accentBg: 'bg-destructive/15',
    accentBar: 'bg-destructive',
    ring: 'border-destructive',
    drawn: 'x',
  },
};

/* ------------------------------------------------------------------ */
/* Stroke-drawn icons (checkmark / X) for extra-satisfying entrances.  */
/* ------------------------------------------------------------------ */

const drawTransition = { delay: 0.12, duration: 0.28, ease: 'easeOut' as const };

const DrawnIcon: React.FC<{ kind: 'check' | 'x'; className?: string }> = ({ kind, className }) => (
  <svg viewBox="0 0 24 24" width={22} height={22} fill="none" className={className} aria-hidden>
    {kind === 'check' ? (
      <motion.path
        d="M4.5 12.5l5 5L19.5 6.5"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={drawTransition}
      />
    ) : (
      <>
        <motion.path
          d="M6 6l12 12"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={drawTransition}
        />
        <motion.path
          d="M18 6L6 18"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ ...drawTransition, delay: 0.24 }}
        />
      </>
    )}
  </svg>
);

/* ------------------------------------------------------------------ */
/* Celebration particles + ring burst (success / add).                 */
/* ------------------------------------------------------------------ */

const PARTICLE_COLORS = ['bg-primary', 'bg-emerald-400', 'bg-sky-400', 'bg-amber-400'];

const PARTICLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2 + 0.35;
  const dist = 36 + (i % 3) * 9;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    size: i % 2 === 0 ? 5 : 4,
    delay: 0.1 + i * 0.014,
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  };
});

const CelebrationBurst: React.FC<{ ring: string }> = ({ ring }) => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
    <motion.span
      className={cn('absolute h-11 w-11 rounded-full border-2', ring)}
      initial={{ scale: 0.5, opacity: 0.55 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ delay: 0.08, duration: 0.5, ease: 'easeOut' }}
    />
    {PARTICLES.map((p, i) => (
      <motion.span
        key={i}
        className={cn('absolute rounded-full', p.color)}
        style={{ width: p.size, height: p.size }}
        initial={{ x: 0, y: 0, scale: 1, opacity: 0 }}
        animate={{ x: p.x, y: p.y, scale: 0.3, opacity: [0, 1, 0] }}
        transition={{ delay: p.delay, duration: 0.55, ease: 'easeOut' }}
      />
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* The centered popup card.                                            */
/* ------------------------------------------------------------------ */

const SPRING = { type: 'spring' as const, stiffness: 520, damping: 30, mass: 0.7 };

export const Alert: React.FC<AlertProps> = ({ id, type, title, message, duration, onClose }) => {
  const reduceMotion = useReducedMotion();
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  const totalDuration = duration ?? config.duration;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (totalDuration <= 0) return;
    const timer = setTimeout(() => closeRef.current?.(id), totalDuration);
    return () => clearTimeout(timer);
  }, [id, totalDuration]);

  const shake = config.degree === 'shake' && !reduceMotion;

  const cardAnimate = useMemo(
    () => ({
      scale: 1,
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      ...(shake ? { x: [0, -8, 7, -5, 3, 0] } : { x: 0 }),
    }),
    [shake],
  );

  return (
    <motion.div
      initial={
        reduceMotion
          ? { opacity: 0 }
          : { scale: 0.72, y: 14, opacity: 0, filter: 'blur(6px)', x: 0 }
      }
      animate={cardAnimate}
      exit={
        reduceMotion
          ? { opacity: 0, transition: { duration: 0.12 } }
          : { scale: 0.88, opacity: 0, filter: 'blur(4px)', transition: { duration: 0.14, ease: 'easeIn' } }
      }
      transition={{
        ...SPRING,
        ...(shake ? { x: { delay: 0.18, duration: 0.4, ease: 'easeInOut' } } : {}),
      }}
      onClick={() => onClose?.(id)}
      className={cn(
        'pointer-events-auto relative flex min-w-[13.5rem] max-w-[min(80vw,20rem)] cursor-pointer select-none',
        'flex-col items-center gap-2 overflow-hidden rounded-2xl border border-border/60',
        'bg-card/95 px-6 pb-4 pt-5 text-center shadow-2xl shadow-black/20 backdrop-blur-md',
      )}
      role="status"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="relative">
        {config.degree === 'celebrate' && !reduceMotion && <CelebrationBurst ring={config.ring} />}
        <motion.div
          initial={reduceMotion ? false : { scale: 0.4, rotate: type === 'add' ? -90 : 0 }}
          animate={{
            scale: config.degree === 'pulse' && !reduceMotion ? [0.4, 1.14, 1] : 1,
            rotate: 0,
          }}
          transition={{ ...SPRING, delay: 0.05 }}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full',
            config.accentBg,
            config.accentText,
          )}
        >
          {config.drawn ? (
            <DrawnIcon kind={config.drawn} />
          ) : (
            Icon && <Icon size={21} strokeWidth={2.4} />
          )}
        </motion.div>
      </div>

      <div className="min-w-0">
        <p className="text-[13px] font-semibold leading-snug text-foreground">{title}</p>
        {message && (
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{message}</p>
        )}
      </div>

      {totalDuration > 0 && (
        <motion.div
          className={cn('absolute bottom-0 left-0 h-[2.5px] w-full origin-left', config.accentBar)}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: totalDuration / 1000, ease: 'linear' }}
          aria-hidden
        />
      )}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Container: centered overlay, one popup at a time (FIFO queue),      */
/* shared dim + blur backdrop that persists while the queue drains.    */
/* ------------------------------------------------------------------ */

export interface AlertContainerProps {
  alerts: AlertProps[];
  onRemove: (id: string) => void;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({ alerts, onRemove }) => {
  const current = alerts[0];

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center p-6">
      <AnimatePresence>
        {current && (
          <motion.div
            key="feedback-backdrop"
            className="absolute inset-0 bg-black/15 backdrop-blur-[2.5px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            aria-hidden
          />
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {current && <Alert key={current.id} {...current} onClose={onRemove} />}
      </AnimatePresence>
    </div>
  );
};
