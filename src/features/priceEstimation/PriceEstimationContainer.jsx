import { useEffect, useState } from 'react'
import { COLLECTIONS } from '../../firebase/collections'
import { db } from '../../firebase/app'
import { doc, deleteDoc } from 'firebase/firestore'
import { listActivePriceItems, listEstimates, saveEstimate } from '../../firebase/firestoreHelpers'
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
  const [estimates, setEstimates] = useState([])
  const [error, setError] = useState('')
  const [formKey, setFormKey] = useState(0)
  const [initialDraft, setInitialDraft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('list')
  const [priceItems, setPriceItems] = useState([])
  const [selectedEstimate, setSelectedEstimate] = useState(null)
  const [success, setSuccess] = useState('')

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
        if (!ignore) setError(loadError.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadInitialData()

    return () => {
      ignore = true
    }
  }, [])

  function openForm(draft, estimate = null) {
    setInitialDraft(draft)
    setSelectedEstimate(estimate)
    setFormKey((current) => current + 1)
    setMode('form')
    setError('')
    setSuccess('')
  }

  function handleCreateNew() {
    openForm(createEmptyQuoteDraft())
  }

  function handleEditDraft(estimate) {
    openForm(buildDraftFromEstimate(estimate), estimate)
  }

  function handleDuplicateEstimate(estimate) {
    openForm(buildDraftFromEstimate(estimate))
  }

  function handleViewEstimate(estimate) {
    setSelectedEstimate(estimate)
    setMode('detail')
    setError('')
    setSuccess('')
  }

  async function runSave(action, message) {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await action()
      await loadData()
      setMode('list')
      setSuccess(message)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setLoading(false)
    }
  }

  function creator() {
    return { uid: profile.uid, name: profile.name || profile.email }
  }

  async function handleSaveDraft(draft) {
    const payload = buildDraftEstimateFromDraft(draft, creator(), selectedEstimate?.id)
    await runSave(() => saveEstimate(payload), 'Draft saved')
  }

  async function handleCreateEstimate(estimate, draft) {
    await runSave(
      () =>
        saveEstimate({
          ...estimate,
          id: selectedEstimate?.id ?? estimate.id,
          createdBy: creator(),
          draft,
          status: 'created',
        }),
      'Estimate created',
    )
  }

  async function handleDeleteDraft(estimate) {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await deleteDoc(doc(db, COLLECTIONS.quotes, estimate.id))
      await loadData()
      setMode('list')
      setSelectedEstimate(null)
      setSuccess('Estimate deleted')
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div> : null}
      {mode === 'list' ? (
        <PriceEstimationListView
          estimates={estimates}
          loading={loading}
          onCreateNew={handleCreateNew}
          onDeleteEstimate={handleDeleteDraft}
          onDuplicateEstimate={handleDuplicateEstimate}
          onEditDraft={handleEditDraft}
          onExportCsv={(_visibleEstimates, csv) => downloadCsv(csv)}
          onViewEstimate={handleViewEstimate}
        />
      ) : null}
      {mode === 'detail' ? (
        <PriceEstimationDetailView
          estimate={selectedEstimate}
          loading={loading}
          onBack={() => setMode('list')}
          onDelete={handleDeleteDraft}
          onDuplicate={handleDuplicateEstimate}
          onEdit={handleEditDraft}
        />
      ) : null}
      {mode === 'form' ? (
        <EstimationView
          key={formKey}
          initialDraft={initialDraft}
          loading={loading}
          onCancel={() => setMode('list')}
          onCreateEstimate={handleCreateEstimate}
          onSaveDraft={handleSaveDraft}
          priceItems={priceItems}
        />
      ) : null}
    </div>
  )
}
