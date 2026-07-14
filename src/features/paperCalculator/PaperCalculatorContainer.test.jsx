import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../../components/ui/Toast'
import { PaperCalculatorContainer } from './PaperCalculatorContainer'

const firestoreMocks = vi.hoisted(() => ({
  deletePaperCalculation: vi.fn(),
  deletePaperCustomSize: vi.fn(),
  getPaperCalculatorDraft: vi.fn(),
  listPaperCalculations: vi.fn(),
  listPaperCustomSizes: vi.fn(),
  savePaperCalculation: vi.fn(),
  savePaperCalculatorDraft: vi.fn(),
  savePaperCustomSize: vi.fn(),
}))

vi.mock('../../firebase/firestoreHelpers', () => firestoreMocks)

function renderCalculator() {
  return render(<ToastProvider><PaperCalculatorContainer profile={{ uid: 'u1', name: 'Estimator', role: 'Estimator' }} /></ToastProvider>)
}

describe('PaperCalculatorContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    firestoreMocks.getPaperCalculatorDraft.mockResolvedValue(null)
    firestoreMocks.listPaperCalculations.mockResolvedValue([])
    firestoreMocks.listPaperCustomSizes.mockResolvedValue([])
    firestoreMocks.savePaperCalculatorDraft.mockResolvedValue({})
    firestoreMocks.savePaperCalculation.mockImplementation(async (input) => ({ ...input, createdAt: '2026-07-13T00:00:00.000Z', createdBy: input.createdBy.uid, createdByName: input.createdBy.name }))
  })

  it('hydrates, calculates in real time, and autosaves the workspace', async () => {
    renderCalculator()
    const width = await screen.findByRole('textbox', { name: 'Lebar desain (cm)' })
    fireEvent.change(width, { target: { value: '9' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Tinggi desain (cm)' }), { target: { value: '5,5' } })
    await waitFor(() => expect(screen.getByText('Pcs / lembar').parentElement).toHaveTextContent('25'))
    await waitFor(() => expect(firestoreMocks.savePaperCalculatorDraft).toHaveBeenCalled(), { timeout: 1800 })
  })

  it('saves a valid calculation snapshot to Firestore', async () => {
    renderCalculator()
    fireEvent.change(await screen.findByRole('textbox', { name: 'Lebar desain (cm)' }), { target: { value: '9' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Tinggi desain (cm)' }), { target: { value: '5,5' } })
    fireEvent.click(screen.getByRole('button', { name: /Simpan Perhitungan/ }))
    await waitFor(() => expect(firestoreMocks.savePaperCalculation).toHaveBeenCalledWith(expect.objectContaining({ module: 'layout', createdBy: expect.objectContaining({ uid: 'u1' }) })))
    expect(await screen.findByText(/Layout 48×32/)).toBeInTheDocument()
  })

  it('restores a Firestore draft and keeps every module directly accessible', async () => {
    firestoreMocks.getPaperCalculatorDraft.mockResolvedValue({ schemaVersion: 1, activeTab: 'layout', drafts: { layout: { designWidth: '10', designHeight: '10' } } })
    renderCalculator()
    expect(await screen.findByRole('textbox', { name: 'Lebar desain (cm)' })).toHaveValue('10')
    fireEvent.click(screen.getByRole('tab', { name: 'Potong Plano' }))
    expect(screen.getByRole('heading', { name: 'Potong Plano' })).toBeInTheDocument()
    expect(screen.queryByText(/terkunci/i)).not.toBeInTheDocument()
  })
})
