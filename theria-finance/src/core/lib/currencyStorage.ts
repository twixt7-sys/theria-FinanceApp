import { STORAGE_KEYS } from '../constants/appStorage';
import {
  CURRENCY_CATALOG,
  DEFAULT_ENABLED_CURRENCIES,
  DEFAULT_MAIN_CURRENCY,
  isValidCurrencyCode,
  type CurrencyCode,
} from '../../shared/lib/currencies';

export interface CurrencyPreferences {
  mainCurrency: CurrencyCode;
  enabledCurrencies: CurrencyCode[];
}

const catalogSet = new Set(CURRENCY_CATALOG.map((c) => c.code));

function toEnabledArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  return [...DEFAULT_ENABLED_CURRENCIES];
}

function sanitizeCodes(codes: unknown[]): CurrencyCode[] {
  const seen = new Set<string>();
  const result: CurrencyCode[] = [];
  for (const raw of codes) {
    if (typeof raw !== 'string' || !isValidCurrencyCode(raw) || seen.has(raw)) continue;
    seen.add(raw);
    result.push(raw);
  }
  return result;
}

export function normalizeCurrencyPreferences(
  partial?: Partial<CurrencyPreferences> | null,
): CurrencyPreferences {
  const enabled = sanitizeCodes(toEnabledArray(partial?.enabledCurrencies));
  const safeEnabled = enabled.length > 0 ? enabled : [...DEFAULT_ENABLED_CURRENCIES];

  let main = partial?.mainCurrency;
  if (!main || !catalogSet.has(main) || !safeEnabled.includes(main as CurrencyCode)) {
    main = safeEnabled[0] ?? DEFAULT_MAIN_CURRENCY;
  }

  if (!safeEnabled.includes(main as CurrencyCode)) {
    safeEnabled.unshift(main as CurrencyCode);
  }

  return {
    mainCurrency: main as CurrencyCode,
    enabledCurrencies: safeEnabled,
  };
}

export function readCurrencyPreferences(): CurrencyPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.currencies);
    if (!raw) return normalizeCurrencyPreferences();
    const parsed = JSON.parse(raw) as Partial<CurrencyPreferences>;
    return normalizeCurrencyPreferences(parsed);
  } catch {
    return normalizeCurrencyPreferences();
  }
}

export function writeCurrencyPreferences(prefs: CurrencyPreferences) {
  const normalized = normalizeCurrencyPreferences(prefs);
  try {
    localStorage.setItem(STORAGE_KEYS.currencies, JSON.stringify(normalized));
  } catch {
    /* session-only */
  }
  return normalized;
}
