import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { COLLECTIONS } from '../../firebase/collections'
import { db } from '../../firebase/app'
import { doc, deleteDoc } from 'firebase/firestore'
import { listActivePriceItems, listEstimates, saveEstimate } from '../../firebase/firestoreHelpers'
import { printInternalEstimatePdf } from '../../lib/estimatePdf'
import { useToast } from '../../components/ui/Toast'
import { createEmptyQuoteDraft, buildDraftEstimateFromDraft } from '../estimation/estimationModel'
import { EstimationView } from '../estimation/EstimationView'
import { PriceEstimationDetailView } from './PriceEstimationDetailView'
import { buildDraftFromEstimate } from './priceEstimationModel'
import { PriceEstimationListView } from './PriceEstimationListView'

function downloadCsv(csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'price-estimates.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function PriceEstimationContainer({ profile }) {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()
  const { estimateId } = useParams()
  const [estimates, setEstimates] = useState([])
  const [formKey, setFormKey] = useState(0)
  const [initialDraft, setInitialDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [priceItems, setPriceItems] = useState([])
  const [selectedEstimate, setSelectedEstimate] = useState(null)
  const routeMode = location.pathname.endsWith('/new') || location.pathname.endsWith('/edit') ? 'form' : estimateId ? 'detail' : 'list'
  const routeEstimate = useMemo(() => estimates.find((estimate) => estimate.id === estimateId) ?? null, [estimateId, estimates])

  async function loadData() {
    const [nextEstimates, nextPriceItems] = await Promise.all([listEstimates(), listActivePriceItems()])
    setEstimates(nextEstimates)
    setPriceItems(nextPriceItems)
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialData() {
      try {
        const [nextEstimates, nextPriceItems] = await Promise.all([listEstimates(), listActivePriceItems()])
        if (!ignore) {
          setEstimates(nextEstimates)
          setPriceItems(nextPriceItems)
        }
      } catch (loadError) {
        if (!ignore) toast.error(loadError.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadInitialData()

    return () => {
      ignore = true
    }
  }, [toast])

  function openForm(draft, estimate = null, path = '/estimates/new') {
    setInitialDraft(draft)
    setSelectedEstimate(estimate)
    setFormKey((current) => current + 1)
    navigate(path)
  }

  function handleCreateNew() {
    openForm(createEmptyQuoteDraft())
  }

  function handleEditDraft(estimate) {
    openForm(buildDraftFromEstimate(estimate), estimate, `/estimates/${estimate.id}/edit`)
  }

  function handleDuplicateEstimate(estimate) {
    openForm(buildDraftFromEstimate(estimate))
  }

  function handleViewEstimate(estimate) {
    setSelectedEstimate(estimate)
    navigate(`/estimates/${estimate.id}`)
  }

  async function runSave(action, message) {
    setLoading(true)

    try {
      await action()
      await loadData()
      navigate('/estimates')
      toast.success(message)
    } catch (saveError) {
      toast.error(saveError.message)
    } finally {
      setLoading(false)
    }
  }

  function creator() {
    return { uid: profile.uid, name: profile.name || profile.email }
  }

  async function handleSaveDraft(draft) {
    const estimate = selectedEstimate ?? routeEstimate
    const payload = buildDraftEstimateFromDraft(draft, creator(), estimate?.id, priceItems)
    await runSave(() => saveEstimate(payload), 'Draft saved')
  }

  async function handleCreateEstimate(estimate, draft) {
    const currentEstimate = selectedEstimate ?? routeEstimate
    await runSave(
      () =>
        saveEstimate({
          ...estimate,
          id: currentEstimate?.id ?? estimate.id,
          createdBy: creator(),
          draft,
          status: 'created',
        }),
      'Estimate created',
    )
  }

  async function handleDeleteDraft(estimate) {
    setLoading(true)

    try {
      await deleteDoc(doc(db, COLLECTIONS.quotes, estimate.id))
      await loadData()
      navigate('/estimates')
      setSelectedEstimate(null)
      toast.success('Estimate deleted')
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
      await Promise.all(items.map((estimate) => deleteDoc(doc(db, COLLECTIONS.quotes, estimate.id))))
      await loadData()
      toast.success(`${items.length} estimate${items.length > 1 ? 's' : ''} deleted`)
    } catch (deleteError) {
      toast.error(deleteError.message)
    } finally {
      setLoading(false)
    }
  }

  const currentEstimate = selectedEstimate ?? routeEstimate
  const formDraft = initialDraft ?? (currentEstimate ? buildDraftFromEstimate(currentEstimate) : createEmptyQuoteDraft())

  return (
    <div className="space-y-4">
      {routeMode === 'list' ? (
        <PriceEstimationListView
          estimates={estimates}
          loading={loading}
          onBulkDelete={handleBulkDelete}
          onCreateNew={handleCreateNew}
          onDeleteEstimate={handleDeleteDraft}
          onDuplicateEstimate={handleDuplicateEstimate}
          onEditDraft={handleEditDraft}
          onExportCsv={(_visibleEstimates, csv) => downloadCsv(csv)}
          onViewEstimate={handleViewEstimate}
        />
      ) : null}
      {routeMode === 'detail' ? (
        <PriceEstimationDetailView
          estimate={currentEstimate}
          loading={loading}
          onBack={() => navigate('/estimates')}
          onDelete={handleDeleteDraft}
          onDuplicate={handleDuplicateEstimate}
          onEdit={handleEditDraft}
          onGeneratePdf={printInternalEstimatePdf}
        />
      ) : null}
      {routeMode === 'form' ? (
        <EstimationView
          key={`${formKey}-${location.pathname}-${currentEstimate?.id ?? 'new'}`}
          initialDraft={formDraft}
          loading={loading}
          onCancel={() => navigate('/estimates')}
          onCreateEstimate={handleCreateEstimate}
          onSaveDraft={handleSaveDraft}
          priceItems={priceItems}
        />
      ) : null}
    </div>
  )
}
