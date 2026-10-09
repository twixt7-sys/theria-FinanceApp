import React from 'react';
import { IconComponent } from './IconComponent';

export type AccountDisplayStyle = 'card' | 'wallet' | 'vault';

interface AccountCardVisualProps {
  name: string;
  bankName?: string;
  /** Pre-formatted balance string (currency handled by the caller). */
  balanceText: string;
  categoryName?: string;
  accountNumber?: string;
  iconName: string;
  color: string;
  cardType?: 'debit' | 'credit' | 'checking' | 'savings' | 'none';
  isSavings?: boolean;
  displayStyle?: AccountDisplayStyle;
  /**
   * 'preview' is the tiny card inside the modal, 'full' the accounts list card,
   * and 'hero' the large, true-proportioned card on the account details page.
   */
  size?: 'preview' | 'full' | 'hero';
  className?: string;
}

/** Inverse of a hex colour — used for the multi-tone card gradient. */
const getOppositeColor = (hexColor: string): string => {
  const color = hexColor.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const inv = (n: number) => (255 - n).toString(16).padStart(2, '0');
  return `#${inv(r)}${inv(g)}${inv(b)}`;
};

/** Per-size measurements, so each treatment below scales from one table. */
const SIZES = {
  preview: {
    root: 'min-h-[84px] p-2',
    radius: 'rounded-lg',
    chip: 'w-4 h-4',
    chipIcon: 8,
    walletChip: 'w-6 h-6',
    walletChipIcon: 11,
    name: 'text-[10px]',
    sub: 'text-[8px]',
    number: 'text-[8px]',
    badge: 'px-1 py-0.5 text-[6px]',
    label: 'text-[6px]',
    balance: 'text-[11px]',
    bigIcon: 40,
    dial: '-right-4 -bottom-4 w-16 h-16',
  },
  full: {
    root: 'min-h-[104px] p-2.5',
    radius: 'rounded-lg',
    chip: 'w-6 h-6',
    chipIcon: 11,
    walletChip: 'w-9 h-9',
    walletChipIcon: 16,
    name: 'text-xs',
    sub: 'text-[8px]',
    number: 'text-[8px]',
    badge: 'px-1 py-0.5 text-[7px]',
    label: 'text-[8px]',
    balance: 'text-lg',
    bigIcon: 44,
    dial: '-right-5 -bottom-5 w-24 h-24',
  },
  hero: {
    // Bank-card proportions (85.6 × 54 mm); flex so the rows spread over the height.
    root: 'aspect-[1.586] flex flex-col p-4 sm:p-5',
    radius: 'rounded-2xl',
    chip: 'w-10 h-10',
    chipIcon: 18,
    walletChip: 'w-11 h-11',
    walletChipIcon: 20,
    name: 'text-base',
    sub: 'text-xs',
    number: 'text-sm sm:text-base',
    badge: 'px-2 py-0.5 text-[10px]',
    label: 'text-[11px]',
    balance: 'text-2xl sm:text-3xl',
    bigIcon: 72,
    dial: '-right-8 -bottom-8 w-40 h-40',
  },
} as const;

const cardTypeLabel = (cardType?: string) =>
  cardType === 'checking'
    ? 'Checking'
    : cardType === 'savings'
    ? 'Savings'
    : cardType === 'debit'
    ? 'Debit'
    : cardType === 'credit'
    ? 'Credit'
    : null;

/**
 * Renders a single account "card" in one of three dynamic-colour treatments:
 * a glossy bank card, a soft wallet billfold, or a dark vault. Shared by the
 * add/edit modal preview and the accounts list so both always match.
 */
export const AccountCardVisual: React.FC<AccountCardVisualProps> = ({
  name,
  bankName,
  balanceText,
  categoryName,
  accountNumber,
  iconName,
  color,
  cardType,
  isSavings,
  displayStyle = 'card',
  size = 'full',
  className = '',
}) => {
  const opposite = getOppositeColor(color);
  const typeLabel = cardType && cardType !== 'none' ? cardTypeLabel(cardType) : null;
  const s = SIZES[size];

  const Badges = (invert = false) => (
    <div className="flex items-center gap-1">
      {typeLabel && (
        <span
          className={`backdrop-blur-sm rounded-full font-medium ${s.badge} ${
            invert ? 'bg-black/10 text-foreground' : 'bg-white/20 text-white'
          }`}
        >
          {typeLabel}
        </span>
      )}
      {isSavings && (
        <span
          className={`backdrop-blur-sm rounded-full font-medium ${s.badge} ${
            invert ? 'bg-black/10 text-foreground' : 'bg-white/20 text-white'
          }`}
        >
          Savings
        </span>
      )}
    </div>
  );

  // ---- WALLET: soft light billfold with a coloured pocket band ---------------
  if (displayStyle === 'wallet') {
    return (
      <div
        className={`relative rounded-2xl border border-border bg-card overflow-hidden shadow-md ${s.root} ${className}`}
        style={{ background: `linear-gradient(160deg, ${color}1f, transparent 60%)` }}
      >
        {/* pocket band */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 rounded-t-[40%]"
          style={{ background: `linear-gradient(180deg, ${color}26, ${color}10)` }}
          aria-hidden
        />
        <div className="relative z-10 h-full flex-1 flex flex-col justify-between gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`${s.walletChip} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}
                style={{ backgroundColor: color }}
              >
                <IconComponent name={iconName} size={s.walletChipIcon} style={{ color: 'white' }} />
              </span>
              <div className="min-w-0">
                <h3 className={`font-bold text-foreground truncate ${s.name}`}>{name || 'Account Name'}</h3>
                {bankName && <p className={`text-muted-foreground truncate ${s.sub}`}>{bankName}</p>}
              </div>
            </div>
            {Badges(true)}
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-muted-foreground ${s.label}`}>Balance</p>
              <p className={`font-bold leading-none truncate ${s.balance}`} style={{ color }}>
                {balanceText}
              </p>
            </div>
            {categoryName && (
              <p className={`text-muted-foreground truncate text-right max-w-[45%] ${s.label}`}>{categoryName}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- VAULT: dark metallic with a coloured combination dial -----------------
  if (displayStyle === 'vault') {
    return (
      <div
        className={`relative ${s.radius} overflow-hidden shadow-lg ${s.root} ${className}`}
        style={{ background: 'linear-gradient(145deg, #232a35, #0b1017)' }}
      >
        {/* rivets */}
        <div className="absolute inset-1.5 rounded-md border border-white/10" aria-hidden />
        {/* combination dial */}
        <div
          className={`absolute ${s.dial} rounded-full opacity-80`}
          style={{ border: `3px solid ${color}`, boxShadow: `0 0 0 4px ${color}22, inset 0 0 0 6px #0b1017` }}
          aria-hidden
        >
          <div
            className="absolute left-1/2 top-1/2 h-1/2 w-0.5 -translate-x-1/2 origin-bottom"
            style={{ backgroundColor: color, transform: 'translateX(-50%) rotate(35deg)' }}
          />
        </div>

        <div className="relative z-10 h-full flex-1 flex flex-col justify-between gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`${s.chip} rounded flex items-center justify-center shrink-0 ring-1 ring-white/20`}
                style={{ backgroundColor: `${color}` }}
              >
                <IconComponent name={iconName} size={s.chipIcon} style={{ color: 'white' }} />
              </span>
              <div className="min-w-0">
                <h3 className={`font-bold text-white truncate ${s.name}`}>{name || 'Account Name'}</h3>
                {bankName && <p className={`text-white/60 truncate ${s.sub}`}>{bankName}</p>}
              </div>
            </div>
            {Badges(false)}
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-white/50 uppercase tracking-widest ${s.label}`}>Vault</p>
              <p className={`text-white font-bold leading-none truncate ${s.balance}`}>{balanceText}</p>
            </div>
            {categoryName && (
              <p className={`text-white/50 truncate text-right max-w-[40%] ${s.label}`}>{categoryName}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- CARD (default): glossy bank card --------------------------------------
  return (
    <div
      className={`relative ${s.radius} overflow-hidden shadow-lg ${s.root} ${className}`}
      style={{
        background: `radial-gradient(circle at 90% 98%, ${opposite}22, transparent 35%), linear-gradient(135deg, ${color}dd, ${color}99)`,
      }}
    >
      <div className="absolute inset-0 opacity-10" aria-hidden>
        <div className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full border-2 border-white/20" />
        <div className="absolute bottom-1.5 left-1.5 w-8 h-8 rounded-full border-2 border-white/15" />
        <div className="absolute top-1/2 right-1/4 w-5 h-5 rounded-full border-2 border-white/10" />
      </div>

      <div
        className="absolute -top-2 right-1 w-10 h-10 opacity-10 transform translate-x-3 translate-y-1 scale-[2] rotate-12"
        aria-hidden
      >
        <IconComponent name={iconName} size={s.bigIcon} style={{ color: 'white', transform: 'scaleX(-1)' }} />
      </div>

      <div className="relative z-10 h-full flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`${s.chip} rounded flex items-center justify-center shadow-md backdrop-blur-sm shrink-0`}
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <IconComponent name={iconName} size={s.chipIcon} style={{ color: 'white' }} />
            </div>
            <div className="min-w-0">
              <h3 className={`font-bold text-white truncate ${s.name}`}>{name || 'Account Name'}</h3>
              {bankName && <p className={`text-white/80 truncate ${s.sub}`}>{bankName}</p>}
            </div>
          </div>
          {Badges(false)}
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-1">
          {accountNumber && (
            <div className={`text-white/90 font-mono tracking-wider truncate ${s.number}`}>
              •••• •••• •••• {accountNumber.slice(-4)}
            </div>
          )}
        </div>

        <div className="flex justify-between items-end">
          <div className="min-w-0">
            <p className={`text-white/70 mb-0.5 ${s.label}`}>Balance</p>
            <p className={`text-white font-bold leading-none whitespace-nowrap truncate ${s.balance}`}>
              {balanceText}
            </p>
          </div>
          {categoryName && (
            <p className={`text-white/60 truncate text-right max-w-[45%] ${s.label}`}>{categoryName}</p>
          )}
        </div>
      </div>
    </div>
  );
};
