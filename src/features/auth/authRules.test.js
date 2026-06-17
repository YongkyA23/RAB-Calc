import { describe, expect, it } from 'vitest'
import { canAccessMenu, getAccessState, getVisibleNavigation } from './authRules'

describe('auth access rules', () => {
  it('asks signed-out users to authenticate', () => {
    expect(getAccessState({ user: null, profile: null, profileCount: 0 })).toBe('signedOut')
  })

  it('allows first signed-in user to bootstrap admin when no profiles exist', () => {
    expect(getAccessState({ user: { uid: 'u1' }, profile: null, profileCount: 0 })).toBe('needsBootstrap')
  })

  it('blocks signed-in users without a profile after bootstrap exists', () => {
    expect(getAccessState({ user: { uid: 'u1' }, profile: null, profileCount: 2 })).toBe('missingProfile')
  })

  it('blocks inactive users', () => {
    expect(
      getAccessState({ user: { uid: 'u1' }, profile: { status: 'inactive', role: 'Admin' }, profileCount: 2 }),
    ).toBe('inactive')
  })

  it('allows active users into the app', () => {
    expect(
      getAccessState({ user: { uid: 'u1' }, profile: { status: 'active', role: 'Estimator' }, profileCount: 2 }),
    ).toBe('active')
  })

  it('shows admin-only navigation only to admins', () => {
    expect(getVisibleNavigation({ role: 'Estimator' }).map((item) => item.label)).toEqual([
      'Create Estimation',
      'Job Log',
    ])
    expect(getVisibleNavigation({ role: 'Admin' }).map((item) => item.label)).toEqual([
      'Create Estimation',
      'Price List / Master Data',
      'Job Log',
      'User Management',
    ])
  })

  it('prevents estimators from accessing admin menus', () => {
    expect(canAccessMenu({ role: 'Estimator' }, 'masterData')).toBe(false)
    expect(canAccessMenu({ role: 'Estimator' }, 'jobLog')).toBe(true)
    expect(canAccessMenu({ role: 'Admin' }, 'userManagement')).toBe(true)
  })
})
