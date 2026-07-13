import { calculateWaste, isBlank, parseCalculatorDecimal, parseIdrInput, parseWholeQuantity, roundPages } from './numbers'
import { emptyResult, invalidResult, noFitResult, readyResult } from './resultState'

function capacity(paperWidth, paperHeight, width, height) {
  const normal = { orientation: 'Normal', columns: Math.floor(paperWidth / width), rows: Math.floor(paperHeight / height) }
  normal.total = normal.columns * normal.rows
  const rotated = { orientation: 'Rotasi', columns: Math.floor(paperWidth / height), rows: Math.floor(paperHeight / width) }
  rotated.total = rotated.columns * rotated.rows
  return rotated.total > normal.total ? rotated : normal
}

export function calculateBook(input) {
  const paperWidth = parseCalculatorDecimal(input.paperWidth)
  const paperHeight = parseCalculatorDecimal(input.paperHeight)
  const bookWidth = parseCalculatorDecimal(input.bookWidth)
  const bookHeight = parseCalculatorDecimal(input.bookHeight)
  const pages = parseWholeQuantity(input.pages)
  const copies = parseWholeQuantity(input.copies)
  const spineThickness = parseCalculatorDecimal(input.spineThickness) ?? 0
  const sheetsPerRim = parseWholeQuantity(input.sheetsPerRim)
  const wastePercent = parseCalculatorDecimal(input.wastePercent) ?? 0
  const contentPricePerRim = parseIdrInput(input.contentPricePerRim)
  const coverPricePerRim = parseIdrInput(input.coverPricePerRim)

  if (isBlank(input.pages) && isBlank(input.copies)) return emptyResult()
  const errors = []
  if (!(paperWidth > 0) || !(paperHeight > 0)) errors.push('Ukuran kertas cetak harus lebih dari 0.')
  if (!(bookWidth > 0) || !(bookHeight > 0)) errors.push('Ukuran buku harus lebih dari 0.')
  if (!(pages > 0) || Number.isNaN(pages)) errors.push('Jumlah halaman harus berupa bilangan bulat lebih dari 0.')
  if (!(copies > 0) || Number.isNaN(copies)) errors.push('Jumlah eksemplar harus berupa bilangan bulat lebih dari 0.')
  if (!(spineThickness >= 0)) errors.push('Tebal punggung tidak boleh negatif.')
  if (!(wastePercent >= 0)) errors.push('Waste tidak boleh negatif.')
  const hasAnyPrice = contentPricePerRim !== null || coverPricePerRim !== null
  if (hasAnyPrice && (!(sheetsPerRim > 0) || Number.isNaN(sheetsPerRim))) errors.push('Isi per rim harus lebih dari 0 untuk menghitung biaya.')
  if ([contentPricePerRim, coverPricePerRim].some((value) => value !== null && (!(value >= 0) || Number.isNaN(value)))) errors.push('Harga rim tidak valid.')
  if (errors.length) return invalidResult(errors)

  const pageLayout = capacity(paperWidth, paperHeight, bookWidth, bookHeight)
  const booksPerSheet = pageLayout.total
  if (!booksPerSheet) return noFitResult({ booksPerSheet: 0, pageLayout }, ['Ukuran buku tidak muat pada kertas cetak.'])

  const finalPages = input.binding === 'spiral' ? Math.ceil(pages) : roundPages(pages, 4)
  const contentSheetsPerBook = input.printMode === 'simplex'
    ? Math.ceil(finalPages / booksPerSheet)
    : Math.ceil(finalPages / 2 / booksPerSheet)
  const hasCover = input.coverType !== 'none'
  const coverWidth = hasCover ? (bookWidth * 2) + spineThickness : 0
  const coverHeight = hasCover ? bookHeight : 0
  const coverLayout = hasCover ? capacity(paperWidth, paperHeight, coverWidth, coverHeight) : null
  const coverPerSheet = coverLayout?.total ?? 0
  if (hasCover && !coverPerSheet) {
    return noFitResult({ finalPages, booksPerSheet, contentSheetsPerBook, coverWidth, coverHeight, coverPerSheet }, ['Bentang cover tidak muat pada kertas cetak.'])
  }

  const contentSheetsTotal = contentSheetsPerBook * copies
  const coverSheetsTotal = hasCover ? Math.ceil(copies / coverPerSheet) : 0
  const totalSheets = contentSheetsTotal + coverSheetsTotal
  const contentWasteSheets = calculateWaste(contentSheetsTotal, wastePercent)
  const coverWasteSheets = calculateWaste(coverSheetsTotal, wastePercent)
  const wasteSheets = contentWasteSheets + coverWasteSheets
  const recommendedOrder = totalSheets + wasteSheets
  const contentPricePerSheet = contentPricePerRim === null ? null : contentPricePerRim / sheetsPerRim
  const coverPricePerSheet = coverPricePerRim === null ? null : coverPricePerRim / sheetsPerRim
  const contentCost = contentPricePerSheet === null ? null : (contentSheetsTotal + contentWasteSheets) * contentPricePerSheet
  const coverCost = !hasCover ? 0 : coverPricePerSheet === null ? null : (coverSheetsTotal + coverWasteSheets) * coverPricePerSheet
  const totalCost = contentCost === null || coverCost === null ? null : contentCost + coverCost
  const warnings = []
  if (pages !== finalPages) warnings.push(`Halaman dibulatkan dari ${pages} menjadi ${finalPages}.`)
  if (input.binding === 'saddle' && pages % 4 !== 0) warnings.push('Saddle stitch idealnya memakai jumlah halaman kelipatan 4.')
  if (input.binding === 'perfect') warnings.push('Perfect binding memakai lem punggung; pastikan tebal punggung sesuai bahan isi.')
  return readyResult({
    paperWidth, paperHeight, bookWidth, bookHeight, pages, copies, finalPages, pageLayout, booksPerSheet,
    contentSheetsPerBook, coverWidth, coverHeight, coverLayout, coverPerSheet,
    sheetsPerBook: contentSheetsPerBook + (hasCover ? 1 / coverPerSheet : 0),
    contentSheetsTotal, coverSheetsTotal, totalSheets, contentWasteSheets, coverWasteSheets, wasteSheets,
    recommendedOrder, contentPricePerSheet, coverPricePerSheet, contentCost, coverCost, totalCost,
    costPerCopy: totalCost === null ? null : totalCost / copies,
  }, warnings)
}

