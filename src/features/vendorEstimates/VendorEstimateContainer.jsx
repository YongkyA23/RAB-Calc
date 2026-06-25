import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  deleteVendorEstimate,
  getVendorEstimate,
  listVendorEstimates,
  saveVendorEstimate,
} from '../../firebase/firestoreHelpers'
import { useToast } from '../../components/ui/Toast'
import { VendorEstimateDetailView } from './VendorEstimateDetailView'
import { VendorEstimateFormView } from './VendorEstimateFormView'
import {
  buildVendorEstimateInput,
  createEmptyVendorEstimateDraft,
  validateVendorEstimateDraft,
} from './vendorEstimateModel'
import { VendorEstimateListView } from './VendorEstimateListView'

function buildVendorEstimateId() {
  return `vendor-estimate-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function buildDraftFromEstimate(estimate) {
  return {
    projectTitle: estimate?.projectTitle ?? '',
    projectInfo: estimate?.projectInfo ?? '',
    vendorName: estimate?.vendorName ?? '',
    price: estimate?.price ?? '',
    attachmentUrl: estimate?.attachmentUrl ?? '',
    attachmentName: estimate?.attachmentName ?? '',
    attachmentType: estimate?.attachmentType ?? '',
  }
}

export function VendorEstimateContainer({ profile }) {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { vendorEstimateId } = useParams()
  const [estimates, setEstimates] = useState([])
  const [errors, setErrors] = useState([])
  const [formDraft, setFormDraft] = useState(createEmptyVendorEstimateDraft())
  const [loading, setLoading] = useState(true)
  const [selectedEstimate, setSelectedEstimate] = useState(null)

  const routeMode = location.pathname.endsWith('/new') || location.pathname.endsWith('/edit')
    ? 'form'
    : vendorEstimateId
      ? 'detail'
      : 'list'

  const routeEstimate = useMemo(
    () => estimates.find((estimate) => estimate.id === vendorEstimateId) ?? null,
    [estimates, vendorEstimateId],
  )

  useEffect(() => {
    let ignore = false

    async function loadInitial() {
      setLoading(true)
      try {
        const nextEstimates = await listVendorEstimates()
        if (ignore) return
        setEstimates(nextEstimates)
      } catch (loadError) {
        if (!ignore) toast.error(loadError.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadInitial()

    return () => {
      ignore = true
    }
  }, [toast])

  useEffect(() => {
    if (routeMode !== 'form') return

    const sourceEstimate = selectedEstimate ?? routeEstimate
    if (!sourceEstimate) {
      setFormDraft(createEmptyVendorEstimateDraft())
      return
    }

    setFormDraft(buildDraftFromEstimate(sourceEstimate))
  }, [routeEstimate, routeMode, selectedEstimate])

  useEffect(() => {
    if (!vendorEstimateId || routeEstimate || routeMode === 'list') return

    let ignore = false

    async function loadSingle() {
      try {
        const estimate = await getVendorEstimate(vendorEstimateId)
        if (!ignore && estimate) {
          setEstimates((current) => {
            if (current.some((item) => item.id === estimate.id)) return current
            return [estimate, ...current]
          })
        }
      } catch {
        // ignore single-fetch errors, list flow handles main error state
      }
    }

    loadSingle()

    return () => {
      ignore = true
    }
  }, [routeEstimate, routeMode, vendorEstimateId])

  function creator() {
    return { uid: profile.uid, name: profile.name || profile.email }
  }

  async function refreshList() {
    const nextEstimates = await listVendorEstimates()
    setEstimates(nextEstimates)
  }

  function handleCreateNew() {
    setSelectedEstimate(null)
    setFormDraft(createEmptyVendorEstimateDraft())
    setErrors([])
    navigate('/vendor-estimates/new')
  }

  function handleViewEstimate(estimate) {
    setSelectedEstimate(estimate)
    setErrors([])
    navigate(`/vendor-estimates/${estimate.id}`)
  }

  function handleEditEstimate(estimate) {
    setSelectedEstimate(estimate)
    setFormDraft(buildDraftFromEstimate(estimate))
    setErrors([])
    navigate(`/vendor-estimates/${estimate.id}/edit`)
  }

  function updateDraft(field, value) {
    setFormDraft((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit() {
    const existing = selectedEstimate ?? routeEstimate
    const nextErrors = validateVendorEstimateDraft(formDraft)

    setErrors(nextErrors)
    if (nextErrors.length) return

    setLoading(true)

    const estimateId = existing?.id ?? buildVendorEstimateId()

    try {
      const payload = buildVendorEstimateInput({
        creator: creator(),
        draft: formDraft,
        existing,
        id: estimateId,
      })

      await saveVendorEstimate(payload)
      await refreshList()
      setErrors([])
      setSelectedEstimate(null)
      toast.success(existing ? 'Vendor estimate updated' : 'Vendor estimate saved')
      navigate('/vendor-estimates')
    } catch (saveError) {
      toast.error(saveError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteEstimate(estimate) {
    setLoading(true)

    try {
      await deleteVendorEstimate(estimate.id)
      await refreshList()
      setSelectedEstimate(null)
      toast.success('Vendor estimate deleted')
      navigate('/vendor-estimates')
    } catch (deleteError) {
      toast.error(deleteError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleBulkDelete(items) {
    if (!items?.length) return
    setLoading(true)

    try {
      await Promise.all(items.map((estimate) => deleteVendorEstimate(estimate.id)))
      await refreshList()
      setSelectedEstimate(null)
      toast.success(`${items.length} vendor estimate${items.length > 1 ? 's' : ''} deleted`)
    } catch (deleteError) {
      toast.error(deleteError.message)
    } finally {
      setLoading(false)
    }
  }

  function handleExportCsv(_items, csv) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'vendor-estimates.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const currentEstimate = selectedEstimate ?? routeEstimate

  return (
    <div className="space-y-4">
      {routeMode === 'list' ? (
        <VendorEstimateListView
          estimates={estimates}
          loading={loading}
          onBulkDelete={handleBulkDelete}
          onCreateNew={handleCreateNew}
          onDeleteEstimate={handleDeleteEstimate}
          onEditEstimate={handleEditEstimate}
          onExportCsv={handleExportCsv}
          onViewEstimate={handleViewEstimate}
        />
      ) : null}

      {routeMode === 'detail' ? (
        <VendorEstimateDetailView
          estimate={currentEstimate}
          loading={loading}
          onBack={() => navigate('/vendor-estimates')}
          onDelete={handleDeleteEstimate}
          onEdit={handleEditEstimate}
        />
      ) : null}

      {routeMode === 'form' ? (
        <VendorEstimateFormView
          draft={formDraft}
          errors={errors}
          loading={loading}
          onCancel={() => navigate('/vendor-estimates')}
          onChange={updateDraft}
          onSubmit={handleSubmit}
          title={currentEstimate ? 'Edit Vendor Estimate' : 'Create Vendor Estimate'}
        />
      ) : null}
    </div>
  )
}
