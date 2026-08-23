import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCheck, Archive, Trash2, RotateCcw, Eye } from '@/shared/icons';
import { SimpleModeHint } from '../../../shared/components/SimpleModeHint';
import { EmptyState } from '../../../shared/components/EmptyState';
import { CapsuleSelector } from '../../../shared/components/CapsuleSelector';
import { Button } from '../../../shared/components/ui/button';
import { SwipeableNotification } from '../components/SwipeableNotification';
import { useNotifications } from '../lib/useNotifications';

type Tab = 'active' | 'archived';

/** Shared exit/enter used for every row so bulk and single actions match. */
const rowMotion = {
  layout: true,
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } },
  transition: { type: 'spring', stiffness: 500, damping: 40 },
} as const;

export const NotificationsScreen: React.FC = () => {
  const [tab, setTab] = useState<Tab>('active');
  const {
    active,
    archived,
    markRead,
    swipeActive,
    swipeArchived,
    markAllRead,
    archiveAll,
    deleteAllArchived,
  } = useNotifications();

  return (
    <div className="space-y-3 pb-6 max-w-4xl mx-auto">
      <SimpleModeHint page="notifications" />

      <CapsuleSelector<Tab>
        id="notifications-tabs"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'active', label: `Active${active.length ? ` (${active.length})` : ''}` },
          {
            value: 'archived',
            label: `Archived${archived.length ? ` (${archived.length})` : ''}`,
          },
        ]}
      />

      {tab === 'active' ? (
        <>
          {active.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={markAllRead}>
                <CheckCheck size={16} />
                Mark all as read
              </Button>
              <Button variant="outline" size="sm" onClick={archiveAll}>
                <Archive size={16} />
                Archive all
              </Button>
            </div>
          )}

          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {active.map((note) => (
                <motion.div key={note.id} {...rowMotion}>
                  <SwipeableNotification
                    note={note}
                    rightHint={{
                      icon: <Eye size={18} />,
                      label: 'Seen',
                      className: 'bg-blue-500',
                    }}
                    leftHint={
                      note.seen
                        ? { icon: <Archive size={18} />, label: 'Archive', className: 'bg-amber-500' }
                        : { icon: <Eye size={18} />, label: 'Seen', className: 'bg-blue-500' }
                    }
                    onSwipe={(direction) => swipeActive(note.id, direction)}
                    onClick={() => markRead(note.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {active.length === 0 && (
              <EmptyState title="No notifications" hint="You're all caught up for now" />
            )}
          </div>
        </>
      ) : (
        <>
          {archived.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={deleteAllArchived}>
                <Trash2 size={16} />
                Delete all
              </Button>
            </div>
          )}

          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {archived.map((note) => (
                <motion.div key={note.id} {...rowMotion}>
                  <SwipeableNotification
                    note={note}
                    rightHint={{
                      icon: <RotateCcw size={18} />,
                      label: 'Restore',
                      className: 'bg-emerald-500',
                    }}
                    leftHint={{
                      icon: <Trash2 size={18} />,
                      label: 'Delete',
                      className: 'bg-red-500',
                    }}
                    onSwipe={(direction) => swipeArchived(note.id, direction)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {archived.length === 0 && (
              <EmptyState title="Nothing archived" hint="Archived notifications land here" />
            )}
          </div>
        </>
      )}
    </div>
  );
};
