import { beforeEach, describe, expect, it, vi } from 'vitest'

const firebaseMocks = vi.hoisted(() => ({
  addDoc: vi.fn(), collection: vi.fn((db, name) => ({ db, name })), deleteDoc: vi.fn(),
  doc: vi.fn((db, collectionName, id) => ({ db, collectionName, id })), getDoc: vi.fn(), getDocs: vi.fn(),
  limit: vi.fn(), orderBy: vi.fn((field, direction) => ({ field, direction })), query: vi.fn((...args) => args),
  setDoc: vi.fn(), updateDoc: vi.fn(), where: vi.fn(),
}))

vi.mock('firebase/firestore', () => firebaseMocks)
vi.mock('./app', () => ({ db: { id: 'db' } }))

import {
  deletePaperCalculation,
  getPaperCalculatorDraft,
  listPaperCalculations,
  savePaperCalculation,
  savePaperCalculatorDraft,
} from './firestoreHelpers'

describe('paper calculator Firestore helpers', () => {
  beforeEach(() => vi.clearAllMocks())

  it('reads and writes the user draft document', async () => {
    firebaseMocks.getDoc.mockResolvedValue({ exists: () => true, id: 'u1', data: () => ({ schemaVersion: 1, userId: 'u1' }) })
    expect(await getPaperCalculatorDraft('u1')).toMatchObject({ id: 'u1', userId: 'u1' })
    await savePaperCalculatorDraft('u1', { activeTab: 'layout', drafts: {} })
    expect(firebaseMocks.doc).toHaveBeenCalledWith({ id: 'db' }, 'paperCalculatorDrafts', 'u1')
    expect(firebaseMocks.setDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'u1' }), expect.objectContaining({ schemaVersion: 1, userId: 'u1' }))
  })

  it('lists, saves, and deletes calculation snapshots', async () => {
    firebaseMocks.getDocs.mockResolvedValue({ docs: [{ id: 'calc-1', data: () => ({ title: 'Saved' }) }] })
    expect(await listPaperCalculations()).toEqual([{ id: 'calc-1', title: 'Saved' }])
    expect(firebaseMocks.orderBy).toHaveBeenCalledWith('createdAt', 'desc')
    await savePaperCalculation({ id: 'calc-2', title: 'Layout', module: 'layout', inputs: {}, result: {}, createdBy: { uid: 'u1', name: 'User' } })
    await deletePaperCalculation('calc-2')
    expect(firebaseMocks.deleteDoc).toHaveBeenCalledWith(expect.objectContaining({ collectionName: 'paperCalculations', id: 'calc-2' }))
  })
})

