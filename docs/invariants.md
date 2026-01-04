# Invariants

## Record Types and Allowed Effects
1. `income`: increases account balance by `amount`.
2. `expense`: decreases account balance by `amount`.
3. `transfer`: moves `amount` from `fromAccountId` to `toAccountId`.
4. `alter`: adjusts account balance by `amount` (positive or negative); delta routed to `unaccounted` system stream.

## Record Invariants
- Records are the only source of truth for balance changes.
- Balances are derived, never edited directly.
- Alter records always route delta to `unaccounted`.
- Transfers affect two accounts symmetrically.
- Deleting a record reverses its effect on balances.
