import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { getSsoAccess, getUserProfile, subscribeToSsoAccess } from './firebase/firestoreHelpers'
import { BlockedAccessPanel } from './features/auth/AccessStatePanels'
import { AuthPanel } from './features/auth/AuthPanel'
import { getAccessState, getVisibleNavigation } from './features/auth/authRules'
import { getPortalSessionClaims, portalLoginUrl, signOutUser, subscribeToAuthState } from './features/auth/authService'
import { AppShell } from './features/shell/AppShell'
import { SsoRoute } from './features/sso/SsoRoute'

const DashboardContainer = lazy(() => import('./features/dashboard/DashboardContainer').then((module) => ({ default: module.DashboardContainer })))
const MasterDataContainer = lazy(() => import('./features/masterData/MasterDataContainer').then((module) => ({ default: module.MasterDataContainer })))
const PaperCalculatorContainer = lazy(() => import('./features/paperCalculator/PaperCalculatorContainer').then((module) => ({ default: module.PaperCalculatorContainer })))
const PriceEstimationContainer = lazy(() => import('./features/priceEstimation/PriceEstimationContainer').then((module) => ({ default: module.PriceEstimationContainer })))
const VendorEstimateContainer = lazy(() => import('./features/vendorEstimates/VendorEstimateContainer').then((module) => ({ default: module.VendorEstimateContainer })))

function validAccess(claims, access, uid) {
  return claims.portalAccess === true
    && claims.appId === 'rab-calc'
    && claims.ssoVersion === 2
    && claims.centralUid === access?.centralUid
    && Number(claims.grantVersion) === access?.grantVersion
    && access?.appId === 'rab-calc'
    && access?.enabled === true
    && access?.id === uid
    && ['admin', 'estimator'].includes(access?.role)
}

function portalProfile(profile, access, user) {
  return {
    ...(profile ?? {}),
    uid: user.uid,
    email: user.email,
    name: profile?.name || user.displayName || user.email,
    role: access.role === 'admin' ? 'Admin' : 'Estimator',
    status: 'active',
  }
}

function accessFromClaims(claims, uid) {
  return {
    id: uid,
    appId: claims.appId,
    centralUid: claims.centralUid,
    grantVersion: Number(claims.grantVersion),
    role: claims.role,
    enabled: true,
  }
}

function App() {
  const location = useLocation()
  const [authError, setAuthError] = useState('')
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    let unsubscribeAccess = () => {}
    const unsubscribeAuth = subscribeToAuthState(async (nextUser) => {
      unsubscribeAccess()
      setLoading(true)
      setUser(nextUser)
      if (!nextUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        const claims = await getPortalSessionClaims(nextUser)
        let projectionReadable = true
        let access
        try {
          access = await getSsoAccess(nextUser.uid)
        } catch (reason) {
          if (reason?.code !== 'permission-denied') throw reason
          projectionReadable = false
          access = accessFromClaims(claims, nextUser.uid)
        }
        const compatibilityProfile = await getUserProfile(nextUser.uid)
        if (!validAccess(claims, access, nextUser.uid)) {
          throw new Error('Open RAB-Calc from the LPHTM portal. This session is not authorized.')
        }
        setAuthError('')
        setProfile(portalProfile(compatibilityProfile, access, nextUser))
        if (projectionReadable) unsubscribeAccess = subscribeToSsoAccess(nextUser.uid, async (nextAccess) => {
          if (!validAccess(claims, nextAccess, nextUser.uid)) {
            await signOutUser()
            setAuthError('Your RAB-Calc access changed. Open the workspace again from the LPHTM portal.')
            return
          }
          setProfile((current) => portalProfile(current, nextAccess, nextUser))
        }, async () => {
          await signOutUser()
          setAuthError('RAB-Calc could not verify the current portal grant.')
        })
      } catch (error) {
        await signOutUser()
        setUser(null)
        setProfile(null)
        setAuthError(error instanceof Error ? error.message : 'RAB-Calc access could not be verified.')
      } finally {
        setLoading(false)
      }
    })
    return () => { unsubscribeAccess(); unsubscribeAuth() }
  }, [])

  async function handleSignOut() {
    setLoading(true)
    await signOutUser()
  }

  if (location.pathname === '/sso/start') return <SsoRoute mode="start" />
  if (location.pathname === '/sso') return <SsoRoute mode="callback" />
  if (loading) return null

  const accessState = getAccessState({ user, profile })
  if (accessState === 'signedOut') {
    return <AuthPanel error={authError} loading={loading} onPortalSignIn={() => window.location.assign(portalLoginUrl())} />
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
          <Route element={<Navigate replace to="/dashboard" />} path="/" />
          <Route element={<DashboardContainer profile={profile} />} path="/dashboard" />
          <Route element={<PriceEstimationContainer profile={profile} />} path="/estimates" />
          <Route element={<PriceEstimationContainer profile={profile} />} path="/estimates/new" />
          <Route element={<PriceEstimationContainer profile={profile} />} path="/estimates/:estimateId" />
          <Route element={<PriceEstimationContainer profile={profile} />} path="/estimates/:estimateId/edit" />
          <Route element={<PaperCalculatorContainer profile={profile} />} path="/hitung-kertas" />
          <Route element={canAccess('vendorEstimates') ? <VendorEstimateContainer profile={profile} /> : <Navigate replace to="/estimates" />} path="/vendor-estimates" />
          <Route element={canAccess('vendorEstimates') ? <VendorEstimateContainer profile={profile} /> : <Navigate replace to="/estimates" />} path="/vendor-estimates/new" />
          <Route element={canAccess('vendorEstimates') ? <VendorEstimateContainer profile={profile} /> : <Navigate replace to="/estimates" />} path="/vendor-estimates/:vendorEstimateId" />
          <Route element={canAccess('vendorEstimates') ? <VendorEstimateContainer profile={profile} /> : <Navigate replace to="/estimates" />} path="/vendor-estimates/:vendorEstimateId/edit" />
          <Route element={canAccess('masterData') ? <MasterDataContainer profile={profile} /> : <Navigate replace to="/estimates" />} path="/master-data" />
          <Route element={<Navigate replace to="/estimates" />} path="*" />
        </Routes>
      </Suspense>
    </AppShell>
  )
}

export default App
