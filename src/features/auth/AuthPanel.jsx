import { useEffect, useState } from 'react'
import { getAllowlistEmails } from '../../firebase/firestoreHelpers'
import { checkEmailAllowed, signInWithGoogle, subscribeToAuthState } from './authService'

export function AuthPanel({ loading, setAuthError, setLoading }) {
  const [emailAllowlist, setEmailAllowlist] = useState([])
  const [user, setUser] = useState(null)
  const [showAccessRequest, setShowAccessRequest] = useState(false)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    let ignore = false

    async function init() {
      try {
        const allowlist = await getAllowlistEmails()
        if (!ignore) {
          setEmailAllowlist(allowlist)
          console.log('Email Allowlist loaded:', allowlist.length, 'emails')
        }
      } catch (error) {
        if (!ignore) console.error('Failed to load allowlist:', error)
      }
    }

    init()

    return () => {
      ignore = true
    }
  }, [])

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (nextUser) => {
      if (!nextUser) {
        setUser(null)
        setLoading(true)
        return
      }

      try {
        const email = nextUser.email?.toLowerCase()
        const isAllowed = await checkEmailAllowed(email) || emailAllowlist.includes(email) || emailAllowlist.length === 0

        console.log('Auth check:', { email, isAllowed, allowlistCount: emailAllowlist.length })

        if (!isAllowed) {
          setError(`Access denied: ${email} is not on the approved list`)
          await signInWithGoogle() // Try again - will fail or succeed depending on permissions
          setUser(null)
          setLoading(true)
          return
        }

        // Check if user profile exists
        const { getUserProfile, getUserProfileCount } = await import('../../firebase/firestoreHelpers')
        const [profile, profileCount] = await Promise.all([
          getUserProfile(nextUser.uid),
          getUserProfileCount(),
        ])

        setUser(nextUser)

        if (!profile && profileCount === 0) {
          // First admin - bootstrap mode
          setLoading(true)
          return
        }

        if (!profile) {
          // Signed in but no profile yet
          setError('Your account has no app profile. Contact an administrator.')
          setLoading(false)
          return
        }

        if (profile.status !== 'active') {
          setError('Your account has been deactivated.')
          setLoading(false)
          return
        }

        // Success - authenticated and authorized
        window.location.href = '/' // Redirect to main app
      } catch (error) {
        console.error('Auth initialization error:', error)
        setError(error.message)
        setUser(null)
        setLoading(true)
      } finally {
        if (!ignore) setLoading(false)
      }
    })

    return () => {
      unsubscribe()
      ignore = true
    }
  }, [emailAllowlist])

  async function handleRequestAccess() {
    setRequesting(true)
    setShowAccessRequest(true)
    setRequesting(false)
  }

  function setError(message) {
    setAuthError?.(message)
  }

  if (user) {
    return null // User signed in successfully
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950">RAB Calculator Login</h1>
        <p className="mt-3 text-slate-600">Use Google to sign in securely</p>

        <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <p className="font-semibold">Approved Email Addresses:</p>
          {emailAllowlist.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {emailAllowlist.map((email) => (
                <li key={email}>• {email}</li>
              ))}
            </ul>
          ) : (
            <p>No approved users yet. Access will be granted to the first signer.</p>
          )}
        </div>

        {showAccessRequest ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            To request access, please contact your administrator and ask them to add your email to the approved list.
          </div>
        ) : null}

        <button
          className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
          disabled={loading}
          onClick={() => signInWithGoogle()}
          type="button"
        >
          Sign in with Google
        </button>

        <button
          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          disabled={loading}
          onClick={handleRequestAccess}
          type="button"
        >
          Request Access
        </button>
      </div>
    </section>
  )
}
