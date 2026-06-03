export const CURRENCY_CATALOG = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'NZD', label: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'PHP', label: 'Philippine Peso', symbol: '₱' },
  { code: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', label: 'Mexican Peso', symbol: 'MX$' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', label: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'KRW', label: 'South Korean Won', symbol: '₩' },
  { code: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
  { code: 'SEK', label: 'Swedish Krona', symbol: 'kr' },
] as const;

export type CurrencyCode = (typeof CURRENCY_CATALOG)[number]['code'];

/** @deprecated Use CURRENCY_CATALOG — kept for existing imports */
export const ACCOUNT_CURRENCIES = CURRENCY_CATALOG;

export type AccountCurrencyCode = CurrencyCode;

export const DEFAULT_MAIN_CURRENCY: CurrencyCode = 'USD';
export const DEFAULT_ENABLED_CURRENCIES: CurrencyCode[] = ['USD'];

/** @deprecated Use DEFAULT_MAIN_CURRENCY */
export const DEFAULT_ACCOUNT_CURRENCY = DEFAULT_MAIN_CURRENCY;

const catalogCodes = new Set(CURRENCY_CATALOG.map((c) => c.code));

export function isValidCurrencyCode(code: string): code is CurrencyCode {
  return catalogCodes.has(code as CurrencyCode);
}

export function getCurrencyMeta(code: string) {
  return CURRENCY_CATALOG.find((c) => c.code === code);
}

export function formatAccountCurrency(amount: number, currencyCode = DEFAULT_MAIN_CURRENCY) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  }
}

export function getCurrencyLabel(code: string) {
  return getCurrencyMeta(code)?.label ?? code;
}

export const currencySelectionItems = CURRENCY_CATALOG.map((c) => ({
  id: c.code,
  name: `${c.code} · ${c.label}`,
}));
