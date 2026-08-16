/**
 * Central icon registry — the single source of truth for icons across the app.
 *
 * Import icons from `@/shared/icons` instead of directly from `lucide-react`
 * so the whole app routes through one module (DRY). Swapping the icon set,
 * aliasing an icon, or adding custom icons becomes a one-file change here.
 *
 * Usage:
 *   import { Wallet, ChevronRight } from '@/shared/icons';
 *   import { IconComponent } from '@/shared/icons'; // dynamic, by-name lookup
 */
export * from 'lucide-react';
export type { LucideIcon, LucideProps } from 'lucide-react';

// Dynamic, name-based icon renderer (single global component).
export { IconComponent } from './components/IconComponent';
