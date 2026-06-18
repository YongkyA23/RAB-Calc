import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthPanel } from './AuthPanel'

describe('AuthPanel', () => {
  it('renders Google sign-in action', () => {
    render(<AuthPanel error="" loading={false} onGoogleSignIn={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument()
    expect(screen.getByText('Use your approved Google account to continue.')).toBeInTheDocument()
  })

  it('calls Google sign-in handler', () => {
    const onGoogleSignIn = vi.fn()
    render(<AuthPanel error="" loading={false} onGoogleSignIn={onGoogleSignIn} />)

    fireEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))

    expect(onGoogleSignIn).toHaveBeenCalledTimes(1)
  })

  it('shows authentication errors', () => {
    render(<AuthPanel error="Access denied: user@example.com is not on the approved list." loading={false} onGoogleSignIn={vi.fn()} />)

    expect(screen.getByText('Access denied: user@example.com is not on the approved list.')).toBeInTheDocument()
  })
})
