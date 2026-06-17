import { useEffect, useState } from 'react'
import './App.css'
import { getUserProfile, getUserProfileCount, saveUserProfile } from './firebase/firestoreHelpers'
import { BlockedAccessPanel, BootstrapAdminPanel, LoadingPanel } from './features/auth/AccessStatePanels'
import { AuthPanel } from './features/auth/AuthPanel'
import { getAccessState } from './features/auth/authRules'
import { signInWithEmail, signOutUser, signUpWithEmail, subscribeToAuthState } from './features/auth/authService'
import { EstimationContainer } from './features/estimation/EstimationContainer'
import { JobLogContainer } from './features/jobLog/JobLogContainer'
import { MasterDataContainer } from './features/masterData/MasterDataContainer'
import { AppShell } from './features/shell/AppShell'

function PlaceholderView({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{children}</p>
    </div>
  )
}

function App() {
  const [activeView, setActiveView] = useState('estimation')
  const [authError, setAuthError] = useState('')
  const [duplicateDraft, setDuplicateDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileCount, setProfileCount] = useState(0)
  const [user, setUser] = useState(null)

  useEffect(() => {
    return subscribeToAuthState(async (nextUser) => {
      setLoading(true)
      setAuthError('')
      setUser(nextUser)

      if (!nextUser) {
        setProfile(null)
        setProfileCount(0)
        setLoading(false)
        return
      }

      try {
        const [nextProfile, nextProfileCount] = await Promise.all([
          getUserProfile(nextUser.uid),
          getUserProfileCount(),
        ])
        setProfile(nextProfile)
        setProfileCount(nextProfileCount)
      } catch (error) {
        setAuthError(error.message)
      } finally {
        setLoading(false)
      }
    })
  }, [])

  async function runAuthAction(action) {
    setLoading(true)
    setAuthError('')

    try {
      await action()
    } catch (error) {
      setAuthError(error.message)
      setLoading(false)
    }
  }

  async function bootstrapAdmin() {
    await runAuthAction(async () => {
      const payload = await saveUserProfile({
        uid: user.uid,
        email: user.email,
        name: user.email,
        role: 'Admin',
      })
      setProfile(payload)
      setProfileCount(1)
    })
  }

  async function handleSignOut() {
    await runAuthAction(signOutUser)
  }

  function handleDuplicateQuote(draft) {
    setDuplicateDraft(draft)
    setActiveView('estimation')
  }

  if (loading) {
    return <LoadingPanel />
  }

  const accessState = getAccessState({ user, profile, profileCount })

  if (accessState === 'signedOut') {
    return (
      <AuthPanel
        error={authError}
        loading={loading}
        onSignIn={(credentials) => runAuthAction(() => signInWithEmail(credentials))}
        onSignUp={(credentials) => runAuthAction(() => signUpWithEmail(credentials))}
      />
    )
  }

  if (accessState === 'needsBootstrap') {
    return <BootstrapAdminPanel loading={loading} onBootstrap={bootstrapAdmin} user={user} />
  }

  if (accessState === 'missingProfile' || accessState === 'inactive') {
    return <BlockedAccessPanel onSignOut={handleSignOut} reason={accessState} />
  }

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView} onSignOut={handleSignOut} profile={profile}>
      {activeView === 'estimation' ? <EstimationContainer initialDraft={duplicateDraft} profile={profile} /> : null}
      {activeView === 'masterData' ? <MasterDataContainer profile={profile} /> : null}
      {activeView === 'jobLog' ? <JobLogContainer onDuplicateQuote={handleDuplicateQuote} /> : null}
      {activeView === 'userManagement' ? (
        <PlaceholderView title="User Management">
          Role and status management arrives in Part 7.
        </PlaceholderView>
      ) : null}
    </AppShell>
  )
}

export default App
