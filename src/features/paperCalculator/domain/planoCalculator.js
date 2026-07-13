import { isBlank, parseCalculatorDecimal } from './numbers'
import { emptyResult, invalidResult, noFitResult, readyResult } from './resultState'

function createGrid(id, label, areaWidth, areaHeight, cutWidth, cutHeight, offsetX = 0, offsetY = 0) {
  const columns = Math.max(0, Math.floor(areaWidth / cutWidth))
  const rows = Math.max(0, Math.floor(areaHeight / cutHeight))
  const totalCuts = columns * rows
  const placements = []
  let rendered = 0
  for (let row = 0; row < rows && rendered < 500; row += 1) {
    for (let column = 0; column < columns && rendered < 500; column += 1) {
      placements.push({ x: offsetX + column * cutWidth, y: offsetY + row * cutHeight, width: cutWidth, height: cutHeight })
      rendered += 1
    }
  }
  return { id, label, columns, rows, totalCuts, cutWidth, cutHeight, usedWidth: columns * cutWidth, usedHeight: rows * cutHeight, placements, placementCount: totalCuts }
}

function completeScheme(base, planoWidth, planoHeight, originalCutWidth, originalCutHeight) {
  const planoArea = planoWidth * planoHeight
  const usedArea = base.totalCuts * originalCutWidth * originalCutHeight
  const wasteArea = Math.max(planoArea - usedArea, 0)
  return { ...base, usedArea, wasteArea, wastePercent: planoArea ? (wasteArea / planoArea) * 100 : 0 }
}

export function calculatePlano(input) {
  const planoWidth = parseCalculatorDecimal(input.planoWidth)
  const planoHeight = parseCalculatorDecimal(input.planoHeight)
  const cutWidth = parseCalculatorDecimal(input.cutWidth)
  const cutHeight = parseCalculatorDecimal(input.cutHeight)
  if (isBlank(input.cutWidth) && isBlank(input.cutHeight)) return emptyResult()
  const errors = []
  if (!(planoWidth > 0) || !(planoHeight > 0)) errors.push('Ukuran plano harus lebih dari 0.')
  if (!(cutWidth > 0) || !(cutHeight > 0)) errors.push('Ukuran potongan harus lebih dari 0.')
  if (errors.length) return invalidResult(errors)

  const normalBase = createGrid('normal', 'Normal', planoWidth, planoHeight, cutWidth, cutHeight)
  const rotatedBase = createGrid('rotated', 'Rotasi', planoWidth, planoHeight, cutHeight, cutWidth)
  const schemes = [
    completeScheme(normalBase, planoWidth, planoHeight, cutWidth, cutHeight),
    completeScheme(rotatedBase, planoWidth, planoHeight, cutWidth, cutHeight),
  ]

  if (input.maximizeRemainder && normalBase.totalCuts > 0) {
    const rightWidth = planoWidth - normalBase.usedWidth
    const bottomHeight = planoHeight - normalBase.usedHeight
    const right = createGrid('right-strip', 'Strip kanan', rightWidth, planoHeight, cutHeight, cutWidth, normalBase.usedWidth, 0)
    const bottom = createGrid('bottom-strip', 'Strip bawah', normalBase.usedWidth, bottomHeight, cutHeight, cutWidth, 0, normalBase.usedHeight)
    const totalCuts = normalBase.totalCuts + right.totalCuts + bottom.totalCuts
    if (totalCuts > normalBase.totalCuts) {
      schemes.push(completeScheme({
        id: 'remainder', label: 'Optimasi sisa', orientation: 'Campuran', columns: normalBase.columns, rows: normalBase.rows,
        totalCuts, cutWidth, cutHeight, usedWidth: planoWidth, usedHeight: planoHeight,
        placements: [...normalBase.placements, ...right.placements, ...bottom.placements],
        extraCuts: right.totalCuts + bottom.totalCuts,
      }, planoWidth, planoHeight, cutWidth, cutHeight))
    }
  }

  let recommended = schemes[0]
  for (const scheme of schemes.slice(1)) if (scheme.totalCuts > recommended.totalCuts) recommended = scheme
  const data = { planoWidth, planoHeight, cutWidth, cutHeight, schemes, recommendedSchemeId: recommended.id }
  return recommended.totalCuts === 0 ? noFitResult(data, ['Ukuran potongan tidak muat pada plano.']) : readyResult(data)
}
