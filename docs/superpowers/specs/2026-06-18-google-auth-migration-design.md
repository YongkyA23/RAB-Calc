# Google Auth Migration Design

## Goal

Migrate RAB Calculator from email/password authentication to Google sign-in. Unlisted Google accounts must not enter the app. The initial approved email is `noobsnoobs28@gmail.com`.

## Current State

The app is mid-migration:

- `authService.js` has Google sign-in only.
- `App.jsx` still imports and calls old email/password auth functions.
- `AuthPanel.jsx` contains duplicated auth-state handling that conflicts with `App.jsx`.
- `GoogleAuthPanel.jsx` is unused and references a missing `setLoading` function.
- `firestoreHelpers.js` has allowlist helpers, but `removeAllowedEmail` is missing the `deleteDoc` import.
- User Management passes allowlist props, but the view does not render allowlist controls.
- Firestore rules do not cover `emailAllowlist`.
- Existing auth tests still expect email/password forms.

## Chosen Approach

Use app-gated Google sign-in with immediate sign-out for unapproved emails.

Flow:

1. Signed-out user sees a Google-only login panel.
2. User clicks “Sign in with Google”.
3. Firebase Auth popup completes.
4. App checks signed-in email against `emailAllowlist`.
5. If email is not approved, app signs the user out immediately and shows an access-denied message.
6. If email is approved, existing profile and bootstrap logic runs.
7. First approved user can bootstrap Admin when no user profiles exist.

This meets the requirement that unlisted emails cannot log in to the application while avoiding Cloud Functions for v1.

## Initial Allowlist

The app will seed or ensure this approved email exists:

- `noobsnoobs28@gmail.com`

The allowlist helper should normalize emails to lowercase and store docs deterministically where practical, so duplicate allowlist entries are avoided.

## Components

### `authService.js`

Keep responsibilities small:

- subscribe to Firebase Auth state
- sign in with Google
- sign out

No email/password functions remain.

### `App.jsx`

Owns auth state and app access decisions.

Responsibilities:

- subscribe once to Firebase Auth state
- load profile and profile count for approved signed-in users
- reject unapproved signed-in users by signing out
- render Google-only `AuthPanel` when signed out
- preserve existing access states: `signedOut`, `needsBootstrap`, `missingProfile`, `inactive`, `active`

### `AuthPanel.jsx`

Pure signed-out UI.

Responsibilities:

- render Google sign-in button
- call `onGoogleSignIn`
- render allowlist/access errors passed from `App.jsx`
- render request-access guidance

It should not subscribe to auth state, load profiles, redirect with `window.location.href`, or call `signInWithGoogle` directly.

### `GoogleAuthPanel.jsx`

Remove it or leave unused only if tests/build require it. Preferred outcome: delete or fold into `AuthPanel` to avoid duplicate broken auth UI.

### `firestoreHelpers.js`

Add reliable allowlist helpers:

- `getAllowlistEmails()`
- `addAllowedEmail(email, addedBy)`
- `removeAllowedEmail(email)`
- `ensureInitialAllowlistEmails()` or equivalent seed helper for `noobsnoobs28@gmail.com`

Fix missing `deleteDoc` import.

### User Management

Admin user management renders allowlist controls:

- show approved emails
- add email
- remove email
- preserve existing user role/status table

## Firestore Rules

Add rules for `emailAllowlist`.

Development/staging rule target:

- signed-in users can read allowlist, so the app can check whether they are approved after Google popup
- admins can create/update/delete allowlist entries

Because Firebase Auth completes before app-level rejection, read access to allowlist for signed-in users is acceptable for this v1 gate. App rejects unapproved users immediately after reading.

## Error Handling

- Google popup closed: show “Sign-in cancelled. Please try again.”
- Email not approved: sign out, show “Access denied: <email> is not on the approved list.”
- Firestore allowlist read failure: sign out and show the underlying error, because approval cannot be verified safely.
- Missing profile after profiles exist: keep existing blocked-access message.
- Inactive profile: keep existing blocked-access message.

## Tests

Update tests to match Google auth:

- `AuthPanel` renders Google sign-in button.
- Clicking Google sign-in calls `onGoogleSignIn`.
- Access-denied error renders.
- Request-access guidance renders.
- Allowlist helpers normalize and remove emails correctly.
- Auth rules remain unchanged unless access-state behavior changes.

Run full test suite after changes.

## Out of Scope

- Cloud Functions for server-side user creation or custom claims
- PDF export
- production-only security hardening beyond allowlist rules
- Firebase Console provider setup automation
