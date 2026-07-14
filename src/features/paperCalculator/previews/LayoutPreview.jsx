import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { getSheetItemCount } from '../domain/layoutCalculator'

const NAVIGATION_BUTTON_CLASS = 'grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-300'

function clampSheet(sheet, totalSheets) {
  return Math.min(Math.max(Math.trunc(Number(sheet)) || 1, 1), totalSheets)
}

function NavigationButton({ children, disabled, label, onClick }) {
  return (
    <button aria-label={label} className={NAVIGATION_BUTTON_CLASS} disabled={disabled} onClick={onClick} title={label} type="button">
      {children}
    </button>
  )
}

function SheetSummary({ pcsPerSheet, sheetPreview }) {
  if (sheetPreview.mode === 'capacity') {
    return (
      <div className="mb-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Kapasitas maksimum</p>
        <p className="mt-1 text-sm font-bold text-blue-950"><span className="tabular-nums">{pcsPerSheet}</span> pcs per lembar</p>
      </div>
    )
  }

  const hasPartialSheet = sheetPreview.partialSheets > 0
  return (
    <div className={`mb-3 grid gap-2 ${hasPartialSheet && sheetPreview.fullSheets > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {sheetPreview.fullSheets > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
          <p className="text-lg font-black tabular-nums text-slate-950">{sheetPreview.fullSheets}</p>
          <p className="text-xs font-bold text-slate-600">lembar penuh × {pcsPerSheet} pcs</p>
        </div>
      ) : null}
      {hasPartialSheet ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-3">
          <p className="text-lg font-black tabular-nums text-blue-900">{sheetPreview.partialSheets}</p>
          <p className="text-xs font-bold text-blue-700">lembar sisa × {sheetPreview.partialItems} pcs</p>
        </div>
      ) : null}
    </div>
  )
}

export function LayoutPreview({ result }) {
  const [navigation, setNavigation] = useState({ signature: '', sheet: 1 })
  if (result.status !== 'ready') return <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">Preview tersedia setelah ukuran valid.</div>

  const {
    paperWidth, paperHeight, designWidth, designHeight, gap, orientation, placements,
    placementCount, columns, rows, pcsPerSheet, requiredQty, sheetPreview, wasteSheets,
  } = result.data
  const totalSheets = sheetPreview?.totalSheets ?? 1
  const signature = [paperWidth, paperHeight, designWidth, designHeight, gap, orientation, pcsPerSheet, requiredQty, totalSheets].join(':')
  const storedSheet = navigation.signature === signature ? navigation.sheet : 1
  const activeSheet = clampSheet(storedSheet, totalSheets)
  const visibleItemCount = getSheetItemCount(sheetPreview, pcsPerSheet, activeSheet)
  const visiblePlacements = placements.slice(0, visibleItemCount)
  const isProductionPreview = sheetPreview?.mode === 'production'
  const atFirstSheet = activeSheet === 1
  const atLastSheet = activeSheet === totalSheets
  const renderIsLimited = placementCount > placements.length
  const hasWasteNote = isProductionPreview && wasteSheets > 0

  function changeSheet(target) {
    setNavigation((current) => {
      const currentSheet = current.signature === signature ? clampSheet(current.sheet, totalSheets) : 1
      const nextSheet = typeof target === 'function' ? target(currentSheet) : target
      return { signature, sheet: clampSheet(nextSheet, totalSheets) }
    })
  }

  const svgLabel = isProductionPreview
    ? `Lembar ${activeSheet} dari ${totalSheets}, ${visibleItemCount} dari ${pcsPerSheet} slot terisi pada kertas ${paperWidth} × ${paperHeight} cm`
    : `Template kapasitas ${pcsPerSheet} slot pada kertas ${paperWidth} × ${paperHeight} cm`

  return (
    <figure aria-label={`${visibleItemCount} desain tersusun ${columns} kolom dan ${rows} baris`} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs">
        <span className="font-black uppercase tracking-[0.16em] text-slate-400">Preview lembar</span>
        <strong className="shrink-0 tabular-nums text-slate-700">{visibleItemCount} / {pcsPerSheet} pcs</strong>
      </div>

      <SheetSummary pcsPerSheet={pcsPerSheet} sheetPreview={sheetPreview} />

      <svg aria-label={svgLabel} className="max-h-96 w-full rounded-2xl bg-white shadow-inner" role="img" viewBox={`0 0 ${paperWidth} ${paperHeight}`}>
        <rect fill="#eff6ff" height={paperHeight} stroke="#93c5fd" strokeWidth={Math.max(paperWidth, paperHeight) / 180} width={paperWidth} />
        {placements.map((item) => (
          <rect data-slot-state="available" fill="#f8fafc" height={item.height} key={`slot-${item.index}`} rx="0.35" stroke="#94a3b8" strokeDasharray="0.7 0.45" strokeWidth="0.16" width={item.width} x={item.x} y={item.y} />
        ))}
        {visiblePlacements.map((item) => (
          <rect data-slot-state="filled" fill="#2563eb" fillOpacity="0.86" height={item.height} key={`filled-${item.index}`} rx="0.35" stroke="#ffffff" strokeWidth="0.18" width={item.width} x={item.x} y={item.y} />
        ))}
      </svg>

      {isProductionPreview ? (
        <nav aria-label="Navigasi preview lembar" className="mt-4 grid grid-cols-[2.75rem_2.75rem_minmax(0,1fr)_2.75rem_2.75rem] gap-2">
          <NavigationButton disabled={atFirstSheet} label="Ke lembar pertama" onClick={() => changeSheet(1)}><ChevronsLeft aria-hidden="true" size={18} /></NavigationButton>
          <NavigationButton disabled={atFirstSheet} label="Ke lembar sebelumnya" onClick={() => changeSheet((sheet) => sheet - 1)}><ChevronLeft aria-hidden="true" size={18} /></NavigationButton>
          <div aria-atomic="true" aria-label={`Lembar ${activeSheet} dari ${totalSheets}, ${visibleItemCount} pcs`} aria-live="polite" className="flex min-w-0 flex-col items-center justify-center rounded-xl bg-slate-900 px-1 text-center text-white" role="status">
            <strong aria-hidden="true" className="max-w-full truncate text-xs tabular-nums">Lembar {activeSheet} dari {totalSheets}</strong>
            <span aria-hidden="true" className="text-[10px] font-bold tabular-nums text-slate-300">{visibleItemCount} pcs</span>
          </div>
          <NavigationButton disabled={atLastSheet} label="Ke lembar berikutnya" onClick={() => changeSheet((sheet) => sheet + 1)}><ChevronRight aria-hidden="true" size={18} /></NavigationButton>
          <NavigationButton disabled={atLastSheet} label="Ke lembar terakhir" onClick={() => changeSheet(totalSheets)}><ChevronsRight aria-hidden="true" size={18} /></NavigationButton>
        </nav>
      ) : null}

      {renderIsLimited || hasWasteNote ? (
        <figcaption className="mt-3 space-y-1 text-xs font-medium leading-5 text-slate-500">
          {renderIsLimited ? <p>Visual dibatasi {placements.length} dari {placementCount} slot untuk menjaga performa.</p> : null}
          {hasWasteNote ? <p>Preview: {totalSheets} lembar bersih · +{wasteSheets} lembar waste pada total order.</p> : null}
        </figcaption>
      ) : null}
    </figure>
  )
}
