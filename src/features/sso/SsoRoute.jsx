import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { auth } from '../../firebase/app'
import { completeSso, createPortalLaunchUrl } from './ssoClient'

export function SsoRoute({ mode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const started = useRef(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (started.current) return
    started.current = true

    if (mode === 'start') {
      const returnTo = new URLSearchParams(location.search).get('returnTo')
      createPortalLaunchUrl(returnTo)
        .then((url) => window.location.replace(url))
        .catch((reason) => setError(reason.message))
      return
    }

    completeSso(auth, location.search)
      .then((returnTo) => navigate(returnTo, { replace: true }))
      .catch((reason) => setError(reason.message))
  }, [location.search, mode, navigate])

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f1e8] px-5 text-[#102a2c]">
      <section className="w-full max-w-lg border-t-4 border-orange-600 bg-white p-8 shadow-xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
          RAB-Calc secure access
        </p>
        <h1 className="mt-4 text-3xl font-semibold">
          {error ? 'Unable to open RAB-Calc' : 'Connecting your workspace…'}
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          {error || 'Your one-time LPHTM portal session is being verified.'}
        </p>
        {error ? (
          <a
            className="mt-7 inline-flex bg-[#102a2c] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white"
            href="/sso/start"
          >
            Start again
          </a>
        ) : (
          <span className="mt-8 block h-1 w-full overflow-hidden bg-slate-200">
            <span className="block h-full w-1/2 animate-pulse bg-orange-600" />
          </span>
        )}
      </section>
    </main>
  )
}
