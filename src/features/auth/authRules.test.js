import { describe, expect, it } from 'vitest'
import { canAccessMenu, getAccessState, getVisibleNavigation } from './authRules'

describe('auth access rules', () => {
  it('asks signed-out users to authenticate', () => {
    expect(getAccessState({ user: null, profile: null })).toBe('signedOut')
  })

  it('blocks signed-in users without a portal-managed profile', () => {
    expect(getAccessState({ user: { uid: 'u1' }, profile: null })).toBe('missingProfile')
  })

  it('blocks inactive users', () => {
    expect(
      getAccessState({ user: { uid: 'u1' }, profile: { status: 'inactive', role: 'Admin' } }),
    ).toBe('inactive')
  })

  it('allows active users into the app', () => {
    expect(
      getAccessState({ user: { uid: 'u1' }, profile: { status: 'active', role: 'Estimator' } }),
    ).toBe('active')
  })

  it('shows admin-only navigation only to admins', () => {
    expect(getVisibleNavigation({ role: 'Estimator' }).map((item) => item.label)).toEqual([
      'Dashboard',
      'Estimasi Harga',
      'Hitung Kertas',
      'Estimasi Vendor',
    ])
    expect(getVisibleNavigation({ role: 'Admin' }).map((item) => item.label)).toEqual([
      'Dashboard',
      'Estimasi Harga',
      'Hitung Kertas',
      'Estimasi Vendor',
      'Daftar Harga / Master Data',
    ])
  })

  it('prevents estimators from accessing admin menus', () => {
    expect(canAccessMenu({ role: 'Estimator' }, 'masterData')).toBe(false)
    expect(canAccessMenu({ role: 'Estimator' }, 'priceEstimation')).toBe(true)
    expect(canAccessMenu({ role: 'Estimator' }, 'paperCalculator')).toBe(true)
    expect(canAccessMenu({ role: 'Estimator' }, 'vendorEstimates')).toBe(true)
    expect(canAccessMenu({ role: 'Admin' }, 'userManagement')).toBe(false)
  })
})
