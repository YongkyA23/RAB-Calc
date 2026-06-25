import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UserManagementView } from './UserManagementView'

const users = [
  { uid: 'u1', name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'active' },
  { uid: 'u2', name: 'Estimator User', email: 'estimator@example.com', role: 'Estimator', status: 'inactive' },
]

const defaultProps = {
  loading: false,
  onAddUser: vi.fn(),
  onUpdateUser: vi.fn(),
  users,
}

describe('UserManagementView', () => {
  it('renders help text and users', () => {
    render(<UserManagementView {...defaultProps} />)

    expect(screen.getByText('Tambahkan pengguna di sini. Pengguna yang ditambahkan akan muncul di tabel ini dan bisa masuk dengan Google.')).toBeInTheDocument()
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('estimator@example.com')).toBeInTheDocument()
  })

  it('filters users by search', () => {
    render(<UserManagementView {...defaultProps} />)

    fireEvent.change(screen.getByLabelText('Cari pengguna'), { target: { value: 'estimator' } })

    expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument()
    expect(screen.getByText('estimator@example.com')).toBeInTheDocument()
  })

  it('updates user role and status', () => {
    const onUpdateUser = vi.fn()
    render(<UserManagementView {...defaultProps} onUpdateUser={onUpdateUser} />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit Estimator User' }))
    fireEvent.change(screen.getAllByLabelText('Role')[1], { target: { value: 'Admin' } })
    fireEvent.change(screen.getAllByLabelText('Status')[1], { target: { value: 'active' } })
    fireEvent.click(screen.getByRole('button', { name: 'Simpan pengguna' }))

    expect(onUpdateUser).toHaveBeenCalledWith('u2', { name: 'Estimator User', role: 'Admin', status: 'active' })
  })

  it('adds users from one form', () => {
    const onAddUser = vi.fn()
    render(<UserManagementView {...defaultProps} onAddUser={onAddUser} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@example.com' } })
    fireEvent.change(screen.getAllByLabelText('Role')[0], { target: { value: 'Estimator' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tambah pengguna' }))

    expect(onAddUser).toHaveBeenCalledWith({ email: 'new@example.com', role: 'Estimator', status: 'active' })
  })

  it('shows pending invited users in the user table', () => {
    render(<UserManagementView {...defaultProps} users={[...users, { id: 'pending_example_com', email: 'pending@example.com', name: 'pending@example.com', role: 'Admin', status: 'active', pending: true }]} />)

    expect(screen.getAllByText('pending@example.com')).toHaveLength(2)
    expect(screen.getByText('pending')).toBeInTheDocument()
  })

  it('shows skeleton rows in the table while users load', () => {
    render(<UserManagementView {...defaultProps} loading={true} />)

    expect(screen.getAllByTestId('table-skeleton-row').length).toBeGreaterThan(0)
    expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument()
  })
})
