# Theria: Finance Core

Clean, concise documentation for the Theria finance core: a single-source-of-truth system that models money as flows between entities and scales toward social and analytical layers.

---

## Table of Contents
- [Overview](#overview)
- [Key Concepts](#key-concepts)
- [Data Model Summary](#data-model-summary)
- [Prototype Scope (v0)](#prototype-scope-v0)
- [User Interface & Screens](#user-interface--screens)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Theme Colors](#theme-colors)

---

## Overview
Theria models money as flows between accounts and streams rather than isolated transactions. This delivers a consistent ledger of balance changes while remaining flexible for future social features, analytics, and visualizations.

Principles:
- Single source of truth for balance changes
- Explicit system streams for unaccounted or system adjustments
- Small, well-scoped prototype first (v0)

---

## Data Model Summary
Entity | Purpose | Key fields
:---|:---|:---
**Users** | Root owner of finance data | `id`, `username`, `email`, `passwordHash`, `createdAt`
**Accounts** | Where money lives (bank, wallet) | `id`, `name`, `balance`, `categoryId`, `iconId`, `createdAt`
**Streams** | Money flows (income/expense/system) | `id`, `name`, `type` (`income`/`expense`/`system`), `iconId`, `color`, `isSystem`
**Categories** | Grouping for accounts/streams | `id`, `name`, `scope` (`account`/`stream`), `iconId`, `color`
**Records** | All balance changes (SOT) | `id`, `type` (`income`/`expense`/`transfer`/`alter`), `amount`, `fromAccountId?`, `toAccountId?`, `streamId`, `note?`, `date`, `createdAt`
**Icons** | Reusable SVG assets | `id`, `name`, `svg`, `scope` (`account`/`stream`/`category`/`global`)
**Budget** | Time-scoped financial limit | `id`, `streamId|categoryId`, `limit`, `period`, `startDate`, `endDate`
**Updates** | System events (internal) | `id`, `type`, `relatedRecordId`, `createdAt`
**Notifications** | User-facing alerts | `id`, `updateId`, `userId`, `isRead`, `createdAt`
**Posts** | Notes / feed items | `id`, `content`, `visibility`, `createdAt`

Notes:
- `alter` records should automatically route delta to the system stream `unaccounted` to preserve ledger integrity.

---

## Prototype Scope (v0)
Focus on a minimal, reliable core to avoid scope creep. Implement only these features in v0:
- User management (auth / profile)
- Accounts
- Streams
- Records (SOT for balance changes)
- Basic overview (home) and `unaccounted` system stream logic

Everything else (notifications, posts, budgets, icon library UI) remains documented for later phases.

---

## User Interface & Screens
Short descriptions of primary screens and components.

- **Splash** — branding and silent auth check
- **Quick Actions** — date, notifications, suggested actions (add record, quick analysis)
- **Home** — balance summary, updates feed, quick actions
- **Analysis** — breakdowns by income, expenses, budgets, accounts
- **Streams** — create / edit / archive flows
- **Records** — list, filters, edit, and apply alters
- **Accounts** — balances, transfers, categorization
- **Budget** — create / track period limits (documented, v1+)
- **Categories & Icons** — unified management screen (documented, v1+)

Navigation:
- Primary: Home, Analysis, Streams, Records, Accounts
- Utilities: Backup, Export, Reset, Settings, Logout

---

## Tech Stack
- Expo (React Native)
- Node.js backend (theria-core)
- Firebase (auth / optional persistence) — replaceable with other stores

---

## Roadmap
- v0: Core ledger (users, accounts, streams, records) — essential invariants
- v1: Basic UI polish, budgets, notifications, icon library
- v2: Social features, feeds, analytics & multi-user collaboration

---

## Contributing
- Keep PRs small and focused. Prefer documentation and tests with feature work.
- Prototype-first approach: implement minimum viable behavior, iterate.


## Theme Colors
Main Colors | Hex Code | Light Mode | Hex Code | Dark Mode | Hex Code
:--- | :--- | :--- | :--- | :--- | :---
`Primary` | `#10B981` | `Background` | `#F1F5F9` | `Background` | `#0F172A`
`Secondary` | `#4F46E5` | `Surface` | `#F1F5F9` | `Surface` | `#020617`
`Accent` | `#6B7280` | `Text Primary` | `#111827` | `Text Primary` | `#E5E7EB`