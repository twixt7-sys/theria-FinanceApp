export type ThemeMode = 'dark' | 'light';

export type ColorThemeId =
  | 'emerald'
  | 'pink'
  | 'ocean'
  | 'violet'
  | 'amber'
  | 'rose';

export type CssThemeTokens = Record<string, string>;

export interface ColorThemeDefinition {
  id: ColorThemeId;
  label: string;
  tagline: string;
  swatch: string;
  modes: Record<ThemeMode, CssThemeTokens>;
}

export function getNextThemeMode(current: ThemeMode): ThemeMode {
  return current === 'dark' ? 'light' : 'dark';
}

export const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  dark: 'Dark',
  light: 'Light',
};

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

function buildTokens(config: {
  primary: string;
  secondary: string;
  accent: string;
  light: { muted: string; fg: string };
  dark: { bg: string; card: string; muted: string; fg: string };
}): Record<ThemeMode, CssThemeTokens> {
  const shared = {
    '--primary': config.primary,
    '--primary-foreground': '#FFFFFF',
    '--secondary': config.secondary,
    '--secondary-foreground': '#FFFFFF',
    '--accent': config.accent,
    '--accent-foreground': '#FFFFFF',
    '--destructive': '#EF4444',
    '--destructive-foreground': '#FFFFFF',
    '--ring': config.primary,
    '--chart-1': config.primary,
    '--chart-2': config.secondary,
    '--chart-3': config.accent,
    '--chart-4': '#F59E0B',
    '--chart-5': '#EF4444',
    '--income': '#10B981',
    '--expense': '#EF4444',
    '--radius': '0.75rem',
    // Scales the rem grid on narrow phones so they render the same content
    // as a 386px-wide design frame; desktops (>=386px) stay at 16px.
    '--font-size': 'clamp(13px, calc(100vw * 16 / 386), 16px)',
    '--font-weight-medium': '500',
    '--font-weight-normal': '400',
    '--switch-background': config.light.muted,
    '--input': 'transparent',
  };

  return {
    light: {
      ...shared,
      '--background': '#FFFFFF',
      '--foreground': config.light.fg,
      '--card': '#FFFFFF',
      '--card-foreground': config.light.fg,
      '--popover': '#FFFFFF',
      '--popover-foreground': config.light.fg,
      '--muted': '#F4F4F5',
      '--muted-foreground': '#71717A',
      '--border': rgba(config.primary, 0.14),
      '--input-background': '#FFFFFF',
      '--sidebar': '#FFFFFF',
      '--sidebar-foreground': config.light.fg,
      '--sidebar-primary': config.primary,
      '--sidebar-primary-foreground': '#FFFFFF',
      '--sidebar-accent': '#F4F4F5',
      '--sidebar-accent-foreground': config.light.fg,
      '--sidebar-border': rgba(config.primary, 0.12),
      '--sidebar-ring': config.primary,
    },
    dark: {
      ...shared,
      '--background': config.dark.bg,
      '--foreground': config.dark.fg,
      '--card': config.dark.card,
      '--card-foreground': config.dark.fg,
      '--popover': config.dark.card,
      '--popover-foreground': config.dark.fg,
      '--muted': config.dark.muted,
      '--muted-foreground': '#9CA3AF',
      '--border': rgba(config.primary, 0.22),
      '--input': rgba(config.primary, 0.12),
      '--input-background': config.dark.muted,
      '--sidebar': config.dark.card,
      '--sidebar-foreground': config.dark.fg,
      '--sidebar-primary': config.primary,
      '--sidebar-primary-foreground': '#FFFFFF',
      '--sidebar-accent': config.dark.muted,
      '--sidebar-accent-foreground': config.dark.fg,
      '--sidebar-border': rgba(config.primary, 0.22),
      '--sidebar-ring': config.primary,
      '--switch-background': config.dark.muted,
    },
  };
}

export const COLOR_THEMES: ColorThemeDefinition[] = [
  {
    id: 'emerald',
    label: 'Emerald',
    tagline: 'Fresh finance green',
    swatch: '#10B981',
    modes: buildTokens({
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      light: { muted: '#F4F4F5', fg: '#052E16' },
      dark: { bg: '#0A0F0D', card: '#1A2420', muted: '#2D3832', fg: '#E8F5E9' },
    }),
  },
  {
    id: 'pink',
    label: 'Blush',
    tagline: 'Soft pink accents',
    swatch: '#EC4899',
    modes: buildTokens({
      primary: '#EC4899',
      secondary: '#DB2777',
      accent: '#F472B6',
      light: { muted: '#F4F4F5', fg: '#500724' },
      dark: { bg: '#120A0F', card: '#1F1219', muted: '#352029', fg: '#FCE7F3' },
    }),
  },
  {
    id: 'ocean',
    label: 'Ocean',
    tagline: 'Cool blue waters',
    swatch: '#0EA5E9',
    modes: buildTokens({
      primary: '#0EA5E9',
      secondary: '#0284C7',
      accent: '#38BDF8',
      light: { muted: '#F4F4F5', fg: '#0C4A6E' },
      dark: { bg: '#071018', card: '#101C28', muted: '#1E3040', fg: '#E0F2FE' },
    }),
  },
  {
    id: 'violet',
    label: 'Violet',
    tagline: 'Rich purple tones',
    swatch: '#8B5CF6',
    modes: buildTokens({
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A78BFA',
      light: { muted: '#F4F4F5', fg: '#3B0764' },
      dark: { bg: '#0E0A14', card: '#1A1424', muted: '#2A2238', fg: '#EDE9FE' },
    }),
  },
  {
    id: 'amber',
    label: 'Amber',
    tagline: 'Warm golden glow',
    swatch: '#F59E0B',
    modes: buildTokens({
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FBBF24',
      light: { muted: '#F4F4F5', fg: '#451A03' },
      dark: { bg: '#100C06', card: '#1C160C', muted: '#302818', fg: '#FEF3C7' },
    }),
  },
  {
    id: 'rose',
    label: 'Rose',
    tagline: 'Bold coral red',
    swatch: '#F43F5E',
    modes: buildTokens({
      primary: '#F43F5E',
      secondary: '#E11D48',
      accent: '#FB7185',
      light: { muted: '#F4F4F5', fg: '#4C0519' },
      dark: { bg: '#11080A', card: '#1E1014', muted: '#341820', fg: '#FFE4E6' },
    }),
  },
];

export const COLOR_THEME_MAP = Object.fromEntries(
  COLOR_THEMES.map((theme) => [theme.id, theme]),
) as Record<ColorThemeId, ColorThemeDefinition>;

export const DEFAULT_COLOR_THEME: ColorThemeId = 'emerald';
export const DEFAULT_THEME_MODE: ThemeMode = 'dark';

export function getThemeTokens(
  palette: ColorThemeId,
  mode: ThemeMode,
): CssThemeTokens {
  return COLOR_THEME_MAP[palette]?.modes[mode] ?? COLOR_THEME_MAP.emerald.modes[mode];
}

export const CSS_TOKEN_KEYS = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--destructive-foreground',
  '--border',
  '--input',
  '--input-background',
  '--switch-background',
  '--ring',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--sidebar',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-ring',
  '--income',
  '--expense',
] as const;
