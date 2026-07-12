import React from 'react';
import { cn } from './ui/utils';

const BRAND_SLOGAN = 'Know your money. Move with purpose.';

/**
 * Theria Finance logomark — vector version of "Theria Finance Logo.png" at the
 * repo root. The same artwork lives in public/logo.svg and
 * scripts/generate-icons.mjs; keep all three in sync after branding changes.
 */
export const TheriaLogoMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 275 310" className={className} aria-hidden>
    {/* gray hexagon-half brackets */}
    <g
      fill="none"
      stroke="#878787"
      strokeWidth="33"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M104 27 L31 89 L31 182" />
      <path d="M171 283 L244 221 L244 128" />
    </g>
    {/* green F with angled terminals; self-stroke softens the corners */}
    <path
      d="M125 91 L210 91 L195 122 L130 122 L130 152 L185 152 L170 183 L130 183 L130 228 L100 242 L100 112 Z"
      fill="#2A633A"
      stroke="#2A633A"
      strokeWidth="7"
      strokeLinejoin="round"
    />
  </svg>
);

type TheriaBrandLogoProps = {
  size?: 'sm' | 'md';
  className?: string;
};

export const TheriaBrandLogo: React.FC<TheriaBrandLogoProps> = ({ size = 'sm', className }) => {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-black/10 shadow-md',
        size === 'sm' ? 'h-8 w-8 rounded-xl' : 'h-10 w-10 rounded-2xl shadow-lg',
        className,
      )}
    >
      <TheriaLogoMark className="h-[62%] w-auto" />
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
