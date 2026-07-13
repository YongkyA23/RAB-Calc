export const NAVIGATION_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', adminOnly: false },
  { key: 'priceEstimation', label: 'Estimasi Harga', adminOnly: false },
  { key: 'paperCalculator', label: 'Hitung Kertas', adminOnly: false },
  { key: 'vendorEstimates', label: 'Estimasi Vendor', adminOnly: false },
  { key: 'masterData', label: 'Daftar Harga / Master Data', adminOnly: true },
  { key: 'userManagement', label: 'Manajemen Pengguna', adminOnly: true },
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
