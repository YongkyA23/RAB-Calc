import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { checkEmailAllowed, signInWithGoogle } from './authService'

export function GoogleAuthPanel({ loading, onSignInSuccess, onRequestAccess }) {
  const [error, setError] = useState('')
  const [requesting, setRequesting] = useState(false)

  async function handleGoogleSignIn() {
    setLoading(true)
    setError('')

    try {
      await signInWithGoogle()
      // Auth state change will trigger via subscriber, just return here
    } catch (signInError) {
      console.error('Google sign in error:', signInError)

      if (signInError.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.')
      } else {
        setError(signInError.message || 'Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestAccess() {
    setRequesting(true)
    await onRequestAccess?.()
    setRequesting(false)
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <h1 className="text-3xl font-bold text-slate-950">RAB Calculator Login</h1>
        <p className="mt-3 text-slate-600">Use Google to sign in securely</p>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Button
          className="mt-8 w-full"
          onClick={handleGoogleSignIn}
          variant="primary"
          disabled={loading}
        >
          Sign in with Google
        </Button>

        <button
          className="mt-4 text-sm text-blue-600 hover:underline"
          disabled={requesting}
          onClick={handleRequestAccess}
          type="button"
        >
          {requesting ? 'Sending request...' : 'Request access'}
        </button>
      </div>
    </section>
  )
}
