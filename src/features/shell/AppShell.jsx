import { getVisibleNavigation } from '../auth/authRules'

const viewTitles = {
  estimation: 'Create Estimation',
  masterData: 'Price List / Master Data',
  jobLog: 'Job Log',
  userManagement: 'User Management',
}

export function AppShell({ activeView, onNavigate, onSignOut, profile, children }) {
  const navigationItems = getVisibleNavigation(profile)

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">RAB Calculator</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {viewTitles[activeView] ?? 'Dashboard'}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Signed in as {profile?.name || profile?.email || 'User'} · {profile?.role}
              </p>
            </div>
            <button
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        </header>

        <nav className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Primary">
          {navigationItems.map((item) => (
            <button
              className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold shadow-sm transition ${
                activeView === item.key
                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800'
              }`}
              key={item.key}
              onClick={() => onNavigate(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section className="mt-6 flex-1">{children}</section>
      </div>
    </main>
  )
}
