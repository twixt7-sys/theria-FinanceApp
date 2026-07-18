import React from 'react';
import { cn } from './ui/utils';

const BRAND_SLOGAN = 'Know your money. Move with purpose.';

/** Shared silhouettes so the flat and gradient treatments can never drift apart. */
const BRACKET_PATHS = ['M104 27 L31 89 L31 182', 'M171 283 L244 221 L244 128'] as const;
const F_PATH =
  'M125 91 L210 91 L195 122 L130 122 L130 152 L185 152 L170 183 L130 183 L130 228 L100 242 L100 112 Z';

/**
 * Theria Finance logomark — vector version of "Theria Finance Logo.png" at the
 * repo root. The same artwork lives in public/logo.svg and
 * scripts/generate-icons.mjs; keep all three in sync after branding changes.
 *
 * `variant="flat"` is the clean, gradient-free treatment used by the app icon
 * set (public/logo.svg, generate-icons.mjs); `gradient` adds the brushed-steel
 * and glossy sheen finish used in-app.
 */
export const TheriaLogoMark: React.FC<{
  className?: string;
  variant?: 'gradient' | 'flat';
}> = ({ className, variant = 'gradient' }) => {
  // Unique per-instance so gradient defs never collide when several logos mount.
  const uid = React.useId().replace(/:/g, '');
  const steelId = `theria-steel-${uid}`;
  const greenId = `theria-green-${uid}`;
  const sheenId = `theria-sheen-${uid}`;

  if (variant === 'flat') {
    return (
      <svg viewBox="0 0 275 310" className={className} aria-hidden>
        <g
          fill="none"
          stroke="#878787"
          strokeWidth="33"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {BRACKET_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <path d={F_PATH} fill="#2A633A" stroke="#2A633A" strokeWidth="7" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 275 310" className={className} aria-hidden>
      <defs>
        {/* brushed-graphite gradient for the hexagon brackets */}
        <linearGradient id={steelId} x1="20" y1="20" x2="255" y2="290" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#b9bfc6" />
          <stop offset="0.5" stopColor="#8a9096" />
          <stop offset="1" stopColor="#5f656b" />
        </linearGradient>
        {/* deep emerald gradient for the F */}
        <linearGradient id={greenId} x1="100" y1="91" x2="200" y2="242" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3a8a52" />
          <stop offset="0.55" stopColor="#2A633A" />
          <stop offset="1" stopColor="#1c4529" />
        </linearGradient>
        {/* soft top-light sheen laid over the F for a subtle glossy finish */}
        <linearGradient id={sheenId} x1="100" y1="91" x2="100" y2="242" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* graphite hexagon-half brackets */}
      <g
        fill="none"
        stroke={`url(#${steelId})`}
        strokeWidth="33"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {BRACKET_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {/* green F with angled terminals; self-stroke softens the corners */}
      <path
        d={F_PATH}
        fill={`url(#${greenId})`}
        stroke="#1c4529"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      {/* glossy sheen — same F silhouette, painted on top */}
      <path d={F_PATH} fill={`url(#${sheenId})`} />
    </svg>
  );
};

type TheriaBrandLogoProps = {
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'gradient' | 'flat';
};

export const TheriaBrandLogo: React.FC<TheriaBrandLogoProps> = ({
  size = 'sm',
  className,
  variant,
}) => {
  // The logomark is placed bare — no plate, ring, or rounded frame — so it reads
  // as a big, solid brand icon that sits directly on the surface behind it.
  return (
    <TheriaLogoMark
      variant={variant}
      className={cn(
        'w-auto shrink-0',
        size === 'sm' ? 'h-9' : 'h-11',
        className,
      )}
    />
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
