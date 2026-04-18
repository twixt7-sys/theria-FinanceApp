import React from 'react';
import { Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
  const formatDisplay = () => {
    const date = currentDate;

    switch (timeFilter) {
      case 'day':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

      case 'week': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return `${weekStart.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })} - ${weekEnd.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })}`;
      }

      case 'month':
        return date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });

      case 'quarter': {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      }

      case 'year':
        return date.getFullYear().toString();

      case 'custom': {
        // Try to get custom range from sessionStorage
        const customRange = sessionStorage.getItem('customDateRange');
        if (customRange) {
          try {
            const { startDate, endDate } = JSON.parse(customRange);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return `${start.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })} - ${end.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}`;
          } catch (e) {
            return 'Custom Range';
          }
        }
        return 'Custom Range';
      }

      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-23.5 left-4 z-40"
          onClick={onClick}
        >
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-full shadow-lg px-6 py-3 min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer hover:bg-card/80 transition-colors">
            <div className="flex items-center gap-2 text-start">
              <Calendar size={12} className="text-muted-foreground mr-2" />
              <div>
                <div className="text-[10px] font-semibold text-foreground capitalize leading-tight">
                  {timeFilter === 'custom' ? 'Custom' : timeFilter}
                </div>
                <div className="text-[10px] font-medium text-muted-foreground leading-tight">
                  {formatDisplay()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
