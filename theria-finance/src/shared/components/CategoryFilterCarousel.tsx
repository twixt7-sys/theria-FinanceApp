import React from 'react';
import { motion } from 'motion/react';
import { IconComponent } from './IconComponent';

export interface FilterCategory {
  id: string;
  name: string;
  iconName?: string;
  color?: string;
}

interface CategoryFilterCarouselProps {
  categories: FilterCategory[];
  /** Selected category id, or 'all'. */
  value: string;
  onChange: (id: string) => void;
  /** Icon used when a category has none of its own. */
  fallbackIcon?: string;
  className?: string;
}

/**
 * A horizontally scrollable carousel of category filter pills — an "All" pill
 * followed by one per category. No arrows: it scrolls (swipe / trackpad /
 * wheel) and hides its scrollbar, so it stays compact on mobile while holding
 * any number of categories.
 */
export const CategoryFilterCarousel: React.FC<CategoryFilterCarouselProps> = ({
  categories,
  value,
  onChange,
  fallbackIcon = 'Folder',
  className = '',
}) => {
  const pillClass = (active: boolean) =>
    `shrink-0 snap-start whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1 ${
      active
        ? 'bg-primary text-white shadow'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    }`;

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className={`flex snap-x items-center gap-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      <motion.button
        type="button"
        onClick={() => onChange('all')}
        className={pillClass(value === 'all')}
        title="All categories"
        whileTap={{ scale: 0.95 }}
      >
        All
      </motion.button>
      {categories.map((cat) => (
        <motion.button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          className={pillClass(value === cat.id)}
          title={cat.name}
          whileTap={{ scale: 0.95 }}
        >
          <IconComponent name={cat.iconName || fallbackIcon} size={12} className="shrink-0" />
          <span>{cat.name}</span>
        </motion.button>
      ))}
    </div>
  );
};
