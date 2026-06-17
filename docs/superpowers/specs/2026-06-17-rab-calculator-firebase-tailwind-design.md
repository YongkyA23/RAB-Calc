# RAB Calculator Firebase + Tailwind Design

## Goal

Build a full Firebase-backed React web app for internal RAB cost estimation, using Tailwind for UI, Firestore for catalog/quotes/users, and Firebase Auth for sign-in.

## Approved approach

Use a frontend-first Firebase app without Cloud Functions in this pass.

This gives real Auth + Firestore persistence and keeps setup/deploy simple. The known limitation is user account creation: the client app cannot securely create Firebase Auth accounts for other people without privileged backend code. In v1, Admin users manage app profiles/roles/status in Firestore, while Firebase Auth accounts are created manually in the Firebase Console.

## Architecture

- `src/firebase/` owns Firebase app initialization, Auth helpers, Firestore collection helpers, and bootstrap checks.
- `src/data/seedData.js` stores default categories and price items from the requirements docs.
- `src/lib/calculations.js` contains pure calculator functions for print, digital finishing, manual finishing, manpower, additional costs, grand total, and turnaround.
- `src/lib/csv.js` contains CSV export helpers.
- `src/features/auth/` contains sign-in/sign-up/bootstrap UI.
- `src/features/estimation/` contains quote builder state and UI.
- `src/features/masterData/` contains Admin catalog/category CRUD and audit writes.
- `src/features/jobLog/` contains quote history, filters, duplicate-to-draft, and CSV export.
- `src/features/users/` contains Admin user profile management.
- `src/App.jsx` coordinates auth state, user profile, navigation, loading/error states, and feature views.
- Tailwind replaces template CSS and provides responsive dashboard styling.

## Firebase configuration

Use supplied Firebase config in app initialization:

```js
const firebaseConfig = {
  apiKey: 'AIzaSyC7nFV4M1IWHTT8mak8UlD7IEZkcfxsuFY',
  authDomain: 'rab-calc.firebaseapp.com',
  projectId: 'rab-calc',
  storageBucket: 'rab-calc.firebasestorage.app',
  messagingSenderId: '221346479149',
  appId: '1:221346479149:web:c47c59d45f8d8a7b940ca4',
}
```

## Firestore collections

### `users/{uid}`

Fields:

- `uid`
- `name`
- `email`
- `role`: `Admin` or `Estimator`
- `status`: `active` or `inactive`
- `createdAt`
- `updatedAt`

Behavior:

- If no user profiles exist, first signed-in user can bootstrap self as Admin.
- After bootstrap, users without an active profile cannot access app features.
- Admin can edit role/status/name of user profiles.
- Deactivation blocks app access after login.

### `categories/{id}`

Fields:

- `id`
- `name`
- `layer`: `print`, `digital`, `manual`, `manpower`, `additional`, or `custom`
- `fieldSchema`
- `createdAt`
- `updatedAt`

Behavior:

- Built-in layers drive calculators.
- Custom categories/fields are stored/displayed only unless mapped to built-in layers.

### `priceItems/{id}`

Fields include:

- `id`
- `categoryId`
- `categoryLayer`
- `name`
- `prices`: keyed by size, e.g. `{ A3: 20000, B2: 30000 }`
- `toolingRate`
- `laborRate`
- `minimumCharge`
- `minimumType`: `numeric` or `byRequest`
- `dailyRate`
- `turnaroundDays`
- `a3Only`
- `additionalMode`: `manual` or `rate`
- `unitLabel`
- `rate`
- `active`
- `createdAt`
- `updatedAt`
- `lastEditedBy`

Behavior:

- Admin can add/edit/deactivate/delete items.
- Delete in UI can be soft delete (`active: false`) to preserve quote price snapshots.
- Estimation reads active items only.

### `priceAuditEntries/{id}`

Fields:

- `itemId`
- `categoryId`
- `action`: `create`, `update`, `delete`, or `seed`
- `changedFields`
- `previousValues`
- `newValues`
- `editedBy`
- `editedAt`

Behavior:

- Every catalog change writes an audit entry.
- Seed writes `seed` audit entries.

### `quotes/{id}`

Fields:

- `id`
- `jobNo`
- `sku`
- `client`
- `project`
- `date`
- `createdBy`
- `createdByName`
- `sourceQuoteId`
- `lineItems`
- `totals`
- `grandTotal`
- `turnaroundDays`
- `status`: `finalized`

Each line item stores:

- `id`
- `layer`
- `inputs`
- `priceSnapshot`
- `computedTotal`

Behavior:

- Saved quotes are immutable in UI.
- Corrections create a new quote.
- Duplicate to New Draft copies a saved quote into local builder state with new date and empty/new job id fields as user edits.

## Calculation rules

- Print line total = `unit price(material, size) × qty`; Total Print = sum of print lines.
- Digital line total = `unit price(type, size) × qty`; Total Digital = sum of digital lines.
- Manual tooling cost = `P × L × toolingRate × jmlAlat`; if no tooling rate, tooling cost = 0.
- Manual labor cost = `P × L × laborRate × qty`.
- Manual line total = manual quoted amount when minimum type is `byRequest`; otherwise `max(minimumCharge, toolingCost + laborCost)`.
- Manpower line total = `days × rate`.
- Additional line total = manual amount or `quantity × master rate`, based on item mode.
- Grand Total = all layer totals.
- Turnaround = maximum turnaround days among selected components.
- Currency displays as IDR with thousands separators and no decimals.

## UI structure

### Auth shell

- Signed-out users see email/password sign-in and sign-up.
- Signed-in users with no profiles in Firestore see Bootstrap Admin.
- Signed-in users with inactive/no profile see blocked-access message.
- Active users see dashboard.

### Navigation

- Create Estimation
- Price List / Master Data (Admin only)
- Job Log
- User Management (Admin only)

### Create Estimation

- Job header: No Job, SKU, Nama Klien, Judul Project.
- Layer cards for Print, Digital Finishing, Manual Finishing, Manpower, Additional Costs.
- Repeatable rows per layer.
- Live totals side panel.
- Validation blocks save for missing required fields, invalid qty/days, invalid size/item combos, and by-request manual items without manual amount.
- Save writes finalized quote.

### Master Data

- Category list and item table.
- Admin can seed defaults if no catalog exists.
- Admin can create/edit/deactivate items.
- Audit log view can show recent changes.

### Job Log

- Table of saved quotes.
- Filters: date range, No Job, SKU, client, project, creator, grand-total range.
- Actions: view details, duplicate to new draft, export CSV.

### User Management

- Admin can edit app user profile name, role, and status.
- UI explains that Firebase Auth account creation happens in Firebase Console in this frontend-only v1.

## Security rules template

Commit `firestore.rules` with rules matching v1 model:

- Signed-in active users can read own user profile.
- Admin users can read/write users, categories, priceItems, and priceAuditEntries.
- Active users can create/read quotes.
- Quotes are immutable from client after create.
- Estimator cannot write master data or user profiles.

## Testing strategy

- Unit-test `src/lib/calculations.js` for core formula cases:
  - repeatable print lines
  - A3/B2 unit pricing
  - manual numeric minimum
  - manual by-request amount
  - no-tooling manual item
  - additional manual amount
  - additional quantity × rate
  - grand total
  - max turnaround
- Run `npm run lint`.
- Run `npm run build`.
- Manual smoke test with Firebase config:
  - sign up/sign in
  - bootstrap first Admin
  - seed catalog
  - create quote
  - confirm quote appears in job log
  - duplicate quote to draft
  - edit master item and see audit entry

## Out of scope for this pass

- Cloud Functions.
- Secure in-app Firebase Auth user creation by Admin.
- PDF quote export.
- PPN/tax/margin.
- Formula builder for custom categories.
- Multi-branch/multi-currency.

## Self-review

- No placeholder requirements remain.
- Architecture matches approved Approach 1.
- Firebase limitation is explicit.
- Scope is one coherent implementation: full frontend Firebase app with Tailwind.
- Calculation and data requirements align with updated BRD/PRD/SRS.