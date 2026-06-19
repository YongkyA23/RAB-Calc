import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import {
  ensureInitialAllowlistEmails,
  getAllowlistEmails,
  getUserInviteByEmail,
  getUserProfile,
  getUserProfileCount,
  normalizeEmail,
  saveUserProfile,
} from './firebase/firestoreHelpers'
import { BlockedAccessPanel, BootstrapAdminPanel } from './features/auth/AccessStatePanels'
import { AuthPanel } from './features/auth/AuthPanel'
import { getAccessState, getVisibleNavigation } from './features/auth/authRules'
import { signInWithGoogle, signOutUser, subscribeToAuthState } from './features/auth/authService'
import { AppShell } from './features/shell/AppShell'

const MasterDataContainer = lazy(() => import('./features/masterData/MasterDataContainer').then((module) => ({ default: module.MasterDataContainer })))
const PriceEstimationContainer = lazy(() => import('./features/priceEstimation/PriceEstimationContainer').then((module) => ({ default: module.PriceEstimationContainer })))
const UserManagementContainer = lazy(() => import('./features/users/UserManagementContainer').then((module) => ({ default: module.UserManagementContainer })))

function App() {
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [profileCount, setProfileCount] = useState(0)
  const [user, setUser] = useState(null)

  async function isApprovedEmail(email) {
    await ensureInitialAllowlistEmails()
    const allowlistEmails = await getAllowlistEmails()
    return allowlistEmails.includes(normalizeEmail(email || ''))
  }

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
        const approved = await isApprovedEmail(nextUser.email)

        if (!approved) {
          const deniedEmail = nextUser.email || 'This Google account'
          await signOutUser()
          setUser(null)
          setProfile(null)
          setProfileCount(0)
          setAuthError(`Access denied: ${deniedEmail} is not on the approved list.`)
          setLoading(false)
          return
        }
      } catch (error) {
        await signOutUser()
        setUser(null)
        setProfile(null)
        setProfileCount(0)
        setAuthError(error.message)
        setLoading(false)
        return
      }

      try {
        const [nextProfile, nextProfileCount] = await Promise.all([
          getUserProfile(nextUser.uid),
          getUserProfileCount(),
        ])
        if (!nextProfile) {
          const invite = await getUserInviteByEmail(nextUser.email)
          if (invite?.status === 'active') {
            const createdProfile = await saveUserProfile({
              uid: nextUser.uid,
              email: invite.email,
              name: invite.name || invite.email,
              role: invite.role || 'Admin',
              status: invite.status,
            })
            setProfile(createdProfile)
            setProfileCount(nextProfileCount + 1)
            return
          }
        }

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

  async function handleGoogleSignIn() {
    await runAuthAction(async () => {
      try {
        await signInWithGoogle()
      } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
          throw new Error('Sign-in cancelled. Please try again.', { cause: error })
        }
        throw error
      }
    })
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
    return null
  }

  const accessState = getAccessState({ user, profile, profileCount })

  if (accessState === 'signedOut') {
    return <AuthPanel error={authError} loading={loading} onGoogleSignIn={handleGoogleSignIn} />
  }

  if (accessState === 'needsBootstrap') {
    return <BootstrapAdminPanel loading={loading} onBootstrap={bootstrapAdmin} user={user} />
  }

  if (accessState === 'missingProfile' || accessState === 'inactive') {
    return <BlockedAccessPanel onSignOut={handleSignOut} reason={accessState} />
  }

  const visibleViews = getVisibleNavigation(profile).map((item) => item.key)
  const canAccess = (view) => visibleViews.includes(view)

  return (
    <AppShell onSignOut={handleSignOut} profile={profile}>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<Navigate replace to="/estimates" />} path="/" />
          <Route element={<PriceEstimationContainer profile={profile} />} path="/estimates" />
          <Route element={<PriceEstimationContainer profile={profile} />} path="/estimates/new" />
          <Route element={<PriceEstimationContainer profile={profile} />} path="/estimates/:estimateId" />
          <Route element={<PriceEstimationContainer profile={profile} />} path="/estimates/:estimateId/edit" />
          <Route element={canAccess('masterData') ? <MasterDataContainer profile={profile} /> : <Navigate replace to="/estimates" />} path="/master-data" />
          <Route element={canAccess('userManagement') ? <UserManagementContainer currentUser={user} /> : <Navigate replace to="/estimates" />} path="/users" />
          <Route element={<Navigate replace to="/estimates" />} path="*" />
        </Routes>
      </Suspense>
    </AppShell>
  )
}

export default App
