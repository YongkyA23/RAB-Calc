import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'

function renderShell({ profile = { name: 'Admin', role: 'Admin' }, path = '/estimates' } = {}) {
  const onSignOut = vi.fn()
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppShell onSignOut={onSignOut} profile={profile}>
        <div>Page content</div>
      </AppShell>
    </MemoryRouter>,
  )
  return { onSignOut }
}

describe('AppShell', () => {
  it('renders admin navigation as links and signs out', () => {
    const { onSignOut } = renderShell()

    expect(screen.getAllByRole('link', { name: /Price Estimation/ })[0]).toHaveAttribute('href', '/estimates')
    expect(screen.getAllByRole('link', { name: /Price List \/ Master Data/ })[0]).toHaveAttribute('href', '/master-data')
    expect(screen.queryByRole('link', { name: /Create Estimation/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Job Log/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /User Management/ })[0]).toHaveAttribute('href', '/users')

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })

  it('hides admin navigation for estimators', () => {
    renderShell({ profile: { name: 'Estimator', role: 'Estimator' } })

    expect(screen.getAllByRole('link', { name: /Price Estimation/ })[0]).toHaveAttribute('href', '/estimates')
    expect(screen.queryByRole('link', { name: /Create Estimation/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Price List \/ Master Data/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Job Log/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /User Management/ })).not.toBeInTheDocument()
  })

  it('uses route path for active page heading', () => {
    renderShell({ path: '/master-data' })

    expect(screen.getByRole('heading', { name: 'Price List / Master Data' })).toBeInTheDocument()
  })
})
