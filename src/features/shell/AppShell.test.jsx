import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders admin navigation and signs out', () => {
    const onSignOut = vi.fn()
    render(
      <AppShell activeView="priceEstimation" onNavigate={vi.fn()} onSignOut={onSignOut} profile={{ name: 'Admin', role: 'Admin' }} />,
    )

    expect(screen.getByRole('button', { name: 'Price Estimation' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Price List / Master Data' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create Estimation' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Job Log' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'User Management' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(onSignOut).toHaveBeenCalledOnce()
  })

  it('hides admin navigation for estimators', () => {
    render(
      <AppShell activeView="priceEstimation" onNavigate={vi.fn()} onSignOut={vi.fn()} profile={{ name: 'Estimator', role: 'Estimator' }} />,
    )

    expect(screen.getByRole('button', { name: 'Price Estimation' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create Estimation' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Price List / Master Data' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Job Log' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'User Management' })).not.toBeInTheDocument()
  })

  it('navigates to selected view', () => {
    const onNavigate = vi.fn()
    render(
      <AppShell activeView="priceEstimation" onNavigate={onNavigate} onSignOut={vi.fn()} profile={{ name: 'Admin', role: 'Admin' }} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Price Estimation' }))
    expect(onNavigate).toHaveBeenCalledWith('priceEstimation')
  })
})
