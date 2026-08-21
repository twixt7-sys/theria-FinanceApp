import React from 'react';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { useStreak } from '../lib/useStreak';
import { StreakHero } from '../components/StreakHero';
import { StreakCoach } from '../components/StreakCoach';
import { StreakWeekStrip } from '../components/StreakWeekStrip';
import { StreakStats } from '../components/StreakStats';
import { StreakFreezeCard } from '../components/StreakFreezeCard';
import { MilestoneTrack } from '../components/MilestoneTrack';
import { StreakHeatmap } from '../components/StreakHeatmap';

/**
 * The streaks module. Every number here is derived live from the user's own
 * logged activity via `useStreak` — nothing is hard-coded. The layout reads
 * top-down as a story: where you stand (hero), what Terry makes of it (coach),
 * a rescue when a run is salvageable (freeze), this week, the tallies, the
 * milestone climb, and the recent history.
 */
export const StreakScreen: React.FC = () => {
  const streak = useStreak();

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-6">
      <SimpleModeHint page="streak" />

      <StreakHero streak={streak} />
      <StreakCoach streak={streak} />
      <StreakFreezeCard streak={streak} />
      <StreakWeekStrip streak={streak} />
      <StreakStats streak={streak} />
      <MilestoneTrack streak={streak} />
      <StreakHeatmap streak={streak} />
    </div>
  );
};
