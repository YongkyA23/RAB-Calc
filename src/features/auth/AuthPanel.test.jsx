import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthPanel } from './AuthPanel'

describe('AuthPanel', () => {
  it('submits email and password for sign in', () => {
    const onSignIn = vi.fn()
    render(<AuthPanel error="" loading={false} onSignIn={onSignIn} onSignUp={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(onSignIn).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'secret123' })
  })

  it('submits email and password for sign up', () => {
    const onSignUp = vi.fn()
    render(<AuthPanel error="" loading={false} onSignIn={vi.fn()} onSignUp={onSignUp} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }))

    expect(onSignUp).toHaveBeenCalledWith({ email: 'new@example.com', password: 'secret123' })
  })

  it('shows authentication errors', () => {
    render(<AuthPanel error="Invalid credentials" loading={false} onSignIn={vi.fn()} onSignUp={vi.fn()} />)

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })
})
