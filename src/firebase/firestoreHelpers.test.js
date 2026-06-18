import { describe, expect, it } from 'vitest'
import {
  buildInviteProfile,
  getAllowlistDocId,
  INITIAL_ADMIN_EMAIL,
  INITIAL_ALLOWLIST_EMAILS,
  normalizeEmail,
} from './firestoreHelpers'

describe('allowlist helpers', () => {
  it('normalizes emails for allowlist checks', () => {
    expect(normalizeEmail('  NoobsNoobs28@Gmail.COM  ')).toBe('noobsnoobs28@gmail.com')
  })

  it('uses deterministic allowlist document ids', () => {
    expect(getAllowlistDocId('NoobsNoobs28@Gmail.COM')).toBe('noobsnoobs28_gmail_com')
  })

  it('includes initial approved email', () => {
    expect(INITIAL_ALLOWLIST_EMAILS).toEqual(['noobsnoobs28@gmail.com'])
  })

  it('uses initial admin email for invites', () => {
    expect(INITIAL_ADMIN_EMAIL).toBe('noobsnoobs28@gmail.com')
    expect(INITIAL_ALLOWLIST_EMAILS).toEqual(['noobsnoobs28@gmail.com'])
  })

  it('builds active admin invite profiles by default', () => {
    expect(buildInviteProfile(' NewUser@Example.COM ', undefined, undefined, 'admin@example.com')).toMatchObject({
      email: 'newuser@example.com',
      name: 'newuser@example.com',
      role: 'Admin',
      status: 'active',
      invitedBy: 'admin@example.com',
    })
  })
})
