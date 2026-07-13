import { calculateWaste, isBlank, parseCalculatorDecimal, parseIdrInput, parseWholeQuantity } from './numbers'
import { emptyResult, invalidResult, noFitResult, readyResult } from './resultState'

function gridFor(paperWidth, paperHeight, itemWidth, itemHeight, gap, orientation) {
  const columns = Math.max(0, Math.floor((paperWidth + gap) / (itemWidth + gap)))
  const rows = Math.max(0, Math.floor((paperHeight + gap) / (itemHeight + gap)))
  const pcsPerSheet = columns * rows
  const placements = []
  const maxPlacements = Math.min(pcsPerSheet, 500)
  for (let index = 0; index < maxPlacements; index += 1) {
    const column = index % columns
    const row = Math.floor(index / columns)
    placements.push({ x: column * (itemWidth + gap), y: row * (itemHeight + gap), width: itemWidth, height: itemHeight, index })
  }
  return { orientation, columns, rows, pcsPerSheet, itemWidth, itemHeight, placements, placementCount: pcsPerSheet }
}

export function calculateLayout(input) {
  const paperWidth = parseCalculatorDecimal(input.paperWidth)
  const paperHeight = parseCalculatorDecimal(input.paperHeight)
  const designWidth = parseCalculatorDecimal(input.designWidth)
  const designHeight = parseCalculatorDecimal(input.designHeight)
  const gap = parseCalculatorDecimal(input.gap) ?? 0
  const requiredQty = parseWholeQuantity(input.requiredQty)
  const pricePerRim = parseIdrInput(input.pricePerRim)
  const sheetsPerRim = parseWholeQuantity(input.sheetsPerRim)
  const wastePercent = parseCalculatorDecimal(input.wastePercent) ?? 0

  if (isBlank(input.designWidth) && isBlank(input.designHeight)) return emptyResult()

  const errors = []
  if (!(paperWidth > 0)) errors.push('Lebar kertas harus lebih dari 0.')
  if (!(paperHeight > 0)) errors.push('Tinggi kertas harus lebih dari 0.')
  if (!(designWidth > 0)) errors.push('Lebar desain harus lebih dari 0.')
  if (!(designHeight > 0)) errors.push('Tinggi desain harus lebih dari 0.')
  if (!(gap >= 0)) errors.push('Gap tidak boleh negatif.')
  if (!Number.isNaN(requiredQty) && requiredQty !== null && requiredQty <= 0) errors.push('Jumlah dibutuhkan harus lebih dari 0.')
  if (Number.isNaN(requiredQty)) errors.push('Jumlah dibutuhkan harus berupa bilangan bulat.')
  if (!(wastePercent >= 0)) errors.push('Waste tidak boleh negatif.')
  if (pricePerRim !== null && (!(pricePerRim >= 0) || Number.isNaN(pricePerRim))) errors.push('Harga per rim tidak valid.')
  if (pricePerRim !== null && (!(sheetsPerRim > 0) || Number.isNaN(sheetsPerRim))) errors.push('Isi per rim harus lebih dari 0 untuk menghitung biaya.')
  if (errors.length) return invalidResult(errors)

  const normal = gridFor(paperWidth, paperHeight, designWidth, designHeight, gap, 'Normal')
  const rotated = gridFor(paperWidth, paperHeight, designHeight, designWidth, gap, 'Rotasi')
  const selected = input.allowRotate && rotated.pcsPerSheet > normal.pcsPerSheet ? rotated : normal
  const paperArea = paperWidth * paperHeight
  const usedArea = selected.pcsPerSheet * designWidth * designHeight
  const wastedArea = Math.max(paperArea - usedArea, 0)
  const requiredSheets = requiredQty === null || selected.pcsPerSheet === 0 ? null : Math.ceil(requiredQty / selected.pcsPerSheet)
  const wasteSheets = requiredSheets === null ? null : calculateWaste(requiredSheets, wastePercent)
  const totalOrderSheets = requiredSheets === null ? null : requiredSheets + wasteSheets
  const pricePerSheet = pricePerRim === null ? null : pricePerRim / sheetsPerRim
  const estimatedPaperCost = pricePerSheet === null || totalOrderSheets === null ? null : totalOrderSheets * pricePerSheet
  const data = {
    paperWidth, paperHeight, designWidth, designHeight, gap, requiredQty, normal, rotated, ...selected,
    paperArea, usedArea, wastedArea, wastedPercent: paperArea ? (wastedArea / paperArea) * 100 : 0,
    requiredSheets, cleanSheets: requiredSheets, wasteSheets, totalOrderSheets, pricePerSheet, estimatedPaperCost,
  }
  return selected.pcsPerSheet === 0 ? noFitResult(data, ['Ukuran desain tidak muat pada kertas.']) : readyResult(data)
}
