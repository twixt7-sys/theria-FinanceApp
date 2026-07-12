import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Coins, FolderOpen, Wallet, TrendingUp } from 'lucide-react';
import { BuddyFace } from '../../../shared/components/FinanceBuddy';

interface StepFinishProps {
  currencyCount: number;
  categoryCount: number;
  accountCount: number;
  streamCount: number;
}

const CONFETTI_COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#EF4444'];

/** Lightweight confetti burst — a handful of motion dots, no library needed. */
const ConfettiBurst: React.FC = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        x: (Math.random() - 0.5) * 220,
        y: -60 - Math.random() * 120,
        delay: Math.random() * 0.25,
        rotate: (Math.random() - 0.5) * 360,
        round: Math.random() > 0.5,
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-10 flex justify-center">
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: piece.x,
            y: [0, piece.y, piece.y + 200],
            rotate: piece.rotate,
            scale: 1,
          }}
          transition={{ duration: 1.8, delay: piece.delay, ease: 'easeOut' }}
          className={`absolute h-2 w-2 ${piece.round ? 'rounded-full' : 'rounded-[2px]'}`}
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
};

export const StepFinish: React.FC<StepFinishProps> = ({
  currencyCount,
  categoryCount,
  accountCount,
  streamCount,
}) => {
  const stats = [
    { icon: Coins, label: 'Currencies', value: currencyCount, color: '#F59E0B' },
    { icon: FolderOpen, label: 'Categories', value: categoryCount, color: '#8B5CF6' },
    { icon: Wallet, label: 'Accounts', value: accountCount, color: '#10B981' },
    { icon: TrendingUp, label: 'Streams', value: streamCount, color: '#3B82F6' },
  ];

  return (
    <div className="relative flex flex-col items-center pt-2 text-center">
      <ConfettiBurst />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 14 }}
        className="h-32 w-32 sm:h-36 sm:w-36"
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, -3, 0, 3, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="h-full w-full"
        >
          <BuddyFace mood="happy" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mt-4 text-xl font-bold text-foreground sm:text-2xl"
      >
        You're all set! 🎉
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground"
      >
        Here's what we built together. I'll be on your dashboard if you need me —
        and everything here can be changed later.
      </motion.p>

      <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-2">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.09, type: 'spring', stiffness: 300, damping: 20 }}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-3.5 py-3 text-left"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${stat.color}1F`, color: stat.color }}
              >
                <Icon size={16} />
              </span>
              <span>
                <span className="block text-lg font-bold leading-none text-foreground">
                  {stat.value}
                </span>
                <span className="mt-0.5 block text-[10px] font-medium text-muted-foreground">
                  {stat.label}
                </span>
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
