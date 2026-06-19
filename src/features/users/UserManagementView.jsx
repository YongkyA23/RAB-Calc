import { Edit3, MailPlus, Save, Search, Shield, UserCog, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { buildUserUpdatePayload, filterUsers, getEmptyUserFilters } from './userManagementModel'

function Field({ children, label }) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${className}`}
      {...props}
    />
  )
}

function Select(props) {
  return (
    <select
      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

export function UserManagementView({ loading, onAddUser, onUpdateUser, users }) {
  const [filters, setFilters] = useState(getEmptyUserFilters())
  const [draft, setDraft] = useState(null)
  const [newUser, setNewUser] = useState({ email: '', role: 'Admin', status: 'active' })
  const visibleUsers = useMemo(() => filterUsers(users, filters), [users, filters])

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  function updateNewUser(field, value) {
    setNewUser((current) => ({ ...current, [field]: value }))
  }

  function saveDraft() {
    onUpdateUser(draft.uid, buildUserUpdatePayload(draft))
  }

  function addUser() {
    const email = newUser.email.trim()
    if (!email) return
    onAddUser({ ...newUser, email })
    setNewUser({ email: '', role: 'Admin', status: 'active' })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <section className="overflow-hidden rounded-4xl border border-white/80 bg-white shadow-xl shadow-slate-300/40">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Users size={22} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Access control</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">User profiles</h2>
            </div>
          </div>
          <p className="mt-4 rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-sm font-medium leading-6 text-blue-900">
            Add users here. Added users appear in this table and can sign in with Google.
          </p>
        </div>

        <div className="grid gap-4 border-b border-slate-100 bg-slate-50/70 p-5 md:grid-cols-3">
          <Field label="Search users">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <Input className="pl-11" onChange={(event) => updateFilter('query', event.target.value)} value={filters.query} />
            </div>
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
              <option value="pending">Pending</option>
            </Select>
          </Field>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-black">Name</th>
                <th className="px-5 py-3 font-black">Email</th>
                <th className="px-5 py-3 font-black">Role</th>
                <th className="px-5 py-3 font-black">Status</th>
                <th className="px-5 py-3 font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleUsers.map((user) => (
                <tr className="transition hover:bg-blue-50/30" key={user.uid ?? user.id ?? user.email}>
                  <td className="px-5 py-4 font-bold text-slate-900">{user.name}</td>
                  <td className="px-5 py-4 text-slate-600">{user.email}</td>
                  <td className="px-5 py-4 text-slate-600">{user.role}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-slate-600">{user.pending ? 'pending' : user.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    {user.pending ? (
                      <span className="text-xs font-bold text-slate-500">Waiting for sign-in</span>
                    ) : (
                      <button
                        aria-label={`Edit ${user.name}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        onClick={() => setDraft(user)}
                        type="button"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
        <div className="mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <MailPlus size={20} />
            </span>
            <div>
              <h3 className="text-lg font-black tracking-tight text-slate-950">Add user</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">Added users can sign in with Google.</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Email">
              <Input
                onChange={(event) => updateNewUser('email', event.target.value)}
                placeholder="name@example.com"
                type="email"
                value={newUser.email}
              />
            </Field>
            <Field label="Role">
              <Select onChange={(event) => updateNewUser('role', event.target.value)} value={newUser.role}>
                <option value="Admin">Admin</option>
                <option value="Estimator">Estimator</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select onChange={(event) => updateNewUser('status', event.target.value)} value={newUser.status}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none"
              disabled={loading || !newUser.email.trim()}
              onClick={addUser}
              type="button"
            >
              <MailPlus size={17} />
              Add user
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
            <UserCog size={20} />
          </span>
          <h3 className="text-lg font-black tracking-tight text-slate-950">Edit profile</h3>
        </div>
        {draft ? (
          <div className="mt-5 space-y-4">
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none"
              disabled={loading}
              onClick={saveDraft}
              type="button"
            >
              <Save size={17} />
              Save user
            </button>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-600"><Shield className="mr-2 inline text-slate-400" size={16} />Choose a user to edit role or active status.</p>
        )}
      </aside>
    </div>
  )
}
