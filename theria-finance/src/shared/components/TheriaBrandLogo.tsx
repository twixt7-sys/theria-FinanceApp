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
  size?: 'default' | 'compact' | 'lg';
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
  const sharedTextSize =
    size === 'compact'
      ? 'text-[8px] tracking-wide'
      : size === 'lg'
        ? 'text-xs uppercase tracking-[0.14em]'
        : 'text-[9px] uppercase tracking-[0.16em]';

  const title = (
    <p
      className={cn(
        'font-bold leading-none text-foreground',
        sharedTextSize,
      )}
    >
      Theria
    </p>
  );
  const subtitle = (
    <p
      className={cn(
        'font-semibold leading-none text-primary/90',
        sharedTextSize,
      )}
    >
      Finance
    </p>
  );

  return (
    <div
      className={cn(
        'min-w-0 text-left',
        layout === 'stack' && 'flex flex-col items-start justify-center gap-0',
        className,
      )}
    >
      {layout === 'inline' ? (
        <div className="flex items-baseline gap-0.5">
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
        <p
          className={cn(
            'mt-1.5 text-[10px] leading-snug text-muted-foreground',
            sloganClassName,
          )}
        >
          {BRAND_SLOGAN}
        </p>
      )}
    </div>
  );
};

export { BRAND_SLOGAN };
