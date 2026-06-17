import { describe, expect, it } from 'vitest'
import { DEFAULT_CATEGORIES, DEFAULT_PRICE_ITEMS, getDefaultCatalogCounts } from './seedData'

describe('seed data', () => {
  it('defines built-in categories for every calculator layer', () => {
    expect(DEFAULT_CATEGORIES.map((category) => category.layer)).toEqual([
      'print',
      'digital',
      'manual',
      'manpower',
      'additional',
    ])
  })

  it('includes required default price items from the requirements docs', () => {
    expect(DEFAULT_PRICE_ITEMS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Duplex 270–350 gsm', categoryLayer: 'print' }),
        expect.objectContaining({ name: 'Laminating Glossy/Matte', categoryLayer: 'digital' }),
        expect.objectContaining({ name: 'Die Cut Manual', categoryLayer: 'manual' }),
        expect.objectContaining({ name: 'Default Manpower', categoryLayer: 'manpower' }),
        expect.objectContaining({ name: 'Paper Purchase', categoryLayer: 'additional' }),
      ]),
    )
  })

  it('reports catalog counts for seeding feedback', () => {
    expect(getDefaultCatalogCounts()).toEqual({ categories: 5, priceItems: DEFAULT_PRICE_ITEMS.length })
  })
})
