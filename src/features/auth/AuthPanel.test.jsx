import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthPanel } from './AuthPanel'

describe('AuthPanel', () => {
  it('renders the central portal action', () => {
    render(<AuthPanel error="" loading={false} onPortalSignIn={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Continue through portal' })).toBeInTheDocument()
    expect(screen.getByText('Continue through the LPHTM portal. Direct workspace login is disabled.')).toBeInTheDocument()
  })

  it('calls the portal handler', () => {
    const onPortalSignIn = vi.fn()
    render(<AuthPanel error="" loading={false} onPortalSignIn={onPortalSignIn} />)

    fireEvent.click(screen.getByRole('button', { name: 'Continue through portal' }))

    expect(onPortalSignIn).toHaveBeenCalledTimes(1)
  })

  it('shows authentication errors', () => {
    render(<AuthPanel error="Access denied: user@example.com is not on the approved list." loading={false} onPortalSignIn={vi.fn()} />)

    expect(screen.getByText('Access denied: user@example.com is not on the approved list.')).toBeInTheDocument()
  })
})
