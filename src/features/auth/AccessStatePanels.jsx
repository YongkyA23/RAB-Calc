export function LoadingPanel() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-600">Loading workspace…</p>
      </div>
    </section>
  )
}

export function BootstrapAdminPanel({ loading, user, onBootstrap }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">First admin</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Bootstrap Admin access</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          No app user profiles exist yet. Promote {user?.email} as first Admin to unlock setup.
        </p>
        <button
          className="mt-6 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
          disabled={loading}
          onClick={onBootstrap}
          type="button"
        >
          Bootstrap me as Admin
        </button>
      </div>
    </section>
  )
}

export function BlockedAccessPanel({ reason, onSignOut }) {
  const messages = {
    missingProfile: 'Your Firebase account has no active app profile. Ask an Admin to add your user profile.',
    inactive: 'Your app profile is inactive. Ask an Admin to reactivate access.',
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-600">Access blocked</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Cannot open workspace</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{messages[reason]}</p>
        <button
          className="mt-6 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          onClick={onSignOut}
          type="button"
        >
          Sign out
        </button>
      </div>
    </section>
  )
}
