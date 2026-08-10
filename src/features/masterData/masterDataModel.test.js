import { describe, expect, it } from 'vitest'
import {
  buildPriceItemPayload,
  filterPriceItemsByLayer,
  getCategoryFieldSchema,
  getEmptyPriceItemDraft,
  summarizeAuditEntry,
  validatePriceItemDraft,
} from './masterDataModel'

describe('master data model', () => {
  it('creates an empty price item draft for print layer', () => {
    expect(getEmptyPriceItemDraft('print')).toMatchObject({
      categoryLayer: 'print',
      name: '',
      prices: { A3: 0, B2: 0 },
      active: true,
    })
  })

  it('builds price item payload with numeric fields', () => {
    expect(
      buildPriceItemPayload({
        id: 'item-1',
        categoryId: 'print-materials',
        categoryLayer: 'print',
        name: 'Duplex',
        prices: { A3: '30000', B2: '40000' },
        turnaroundDays: '2',
        active: true,
      }),
    ).toMatchObject({
      id: 'item-1',
      categoryId: 'print-materials',
      categoryLayer: 'print',
      name: 'Duplex',
      prices: { A3: 30000, B2: 40000 },
      turnaroundDays: 2,
      active: true,
    })
  })

  it('filters price items by layer and active state', () => {
    const items = [
      { id: 'a', categoryLayer: 'print', active: true },
      { id: 'b', categoryLayer: 'print', active: false },
      { id: 'c', categoryLayer: 'digital', active: true },
    ]

    expect(filterPriceItemsByLayer(items, 'print')).toEqual([{ id: 'a', categoryLayer: 'print', active: true }])
  })

  it('uses category field schema with a fallback for older category documents', () => {
    expect(getCategoryFieldSchema({ layer: 'additional', fieldSchema: ['name', 'rate'] })).toEqual(['name', 'rate'])
    expect(getCategoryFieldSchema({ layer: 'manpower' })).toEqual(['name', 'dailyRate', 'turnaroundDays'])
  })

  it('sets B2 to null for an A3-only item', () => {
    expect(buildPriceItemPayload({
      name: 'Sticker',
      prices: { A3: '25000', B2: '40000' },
      a3Only: true,
    }).prices).toEqual({ A3: 25000, B2: null })
  })

  it('validates only fields required by the selected category', () => {
    expect(validatePriceItemDraft(
      { name: '', categoryId: 'additional-costs', additionalMode: 'percent', rate: '' },
      ['name', 'additionalMode', 'rate'],
    )).toEqual(['Nama item wajib diisi', 'Tarif harus lebih dari 0'])

    expect(validatePriceItemDraft(
      { name: 'Operator Fee', categoryId: 'additional-costs', additionalMode: 'manual' },
      ['name', 'additionalMode', 'rate'],
    )).toEqual([])
  })

  it('summarizes audit entries for display', () => {
    expect(
      summarizeAuditEntry({
        action: 'update',
        itemId: 'item-1',
        changedFields: ['name', 'prices'],
        editedBy: 'admin@example.com',
      }),
    ).toBe('update item-1: name, prices by admin@example.com')
  })
})
