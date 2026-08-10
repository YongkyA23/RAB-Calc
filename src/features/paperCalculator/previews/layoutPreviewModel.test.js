import { describe, expect, it } from 'vitest'
import { getAlignedPlacementIndexes } from './layoutPreviewModel'

describe('getAlignedPlacementIndexes', () => {
  it('aligns partial rows on both axes', () => {
    expect(getAlignedPlacementIndexes(3, 5, 2, 'top-left')).toEqual([0, 1, 2])
    expect(getAlignedPlacementIndexes(3, 5, 2, 'bottom-right')).toEqual([7, 8, 9])
    expect(getAlignedPlacementIndexes(8, 5, 4, 'middle-center')).toEqual([5, 6, 7, 8, 9, 11, 12, 13])
  })

  it('does not change a fully occupied sheet', () => {
    expect(getAlignedPlacementIndexes(6, 3, 2, 'bottom-right')).toEqual([0, 1, 2, 3, 4, 5])
  })
})
