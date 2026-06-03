import React, { useMemo } from 'react';
import { Calendar, LogOut, Mail, Shield, Sparkles, User } from 'lucide-react';
import { useAuth } from '../../../core/state/AuthContext';
import { useData } from '../../../core/state/DataContext';
import { SettingsGroup, SettingsRow } from '../../settings/components/SettingsNav';
import { ProfileHeroCard, computeProfileScore } from '../components/ProfileHeroCard';

const STREAK_DAYS = 7;

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { records, accounts } = useData();

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return '—';
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [user?.createdAt]);

  const profileScore = computeProfileScore(STREAK_DAYS, records.length, accounts.length);

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-6">
      <ProfileHeroCard
        user={user}
        streakDays={STREAK_DAYS}
        recordCount={records.length}
        accountCount={accounts.length}
      />

      <SettingsGroup title="Account">
        <SettingsRow icon={User} label="Username" hint={user?.username} showChevron={false} />
        <SettingsRow icon={Mail} label="Email" hint={user?.email} showChevron={false} />
        <SettingsRow icon={Calendar} label="Member since" hint={memberSince} showChevron={false} />
      </SettingsGroup>

      <SettingsGroup title="Overview">
        <SettingsRow
          icon={Sparkles}
          label="Profile strength"
          hint={`${profileScore}% — keep logging to grow`}
          showChevron={false}
        />
        <SettingsRow
          icon={Shield}
          label="Plan"
          hint="Free · all core features included"
          showChevron={false}
        />
      </SettingsGroup>

      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/8 py-2.5 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
      >
        <LogOut size={15} />
        Log out
      </button>

      <p className="text-center text-[10px] text-muted-foreground/80">
        Theria Finance · v1.0.0
      </p>
    </div>
  );
};
