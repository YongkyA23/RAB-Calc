import { useEffect, useMemo, useState } from 'react'
import { listEstimates, listVendorEstimates } from '../../firebase/firestoreHelpers'
import { useToast } from '../../components/ui/Toast'
import { normalizeEstimateStatus } from '../priceEstimation/priceEstimationModel'
import { DashboardView } from './DashboardView'

function estimateLabel(estimate) {
  return estimate.jobNo || estimate.sku || estimate.client || 'Untitled estimate'
}

export function DashboardContainer({ profile }) {
  const toast = useToast()
  const [estimates, setEstimates] = useState([])
  const [vendorEstimates, setVendorEstimates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadData() {
      try {
        const [nextEstimates, nextVendor] = await Promise.all([listEstimates(), listVendorEstimates()])
        if (!ignore) {
          setEstimates(nextEstimates)
          setVendorEstimates(nextVendor)
        }
      } catch (loadError) {
        if (!ignore) toast.error(loadError.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadData()

    return () => {
      ignore = true
    }
  }, [toast])

  const stats = useMemo(() => {
    const draftCount = estimates.filter((estimate) => normalizeEstimateStatus(estimate) === 'draft').length
    return {
      estimateCount: estimates.length,
      draftCount,
      createdCount: estimates.length - draftCount,
      estimateValue: estimates.reduce((sum, estimate) => sum + (Number(estimate.grandTotal) || 0), 0),
      vendorCount: vendorEstimates.length,
      vendorValue: vendorEstimates.reduce((sum, vendor) => sum + (Number(vendor.price) || 0), 0),
    }
  }, [estimates, vendorEstimates])

  const activity = useMemo(() => {
    const estimateItems = estimates.map((estimate) => ({
      type: 'estimate',
      id: estimate.id,
      label: estimateLabel(estimate),
      value: Number(estimate.grandTotal) || 0,
      date: estimate.updatedAt || estimate.date,
      to: `/estimates/${estimate.id}`,
    }))
    const vendorItems = vendorEstimates.map((vendor) => ({
      type: 'vendor',
      id: vendor.id,
      label: vendor.projectTitle || vendor.vendorName || 'Vendor estimate',
      value: Number(vendor.price) || 0,
      date: vendor.updatedAt,
      to: `/vendor-estimates/${vendor.id}`,
    }))
    return [...estimateItems, ...vendorItems]
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .slice(0, 8)
  }, [estimates, vendorEstimates])

  return <DashboardView activity={activity} loading={loading} profile={profile} stats={stats} />
}
