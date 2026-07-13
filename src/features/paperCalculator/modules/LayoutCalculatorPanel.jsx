import { Calculator, RotateCw } from 'lucide-react'
import { formatIdr } from '../../../lib/format'
import { PAPER_PRESETS } from '../paperCalculatorDefaults'
import { CalculatorField } from '../components/CalculatorField'
import { CustomSizeControls } from '../components/CustomSizeControls'
import { PresetButtons } from '../components/PresetButtons'
import { ResultMetric } from '../components/ResultMetric'
import { ValidationSummary } from '../components/ValidationSummary'
import { formatDecimal } from '../domain/numbers'
import { LayoutPreview } from '../previews/LayoutPreview'

export function LayoutCalculatorPanel({ draft, onChange, onDeleteSize, onSaveSize, result, sizes }) {
  const update = (field, value) => onChange({ ...draft, [field]: value })
  const data = result.data ?? {}
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Calculator size={20} /></span><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Imposisi lembar</p><h2 className="text-xl font-black tracking-tight text-slate-950">Layout Cetak</h2></div></div>
        <div className="mt-6 space-y-6">
          <PresetButtons label="Ukuran kertas" onSelect={(preset) => onChange({ ...draft, paperWidth: preset.width, paperHeight: preset.height })} presets={[...PAPER_PRESETS, ...sizes.filter((size) => size.type === 'paper')]} selectedHeight={draft.paperHeight} selectedWidth={draft.paperWidth} />
          <div className="grid gap-4 sm:grid-cols-2"><CalculatorField label="Lebar kertas" onChange={(event) => update('paperWidth', event.target.value)} unit="cm" value={draft.paperWidth} /><CalculatorField label="Tinggi kertas" onChange={(event) => update('paperHeight', event.target.value)} unit="cm" value={draft.paperHeight} /></div>
          <CustomSizeControls currentHeight={draft.paperHeight} currentWidth={draft.paperWidth} onApply={(size) => onChange({ ...draft, paperWidth: String(size.width), paperHeight: String(size.height) })} onDelete={onDeleteSize} onSave={onSaveSize} sizes={sizes} type="paper" />
          <div className="border-t border-slate-100 pt-6"><h3 className="text-sm font-black text-slate-900">Ukuran desain dan produksi</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><CalculatorField label="Lebar desain" onChange={(event) => update('designWidth', event.target.value)} placeholder="Contoh 9" unit="cm" value={draft.designWidth} /><CalculatorField label="Tinggi desain" onChange={(event) => update('designHeight', event.target.value)} placeholder="Contoh 5,5" unit="cm" value={draft.designHeight} /><CalculatorField label="Bleed / jarak" onChange={(event) => update('gap', event.target.value)} unit="cm" value={draft.gap} /><CalculatorField label="Jumlah dibutuhkan" onChange={(event) => update('requiredQty', event.target.value)} placeholder="Opsional" unit="pcs" value={draft.requiredQty} /></div></div>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700"><input checked={draft.allowRotate} className="h-4 w-4 accent-blue-600" onChange={(event) => update('allowRotate', event.target.checked)} type="checkbox" /><RotateCw size={16} /> Putar desain jika lebih efisien</label>
          <div className="border-t border-slate-100 pt-6"><h3 className="text-sm font-black text-slate-900">Estimasi harga kertas</h3><div className="mt-4 grid gap-4 sm:grid-cols-3"><CalculatorField label="Harga per rim" onChange={(event) => update('pricePerRim', event.target.value)} placeholder="500.000" unit="Rp" value={draft.pricePerRim} /><CalculatorField label="Isi per rim" onChange={(event) => update('sheetsPerRim', event.target.value)} unit="lembar" value={draft.sheetsPerRim} /><CalculatorField label="Waste produksi" onChange={(event) => update('wastePercent', event.target.value)} unit="%" value={draft.wastePercent} /></div></div>
        </div>
      </section>
      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Hasil real-time</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Susunan produksi</h2><div className="mt-5"><ValidationSummary result={result} /></div><div className="mt-5 grid grid-cols-2 gap-3"><ResultMetric accent label="Pcs / lembar" value={data.pcsPerSheet} /><ResultMetric label="Lembar dibutuhkan" value={data.requiredSheets} /><ResultMetric label="Grid" value={data.columns == null ? null : `${data.columns} × ${data.rows}`} /><ResultMetric label="Orientasi" value={data.orientation} /><ResultMetric label="Waste area" value={data.wastedPercent == null ? null : `${formatDecimal(data.wastedPercent)}%`} /><ResultMetric label="Total order" suffix="lembar" value={data.totalOrderSheets} /><ResultMetric label="Harga / lembar" value={data.pricePerSheet == null ? null : formatIdr(data.pricePerSheet)} /><ResultMetric label="Estimasi biaya" value={data.estimatedPaperCost == null ? null : formatIdr(data.estimatedPaperCost)} /></div></section>
        <LayoutPreview result={result} />
      </aside>
    </div>
  )
}

