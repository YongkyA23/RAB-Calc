import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from './components/ui/Toast'
import App from './App'

const authMocks = vi.hoisted(() => ({
  currentUser: null,
  getPortalSessionClaims: vi.fn(),
  signOutUser: vi.fn(),
  subscribeToAuthState: vi.fn((callback) => {
    callback(authMocks.currentUser)
    return vi.fn()
  }),
}))

const firestoreMocks = vi.hoisted(() => ({
  getSsoAccess: vi.fn(),
  getUserProfile: vi.fn(),
  subscribeToSsoAccess: vi.fn(() => vi.fn()),
}))

vi.mock('./features/auth/authService', () => authMocks)
vi.mock('./firebase/firestoreHelpers', () => firestoreMocks)
vi.mock('./features/paperCalculator/PaperCalculatorContainer', () => ({ PaperCalculatorContainer: () => <div>Internal paper calculator</div> }))

function renderApp() {
  return render(<MemoryRouter initialEntries={['/hitung-kertas']}><ToastProvider><App /></ToastProvider></MemoryRouter>)
}

describe('App paper calculator route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMocks.currentUser = null
    authMocks.getPortalSessionClaims.mockResolvedValue({ portalAccess: true, appId: 'rab-calc', ssoVersion: 2, centralUid: 'central-1', grantVersion: 1 })
    firestoreMocks.getSsoAccess.mockResolvedValue({ id: 'u1', appId: 'rab-calc', centralUid: 'central-1', grantVersion: 1, enabled: true, role: 'estimator' })
    firestoreMocks.getUserProfile.mockResolvedValue({ uid: 'u1', email: 'user@example.com', name: 'User', role: 'Estimator', status: 'active' })
  })

  it('keeps the calculator behind existing authentication', async () => {
    renderApp()
    expect(await screen.findByRole('heading', { name: 'RAB Calculator Login' })).toBeInTheDocument()
    expect(screen.queryByText('Internal paper calculator')).not.toBeInTheDocument()
  })

  it('renders the calculator inside the authenticated app shell', async () => {
    authMocks.currentUser = { uid: 'u1', email: 'user@example.com' }
    renderApp()
    expect(await screen.findByRole('heading', { name: 'Hitung Kertas' })).toBeInTheDocument()
    expect(await screen.findByText('Internal paper calculator')).toBeInTheDocument()
  })
})
