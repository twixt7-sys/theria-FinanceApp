import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell size={18} className="text-primary" />
        <h2 className="text-lg font-semibold">Notifications</h2>
      </div>

      <div className="space-y-3">
        {demoNotifications.map((note) => {
          const tone = getTone(note.type);
          return (
            <div
              key={note.id}
              className={`rounded-2xl border ${tone.border} ${tone.bg} dark:bg-card dark:border-border p-4 shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{tone.icon}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{note.title}</p>
                    <span className="text-xs text-muted-foreground">{note.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{note.message}</p>
                </div>
              </div>
            </div>
          );
        })}

        {demoNotifications.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-2xl shadow-sm">
            <Bell size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="font-semibold">You&apos;re all caught up</p>
            <p className="text-sm text-muted-foreground">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};
