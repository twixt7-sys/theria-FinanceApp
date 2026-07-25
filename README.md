# Theria

Offline-first personal finance PWA. Money is modelled as **flows between accounts and streams**, so every balance change traces back to a record.

## Stack

| Concern | Choice |
|---|---|
| Build | Vite 6, TypeScript 5.9 |
| UI | React 18, Tailwind v4, Radix (shadcn-style), Motion, Recharts |
| Offline | `vite-plugin-pwa` (Workbox), precached shell |
| Tests | Vitest (unit), Playwright (smoke) |

Web only — there is no React Native or Expo target.

## Getting started

```bash
npm install
```

```bash
npm run dev
```

## Scripts

| Script | Does |
|---|---|
| `dev` / `preview` | Vite dev server / preview a production build |
| `build` | Typecheck, then bundle to `dist/` |
| `typecheck` | `tsc -b` |
| `lint` | ESLint over `src` |
| `test` | Vitest unit tests |
| `smoke:*` | Playwright flows: `modals`, `onboarding`, `tutorial`, `factory-reset` |
| `icons` | Regenerate PWA icons |

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build on every push and PR.

## Layout

```
src/
├── app/        App shell, root screens
├── core/       Cross-cutting: state (contexts), domain, lib, constants
├── features/   One folder per feature (screens/, components/)
└── shared/     Reusable components (incl. ui/), lib, styles
```

Import via the `@/` alias (mirrors `src/`) — configured in both `vite.config.ts` and `tsconfig.app.json`.

## Domain model

| Entity | Purpose | Key fields |
|---|---|---|
| **Account** | Where money lives | `id`, `name`, `balance`, `categoryId`, `currency`, `iconName`, `color` |
| **Stream** | A flow of money | `id`, `name`, `type` (`income`/`expense`/`system`), `categoryId` |
| **Category** | Groups accounts or streams | `id`, `name`, `scope` (`account`/`stream`) |
| **Record** | Every balance change | `id`, `type` (`income`/`expense`/`transfer`/`alter`), `amount`, `fromAccountId?`, `toAccountId?`, `streamId`, `date` |
| **Budget** | Spend limit for a stream over a period | `id`, `streamId`, `limit`, `period`, `startDate`, `endDate` |
| **Savings** | A goal funded from an account | `id`, `name`, `accountId`, `target`, `current`, `period` |

Data currently persists to `localStorage` under `theria-*` keys.

### Known invariant gaps

Balances are stored rather than derived, so deleting or editing a record does **not** reverse its effect, and `alter` records are unhandled. Being addressed by the derived-ledger work.

## Terry

Terry is the in-app finance buddy — a mascot that surfaces short contextual tips per screen and narrates onboarding and the guided tutorial. Rendering lives in `src/shared/components/FinanceBuddy.tsx`; visibility in `src/core/state/TerryContext.tsx`.

## Theme

| Role | Hex | Light | Hex | Dark | Hex |
|---|---|---|---|---|---|
| Primary | `#10B981` | Background | `#F1F5F9` | Background | `#0F172A` |
| Secondary | `#4F46E5` | Surface | `#F1F5F9` | Surface | `#020617` |
| Accent | `#6B7280` | Text | `#111827` | Text | `#E5E7EB` |

## Contributing

Keep PRs small and focused. `npm run lint && npm run typecheck && npm run test` must pass before pushing.
