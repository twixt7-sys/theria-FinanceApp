import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  circleClass: string;
  iconClass: string;
  onClick?: () => void;
}

interface QuickActionsCarouselProps {
  actions: QuickAction[];
}

const PER_PAGE = 3;

export const QuickActionsCarousel: React.FC<QuickActionsCarouselProps> = ({ actions }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  if (actions.length === 0) return null;

  const pageCount = Math.ceil(actions.length / PER_PAGE);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setPage(Math.min(Math.max(next, 0), pageCount - 1));
  };

  const scrollToPage = (target: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.min(Math.max(target, 0), pageCount - 1);
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div>
      <p className="text-center text-xs font-semibold text-muted-foreground">Quick actions</p>

      <div className="mt-2.5 flex items-center gap-1.5">
        {pageCount > 1 && (
          <button
            type="button"
            onClick={() => scrollToPage(page - 1)}
            disabled={page === 0}
            aria-label="Previous actions"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex min-w-0 flex-1 snap-x snap-mandatory gap-1.5 overflow-x-auto overscroll-x-contain pb-1.5 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                type="button"
                onClick={action.onClick}
                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.92 }}
                className="group flex w-[calc((100%-0.75rem)/3)] shrink-0 snap-start flex-col items-center gap-1.5"
              >
                <span
                  className={`flex aspect-square w-[68%] max-w-[80px] items-center justify-center rounded-full ${action.circleClass}`}
                >
                  <Icon
                    size={22}
                    strokeWidth={2}
                    className={`transition-transform duration-200 group-hover:scale-110 ${action.iconClass}`}
                  />
                </span>
                <span className="w-full truncate text-center text-[11px] font-medium text-muted-foreground">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {pageCount > 1 && (
          <button
            type="button"
            onClick={() => scrollToPage(page + 1)}
            disabled={page === pageCount - 1}
            aria-label="Next actions"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {pageCount > 1 && (
        <div className="mt-1 flex items-center justify-center gap-1.5">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToPage(i)}
              aria-label={`Go to actions page ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                page === i ? 'w-4 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
