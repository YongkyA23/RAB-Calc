import { useMemo, useState } from 'react'
import { buildUserUpdatePayload, filterUsers, getEmptyUserFilters } from './userManagementModel'

function Field({ children, label }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}

function Input(props) {
  return (
    <input
      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

function Select(props) {
  return (
    <select
      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

export function UserManagementView({ loading, onUpdateUser, users }) {
  const [filters, setFilters] = useState(getEmptyUserFilters())
  const [draft, setDraft] = useState(null)
  const visibleUsers = useMemo(() => filterUsers(users, filters), [users, filters])

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function saveDraft() {
    onUpdateUser(draft.uid, buildUserUpdatePayload(draft))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">User Management</h2>
        <p className="mt-2 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          Create Firebase Auth accounts in Firebase Console, then manage app role/status here.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Field label="Search users">
            <Input onChange={(event) => updateFilter('query', event.target.value)} value={filters.query} />
          </Field>
          <Field label="Role filter">
            <Select onChange={(event) => updateFilter('role', event.target.value)} value={filters.role}>
              <option value="all">All roles</option>
              <option value="Admin">Admin</option>
              <option value="Estimator">Estimator</option>
            </Select>
          </Field>
          <Field label="Status filter">
            <Select onChange={(event) => updateFilter('status', event.target.value)} value={filters.status}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleUsers.map((user) => (
                <tr key={user.uid}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{user.email}</td>
                  <td className="px-4 py-3 text-slate-600">{user.role}</td>
                  <td className="px-4 py-3 text-slate-600">{user.status}</td>
                  <td className="px-4 py-3">
                    <button
                      aria-label={`Edit ${user.name}`}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => setDraft(user)}
                      type="button"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Edit profile</h3>
        {draft ? (
          <div className="mt-4 space-y-4">
            <Field label="Name">
              <Input onChange={(event) => updateDraft('name', event.target.value)} value={draft.name} />
            </Field>
            <Field label="Role">
              <Select onChange={(event) => updateDraft('role', event.target.value)} value={draft.role}>
                <option value="Admin">Admin</option>
                <option value="Estimator">Estimator</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select onChange={(event) => updateDraft('status', event.target.value)} value={draft.status}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
            <button
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
              disabled={loading}
              onClick={saveDraft}
              type="button"
            >
              Save user
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">Choose a user to edit role or active status.</p>
        )}
      </aside>
    </div>
  )
}
