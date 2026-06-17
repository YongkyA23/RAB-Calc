export const NAVIGATION_ITEMS = [
  { key: 'estimation', label: 'Create Estimation', adminOnly: false },
  { key: 'masterData', label: 'Price List / Master Data', adminOnly: true },
  { key: 'jobLog', label: 'Job Log', adminOnly: false },
  { key: 'userManagement', label: 'User Management', adminOnly: true },
]

export function getAccessState({ user, profile, profileCount }) {
  if (!user) {
    return 'signedOut'
  }

  if (!profile && profileCount === 0) {
    return 'needsBootstrap'
  }

  if (!profile) {
    return 'missingProfile'
  }

  if (profile.status !== 'active') {
    return 'inactive'
  }

  return 'active'
}

export function canAccessMenu(profile, key) {
  const item = NAVIGATION_ITEMS.find((navigationItem) => navigationItem.key === key)

  if (!item) {
    return false
  }

  return !item.adminOnly || profile?.role === 'Admin'
}

export function getVisibleNavigation(profile) {
  return NAVIGATION_ITEMS.filter((item) => canAccessMenu(profile, item.key))
}
