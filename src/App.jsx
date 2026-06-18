import { useEffect, useState } from 'react'
import './App.css'
import { getUserProfile, getUserProfileCount, saveUserProfile } from './firebase/firestoreHelpers'
import { BlockedAccessPanel, BootstrapAdminPanel, LoadingPanel } from './features/auth/AccessStatePanels'
import { AuthPanel } from './features/auth/AuthPanel'
import { getAccessState } from './features/auth/authRules'
import { signInWithEmail, signOutUser, signUpWithEmail, subscribeToAuthState } from './features/auth/authService'
import { MasterDataContainer } from './features/masterData/MasterDataContainer'
import { PriceEstimationContainer } from './features/priceEstimation/PriceEstimationContainer'
import { AppShell } from './features/shell/AppShell'
import { UserManagementContainer } from './features/users/UserManagementContainer'

function App() {
  const [activeView, setActiveView] = useState('priceEstimation')
  const [authError, setAuthError] = useState('')
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
      {activeView === 'priceEstimation' ? <PriceEstimationContainer profile={profile} /> : null}
      {activeView === 'masterData' ? <MasterDataContainer profile={profile} /> : null}
      {activeView === 'userManagement' ? <UserManagementContainer currentUser={user} /> : null}
    </AppShell>
  )
}

export default App
