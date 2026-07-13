import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { calculatePlano } from '../domain/planoCalculator'
import { PlanoPreview } from './PlanoPreview'

describe('PlanoPreview', () => {
  it('renders the selected domain scheme accessibly', () => {
    const result = calculatePlano({ planoWidth: '65', planoHeight: '100', cutWidth: '21', cutHeight: '29.7', maximizeRemainder: false })
    const scheme = result.data.schemes.find((item) => item.id === result.data.recommendedSchemeId)
    render(<PlanoPreview result={result} scheme={scheme} />)
    expect(screen.getByRole('img', { name: /Plano 65 × 100 cm/ })).toBeInTheDocument()
  })
})

