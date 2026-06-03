import React, { useEffect, useRef, useState } from 'react';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatTimeRangeDisplay } from '../lib/timeRangeDisplay';
import type { TimeFilterValue } from './TimeFilter';

interface FloatingTimeDisplayProps {
  isVisible: boolean;
  timeFilter: string;
  currentDate: Date;
  onClick?: () => void;
}

export const FloatingTimeDisplay: React.FC<FloatingTimeDisplayProps> = ({
  isVisible,
  timeFilter,
  currentDate,
  onClick,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  const scheduleIdleCollapse = React.useCallback(() => {
    if (idleTimerRef.current) {
      window.clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = window.setTimeout(() => {
      setIsCollapsed(true);
    }, 3000);
  }, []);

  const formatDisplay = () => formatTimeRangeDisplay(timeFilter as TimeFilterValue, currentDate);

  useEffect(() => {
    if (!isVisible) return;
    // Collapse only based on "unclicked for a while".
    scheduleIdleCollapse();
    return () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [isVisible, scheduleIdleCollapse]);

  const handlePillClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
      scheduleIdleCollapse();
      return;
    }
    onClick?.();
    scheduleIdleCollapse();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed left-4 z-40 bottom-[calc(6rem+env(safe-area-inset-bottom,0px))]"
          onClick={handlePillClick}
        >
          <motion.div
            layout
            animate={{
              width: isCollapsed ? 48 : 'auto',
              paddingLeft: isCollapsed ? 0 : 24,
              paddingRight: isCollapsed ? 0 : 24,
              paddingTop: isCollapsed ? 0 : 12,
              paddingBottom: isCollapsed ? 0 : 12,
            }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className={`bg-card/95 backdrop-blur-sm border border-border rounded-full min-h-[48px] flex items-center justify-center cursor-pointer hover:bg-card/80 transition-all overflow-hidden ${
              isCollapsed ? 'w-12 h-12 p-0 relative shadow-xl' : 'px-6 py-3 min-w-[48px] shadow-lg'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCollapsed ? (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.2 }}
                  className="relative flex h-12 w-12 items-center justify-center"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-blue-500/70"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.96, 1.04, 0.96] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  />
                  <Calendar size={16} className="text-blue-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 text-start whitespace-nowrap"
                >
                  <Calendar size={12} className="text-muted-foreground mr-2" />
                  <div>
                    <div className="text-[10px] font-semibold text-foreground capitalize leading-tight">
                      {timeFilter === 'custom' ? 'Custom' : timeFilter}
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground leading-tight">
                      {formatDisplay()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {isCollapsed && (
              <>
                <motion.div
                  className="absolute inset-[-1px] rounded-full border border-blue-500/45"
                  animate={{ opacity: [0.2, 0.65, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                />
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
