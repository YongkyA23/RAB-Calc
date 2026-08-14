import { describe, expect, it } from 'vitest'
import { createPortalLaunchUrl } from './ssoClient'

describe('createPortalLaunchUrl', () => {
  it('creates a PKCE-bound Project C launch URL', async () => {
    const url = new URL(await createPortalLaunchUrl('/estimates'))
    const configuredPortalOrigin = new URL(
      import.meta.env.VITE_SSO_PORTAL_URL || 'http://localhost:5173',
    ).origin
    expect(url.origin).toBe(configuredPortalOrigin)
    expect(url.pathname).toBe('/launch')
    expect(url.searchParams.get('app')).toBe('rab-calc')
    expect(url.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(url.searchParams.get('state')).toMatch(/^[A-Za-z0-9_-]{32}$/)
  })
})
