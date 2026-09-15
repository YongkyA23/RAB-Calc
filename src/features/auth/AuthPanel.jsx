import { ArrowRight, Laptop, LockKeyhole, ShieldCheck, UserCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { signInLocal } from './authService'

export function AuthPanel({ error, loading, onPortalSignIn, onLocalSignIn }) {
  const handleLocalAdmin = () => {
    if (onLocalSignIn) {
      onLocalSignIn('Admin')
    } else {
      signInLocal('Admin', 'Local Admin', 'admin@local.test')
    }
  }

  const handleLocalEstimator = () => {
    if (onLocalSignIn) {
      onLocalSignIn('Estimator')
    } else {
      signInLocal('Estimator', 'Local Estimator', 'estimator@local.test')
    }
  }

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
          Kalkulator & Estimasi Biaya Cetak & Finishing
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        {/* Local / Offline Quick Access */}
        <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 text-left">
          <div className="flex items-center gap-2 text-emerald-800">
            <Laptop size={18} className="text-emerald-600" />
            <p className="text-xs font-black uppercase tracking-wider">Mode Lokal / Offline (Standalone)</p>
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            Jalankan aplikasi 100% lokal tanpa koneksi Firebase atau SSO. Data tersimpan di browser.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Button
              className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 text-white border-none text-xs font-bold py-2.5"
              disabled={loading}
              onClick={handleLocalAdmin}
              type="button"
            >
              <UserCheck size={16} />
              Masuk Admin Lokal
            </Button>
            <Button
              className="flex-1 justify-center bg-slate-800 hover:bg-slate-900 text-white border-none text-xs font-bold py-2.5"
              disabled={loading}
              onClick={handleLocalEstimator}
              type="button"
            >
              <UserCheck size={16} />
              Masuk Estimator
            </Button>
          </div>
        </div>

        {/* SSO Portal Section */}
        <div className="mt-5 rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-left">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 text-blue-600" size={20} />
            <div>
              <p className="text-sm font-black text-slate-950">LPHTM Portal SSO (Cloud)</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-600">
                Continue through the LPHTM portal. Direct workspace login is disabled.
              </p>
              <p className="mt-0.5 text-xs text-slate-500">Only invited Google accounts can enter the pricing workspace.</p>
            </div>
          </div>
          <Button
            className="mt-3 w-full justify-center text-xs"
            disabled={loading}
            onClick={onPortalSignIn}
            variant="primary"
          >
            <ArrowRight size={16} />
            Continue through portal
          </Button>
        </div>
      </div>
    </section>
  )
}
