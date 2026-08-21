import React from 'react';
import { useNavigate } from 'react-router';
import { FinanceBuddy } from '../../../shared/components/FinanceBuddy';
import { buildStreakTerry } from '../../terry/terryLines';
import type { UseStreakResult } from '../lib/useStreak';

/**
 * Terry as the streak coach. He lives inside the module (not just the floating
 * bubble), reads the same summary every other card does, and reacts with mood
 * and copy — celebrating a live streak, nudging an at-risk one, rallying after
 * a break. Tapping cycles his lines; the ask button opens the full chat.
 */
export const StreakCoach: React.FC<{ streak: UseStreakResult }> = ({ streak }) => {
  const navigate = useNavigate();

  const terry = buildStreakTerry({
    status: streak.status,
    current: streak.current,
    longest: streak.longest,
    daysToNextMilestone: streak.daysToNextMilestone,
    nextMilestoneLabel: streak.nextMilestone?.label ?? null,
    canRepair: streak.canRepair,
    freezesRemaining: streak.freezesRemaining,
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <FinanceBuddy lines={terry.lines} mood={terry.mood} onAsk={() => navigate('/chat')} />
    </div>
  );
};
