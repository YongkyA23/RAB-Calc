# Firestore Security Rules audit — portal authority migration

Date: 2026-08-12

## Data model observed

- `ssoAccess/{targetUid}` is a server-managed projection containing `centralUid`, `appId`, `role`, `enabled`, and `grantVersion`.
- `users/{targetUid}` is a compatibility profile. Its role/status are not authorization authority.
- `categories`, `priceItems`, and `priceAuditEntries` are master-data collections.
- Quotes, vendor estimates, actual costs, paper drafts, calculations, and custom sizes are application data.

## Findings before the prototype update

1. A signed-in user could create or update their own `users/{uid}` document, including `role` and `status`, enabling self-escalation.
2. The client bootstrapped a hard-coded pilot allowlist and an initial Admin profile.
3. Estimator sessions attempted to list all user profiles during login although list access was admin-only.
4. `categories` and `priceItems` writes were allowed to every active user despite the UI presenting them as admin-only.
5. Rules checked that an `ssoAccess` record was enabled, but did not bind its `centralUid` or `grantVersion` to the custom token. A stale token could therefore survive a remap or role change.
6. Client-managed `emailAllowlist` and `userInvites` duplicated Project C authority.

## Prototype policy

- Project C and the NestJS service are the only writers of identities, roles, and access projections.
- A target session must have portal claims for `rab-calc`, SSO schema version 2, matching `centralUid`, and matching `grantVersion`.
- Master-data mutation requires the projected `admin` role.
- Clients may read only their own compatibility profile and access projection; all authority writes are denied.
- Unmatched paths are denied by default.

## Devil's-advocate cases to verify in Emulator Suite

- Direct Google/password login without portal custom claims is denied.
- A token for PressPass is denied in RAB-Calc.
- A disabled projection is denied immediately.
- An old token with a lower `grantVersion` is denied after a role or access change.
- A projection whose `centralUid` differs from the token is denied.
- An estimator cannot modify their compatibility profile, categories, price items, or price audit entries.
- An admin cannot forge a client write to `ssoAccess`.

These rules are intentionally kept local until the v2 frontend and backend are released together.
