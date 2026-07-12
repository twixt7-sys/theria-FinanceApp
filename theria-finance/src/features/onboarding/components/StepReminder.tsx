import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, BellOff, Clock } from 'lucide-react';
import type { ReminderFrequency, ReminderSchedule } from '../../../core/lib/onboardingStorage';
import { StepHeading, SectionLabel } from './onboardingUi';

interface StepReminderProps {
  schedule: ReminderSchedule;
  onChange: (schedule: ReminderSchedule) => void;
}

const FREQUENCIES: Array<{ id: ReminderFrequency; label: string }> = [
  { id: 'daily', label: 'Every day' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekly', label: 'Once a week' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
};

const previewLine = (s: ReminderSchedule) => {
  if (!s.enabled) return 'No reminders — you can turn them on anytime in Settings.';
  const when =
    s.frequency === 'daily'
      ? 'every day'
      : s.frequency === 'weekdays'
        ? 'on weekdays'
        : `every ${WEEKDAYS[s.weekday]}`;
  return `Terry will nudge you ${when} at ${formatTime(s.time)} to log your spending.`;
};

export const StepReminder: React.FC<StepReminderProps> = ({ schedule, onChange }) => (
  <div>
    <StepHeading
      title="Want a gentle nudge?"
      subtitle="Logging works best as a small daily habit. Pick a time when your day is winding down."
    />

    {/* Enable toggle */}
    <button
      type="button"
      onClick={() => onChange({ ...schedule, enabled: !schedule.enabled })}
      aria-pressed={schedule.enabled}
      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 transition-colors ${
        schedule.enabled ? 'border-primary/40 bg-primary/8' : 'border-border bg-card/70'
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
            schedule.enabled ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
          }`}
        >
          {schedule.enabled ? <BellRing size={17} /> : <BellOff size={17} />}
        </span>
        <span className="text-left">
          <span className="block text-xs font-semibold text-foreground">Logging reminder</span>
          <span className="block text-[10px] text-muted-foreground">
            {schedule.enabled ? 'On — Terry will check in' : 'Off — no nudges'}
          </span>
        </span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          schedule.enabled ? 'bg-primary' : 'bg-border'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${
            schedule.enabled ? 'right-0.5' : 'left-0.5'
          }`}
        />
      </span>
    </button>

    <AnimatePresence initial={false}>
      {schedule.enabled && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden"
        >
          <SectionLabel>How often</SectionLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq.id}
                type="button"
                onClick={() => onChange({ ...schedule, frequency: freq.id })}
                className={`rounded-xl border px-2 py-2.5 text-[11px] font-semibold transition-colors ${
                  schedule.frequency === freq.id
                    ? 'border-primary/50 bg-primary/12 text-primary'
                    : 'border-border bg-card/70 text-muted-foreground hover:bg-card hover:text-foreground'
                }`}
              >
                {freq.label}
              </button>
            ))}
          </div>

          <AnimatePresence initial={false}>
            {schedule.frequency === 'weekly' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => onChange({ ...schedule, weekday: i })}
                      className={`h-9 w-11 rounded-lg border text-[11px] font-bold transition-colors ${
                        schedule.weekday === i
                          ? 'border-primary/50 bg-primary/12 text-primary'
                          : 'border-border bg-card/70 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <SectionLabel>What time</SectionLabel>
          <label className="flex items-center gap-2.5 rounded-xl border border-border bg-card/70 px-3.5 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Clock size={16} />
            </span>
            <input
              type="time"
              value={schedule.time}
              onChange={(e) => onChange({ ...schedule, time: e.target.value || schedule.time })}
              className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
            />
          </label>
        </motion.div>
      )}
    </AnimatePresence>

    <motion.p
      key={previewLine(schedule)}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-xl bg-muted/50 px-3.5 py-3 text-[11px] leading-relaxed text-muted-foreground"
    >
      {previewLine(schedule)}
    </motion.p>
  </div>
);
