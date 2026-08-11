import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RectangleHorizontal,
  RectangleVertical,
} from 'lucide-react'
import { getSheetItemCount } from '../domain/layoutCalculator'
import { getAlignedPlacementIndexes } from './layoutPreviewModel'

const NAVIGATION_BUTTON_CLASS = 'grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-100 disabled:text-slate-300'
const ALIGNMENT_OPTIONS = [
  { value: 'top-left', label: 'Kiri atas', dotClass: 'self-start justify-self-start' },
  { value: 'top-center', label: 'Tengah atas', dotClass: 'self-start justify-self-center' },
  { value: 'top-right', label: 'Kanan atas', dotClass: 'self-start justify-self-end' },
  { value: 'middle-left', label: 'Kiri tengah', dotClass: 'self-center justify-self-start' },
  { value: 'middle-center', label: 'Tengah', dotClass: 'self-center justify-self-center' },
  { value: 'middle-right', label: 'Kanan tengah', dotClass: 'self-center justify-self-end' },
  { value: 'bottom-left', label: 'Kiri bawah', dotClass: 'self-end justify-self-start' },
  { value: 'bottom-center', label: 'Tengah bawah', dotClass: 'self-end justify-self-center' },
  { value: 'bottom-right', label: 'Kanan bawah', dotClass: 'self-end justify-self-end' },
]
const ORIENTATION_OPTIONS = [
  { value: 'portrait', label: 'Portrait', Icon: RectangleVertical },
  { value: 'landscape', label: 'Landscape', Icon: RectangleHorizontal },
]

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

function PreviewControls({ alignment, onAlignmentChange, onPaperOrientationChange, onPrintMarginChange, paperOrientation, printMargin }) {
  return (
    <section aria-label="Pengaturan preview" className="mb-3 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
      <fieldset>
        <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Alignment isi</legend>
        <div className="mt-2 grid w-fit grid-cols-3 gap-1.5">
          {ALIGNMENT_OPTIONS.map((option) => {
            const selected = alignment === option.value
            return (
              <button
                aria-label={`Posisikan isi: ${option.label}`}
                aria-pressed={selected}
                className={`grid h-9 w-9 place-items-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${selected ? 'border-blue-600 bg-blue-600 shadow-md shadow-blue-600/20' : 'border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-blue-50'}`}
                key={option.value}
                onClick={() => onAlignmentChange?.(option.value)}
                title={option.label}
                type="button"
              >
                <span aria-hidden="true" className={`grid h-4 w-4 rounded-[0.3rem] border p-[2px] ${selected ? 'border-blue-200/70' : 'border-slate-300'}`}>
                  <span className={`h-1.5 w-1.5 rounded-[0.15rem] ${option.dotClass} ${selected ? 'bg-white' : 'bg-slate-500'}`} />
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="sm:justify-self-center">
        <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Area cetak</legend>
        <label className="mt-2 flex h-10 w-32 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
          <input
            aria-label="Margin area cetak"
            className="min-w-0 flex-1 bg-transparent text-sm font-black tabular-nums text-slate-900 outline-none"
            inputMode="decimal"
            onChange={(event) => onPrintMarginChange?.(event.target.value)}
            value={printMargin}
          />
          <span className="text-xs font-bold text-slate-400">cm</span>
        </label>
        <p className="mt-1 text-[10px] font-bold text-slate-400">Margin semua sisi</p>
      </fieldset>

      <fieldset>
        <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Orientasi kertas</legend>
        <div className="mt-2 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          {ORIENTATION_OPTIONS.map(({ value, label, Icon }) => {
            const selected = paperOrientation === value
            return (
              <button
                aria-label={`Gunakan orientasi ${label}`}
                aria-pressed={selected}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${selected ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
                key={value}
                onClick={() => onPaperOrientationChange?.(value)}
                type="button"
              >
                <Icon aria-hidden="true" size={15} />
                {label}
              </button>
            )
          })}
        </div>
      </fieldset>
    </section>
  )
}

export function LayoutPreview({ alignment = 'top-left', onAlignmentChange, onPaperOrientationChange, onPrintMarginChange, paperOrientation = 'landscape', printMargin = '0', result }) {
  const [navigation, setNavigation] = useState({ signature: '', sheet: 1 })
  if (result.status !== 'ready') {
    return (
      <figure className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
        <div className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">Preview lembar</div>
        <PreviewControls
          alignment={alignment}
          onAlignmentChange={onAlignmentChange}
          onPaperOrientationChange={onPaperOrientationChange}
          onPrintMarginChange={onPrintMarginChange}
          paperOrientation={paperOrientation}
          printMargin={printMargin}
        />
        <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">Preview tersedia setelah ukuran valid.</div>
      </figure>
    )
  }

  const {
    paperWidth, paperHeight, printableWidth = paperWidth, printableHeight = paperHeight, printMargin: appliedPrintMargin = 0, designWidth, designHeight, gap, orientation, placements,
    placementCount, columns, rows, pcsPerSheet, requiredQty, sheetPreview, wasteSheets,
  } = result.data
  const totalSheets = sheetPreview?.totalSheets ?? 1
  const signature = [paperWidth, paperHeight, appliedPrintMargin, designWidth, designHeight, gap, orientation, pcsPerSheet, requiredQty, totalSheets].join(':')
  const storedSheet = navigation.signature === signature ? navigation.sheet : 1
  const activeSheet = clampSheet(storedSheet, totalSheets)
  const visibleItemCount = getSheetItemCount(sheetPreview, pcsPerSheet, activeSheet)
  const visiblePlacementIndexes = getAlignedPlacementIndexes(visibleItemCount, columns, rows, alignment)
  const visiblePlacements = visiblePlacementIndexes.slice(0, 500).map((index) => {
    const storedPlacement = placements[index]
    if (storedPlacement) return storedPlacement
    const column = index % columns
    const row = Math.floor(index / columns)
    return {
      index,
      x: appliedPrintMargin + column * (result.data.itemWidth + gap),
      y: appliedPrintMargin + row * (result.data.itemHeight + gap),
      width: result.data.itemWidth,
      height: result.data.itemHeight,
    }
  })
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

      <PreviewControls
        alignment={alignment}
        onAlignmentChange={onAlignmentChange}
        onPaperOrientationChange={onPaperOrientationChange}
        onPrintMarginChange={onPrintMarginChange}
        paperOrientation={paperOrientation}
        printMargin={printMargin}
      />

      <svg aria-label={svgLabel} className="max-h-96 w-full rounded-2xl bg-white shadow-inner" role="img" viewBox={`0 0 ${paperWidth} ${paperHeight}`}>
        <rect fill="#eff6ff" height={paperHeight} stroke="#93c5fd" strokeWidth={Math.max(paperWidth, paperHeight) / 180} width={paperWidth} />
        {appliedPrintMargin > 0 ? <rect data-print-area="true" fill="#ffffff" height={printableHeight} stroke="#f59e0b" strokeDasharray="0.8 0.55" strokeWidth="0.18" width={printableWidth} x={appliedPrintMargin} y={appliedPrintMargin} /> : null}
        {placements.map((item) => (
          <rect data-slot-state="available" fill="#f8fafc" height={item.height} key={`slot-${item.index}`} rx="0.35" stroke="#94a3b8" strokeDasharray="0.7 0.45" strokeWidth="0.16" width={item.width} x={item.x} y={item.y} />
        ))}
        {visiblePlacements.map((item) => (
          <rect data-slot-index={item.index} data-slot-state="filled" fill="#2563eb" fillOpacity="0.86" height={item.height} key={`filled-${item.index}`} rx="0.35" stroke="#ffffff" strokeWidth="0.18" width={item.width} x={item.x} y={item.y} />
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
