import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UserManagementView } from './UserManagementView'

const users = [
  { uid: 'u1', name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'active' },
  { uid: 'u2', name: 'Estimator User', email: 'estimator@example.com', role: 'Estimator', status: 'inactive' },
]

describe('UserManagementView', () => {
  it('renders help text and users', () => {
    render(<UserManagementView loading={false} onUpdateUser={vi.fn()} users={users} />)

    expect(screen.getByText('Create Firebase Auth accounts in Firebase Console, then manage app role/status here.')).toBeInTheDocument()
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('estimator@example.com')).toBeInTheDocument()
  })

  it('filters users by search', () => {
    render(<UserManagementView loading={false} onUpdateUser={vi.fn()} users={users} />)

    fireEvent.change(screen.getByLabelText('Search users'), { target: { value: 'estimator' } })

    expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument()
    expect(screen.getByText('estimator@example.com')).toBeInTheDocument()
  })

  it('updates user role and status', () => {
    const onUpdateUser = vi.fn()
    render(<UserManagementView loading={false} onUpdateUser={onUpdateUser} users={users} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit Estimator User' }))
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'Admin' } })
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'active' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save user' }))

    expect(onUpdateUser).toHaveBeenCalledWith('u2', { name: 'Estimator User', role: 'Admin', status: 'active' })
  })
})
