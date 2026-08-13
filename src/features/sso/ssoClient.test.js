import { describe, expect, it } from 'vitest'
import { createPortalLaunchUrl } from './ssoClient'

describe('createPortalLaunchUrl', () => {
  it('creates a PKCE-bound Project C launch URL', async () => {
    const url = new URL(await createPortalLaunchUrl('/estimates'))
    expect(url.origin).toBe('http://localhost:5173')
    expect(url.pathname).toBe('/launch')
    expect(url.searchParams.get('app')).toBe('rab-calc')
    expect(url.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(url.searchParams.get('state')).toMatch(/^[A-Za-z0-9_-]{32}$/)
  })
})
