# User Invites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make User Management one simple add-user flow where invited emails appear in the user table and can sign in with Google.

**Architecture:** Firestore `userInvites` stores pre-login users by normalized email. `users/{auth.uid}` remains the runtime profile store after Google sign-in. The login flow converts an active invite into a UID-based user profile automatically.

**Tech Stack:** React 19, Firebase Auth, Firestore, Vitest, Testing Library, Firestore security rules.

## Global Constraints

- Password sign-in is not used.
- No separate “Approved Google emails” UI.
- Add user creates an invite immediately visible in the left table.
- Added users default to `Admin` and `active` unless UI selects otherwise.
- Existing Google profile lookup must keep using `users/{auth.uid}`.
- Initial admin email remains `noobsnoobs28@gmail.com`.
- No commits unless user explicitly asks.

---

## File Structure

- Modify `src/firebase/firestoreHelpers.js`: add `userInvites` helpers and keep allowlist helpers as compatibility implementation detail.
- Modify `src/firebase/firestoreHelpers.test.js`: test invite email helpers/initial invite.
- Modify `src/App.jsx`: convert active invite into `users/{auth.uid}` profile during sign-in.
- Modify `src/features/users/UserManagementContainer.jsx`: load users + invites, add users through invite helper.
- Modify `src/features/users/UserManagementView.jsx`: one table and Add user form; remove approved-email list UI.
- Modify `src/features/users/UserManagementView.test.jsx`: verify add user form and pending invited row.
- Modify `firestore.rules`: add `userInvites` rules.
- Modify `README.md`: describe Add user flow.

---

### Task 1: Add invite helpers

**Files:**
- Modify: `src/firebase/firestoreHelpers.js`
- Modify: `src/firebase/firestoreHelpers.test.js`

**Interfaces:**
- Produces: `USER_INVITES_COLLECTION = 'userInvites'`
- Produces: `INITIAL_ADMIN_EMAIL = 'noobsnoobs28@gmail.com'`
- Produces: `buildInviteProfile(email, role = 'Admin', status = 'active', invitedBy = 'system')`
- Produces: `listUserInvites()`
- Produces: `getUserInviteByEmail(email)`
- Produces: `saveUserInvite({ email, role, status, invitedBy })`

- [ ] **Step 1: Add failing tests**

Append to `src/firebase/firestoreHelpers.test.js`:

```js
import { buildInviteProfile, getAllowlistDocId, INITIAL_ADMIN_EMAIL, INITIAL_ALLOWLIST_EMAILS, normalizeEmail } from './firestoreHelpers'
```

Replace existing import with the above, then add tests:

```js
  it('uses initial admin email for invites', () => {
    expect(INITIAL_ADMIN_EMAIL).toBe('noobsnoobs28@gmail.com')
    expect(INITIAL_ALLOWLIST_EMAILS).toEqual(['noobsnoobs28@gmail.com'])
  })

  it('builds active admin invite profiles by default', () => {
    expect(buildInviteProfile(' NewUser@Example.COM ', undefined, undefined, 'admin@example.com')).toMatchObject({
      email: 'newuser@example.com',
      name: 'newuser@example.com',
      role: 'Admin',
      status: 'active',
      invitedBy: 'admin@example.com',
    })
  })
```

- [ ] **Step 2: Run test and see failure**

Run: `npm test -- src/firebase/firestoreHelpers.test.js`

Expected: FAIL because `INITIAL_ADMIN_EMAIL` and `buildInviteProfile` are missing.

- [ ] **Step 3: Implement helpers**

In `src/firebase/firestoreHelpers.js`, add after allowlist constants:

```js
export const USER_INVITES_COLLECTION = 'userInvites'
export const INITIAL_ADMIN_EMAIL = 'noobsnoobs28@gmail.com'
```

Change `INITIAL_ALLOWLIST_EMAILS` to:

```js
export const INITIAL_ALLOWLIST_EMAILS = [INITIAL_ADMIN_EMAIL]
```

Add after `getAllowlistDocId`:

```js
export function buildInviteProfile(email, role = 'Admin', status = 'active', invitedBy = 'system') {
  const normalizedEmail = normalizeEmail(email)
  return {
    email: normalizedEmail,
    name: normalizedEmail,
    role,
    status,
    invitedBy,
    invitedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export async function listUserInvites() {
  const snapshot = await getDocs(collection(db, USER_INVITES_COLLECTION))
  return snapshot.docs.map((document) => ({ id: document.id, ...document.data(), pending: true }))
}

export async function getUserInviteByEmail(email) {
  const snapshot = await getDoc(doc(db, USER_INVITES_COLLECTION, getAllowlistDocId(email)))
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data(), pending: true } : null
}

export async function saveUserInvite({ email, role = 'Admin', status = 'active', invitedBy = 'system' }) {
  const payload = buildInviteProfile(email, role, status, invitedBy)
  await setDoc(doc(db, USER_INVITES_COLLECTION, getAllowlistDocId(payload.email)), payload)
  await addAllowedEmail(payload.email, invitedBy)
  return payload
}
```

Update `ensureInitialAllowlistEmails()` to call `saveUserInvite` for initial admin if invite missing.

- [ ] **Step 4: Run tests**

Run: `npm test -- src/firebase/firestoreHelpers.test.js`

Expected: PASS.

---

### Task 2: Convert invites during Google sign-in

**Files:**
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `getUserInviteByEmail(email)`
- Consumes: `saveUserProfile({ uid, email, name, role, status })`

- [ ] **Step 1: Add invite profile creation logic**

In `src/App.jsx`, import `getUserInviteByEmail`.

After loading `[nextProfile, nextProfileCount]`, if `nextProfile` is null:

```js
        const invite = await getUserInviteByEmail(nextUser.email)
        if (invite?.status === 'active') {
          const createdProfile = await saveUserProfile({
            uid: nextUser.uid,
            email: invite.email,
            name: invite.name || invite.email,
            role: invite.role || 'Admin',
            status: invite.status,
          })
          setProfile(createdProfile)
          setProfileCount(nextProfileCount + 1)
          return
        }
```

Keep existing bootstrap path for first admin.

- [ ] **Step 2: Run focused tests**

Run: `npm test -- src/features/auth/AuthPanel.test.jsx src/firebase/firestoreHelpers.test.js`

Expected: PASS.

---

### Task 3: Simplify User Management UI

**Files:**
- Modify: `src/features/users/UserManagementContainer.jsx`
- Modify: `src/features/users/UserManagementView.jsx`
- Modify: `src/features/users/UserManagementView.test.jsx`

**Interfaces:**
- Container passes `users`, where pending invites have `pending: true`.
- View calls `onAddUser({ email, role, status })`.

- [ ] **Step 1: Update tests first**

In `UserManagementView.test.jsx`:

- remove `allowlistEmails`, `onAddEmail`, `onRemoveEmail` props from defaults
- add `onAddUser: vi.fn()`
- update tests to expect `Add user` form
- test pending invited row:

```jsx
  it('adds users from one form', () => {
    const onAddUser = vi.fn()
    render(<UserManagementView {...defaultProps} onAddUser={onAddUser} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } })
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'Estimator' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add user' }))

    expect(onAddUser).toHaveBeenCalledWith({ email: 'new@example.com', role: 'Estimator', status: 'active' })
  })

  it('shows pending invited users in the user table', () => {
    render(<UserManagementView {...defaultProps} users={[...users, { id: 'pending_example_com', email: 'pending@example.com', name: 'pending@example.com', role: 'Admin', status: 'active', pending: true }]} />)

    expect(screen.getByText('pending@example.com')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run test and see failure**

Run: `npm test -- src/features/users/UserManagementView.test.jsx`

Expected: FAIL because current UI has approved Google emails list.

- [ ] **Step 3: Update container**

In `UserManagementContainer.jsx`, replace allowlist state with `invites`. Load `Promise.all([listCollection(COLLECTIONS.users), listUserInvites()])`. Merge users and invites by email, excluding invites already represented by real user profiles. Implement:

```js
  async function handleAddUser(input) {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await saveUserInvite({ ...input, invitedBy: currentUser.email })
      await loadUsers()
      setSuccess(`Added ${input.email} to users`)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
```

Pass `onAddUser={handleAddUser}`.

- [ ] **Step 4: Update view**

Remove approved Google emails list. Add right-side Add user form with fields:

- Email
- Role
- Status

Button text: `Add user`.

Table status cell shows `pending` for `user.pending`, otherwise existing status.

- [ ] **Step 5: Run tests**

Run: `npm test -- src/features/users/UserManagementView.test.jsx`

Expected: PASS.

---

### Task 4: Rules and docs

**Files:**
- Modify: `firestore.rules`
- Modify: `README.md`

- [ ] **Step 1: Add `userInvites` rules**

Add:

```js
    match /userInvites/{inviteId} {
      allow read: if signedIn();
      allow create: if isAdmin()
        || (signedIn()
          && request.auth.token.email == 'noobsnoobs28@gmail.com'
          && inviteId == 'noobsnoobs28_gmail_com'
          && request.resource.data.email == 'noobsnoobs28@gmail.com');
      allow update, delete: if isAdmin();
    }
```

- [ ] **Step 2: Update README**

Replace allowlist wording with:

```md
### Google sign-in and users

1. Enable Firebase Auth Google provider in Firebase Console.
2. Deploy Firestore rules from `firestore.rules`.
3. Start the app and sign in with `noobsnoobs28@gmail.com`.
4. If no user profiles exist, click **Bootstrap me as Admin**.
5. Open **User Management** and use **Add user** to invite Google emails. Added users appear in the table immediately and can sign in with Google.

Unlisted Google accounts are signed out immediately and cannot enter the app.
```

- [ ] **Step 3: Run focused tests/build**

Run:

```powershell
npm test -- src/firebase/firestoreHelpers.test.js src/features/users/UserManagementView.test.jsx src/features/auth/AuthPanel.test.jsx
npm run build
```

Expected: PASS.

---

## Self-Review

Spec coverage:

- One UI feature: Task 3.
- Add email appears in table immediately: Task 3.
- Google UID correctness: Task 2.
- Hidden invite/allowlist implementation: Tasks 1 and 2.
- Rules: Task 4.
- Docs: Task 4.

Placeholder scan: no TBD/TODO placeholders.

Type consistency: `saveUserInvite`, `listUserInvites`, `getUserInviteByEmail`, and `onAddUser` match across tasks.
