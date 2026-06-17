import { useEffect, useState } from 'react'
import {
  deactivatePriceItem,
  listCategories,
  listPriceItems,
  listRecentPriceAuditEntries,
  savePriceItem,
  seedDefaultCatalog,
} from '../../firebase/firestoreHelpers'
import { DEFAULT_CATEGORIES } from '../../data/seedData'
import { MasterDataView } from './MasterDataView'

export function MasterDataContainer({ profile }) {
  const [auditEntries, setAuditEntries] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [priceItems, setPriceItems] = useState([])

  async function loadMasterData() {
    setLoading(true)
    setError('')

    try {
      const [nextCategories, nextPriceItems, nextAuditEntries] = await Promise.all([
        listCategories(),
        listPriceItems(),
        listRecentPriceAuditEntries(),
      ])
      setCategories(nextCategories.length ? nextCategories : DEFAULT_CATEGORIES)
      setPriceItems(nextPriceItems)
      setAuditEntries(nextAuditEntries)
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialMasterData() {
      try {
        const [nextCategories, nextPriceItems, nextAuditEntries] = await Promise.all([
          listCategories(),
          listPriceItems(),
          listRecentPriceAuditEntries(),
        ])

        if (!ignore) {
          setCategories(nextCategories.length ? nextCategories : DEFAULT_CATEGORIES)
          setPriceItems(nextPriceItems)
          setAuditEntries(nextAuditEntries)
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadInitialMasterData()

    return () => {
      ignore = true
    }
  }, [])

  async function runAction(action) {
    setLoading(true)
    setError('')

    try {
      await action()
      await loadMasterData()
    } catch (actionError) {
      setError(actionError.message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <MasterDataView
        auditEntries={auditEntries}
        categories={categories}
        loading={loading}
        onDeactivateItem={(item) => runAction(() => deactivatePriceItem(item, profile.email || profile.uid))}
        onSaveItem={(item) => runAction(() => savePriceItem(item, profile.email || profile.uid, priceItems.find((current) => current.id === item.id)))}
        onSeedDefaults={() => runAction(() => seedDefaultCatalog(profile.email || profile.uid))}
        priceItems={priceItems}
      />
    </div>
  )
}
