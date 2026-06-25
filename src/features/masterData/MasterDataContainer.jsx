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
import { useToast } from '../../components/ui/Toast'
import { MasterDataView } from './MasterDataView'

export function MasterDataContainer({ profile }) {
  const toast = useToast()
  const [auditEntries, setAuditEntries] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [priceItems, setPriceItems] = useState([])

  async function loadMasterData() {
    setLoading(true)

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
      toast.error(loadError.message)
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
          toast.error(loadError.message)
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
  }, [toast])

  async function runAction(action) {
    setLoading(true)

    try {
      await action()
      await loadMasterData()
    } catch (actionError) {
      toast.error(actionError.message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
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
