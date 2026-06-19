import { LogIn, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export function AuthPanel({ error, loading, onGoogleSignIn }) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#eef2f7] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-50" />
      <div className="relative w-full max-w-lg rounded-4xl border border-white/80 bg-white/90 p-8 text-center shadow-2xl shadow-slate-300/60 backdrop-blur-xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/25">
          <LockKeyhole size={28} />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-blue-600">Secure workspace</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">RAB Calculator Login</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
          Use your approved Google account to continue.
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-left">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 text-blue-600" size={20} />
            <div>
              <p className="text-sm font-black text-slate-950">Admin-approved access</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">Only invited Google accounts can enter the pricing workspace.</p>
            </div>
          </div>
        </div>

        <Button
          className="mt-8 w-full"
          disabled={loading}
          onClick={onGoogleSignIn}
          variant="primary"
        >
          <LogIn size={18} />
          Sign in with Google
        </Button>
      </div>
    </section>
  )
}
