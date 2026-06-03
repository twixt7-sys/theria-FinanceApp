import React from 'react';
import { Wallet } from 'lucide-react';
import { cn } from './ui/utils';

const BRAND_SLOGAN = 'Know your money. Move with purpose.';

type TheriaBrandLogoProps = {
  size?: 'sm' | 'md';
  className?: string;
};

export const TheriaBrandLogo: React.FC<TheriaBrandLogoProps> = ({ size = 'sm', className }) => {
  const iconSize = size === 'sm' ? 15 : 18;

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary to-emerald-700 text-primary-foreground shadow-md',
        size === 'sm' ? 'h-8 w-8 rounded-xl' : 'h-10 w-10 rounded-2xl shadow-lg',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/5 to-transparent"
        aria-hidden
      />
      <Wallet size={iconSize} strokeWidth={2.25} className="relative z-[1]" aria-hidden />
    </div>
  );
};

type TheriaBrandWordmarkProps = {
  className?: string;
  layout?: 'stack' | 'inline';
  size?: 'default' | 'compact';
  showSlogan?: boolean;
  sloganClassName?: string;
};

export const TheriaBrandWordmark: React.FC<TheriaBrandWordmarkProps> = ({
  className,
  layout = 'stack',
  size = 'default',
  showSlogan = false,
  sloganClassName,
}) => {
  const compact = size === 'compact';

  const title = (
    <p
      className={cn(
        'font-bold capitalize leading-none text-foreground',
        compact ? 'text-xs' : 'text-sm',
      )}
    >
      Theria
    </p>
  );
  const subtitle = (
    <p
      className={cn(
        'font-semibold capitalize leading-none text-primary/90',
        compact
          ? 'text-[8px] tracking-wide'
          : 'text-[9px] uppercase tracking-[0.16em]',
      )}
    >
      Finance
    </p>
  );

  return (
    <div
      className={cn(
        'min-w-0 text-left',
        layout === 'stack' && 'flex flex-col items-start justify-center gap-0.5',
        className,
      )}
    >
      {layout === 'inline' ? (
        <div className="flex items-baseline gap-1.5">
          {title}
          {subtitle}
        </div>
      ) : (
        <>
          {title}
          {subtitle}
        </>
      )}
      {showSlogan && (
        <p className={cn('mt-1.5 text-[10px] leading-snug text-muted-foreground', sloganClassName)}>
          {BRAND_SLOGAN}
        </p>
      )}
    </div>
  );
};

export { BRAND_SLOGAN };
