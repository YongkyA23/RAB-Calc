import { normalizeSearchText } from '../../lib/format'

export function getEmptyUserFilters() {
  return { query: '', role: 'all', status: 'all' }
}

export function filterUsers(users, filters) {
  const query = normalizeSearchText(filters.query)

  return users.filter((user) => {
    const haystack = normalizeSearchText([user.name, user.email, user.role, user.status].join(' '))

    if (query && !haystack.includes(query)) return false
    if (filters.role !== 'all' && user.role !== filters.role) return false
    if (filters.status !== 'all' && user.status !== filters.status) return false

    return true
  })
}

export function buildUserUpdatePayload(draft) {
  return {
    name: draft.name.trim(),
    role: draft.role,
    status: draft.status,
  }
}
