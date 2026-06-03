import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';

const demoNotifications = [
  { id: '1', title: 'Budget nearing limit', message: 'Groceries budget is at 85% for this month.', type: 'warning', time: '2h ago' },
  { id: '2', title: 'Savings milestone', message: 'You hit 75% of your annual savings goal.', type: 'success', time: '1d ago' },
  { id: '3', title: 'New record added', message: 'Expense of $120 was logged to Transportation.', type: 'info', time: '3d ago' },
];

export const NotificationsScreen: React.FC = () => {
  const getTone = (type: string) => {
    switch (type) {
      case 'warning':
        return { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="text-amber-500" size={18} /> };
      case 'success':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="text-emerald-600" size={18} /> };
      default:
        return { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Info className="text-blue-600" size={18} /> };
    }
  };

  return (
    <div className="space-y-3 pb-6 max-w-4xl mx-auto">
      <SimpleModeHint page="notifications" />
      <div className="space-y-2.5">
        {demoNotifications.map((note) => {
          const tone = getTone(note.type);
          return (
            <div
              key={note.id}
              className={`rounded-xl border ${tone.border} ${tone.bg} dark:bg-card dark:border-border p-3.5 shadow-sm`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{tone.icon}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{note.title}</p>
                    <span className="text-xs text-muted-foreground">{note.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{note.message}</p>
                </div>
              </div>
            </div>
          );
        })}

        {demoNotifications.length === 0 && (
          <EmptyState
            title="No notifications"
            hint="You're all caught up for now"
          />
        )}
      </div>
    </div>
  );
};
