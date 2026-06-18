# User Invites Design

## Goal

Make User Management one simple feature. Admin adds an email, user appears in the table immediately, and that email can sign in with Google. Password sign-in is not used.

## Chosen Design

Use `userInvites` as the pre-login source of truth and keep `users/{uid}` for signed-in Firebase users.

Why: Firebase Auth UID is unknown before the invited person signs in. Creating `users/{email}` would not work because the app loads profiles by `users/{auth.uid}`. Invites solve this: admin can add an email now, and the app can create the correct UID-based profile after Google sign-in.

## User Management UI

Show one table only:

- existing signed-in users from `users`
- pending invited users from `userInvites`

Right-side form becomes **Add user**:

- email input
- role select, default `Admin`
- status select, default `active`
- Add user button

No separate “Approved Google emails” list appears. Allowlist/invites are implementation details.

## Data Flow

1. Admin adds an email in User Management.
2. App writes `userInvites/{emailDocId}` with normalized email, role, status, and audit fields.
3. User table shows that invite as pending until the person signs in.
4. Person signs in with Google.
5. App checks invite by normalized email.
6. If invite exists and status is active, app creates `users/{auth.uid}` using invite role/status.
7. Existing profile flow continues.
8. If no active invite/profile exists, app signs user out and shows access denied.

## Firestore Rules

- signed-in users can read `userInvites` for login gate
- admins can create/update/delete invites
- bootstrap admin email `noobsnoobs28@gmail.com` can create/read its own initial invite/profile path during first sign-in

## Tests

Update User Management tests to verify:

- add user form exists
- adding user calls one handler with email, role, status
- table shows invited users as pending
- old approved-email list copy is gone

Update auth/invite helper tests to verify email normalization and initial admin invite.
