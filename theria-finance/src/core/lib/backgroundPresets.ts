import type { CSSProperties } from 'react';

export type BackgroundStyleId =
  | 'solid'
  | 'soft'
  | 'gradient'
  | 'mesh'
  | 'dots'
  | 'grid'
  | 'aurora';

export interface BackgroundStyleDefinition {
  id: BackgroundStyleId;
  label: string;
  tagline: string;
}

export const BACKGROUND_STYLES: BackgroundStyleDefinition[] = [
  { id: 'solid', label: 'Solid', tagline: 'Clean flat background' },
  { id: 'soft', label: 'Soft glow', tagline: 'Gentle accent halo' },
  { id: 'gradient', label: 'Gradient', tagline: 'Smooth color fade' },
  { id: 'mesh', label: 'Mesh', tagline: 'Layered color pools' },
  { id: 'dots', label: 'Dots', tagline: 'Subtle dot pattern' },
  { id: 'grid', label: 'Grid', tagline: 'Fine line grid' },
  { id: 'aurora', label: 'Aurora', tagline: 'Flowing accent bands' },
];

export const DEFAULT_BACKGROUND: BackgroundStyleId = 'solid';

export const BACKGROUND_CSS_KEYS = [
  '--app-background-image',
  '--app-background-size',
  '--app-background-position',
  '--app-background-repeat',
] as const;

const ALLOWED_BACKGROUNDS = new Set(BACKGROUND_STYLES.map((s) => s.id));

export function isBackgroundStyleId(value: unknown): value is BackgroundStyleId {
  return typeof value === 'string' && ALLOWED_BACKGROUNDS.has(value as BackgroundStyleId);
}

function rgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getBackgroundCssVars(
  id: BackgroundStyleId,
  primary: string,
  isDark: boolean,
): Record<string, string> {
  const a1 = isDark ? 0.22 : 0.14;
  const a2 = isDark ? 0.14 : 0.08;
  const a3 = isDark ? 0.1 : 0.06;
  const dotColor = isDark ? 'rgba(255,255,255,0.06)' : rgba(primary, 0.12);
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : rgba(primary, 0.08);

  switch (id) {
    case 'solid':
      return {
        '--app-background-image': 'none',
        '--app-background-size': 'auto',
        '--app-background-position': 'center',
        '--app-background-repeat': 'no-repeat',
      };
    case 'soft':
      return {
        '--app-background-image': `radial-gradient(ellipse 90% 55% at 50% -15%, ${rgba(primary, a1)}, transparent 70%)`,
        '--app-background-size': '100% 100%',
        '--app-background-position': 'center top',
        '--app-background-repeat': 'no-repeat',
      };
    case 'gradient':
      return {
        '--app-background-image': `linear-gradient(165deg, ${rgba(primary, a1)} 0%, transparent 45%, ${rgba(primary, a3)} 100%)`,
        '--app-background-size': '100% 100%',
        '--app-background-position': 'center',
        '--app-background-repeat': 'no-repeat',
      };
    case 'mesh':
      return {
        '--app-background-image': [
          `radial-gradient(circle at 15% 20%, ${rgba(primary, a1)}, transparent 42%)`,
          `radial-gradient(circle at 85% 10%, ${rgba(primary, a2)}, transparent 38%)`,
          `radial-gradient(circle at 70% 85%, ${rgba(primary, a2)}, transparent 40%)`,
        ].join(', '),
        '--app-background-size': '100% 100%',
        '--app-background-position': 'center',
        '--app-background-repeat': 'no-repeat',
      };
    case 'dots':
      return {
        '--app-background-image': `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
        '--app-background-size': '18px 18px',
        '--app-background-position': '0 0',
        '--app-background-repeat': 'repeat',
      };
    case 'grid':
      return {
        '--app-background-image': [
          `linear-gradient(${gridColor} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
        ].join(', '),
        '--app-background-size': '28px 28px',
        '--app-background-position': 'center',
        '--app-background-repeat': 'repeat',
      };
    case 'aurora':
      return {
        '--app-background-image': [
          `linear-gradient(115deg, transparent 30%, ${rgba(primary, a2)} 48%, transparent 62%)`,
          `linear-gradient(245deg, transparent 35%, ${rgba(primary, a3)} 50%, transparent 65%)`,
          `radial-gradient(ellipse 60% 40% at 50% 100%, ${rgba(primary, a1)}, transparent 70%)`,
        ].join(', '),
        '--app-background-size': '100% 100%',
        '--app-background-position': 'center',
        '--app-background-repeat': 'no-repeat',
      };
    default:
      return getBackgroundCssVars('solid', primary, isDark);
  }
}

export function getBackgroundPreviewStyle(
  id: BackgroundStyleId,
  primary: string,
  isDark: boolean,
): CSSProperties {
  const vars = getBackgroundCssVars(id, primary, isDark);
  const image = vars['--app-background-image'];
  return {
    backgroundColor: isDark ? '#0f0f0f' : '#fafafa',
    backgroundImage: image === 'none' ? undefined : image,
    backgroundSize: vars['--app-background-size'],
    backgroundPosition: vars['--app-background-position'],
    backgroundRepeat: vars['--app-background-repeat'],
  };
}

export const BACKGROUND_STYLE_MAP = Object.fromEntries(
  BACKGROUND_STYLES.map((style) => [style.id, style]),
) as Record<BackgroundStyleId, BackgroundStyleDefinition>;
