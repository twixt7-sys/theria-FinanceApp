import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  CURRENCY_CATALOG,
  getCurrencyMeta,
  type CurrencyCode,
} from '../../shared/lib/currencies';
import {
  normalizeCurrencyPreferences,
  readCurrencyPreferences,
  writeCurrencyPreferences,
  type CurrencyPreferences,
} from '../lib/currencyStorage';

interface CurrencyContextType {
  mainCurrency: CurrencyCode;
  enabledCurrencies: CurrencyCode[];
  enabledCurrencyOptions: (typeof CURRENCY_CATALOG)[number][];
  availableToAdd: (typeof CURRENCY_CATALOG)[number][];
  setMainCurrency: (code: CurrencyCode) => void;
  addEnabledCurrency: (code: CurrencyCode) => void;
  removeEnabledCurrency: (code: CurrencyCode) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function applyPrefs(prefs: CurrencyPreferences) {
  return writeCurrencyPreferences(prefs);
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<CurrencyPreferences>(() => readCurrencyPreferences());

  const commit = useCallback((next: CurrencyPreferences) => {
    const normalized = applyPrefs(next);
    setPrefs(normalized);
  }, []);

  const setMainCurrency = useCallback(
    (code: CurrencyCode) => {
      commit(
        normalizeCurrencyPreferences({
          mainCurrency: code,
          enabledCurrencies: prefs.enabledCurrencies.includes(code)
            ? prefs.enabledCurrencies
            : [code, ...prefs.enabledCurrencies],
        }),
      );
    },
    [commit, prefs.enabledCurrencies],
  );

  const addEnabledCurrency = useCallback(
    (code: CurrencyCode) => {
      if (prefs.enabledCurrencies.includes(code)) return;
      commit(
        normalizeCurrencyPreferences({
          ...prefs,
          enabledCurrencies: [...prefs.enabledCurrencies, code],
        }),
      );
    },
    [commit, prefs],
  );

  const removeEnabledCurrency = useCallback(
    (code: CurrencyCode) => {
      if (code === prefs.mainCurrency) return;
      if (prefs.enabledCurrencies.length <= 1) return;
      commit(
        normalizeCurrencyPreferences({
          ...prefs,
          enabledCurrencies: prefs.enabledCurrencies.filter((c) => c !== code),
        }),
      );
    },
    [commit, prefs],
  );

  const enabledCurrencyOptions = useMemo(
    () =>
      prefs.enabledCurrencies
        .map((code) => getCurrencyMeta(code))
        .filter((c): c is (typeof CURRENCY_CATALOG)[number] => Boolean(c)),
    [prefs.enabledCurrencies],
  );

  const availableToAdd = useMemo(
    () => CURRENCY_CATALOG.filter((c) => !prefs.enabledCurrencies.includes(c.code)),
    [prefs.enabledCurrencies],
  );

  const value = useMemo(
    () => ({
      mainCurrency: prefs.mainCurrency,
      enabledCurrencies: prefs.enabledCurrencies,
      enabledCurrencyOptions,
      availableToAdd,
      setMainCurrency,
      addEnabledCurrency,
      removeEnabledCurrency,
    }),
    [
      prefs.mainCurrency,
      prefs.enabledCurrencies,
      enabledCurrencyOptions,
      availableToAdd,
      setMainCurrency,
      addEnabledCurrency,
      removeEnabledCurrency,
    ],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
