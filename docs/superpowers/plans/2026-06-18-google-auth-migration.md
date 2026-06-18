# Google Auth Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace email/password auth with Google sign-in, block unapproved emails, seed `noobsnoobs28@gmail.com`, and expose allowlist management.

**Architecture:** `App.jsx` remains the single auth-state owner. `AuthPanel.jsx` becomes a pure Google-only signed-out UI. Firestore helpers own allowlist normalization/storage; User Management owns admin allowlist editing.

**Tech Stack:** React 19, Vite, Firebase Auth, Firestore, Vitest, Testing Library, Firestore security rules.

## Global Constraints

- Initial approved email: `noobsnoobs28@gmail.com`.
- Unlisted Google emails must not enter the application.
- Google-only auth; no email/password sign-in or sign-up UI.
- Keep existing app access states: `signedOut`, `needsBootstrap`, `missingProfile`, `inactive`, `active`.
- No Cloud Functions or custom claims in this migration.
- Run full `npm test` after implementation.

---

## File Structure

- Modify `src/features/auth/authService.js`: Google auth functions only.
- Modify `src/features/auth/AuthPanel.jsx`: pure Google login UI, no auth subscription.
- Modify `src/features/auth/AuthPanel.test.jsx`: Google UI tests.
- Modify `src/App.jsx`: allowlist gate after Google auth; remove email/password usage.
- Modify `src/firebase/firestoreHelpers.js`: allowlist helpers, `deleteDoc` import, initial allowlist seeding.
- Create `src/firebase/firestoreHelpers.test.js`: pure allowlist normalization tests if helper functions can be tested without Firebase calls.
- Modify `src/features/users/UserManagementView.jsx`: render allowlist add/remove controls.
- Modify `src/features/users/UserManagementView.test.jsx`: allowlist UI tests.
- Modify `firestore.rules`: add `emailAllowlist` access rules.
- Modify `README.md`: update auth setup instructions from email/password to Google + allowlist.

---

### Task 1: Make AuthPanel Google-only

**Files:**
- Modify: `src/features/auth/AuthPanel.jsx`
- Modify: `src/features/auth/AuthPanel.test.jsx`

**Interfaces:**
- Consumes: `loading: boolean`, `error: string`, `onGoogleSignIn: () => void | Promise<void>`
- Produces: `AuthPanel({ loading, error, onGoogleSignIn })`

- [ ] **Step 1: Replace AuthPanel tests with Google-only expectations**

Write this full file to `src/features/auth/AuthPanel.test.jsx`:

```jsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthPanel } from './AuthPanel'

describe('AuthPanel', () => {
  it('renders Google sign-in action', () => {
    render(<AuthPanel error="" loading={false} onGoogleSignIn={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument()
    expect(screen.getByText('Use your approved Google account to continue.')).toBeInTheDocument()
  })

  it('calls Google sign-in handler', () => {
    const onGoogleSignIn = vi.fn()
    render(<AuthPanel error="" loading={false} onGoogleSignIn={onGoogleSignIn} />)

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))

    expect(onGoogleSignIn).toHaveBeenCalledTimes(1)
  })

  it('shows authentication errors', () => {
    render(<AuthPanel error="Access denied: user@example.com is not on the approved list." loading={false} onGoogleSignIn={vi.fn()} />)

    expect(screen.getByText('Access denied: user@example.com is not on the approved list.')).toBeInTheDocument()
  })

  it('shows request access guidance', () => {
    render(<AuthPanel error="" loading={false} onGoogleSignIn={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Request access' }))

    expect(screen.getByText('Contact an administrator and ask them to add your Google email to the approved list.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/features/auth/AuthPanel.test.jsx`

Expected: FAIL because current panel uses old props/duplicate auth logic and may throw from missing setters.

- [ ] **Step 3: Replace AuthPanel implementation**

Write this full file to `src/features/auth/AuthPanel.jsx`:

```jsx
import { useState } from 'react'
import { Button } from '../../components/ui/Button'

export function AuthPanel({ error, loading, onGoogleSignIn }) {
  const [showAccessRequest, setShowAccessRequest] = useState(false)

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950">RAB Calculator Login</h1>
        <p className="mt-3 text-slate-600">Use your approved Google account to continue.</p>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {showAccessRequest ? (
          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Contact an administrator and ask them to add your Google email to the approved list.
          </div>
        ) : null}

        <Button className="mt-8 w-full" disabled={loading} onClick={onGoogleSignIn} variant="primary">
          Sign in with Google
        </Button>

        <button
          className="mt-4 text-sm font-semibold text-blue-600 hover:underline disabled:text-slate-400"
          disabled={loading}
          onClick={() => setShowAccessRequest(true)}
          type="button"
        >
          Request access
        </button>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/features/auth/AuthPanel.test.jsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/AuthPanel.jsx src/features/auth/AuthPanel.test.jsx
git commit -m "refactor: replace password auth panel with google login"
```

---

### Task 2: Add allowlist helper functions and initial email

**Files:**
- Modify: `src/firebase/firestoreHelpers.js`
- Create: `src/firebase/firestoreHelpers.test.js`

**Interfaces:**
- Produces: `INITIAL_ALLOWLIST_EMAILS: string[]`
- Produces: `normalizeEmail(email: string): string`
- Produces: `getAllowlistDocId(email: string): string`
- Produces: `getAllowlistEmails(): Promise<string[]>`
- Produces: `addAllowedEmail(email: string, addedBy: string): Promise<void>`
- Produces: `removeAllowedEmail(email: string): Promise<void>`
- Produces: `ensureInitialAllowlistEmails(addedBy?: string): Promise<void>`

- [ ] **Step 1: Write pure helper tests**

Create `src/firebase/firestoreHelpers.test.js`:

```js
import { describe, expect, it } from 'vitest'
import { getAllowlistDocId, INITIAL_ALLOWLIST_EMAILS, normalizeEmail } from './firestoreHelpers'

describe('allowlist helpers', () => {
  it('normalizes emails for allowlist checks', () => {
    expect(normalizeEmail('  NoobsNoobs28@Gmail.COM  ')).toBe('noobsnoobs28@gmail.com')
  })

  it('uses deterministic allowlist document ids', () => {
    expect(getAllowlistDocId('NoobsNoobs28@Gmail.COM')).toBe('noobsnoobs28_gmail_com')
  })

  it('includes initial approved email', () => {
    expect(INITIAL_ALLOWLIST_EMAILS).toEqual(['noobsnoobs28@gmail.com'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/firebase/firestoreHelpers.test.js`

Expected: FAIL because exported helper constants/functions do not exist.

- [ ] **Step 3: Update Firestore helpers**

In `src/firebase/firestoreHelpers.js`, change import from `firebase/firestore` to include `deleteDoc`:

```js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
```

Replace the allowlist section at the bottom with:

```js
// Email allowlist management
export const EMAIL_ALLOWLIST_COLLECTION = 'emailAllowlist'
export const INITIAL_ALLOWLIST_EMAILS = ['noobsnoobs28@gmail.com']

export function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

export function getAllowlistDocId(email) {
  return normalizeEmail(email).replace(/[^a-z0-9]/g, '_')
}

export async function getAllowlistEmails() {
  const snapshot = await getDocs(collection(db, EMAIL_ALLOWLIST_COLLECTION))
  return snapshot.docs.map((document) => document.data().email).filter(Boolean).map(normalizeEmail)
}

export async function addAllowedEmail(email, addedBy) {
  const normalizedEmail = normalizeEmail(email)
  const payload = {
    email: normalizedEmail,
    addedBy,
    addedAt: new Date().toISOString(),
  }
  await setDoc(doc(db, EMAIL_ALLOWLIST_COLLECTION, getAllowlistDocId(normalizedEmail)), payload)
}

export async function removeAllowedEmail(email) {
  await deleteDoc(doc(db, EMAIL_ALLOWLIST_COLLECTION, getAllowlistDocId(email)))
}

export async function ensureInitialAllowlistEmails(addedBy = 'system') {
  await Promise.all(INITIAL_ALLOWLIST_EMAILS.map((email) => addAllowedEmail(email, addedBy)))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/firebase/firestoreHelpers.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/firebase/firestoreHelpers.js src/firebase/firestoreHelpers.test.js
git commit -m "feat: add google email allowlist helpers"
```

---

### Task 3: Gate Google sign-in in App

**Files:**
- Modify: `src/App.jsx`
- Optionally delete: `src/features/auth/GoogleAuthPanel.jsx`

**Interfaces:**
- Consumes from Task 2: `getAllowlistEmails()`, `ensureInitialAllowlistEmails()`, `normalizeEmail()`
- Consumes from `authService.js`: `signInWithGoogle()`, `signOutUser()`, `subscribeToAuthState()`
- Produces: signed-out UI calls `handleGoogleSignIn()`

- [ ] **Step 1: Write manual gate checklist before code**

Use this as acceptance checklist for Task 3:

```text
1. Signed-out state renders AuthPanel.
2. Clicking Google button starts Google popup.
3. Popup cancelled shows "Sign-in cancelled. Please try again."
4. Unapproved signed-in email is immediately signed out.
5. Approved signed-in email proceeds to profile/bootstrap logic.
6. Firestore allowlist read failure signs out and shows error.
```

- [ ] **Step 2: Update imports in App**

In `src/App.jsx`, replace current imports from `firestoreHelpers` and `authService` with:

```js
import {
  ensureInitialAllowlistEmails,
  getAllowlistEmails,
  getUserProfile,
  getUserProfileCount,
  normalizeEmail,
  saveUserProfile,
} from './firebase/firestoreHelpers'
import { BlockedAccessPanel, BootstrapAdminPanel, LoadingPanel } from './features/auth/AccessStatePanels'
import { AuthPanel } from './features/auth/AuthPanel'
import { getAccessState } from './features/auth/authRules'
import { signInWithGoogle, signOutUser, subscribeToAuthState } from './features/auth/authService'
```

- [ ] **Step 3: Add approval helper inside App component**

Inside `function App()`, before `useEffect`, add:

```js
  async function isApprovedEmail(email) {
    await ensureInitialAllowlistEmails()
    const allowlistEmails = await getAllowlistEmails()
    return allowlistEmails.includes(normalizeEmail(email || ''))
  }
```

- [ ] **Step 4: Gate auth subscriber**

Inside `subscribeToAuthState`, after the `if (!nextUser)` block and before profile loading, add:

```js
      try {
        const approved = await isApprovedEmail(nextUser.email)

        if (!approved) {
          const deniedEmail = nextUser.email || 'This Google account'
          await signOutUser()
          setUser(null)
          setProfile(null)
          setProfileCount(0)
          setAuthError(`Access denied: ${deniedEmail} is not on the approved list.`)
          setLoading(false)
          return
        }
      } catch (error) {
        await signOutUser()
        setUser(null)
        setProfile(null)
        setProfileCount(0)
        setAuthError(error.message)
        setLoading(false)
        return
      }
```

Keep existing profile-loading `try` block after this gate.

- [ ] **Step 5: Add Google sign-in handler**

Replace old email/password handlers with:

```js
  async function handleGoogleSignIn() {
    await runAuthAction(async () => {
      try {
        await signInWithGoogle()
      } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign-in cancelled. Please try again.')
        }
        throw error
      }
    })
  }
```

- [ ] **Step 6: Render Google-only AuthPanel**

Replace signed-out branch with:

```jsx
  if (accessState === 'signedOut') {
    return <AuthPanel error={authError} loading={loading} onGoogleSignIn={handleGoogleSignIn} />
  }
```

- [ ] **Step 7: Delete unused broken GoogleAuthPanel**

Delete `src/features/auth/GoogleAuthPanel.jsx` if no imports reference it.

Run: `npm test -- src/features/auth/AuthPanel.test.jsx src/firebase/firestoreHelpers.test.js`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/App.jsx src/features/auth/GoogleAuthPanel.jsx
git commit -m "feat: gate google sign in by email allowlist"
```

If `GoogleAuthPanel.jsx` was deleted, `git add -A src/features/auth/GoogleAuthPanel.jsx src/App.jsx` instead.

---

### Task 4: Add allowlist UI to User Management

**Files:**
- Modify: `src/features/users/UserManagementView.jsx`
- Modify: `src/features/users/UserManagementView.test.jsx`

**Interfaces:**
- Consumes: `allowlistEmails: string[]`
- Consumes: `onAddEmail(email: string): void | Promise<void>`
- Consumes: `onRemoveEmail(email: string): void | Promise<void>`
- Keeps: `onUpdateUser(uid: string, changes: { name: string, role: string, status: string })`

- [ ] **Step 1: Add allowlist UI tests**

Append these tests inside `describe('UserManagementView', () => { ... })` in `src/features/users/UserManagementView.test.jsx`:

```jsx
  it('renders approved Google emails', () => {
    render(
      <UserManagementView
        allowlistEmails={['noobsnoobs28@gmail.com']}
        loading={false}
        onAddEmail={vi.fn()}
        onRemoveEmail={vi.fn()}
        onUpdateUser={vi.fn()}
        users={users}
      />,
    )

    expect(screen.getByText('Approved Google emails')).toBeInTheDocument()
    expect(screen.getByText('noobsnoobs28@gmail.com')).toBeInTheDocument()
  })

  it('adds an approved Google email', () => {
    const onAddEmail = vi.fn()
    render(
      <UserManagementView
        allowlistEmails={[]}
        loading={false}
        onAddEmail={onAddEmail}
        onRemoveEmail={vi.fn()}
        onUpdateUser={vi.fn()}
        users={users}
      />,
    )

    fireEvent.change(screen.getByLabelText('New approved email'), { target: { value: 'new@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add email' }))

    expect(onAddEmail).toHaveBeenCalledWith('new@example.com')
  })

  it('removes an approved Google email', () => {
    const onRemoveEmail = vi.fn()
    render(
      <UserManagementView
        allowlistEmails={['remove@example.com']}
        loading={false}
        onAddEmail={vi.fn()}
        onRemoveEmail={onRemoveEmail}
        onUpdateUser={vi.fn()}
        users={users}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Remove remove@example.com' }))

    expect(onRemoveEmail).toHaveBeenCalledWith('remove@example.com')
  })
```

Also update existing render calls in tests to pass default props:

```jsx
allowlistEmails={[]}
onAddEmail={vi.fn()}
onRemoveEmail={vi.fn()}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/features/users/UserManagementView.test.jsx`

Expected: FAIL because allowlist UI does not exist.

- [ ] **Step 3: Update UserManagementView props and state**

Change function signature:

```jsx
export function UserManagementView({ allowlistEmails = [], loading, onAddEmail, onRemoveEmail, onUpdateUser, users }) {
```

Add state after `draft`:

```jsx
  const [newAllowedEmail, setNewAllowedEmail] = useState('')
```

Add function before return:

```jsx
  function addAllowedEmail() {
    const email = newAllowedEmail.trim()
    if (!email) return
    onAddEmail(email)
    setNewAllowedEmail('')
  }
```

- [ ] **Step 4: Add allowlist section in aside above Edit profile**

Inside `<aside ...>`, before `<h3 className="text-lg font-bold text-slate-950">Edit profile</h3>`, add:

```jsx
        <div className="mb-8 border-b border-slate-200 pb-6">
          <h3 className="text-lg font-bold text-slate-950">Approved Google emails</h3>
          <p className="mt-2 text-sm text-slate-600">Only these Google accounts can enter the app.</p>

          <div className="mt-4 space-y-3">
            <Field label="New approved email">
              <Input
                onChange={(event) => setNewAllowedEmail(event.target.value)}
                placeholder="name@example.com"
                type="email"
                value={newAllowedEmail}
              />
            </Field>
            <button
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
              disabled={loading || !newAllowedEmail.trim()}
              onClick={addAllowedEmail}
              type="button"
            >
              Add email
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {allowlistEmails.map((email) => (
              <li className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm" key={email}>
                <span className="text-slate-700">{email}</span>
                <button
                  aria-label={`Remove ${email}`}
                  className="text-xs font-semibold text-red-600 hover:underline"
                  disabled={loading}
                  onClick={() => onRemoveEmail(email)}
                  type="button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/features/users/UserManagementView.test.jsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/users/UserManagementView.jsx src/features/users/UserManagementView.test.jsx
git commit -m "feat: manage google email allowlist"
```

---

### Task 5: Add Firestore allowlist rules and docs

**Files:**
- Modify: `firestore.rules`
- Modify: `README.md`

**Interfaces:**
- Firestore collection: `emailAllowlist/{emailId}` docs with `email`, `addedBy`, `addedAt`

- [ ] **Step 1: Add allowlist rules**

In `firestore.rules`, after `/users/{uid}` block and before app data blocks, add:

```js
    match /emailAllowlist/{emailId} {
      allow read: if signedIn();
      allow create, update, delete: if isAdmin();
    }
```

- [ ] **Step 2: Update README auth setup**

In `README.md`, replace email/password setup references with Google setup. Ensure these exact bullets exist:

```md
### Google sign-in and access allowlist

1. Enable Firebase Auth Google provider in Firebase Console.
2. Deploy Firestore rules from `firestore.rules`.
3. Start the app and sign in with `noobsnoobs28@gmail.com`.
4. If no user profiles exist, click **Bootstrap me as Admin**.
5. Open **User Management** to add more approved Google emails and manage roles/status.

Unlisted Google accounts are signed out immediately and cannot enter the app.
```

- [ ] **Step 3: Run tests and lint docs-free changes**

Run: `npm test -- src/features/auth/AuthPanel.test.jsx src/features/users/UserManagementView.test.jsx src/firebase/firestoreHelpers.test.js`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add firestore.rules README.md
git commit -m "docs: document google auth allowlist setup"
```

---

### Task 6: Full verification

**Files:**
- Verify all changed files

**Interfaces:**
- Produces: confidence migration works locally by tests/build.

- [ ] **Step 1: Search for removed email/password usage**

Run: `npx eslint .`

Expected: PASS, no unresolved imports like `signInWithEmail` or `signUpWithEmail`.

Run: `npm test`

Expected: PASS all tests.

Run: `npm run build`

Expected: PASS production build.

- [ ] **Step 2: Manual app smoke test**

Run: `npm run dev`

Expected behavior in browser:

```text
1. Signed-out page shows only "Sign in with Google" and "Request access".
2. "Request access" shows admin-contact guidance.
3. Google popup opens when clicking sign-in.
4. Allowed account noobsnoobs28@gmail.com proceeds to bootstrap/profile flow.
5. Unlisted account signs out and shows access denied.
```

- [ ] **Step 3: Final commit if verification fixes required**

If verification required fixes, commit them:

```bash
git add -A
git commit -m "fix: complete google auth migration verification"
```

If no fixes required, do not create empty commit.

---

## Self-Review

Spec coverage:

- Google-only auth: Task 1 and Task 3.
- Unlisted emails cannot enter app: Task 3.
- Initial email `noobsnoobs28@gmail.com`: Task 2.
- Allowlist management: Task 4.
- Firestore rules: Task 5.
- Error handling: Task 1 and Task 3.
- Tests: Tasks 1, 2, 4, 6.
- Docs: Task 5.

Placeholder scan: no TODO/TBD placeholders. All code steps include concrete snippets.

Type consistency: `normalizeEmail`, `getAllowlistDocId`, `INITIAL_ALLOWLIST_EMAILS`, `ensureInitialAllowlistEmails`, `onGoogleSignIn`, `allowlistEmails`, `onAddEmail`, and `onRemoveEmail` names match across tasks.
