import React from 'react';
import { motion } from 'motion/react';
import { Coins, FolderOpen, Wallet, TrendingUp, ClipboardList, BellRing } from 'lucide-react';
import { BuddyFace } from '../../../shared/components/FinanceBuddy';

const SETUP_ITEMS = [
  { icon: Coins, label: 'Currencies', color: '#F59E0B' },
  { icon: FolderOpen, label: 'Categories', color: '#8B5CF6' },
  { icon: Wallet, label: 'Accounts', color: '#10B981' },
  { icon: TrendingUp, label: 'Income & expenses', color: '#3B82F6' },
  { icon: ClipboardList, label: 'A little about you', color: '#EC4899' },
  { icon: BellRing, label: 'Reminders', color: '#EF4444' },
];

export const StepWelcome: React.FC<{ username: string }> = ({ username }) => (
  <div className="flex flex-col items-center pt-2 text-center">
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      className="h-32 w-32 sm:h-36 sm:w-36"
    >
      <motion.div
        initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        className="h-full w-full"
      >
        <BuddyFace mood="happy" />
      </motion.div>
    </motion.div>
    <motion.div
      aria-hidden
      animate={{ scaleX: [1, 0.75, 1], opacity: [0.35, 0.2, 0.35] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      className="mt-1 h-2 w-16 rounded-full bg-foreground/20 blur-[2px]"
    />

    <motion.h1
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      className="mt-5 text-xl font-bold text-foreground sm:text-2xl"
    >
      Hi {username}, I'm <span className="text-primary">Terry</span>!
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.3 }}
      className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground"
    >
      Your money buddy. Let's set up Theria together — it only takes a couple of
      minutes, and you can change everything later.
    </motion.p>

    <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-2">
      {SETUP_ITEMS.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.07, type: 'spring', stiffness: 300, damping: 22 }}
            className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-card/80 px-3 py-2.5 text-left"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${item.color}1F`, color: item.color }}
            >
              <Icon size={15} />
            </span>
            <span className="text-[11px] font-semibold leading-tight text-foreground">
              {item.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  </div>
);
