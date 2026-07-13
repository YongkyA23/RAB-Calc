import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from './components/ui/Toast'
import App from './App'

const authMocks = vi.hoisted(() => ({
  currentUser: null,
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
  subscribeToAuthState: vi.fn((callback) => {
    callback(authMocks.currentUser)
    return vi.fn()
  }),
}))

const firestoreMocks = vi.hoisted(() => ({
  ensureInitialAllowlistEmails: vi.fn(),
  getAllowlistEmails: vi.fn(),
  getUserInviteByEmail: vi.fn(),
  getUserProfile: vi.fn(),
  getUserProfileCount: vi.fn(),
  normalizeEmail: vi.fn((email) => email.trim().toLowerCase()),
  saveUserProfile: vi.fn(),
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
    firestoreMocks.ensureInitialAllowlistEmails.mockResolvedValue(undefined)
    firestoreMocks.getAllowlistEmails.mockResolvedValue(['user@example.com'])
    firestoreMocks.getUserProfile.mockResolvedValue({ uid: 'u1', email: 'user@example.com', name: 'User', role: 'Estimator', status: 'active' })
    firestoreMocks.getUserProfileCount.mockResolvedValue(1)
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

