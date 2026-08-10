import { beforeEach, describe, expect, it, vi } from 'vitest'

const firebaseMocks = vi.hoisted(() => ({
  addDoc: vi.fn(), collection: vi.fn((db, name) => ({ db, name })), deleteDoc: vi.fn(),
  doc: vi.fn((db, collectionName, id) => ({ db, collectionName, id })), getDoc: vi.fn(), getDocs: vi.fn(),
  limit: vi.fn(), orderBy: vi.fn(), query: vi.fn((...args) => args), setDoc: vi.fn(), updateDoc: vi.fn(), where: vi.fn(),
}))

vi.mock('firebase/firestore', () => firebaseMocks)
vi.mock('./app', () => ({ db: { id: 'db' } }))

import { getActualCost, listActualCosts, saveActualCost } from './firestoreHelpers'

describe('actual cost Firestore helpers', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists and reads actual cost documents', async () => {
    firebaseMocks.getDocs.mockResolvedValue({ docs: [{ id: 'e1', data: () => ({ actualTotal: 125000 }) }] })
    firebaseMocks.getDoc.mockResolvedValue({ exists: () => true, id: 'e1', data: () => ({ actualTotal: 125000 }) })

    expect(await listActualCosts()).toEqual([{ id: 'e1', actualTotal: 125000 }])
    expect(await getActualCost('e1')).toEqual({ id: 'e1', actualTotal: 125000 })
  })

  it('uses the estimate id as the actual cost document id', async () => {
    const payload = { estimateId: 'e1', status: 'draft', actualTotal: 125000 }
    await saveActualCost(payload)

    expect(firebaseMocks.doc).toHaveBeenCalledWith({ id: 'db' }, 'actualCosts', 'e1')
    expect(firebaseMocks.setDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }), payload)
  })
})
