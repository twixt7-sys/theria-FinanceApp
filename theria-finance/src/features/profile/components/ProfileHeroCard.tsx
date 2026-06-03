import React, { useMemo, useRef, useState } from 'react';
import { Flame, Sparkles, FileText, Wallet, ChevronRight } from 'lucide-react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'motion/react';
import type { TheriaUser } from '../../../core/auth/user';

const RING = 88;
const STROKE = 4;
const R = (RING - STROKE) / 2;
const C = 2 * Math.PI * R;

type HeroStat = {
  id: string;
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
};

export function computeProfileScore(
  streakDays: number,
  recordCount: number,
  accountCount: number,
): number {
  return Math.min(
    100,
    40 +
      Math.min(streakDays, 14) * 3 +
      Math.min(recordCount, 20) * 2 +
      Math.min(accountCount, 3) * 5,
  );
}

interface ProfileHeroCardProps {
  user: TheriaUser | null;
  streakDays: number;
  recordCount: number;
  accountCount: number;
}

export const ProfileHeroCard: React.FC<ProfileHeroCardProps> = ({
  user,
  streakDays,
  recordCount,
  accountCount,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [statIndex, setStatIndex] = useState(0);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springCfg = { stiffness: 260, damping: 22 };
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [7, -7]), springCfg);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-7, 7]), springCfg);
  const glowX = useSpring(useTransform(pointerX, [-0.5, 0.5], [30, 70]), springCfg);
  const glowY = useSpring(useTransform(pointerY, [-0.5, 0.5], [20, 80]), springCfg);

  const memberLabel = useMemo(() => {
    if (!user?.createdAt) return 'New member';
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }, [user?.createdAt]);

  const profileScore = computeProfileScore(streakDays, recordCount, accountCount);
  const ringOffset = C * (1 - profileScore / 100);

  const stats: HeroStat[] = useMemo(
    () => [
      {
        id: 'streak',
        label: 'Current streak',
        value: String(streakDays),
        sub: streakDays === 1 ? 'day' : 'days',
        icon: Flame,
      },
      {
        id: 'records',
        label: 'Records logged',
        value: String(recordCount),
        sub: recordCount === 1 ? 'entry' : 'entries',
        icon: FileText,
      },
      {
        id: 'accounts',
        label: 'Active accounts',
        value: String(accountCount),
        sub: accountCount === 1 ? 'wallet' : 'wallets',
        icon: Wallet,
      },
    ],
    [streakDays, recordCount, accountCount],
  );

  const activeStat = stats[statIndex];
  const ActiveIcon = activeStat.icon;

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTilt = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const cycleStat = () => setStatIndex((i) => (i + 1) % stats.length);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ perspective: 900 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      onPointerUp={resetTilt}
      className="relative"
    >
      <motion.button
        type="button"
        onClick={cycleStat}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group relative w-full overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-emerald-600 via-primary to-teal-700 p-4 text-left text-white shadow-lg shadow-primary/20 transition-shadow hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Profile highlights. Tap to cycle stats"
      >
        <motion.div
          className="pointer-events-none absolute h-40 w-40 rounded-full bg-white/20 blur-3xl"
          style={{ left: glowX, top: glowY, x: '-50%', y: '-50%' }}
        />
        <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 20%, white 1px, transparent 1px), radial-gradient(circle at 75% 70%, white 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        <div className="relative flex items-start gap-3">
          <div className="relative shrink-0">
            <motion.div
              className="absolute -inset-1 rounded-full bg-white/15"
              animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.65, 0.4] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <svg
              width={RING}
              height={RING}
              className="relative -rotate-90 drop-shadow-sm"
              aria-hidden
            >
              <circle
                cx={RING / 2}
                cy={RING / 2}
                r={R}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={STROKE}
              />
              <motion.circle
                cx={RING / 2}
                cy={RING / 2}
                r={R}
                fill="none"
                stroke="white"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: ringOffset }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold leading-none">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </span>
              <span className="mt-0.5 text-[8px] font-medium text-white/75">{profileScore}%</span>
            </div>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold tracking-tight">{user?.username}</p>
                <p className="truncate text-[11px] text-white/75">{user?.email}</p>
              </div>
              <span className="shrink-0 rounded-md border border-white/25 bg-white/10 px-2 py-0.5 text-[9px] font-medium backdrop-blur-sm">
                {memberLabel}
              </span>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm transition-colors group-hover:bg-white/15">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStat.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <ActiveIcon size={15} className="text-amber-200" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-white/70">{activeStat.label}</p>
                    <p className="text-[13px] font-semibold leading-tight">
                      {activeStat.value}{' '}
                      <span className="text-[11px] font-normal text-white/80">{activeStat.sub}</span>
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="mt-2 flex items-center gap-1 text-[9px] text-white/55">
              <Sparkles size={10} />
              Tap card to cycle highlights
            </p>
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
};
