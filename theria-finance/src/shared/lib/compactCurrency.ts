/**
 * Compact currency for tight spaces (the dashboard balance ring):
 * $712.45 → $712.45, $71,240 → $71.24k, $1,230,000 → $1.23M, $2,500,000,000 → $2.5B.
 * Values under 1k fall back to the caller's full formatter.
 */
export function formatCompactCurrency(
  amount: number,
  formatFull: (n: number) => string,
): string {
  const abs = Math.abs(amount);
  if (abs < 1000) return formatFull(amount);

  const units = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'k' },
  ];
  let idx = units.findIndex((u) => abs >= u.value);
  // Rounding can push e.g. 999,999 to "1000k" — roll over to the next unit.
  if (idx > 0 && Number((abs / units[idx].value).toFixed(2)) >= 1000) idx -= 1;
  // Two decimals with trailing zeros trimmed: 71.24k, 50k, 1.2M
  const scaled = (abs / units[idx].value).toFixed(2).replace(/\.?0+$/, '');
  return `${amount < 0 ? '-' : ''}$${scaled}${units[idx].suffix}`;
}
