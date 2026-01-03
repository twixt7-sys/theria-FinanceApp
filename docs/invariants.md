# Invariants

## Record Types and Allowed Effects
1. `income`: increases account balance by `amount`.
2. `expense`: decreases account balance by `amount`.
3. `transfer`: moves `amount` from `fromAccountId` to `toAccountId`.
4. `alter`: adjusts account balance by `amount` (positive or negative); delta routed to `unaccounted` system stream.