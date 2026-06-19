import { AlertTriangle, Loader2, ShieldCheck } from 'lucide-react'

function AccessShell({ children }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef2f7] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-50" />
      {children}
    </section>
  )
}

export function LoadingPanel() {
  return (
    <AccessShell>
      <div className="relative rounded-4xl border border-white/80 bg-white/90 p-8 text-center shadow-2xl shadow-slate-300/60 backdrop-blur-xl">
        <Loader2 className="mx-auto animate-spin text-blue-600" size={30} />
        <p className="mt-4 text-sm font-bold text-slate-600">Loading workspace…</p>
      </div>
    </AccessShell>
  )
}

export function BootstrapAdminPanel({ loading, user, onBootstrap }) {
  return (
    <AccessShell>
      <div className="relative w-full max-w-lg rounded-4xl border border-white/80 bg-white/90 p-8 shadow-2xl shadow-slate-300/60 backdrop-blur-xl">
        <div className="grid h-14 w-14 place-items-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/25">
          <ShieldCheck size={26} />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-blue-600">First admin</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Bootstrap Admin access</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
          No app user profiles exist yet. Promote {user?.email} as first Admin to unlock setup.
        </p>
        <button
          className="mt-6 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none"
          disabled={loading}
          onClick={onBootstrap}
          type="button"
        >
          Bootstrap me as Admin
        </button>
      </div>
    </AccessShell>
  )
}

export function BlockedAccessPanel({ reason, onSignOut }) {
  const messages = {
    missingProfile: 'Your Firebase account has no active app profile. Ask an Admin to add your user profile.',
    inactive: 'Your app profile is inactive. Ask an Admin to reactivate access.',
  }

  return (
    <AccessShell>
      <div className="relative w-full max-w-lg rounded-4xl border border-white/80 bg-white/90 p-8 text-center shadow-2xl shadow-slate-300/60 backdrop-blur-xl">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-rose-50 text-rose-600">
          <AlertTriangle size={26} />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-rose-600">Access blocked</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Cannot open workspace</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{messages[reason]}</p>
        <button
          className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          onClick={onSignOut}
          type="button"
        >
          Sign out
        </button>
      </div>
    </AccessShell>
  )
}
