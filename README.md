# RAB Calculator Web App

Firebase-backed React app for internal print and finishing cost estimation.

## Stack

- React + Vite
- Tailwind CSS
- Firebase Auth
- Firestore
- Firebase Hosting config
- Vitest + Testing Library

## Local development

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

## Firebase setup

Project id is configured in [.firebaserc](.firebaserc): `rab-calc`.

Firebase client config lives in [src/firebase/config.js](src/firebase/config.js).

### Deploy Firestore rules

```powershell
firebase login
firebase use rab-calc
firebase deploy --only firestore:rules
```

Current [firestore.rules](firestore.rules) are staging-friendly:

- signed-in user can create own first app profile
- active app users can use catalog, quotes, and audit records
- quote and audit edits/deletes are blocked
- user deletes are blocked

Before production, tighten rules so only Admin users can write master data and user profiles.

### First Admin bootstrap

1. Enable Firebase Auth email/password provider in Firebase Console.
2. Run app locally.
3. Create/sign in with first account.
4. If no user profiles exist, click **Bootstrap me as Admin**.
5. Go to **Price List / Master Data** and click **Seed default catalog**.

### Additional users

Frontend-only v1 cannot securely create Firebase Auth accounts for other users. Create Auth accounts in Firebase Console, then manage app role/status in **User Management**.

## Available scripts

```powershell
npm test
npm run lint
npm run build
npm run dev
```

## Implemented features

- Email/password sign-in/sign-up
- First-admin bootstrap
- Role-based navigation
- Master data seed/edit/deactivate with audit entries
- Estimation builder with print, digital finishing, manual finishing, manpower, and additional costs
- Live totals and turnaround estimate
- Quote save to Firestore
- Job log with filters, detail view, duplicate-to-draft, and CSV export
- User management for profile role/status

## Notes

Build may warn that Firebase chunk is larger than 500 kB. This is acceptable for staging; code-splitting can be added later.
