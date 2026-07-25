import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryCarouselProps {
  /** Children are laid out as snap-aligned slides. */
  children: React.ReactNode;
  /** How many slides are visible at once. */
  perPage?: number;
  /** Gap between slides (tailwind gap class suffix in rem, used for width math). */
  gapRem?: number;
  ariaLabel?: string;
  className?: string;
}

/**
 * Horizontal, swipeable carousel used to lay out the items inside a category
 * group. Mirrors the paging/dot affordances of QuickActionsCarousel so the
 * accounts module feels consistent with the rest of the app.
 */
export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  children,
  perPage = 2,
  gapRem = 0.75,
  ariaLabel = 'Items',
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const items = React.Children.toArray(children).filter(Boolean);

  const measure = () => {
    const el = scrollRef.current;
    if (!el) return;
    const pages = Math.max(1, Math.ceil(el.scrollWidth / Math.max(el.clientWidth, 1)));
    setPageCount(pages);
    setPage((p) => Math.min(p, pages - 1));
  };

  useLayoutEffect(measure, [items.length, perPage]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
    setPage(Math.min(Math.max(next, 0), pageCount - 1));
  };

  const scrollToPage = (target: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.min(Math.max(target, 0), pageCount - 1);
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  const slideWidth = `calc((100% - ${(perPage - 1) * gapRem}rem) / ${perPage})`;
  const showControls = pageCount > 1;

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5">
        {showControls && (
          <button
            type="button"
            onClick={() => scrollToPage(page - 1)}
            disabled={page === 0}
            aria-label={`Previous ${ariaLabel.toLowerCase()}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ gap: `${gapRem}rem` }}
        >
          {items.map((child, i) => (
            <div
              key={(child as React.ReactElement)?.key ?? i}
              className="shrink-0 snap-start"
              style={{ width: slideWidth }}
            >
              {child}
            </div>
          ))}
        </div>

        {showControls && (
          <button
            type="button"
            onClick={() => scrollToPage(page + 1)}
            disabled={page === pageCount - 1}
            aria-label={`Next ${ariaLabel.toLowerCase()}`}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-35"
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {showControls && (
        <div className="mt-1 flex items-center justify-center gap-1.5">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToPage(i)}
              aria-label={`Go to page ${i + 1}`}
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
