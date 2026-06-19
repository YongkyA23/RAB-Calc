import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { getVisibleNavigation } from '../auth/authRules'

const viewTitles = {
  priceEstimation: 'Price Estimation',
  masterData: 'Price List / Master Data',
  userManagement: 'User Management',
}

const viewDescriptions = {
  priceEstimation: 'Manage draft and created price estimates from one workspace.',
  masterData: 'Maintain catalog rates, defaults, and audit history.',
  userManagement: 'Manage app-level user roles and access status.',
}

const navGlyphs = {
  priceEstimation: 'PE',
  masterData: 'PL',
  userManagement: 'UM',
}

const routeByView = {
  priceEstimation: '/estimates',
  masterData: '/master-data',
  userManagement: '/users',
}

function viewFromPath(pathname) {
  if (pathname.startsWith('/master-data')) return 'masterData'
  if (pathname.startsWith('/users')) return 'userManagement'
  return 'priceEstimation'
}

export function AppShell({ onSignOut, profile, children }) {
  const location = useLocation()
  const activeView = viewFromPath(location.pathname)
  const navigationItems = getVisibleNavigation(profile)

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-950 text-white lg:flex lg:flex-col">
          <div className="border-b border-slate-800 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500 text-sm font-black tracking-wider">
                RAB
              </div>
              <div>
                <p className="text-sm font-bold">RAB Calculator</p>
                <p className="text-xs text-slate-400">Print & finishing</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Primary">
            {navigationItems.map((item) => (
              <NavLink
                className={({ isActive }) => `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  isActive || activeView === item.key
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-950/30'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
                end={item.key === 'priceEstimation'}
                key={item.key}
                to={routeByView[item.key]}
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-[11px] font-black tracking-wider">
                  {navGlyphs[item.key]}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-800 p-4">
            <p className="truncate text-sm font-semibold">{profile?.name || profile?.email || 'User'}</p>
            <p className="text-xs text-slate-400">{profile?.role}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Admin workspace</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                  {viewTitles[activeView] ?? 'Dashboard'}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{viewDescriptions[activeView]}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-xs text-slate-600 sm:block">
                  <p className="font-semibold text-slate-900">{profile?.name || profile?.email || 'User'}</p>
                  <p>{profile?.role}</p>
                </div>
                <Button onClick={onSignOut}>Sign out</Button>
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3 lg:hidden" aria-label="Mobile primary">
              {navigationItems.map((item) => (
                <NavLink
                  className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive || activeView === item.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                  end={item.key === 'priceEstimation'}
                  key={item.key}
                  to={routeByView[item.key]}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <section className="flex-1 p-4 sm:p-6 lg:p-8">{children}</section>
        </div>
      </div>
    </main>
  )
}
