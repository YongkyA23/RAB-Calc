import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { calculateLayout } from '../domain/layoutCalculator'
import { LayoutCalculatorPanel } from './LayoutCalculatorPanel'

const draft = {
  paperWidth: '20', paperHeight: '10', designWidth: '4', designHeight: '5', gap: '0', requiredQty: '13',
  allowRotate: true, alignment: 'top-left', pricePerRim: '', sheetsPerRim: '500', wastePercent: '0',
}

describe('LayoutCalculatorPanel preview controls', () => {
  it('updates alignment and swaps paper dimensions for portrait orientation', () => {
    const onChange = vi.fn()
    render(
      <LayoutCalculatorPanel
        draft={draft}
        onChange={onChange}
        onDeleteSize={vi.fn()}
        onSaveSize={vi.fn()}
        result={calculateLayout(draft)}
        sizes={[]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Posisikan isi: Kanan bawah' }))
    expect(onChange).toHaveBeenNthCalledWith(1, { ...draft, alignment: 'bottom-right' })

    fireEvent.click(screen.getByRole('button', { name: 'Gunakan orientasi Portrait' }))
    expect(onChange).toHaveBeenNthCalledWith(2, { ...draft, paperWidth: '10', paperHeight: '20' })
  })
})
