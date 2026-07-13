import { addCalendarMinutes, parseCalculatorDecimal, parseWholeQuantity, roundPages } from './numbers'
import { emptyResult, invalidResult, readyResult } from './resultState'
import { FINISHING_RULES, TIME_RULES } from './timeRules'

function activeWhole(value, label, errors) {
  const parsed = parseWholeQuantity(value)
  if (!(parsed > 0) || Number.isNaN(parsed)) errors.push(`${label} harus berupa bilangan bulat lebih dari 0.`)
  return parsed
}

function bookJob(id, label, job, bindMinutes, errors) {
  const pages = activeWhole(job.pages, `${label}: halaman`, errors)
  const copies = activeWhole(job.copies, `${label}: eksemplar`, errors)
  if (!(pages > 0) || !(copies > 0)) return null
  const roundedPages = roundPages(pages, 4)
  const sheetsPerBook = id === 'saddle' ? roundedPages / 4 : Math.ceil(roundedPages / 2)
  const finishingSheets = sheetsPerBook * copies
  const minutes = Math.ceil(finishingSheets / TIME_RULES.bookSheetsPerMinute) + Math.ceil(copies * bindMinutes)
  return { id, label, minutes, finishingSheets, detail: `${copies} buku · ${roundedPages} halaman` }
}

function finishingRange(finishing, sheets) {
  const breakdown = []
  if (finishing.laminate && sheets > 0) {
    const minutes = FINISHING_RULES.laminate.setup + Math.ceil(sheets / FINISHING_RULES.laminate.sheetsPerMinute)
    breakdown.push({ id: 'laminate', label: 'Laminasi 1 jenis', minMinutes: minutes, maxMinutes: minutes })
  }
  if (finishing.secondRoll && finishing.laminate && sheets > 0) breakdown.push({ id: 'secondRoll', label: 'Ganti roll laminasi kedua', minMinutes: 15, maxMinutes: 20 })
  if (finishing.standardCut && sheets > 0) breakdown.push({ id: 'standardCut', label: 'Potong standar', minMinutes: 30 + sheets * 3, maxMinutes: 30 + sheets * 5 })
  if (finishing.customCut && sheets > 0) breakdown.push({ id: 'customCut', label: 'Potong custom', minMinutes: 30 + sheets * 5, maxMinutes: 30 + sheets * 8 })
  if (finishing.dieCut && sheets > 0) breakdown.push({ id: 'dieCut', label: 'Die cut', minMinutes: 45 + sheets * 2, maxMinutes: 60 + sheets * 3 })
  if (finishing.kissCut && sheets > 0) breakdown.push({ id: 'kissCut', label: 'Kiss cut', minMinutes: 30 + sheets * 2, maxMinutes: 45 + sheets * 3 })
  return breakdown
}

export function calculateTimeEstimate(input) {
  const jobs = input.jobs ?? {}
  const activeEntries = Object.entries(jobs).filter(([, job]) => job.active)
  if (!activeEntries.length) return emptyResult()
  const errors = []
  const activeJobs = []
  if (jobs.a3?.active) {
    const sheets = activeWhole(jobs.a3.sheets, 'Lembaran A3+', errors)
    if (sheets > 0) {
      const rate = jobs.a3.mode === 'simplex' ? TIME_RULES.a3SimplexPerMinute : TIME_RULES.a3DuplexPerMinute
      activeJobs.push({ id: 'a3', label: 'Lembaran A3+', minutes: Math.ceil(sheets / rate), finishingSheets: sheets, detail: `${sheets} lembar` })
    }
  }
  if (jobs.meter?.active) {
    const area = parseCalculatorDecimal(jobs.meter.areaM2)
    if (!(area > 0)) errors.push('Cetak meteran: luas harus lebih dari 0.')
    else activeJobs.push({ id: 'meter', label: 'Cetak Meteran', minutes: Math.ceil(area * TIME_RULES.meterMinutesPerM2), finishingSheets: 0, detail: `${area} m²` })
  }
  if (jobs.businessCards?.active) {
    const boxes = activeWhole(jobs.businessCards.boxes, 'Kartu nama: box', errors)
    if (boxes > 0) {
      const sheets = boxes * TIME_RULES.businessCardSheetsPerBox
      activeJobs.push({ id: 'businessCards', label: 'Kartu Nama', minutes: Math.ceil(sheets / TIME_RULES.businessCardSheetsPerMinute), finishingSheets: sheets, detail: `${boxes} box` })
    }
  }
  if (jobs.saddle?.active) {
    const result = bookJob('saddle', 'Buku Saddle Stitch', jobs.saddle, TIME_RULES.saddleMinutesPerCopy, errors)
    if (result) activeJobs.push(result)
  }
  if (jobs.perfect?.active) {
    const result = bookJob('perfect', 'Buku Perfect Binding', jobs.perfect, TIME_RULES.perfectMinutesPerCopy, errors)
    if (result) activeJobs.push(result)
  }
  if (jobs.hardCover?.active) {
    const result = bookJob('hardCover', 'Buku Hard Cover', jobs.hardCover, TIME_RULES.hardCoverMinutesPerCopy, errors)
    if (result) activeJobs.push(result)
  }
  if (errors.length) return invalidResult(errors, { activeJobs, activeCount: activeEntries.length })

  const startAt = new Date(input.startAt)
  if (Number.isNaN(startAt.getTime())) return invalidResult(['Waktu mulai produksi tidak valid.'], { activeJobs })
  const totalFinishingSheets = activeJobs.reduce((sum, job) => sum + job.finishingSheets, 0)
  const finishingBreakdown = finishingRange(input.finishing ?? {}, totalFinishingSheets)
  const jobMinutes = activeJobs.reduce((sum, job) => sum + job.minutes, 0)
  const finishingMinMinutes = finishingBreakdown.reduce((sum, item) => sum + item.minMinutes, 0)
  const finishingMaxMinutes = finishingBreakdown.reduce((sum, item) => sum + item.maxMinutes, 0)
  const minTotalMinutes = jobMinutes + finishingMinMinutes
  const maxTotalMinutes = jobMinutes + finishingMaxMinutes
  const warnings = []
  if (Object.values(input.finishing ?? {}).some(Boolean) && totalFinishingSheets === 0) warnings.push('Finishing berbasis lembar tidak dihitung karena pekerjaan aktif tidak menghasilkan lembar finishing.')
  return readyResult({
    activeJobs, activeCount: activeEntries.length, totalFinishingSheets, finishingBreakdown, jobMinutes,
    finishingMinMinutes, finishingMaxMinutes, minTotalMinutes, maxTotalMinutes,
    estimatedFinishMin: addCalendarMinutes(startAt, minTotalMinutes),
    estimatedFinishMax: addCalendarMinutes(startAt, maxTotalMinutes),
  }, warnings)
}

