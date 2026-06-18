import { describe, expect, it } from 'vitest'
import { buildUserUpdatePayload, filterUsers, getEmptyUserFilters } from './userManagementModel'

const users = [
  { uid: 'u1', name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'active' },
  { uid: 'u2', name: 'Estimator User', email: 'estimator@example.com', role: 'Estimator', status: 'inactive' },
]

describe('user management model', () => {
  it('creates empty user filters', () => {
    expect(getEmptyUserFilters()).toEqual({ query: '', role: 'all', status: 'all' })
  })

  it('filters users by query role and status', () => {
    expect(filterUsers(users, { query: 'estimator', role: 'Estimator', status: 'inactive' })).toEqual([users[1]])
  })

  it('builds update payload for role and status changes', () => {
    expect(buildUserUpdatePayload({ name: 'New Name', role: 'Admin', status: 'active' })).toEqual({
      name: 'New Name',
      role: 'Admin',
      status: 'active',
    })
  })
})
