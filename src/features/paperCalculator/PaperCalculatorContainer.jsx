import { useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '../../components/ui/Toast'
import {
  deletePaperCalculation,
  deletePaperCustomSize,
  getPaperCalculatorDraft,
  listPaperCalculations,
  listPaperCustomSizes,
  savePaperCalculation,
  savePaperCalculatorDraft,
  savePaperCustomSize,
} from '../../firebase/firestoreHelpers'
import { calculateBook } from './domain/bookCalculator'
import { calculateLayout } from './domain/layoutCalculator'
import { parseCalculatorDecimal } from './domain/numbers'
import { calculatePlano } from './domain/planoCalculator'
import { calculateTimeEstimate } from './domain/timeCalculator'
import { createPaperCalculatorWorkspace } from './paperCalculatorDefaults'
import {
  canDeletePaperRecord,
  createCalculatorId,
  defaultCalculationTitle,
  hasDuplicateCustomSize,
  hydratePaperWorkspace,
  PAPER_CALCULATOR_MODULES,
  validateCustomSize,
} from './persistence/paperCalculatorPersistence'
import { PaperCalculatorView } from './PaperCalculatorView'

function calculateWorkspaceResults(drafts) {
  return {
    layout: calculateLayout(drafts.layout),
    book: calculateBook(drafts.book),
    plano: calculatePlano(drafts.plano),
    time: calculateTimeEstimate(drafts.time),
  }
}

export function PaperCalculatorContainer({ profile }) {
  const toast = useToast()
  const userId = profile?.uid || profile?.id
  const [workspace, setWorkspace] = useState(createPaperCalculatorWorkspace)
  const [calculations, setCalculations] = useState([])
  const [customSizes, setCustomSizes] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saveStatus, setSaveStatus] = useState('loading')
  const revisionRef = useRef(0)

  useEffect(() => {
    let ignore = false
    async function hydrate() {
      if (!userId) {
        setHydrated(true)
        setSaveStatus('error')
        return
      }
      const [draftResult, calculationsResult, sizesResult] = await Promise.allSettled([
        getPaperCalculatorDraft(userId),
        listPaperCalculations(),
        listPaperCustomSizes(),
      ])
      if (ignore) return
      if (draftResult.status === 'fulfilled') setWorkspace(hydratePaperWorkspace(draftResult.value))
      if (calculationsResult.status === 'fulfilled') setCalculations(calculationsResult.value)
      if (sizesResult.status === 'fulfilled') setCustomSizes(sizesResult.value)
      const failed = [draftResult, calculationsResult, sizesResult].find((result) => result.status === 'rejected')
      if (failed) toast.error(`Sebagian data Hitung Kertas gagal dimuat: ${failed.reason?.message ?? 'Firestore tidak tersedia'}`)
      setHydrated(true)
      setSaveStatus('saved')
    }
    hydrate()
    return () => { ignore = true }
  }, [toast, userId])

  useEffect(() => {
    if (!hydrated || !dirty || !userId) return undefined
    const revision = revisionRef.current
    const timer = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await savePaperCalculatorDraft(userId, workspace)
        if (revisionRef.current === revision) {
          setDirty(false)
          setSaveStatus('saved')
        }
      } catch (error) {
        setSaveStatus('error')
        toast.error(`Draft gagal disimpan: ${error.message}`)
      }
    }, 650)
    return () => clearTimeout(timer)
  }, [dirty, hydrated, toast, userId, workspace])

  const results = useMemo(() => calculateWorkspaceResults(workspace.drafts), [workspace.drafts])
  const activeResult = results[workspace.activeTab]

  function markChanged(nextWorkspace) {
    revisionRef.current += 1
    setWorkspace(nextWorkspace)
    setDirty(true)
    setSaveStatus('pending')
  }

  function changeTab(activeTab) {
    markChanged({ ...workspace, activeTab })
  }

  function changeDraft(module, draft) {
    markChanged({ ...workspace, drafts: { ...workspace.drafts, [module]: draft } })
  }

  async function saveCalculation(title) {
    if (activeResult.status !== 'ready') return false
    try {
      const payload = await savePaperCalculation({
        id: createCalculatorId('calc'),
        title: title.trim() || defaultCalculationTitle(workspace.activeTab, activeResult),
        module: workspace.activeTab,
        inputs: workspace.drafts[workspace.activeTab],
        result: activeResult,
        createdBy: { uid: userId, name: profile?.name, email: profile?.email },
      })
      setCalculations((current) => [payload, ...current])
      toast.success('Perhitungan tersimpan di Firestore.')
      return true
    } catch (error) {
      toast.error(`Perhitungan gagal disimpan: ${error.message}`)
      return false
    }
  }

  function openCalculation(calculation) {
    if (!PAPER_CALCULATOR_MODULES.has(calculation.module) || !calculation.inputs) return
    markChanged({
      ...workspace,
      activeTab: calculation.module,
      drafts: { ...workspace.drafts, [calculation.module]: calculation.inputs },
    })
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }

  async function removeCalculation(calculation) {
    try {
      await deletePaperCalculation(calculation.id)
      setCalculations((current) => current.filter((item) => item.id !== calculation.id))
      toast.success('Riwayat perhitungan dihapus.')
    } catch (error) {
      toast.error(`Riwayat gagal dihapus: ${error.message}`)
    }
  }

  async function saveCustomSize(candidate) {
    const normalized = {
      ...candidate,
      width: parseCalculatorDecimal(candidate.width),
      height: parseCalculatorDecimal(candidate.height),
    }
    const errors = validateCustomSize(normalized)
    if (errors.length) {
      toast.error(errors[0])
      return false
    }
    if (hasDuplicateCustomSize(customSizes, normalized)) {
      toast.error('Ukuran yang sama sudah tersimpan.')
      return false
    }
    try {
      const payload = await savePaperCustomSize({
        ...normalized,
        id: createCalculatorId('size'),
        createdBy: { uid: userId, name: profile?.name, email: profile?.email },
      })
      setCustomSizes((current) => [...current, payload])
      toast.success('Ukuran custom tersimpan di Firestore.')
      return true
    } catch (error) {
      toast.error(`Ukuran gagal disimpan: ${error.message}`)
      return false
    }
  }

  async function removeCustomSize(size) {
    try {
      await deletePaperCustomSize(size.id)
      setCustomSizes((current) => current.filter((item) => item.id !== size.id))
      toast.success('Ukuran custom dihapus.')
    } catch (error) {
      toast.error(`Ukuran gagal dihapus: ${error.message}`)
    }
  }

  const decoratedCalculations = calculations.map((item) => ({ ...item, canDelete: canDeletePaperRecord(item, { ...profile, uid: userId }) }))
  const decoratedSizes = customSizes.map((item) => ({ ...item, canDelete: canDeletePaperRecord(item, { ...profile, uid: userId }) }))

  return (
    <PaperCalculatorView
      activeResult={activeResult}
      calculations={decoratedCalculations}
      hydrated={hydrated}
      onDeleteCalculation={removeCalculation}
      onDeleteSize={removeCustomSize}
      onDraftChange={changeDraft}
      onOpenCalculation={openCalculation}
      onSaveCalculation={saveCalculation}
      onSaveSize={saveCustomSize}
      onTabChange={changeTab}
      results={results}
      saveStatus={saveStatus}
      sizes={decoratedSizes}
      workspace={workspace}
    />
  )
}

