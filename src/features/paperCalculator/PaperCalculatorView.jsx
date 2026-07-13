import { CheckCircle2, Cloud, CloudAlert, CloudUpload, Save } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Form'
import { CalculatorTabs } from './components/CalculatorTabs'
import { SavedCalculationsPanel } from './components/SavedCalculationsPanel'
import { BookCalculatorPanel } from './modules/BookCalculatorPanel'
import { LayoutCalculatorPanel } from './modules/LayoutCalculatorPanel'
import { PlanoCalculatorPanel } from './modules/PlanoCalculatorPanel'
import { TimeEstimatorPanel } from './modules/TimeEstimatorPanel'
import { defaultCalculationTitle } from './persistence/paperCalculatorPersistence'

const STATUS = {
  loading: { label: 'Memuat Firestore…', icon: CloudUpload, className: 'text-slate-500 bg-slate-100' },
  pending: { label: 'Perubahan belum tersimpan', icon: Cloud, className: 'text-amber-700 bg-amber-50' },
  saving: { label: 'Menyimpan draft…', icon: CloudUpload, className: 'text-blue-700 bg-blue-50' },
  saved: { label: 'Draft tersimpan', icon: CheckCircle2, className: 'text-emerald-700 bg-emerald-50' },
  error: { label: 'Gagal menyimpan draft', icon: CloudAlert, className: 'text-rose-700 bg-rose-50' },
}

function SaveCalculationBar({ activeResult, module, onSave }) {
  const [title, setTitle] = useState('')
  const defaultTitle = defaultCalculationTitle(module, activeResult)
  async function save() {
    const saved = await onSave(title)
    if (saved) setTitle('')
  }
  return (
    <section className="flex flex-col gap-4 rounded-4xl border border-blue-200 bg-blue-600 p-5 text-white shadow-xl shadow-blue-600/25 sm:flex-row sm:items-center">
      <div className="flex-1"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">Simpan snapshot</p><h2 className="mt-1 text-lg font-black">Simpan hasil aktif ke Firestore</h2><p className="mt-1 text-xs font-medium text-blue-100">Hanya hasil valid yang dapat masuk ke riwayat.</p></div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"><Input aria-label="Judul perhitungan" className="mt-0 border-blue-400/50 bg-white text-slate-900" onChange={(event) => setTitle(event.target.value)} placeholder={defaultTitle} value={title} /><Button className="shrink-0" disabled={activeResult.status !== 'ready'} onClick={save} variant="dark"><Save size={16} /> Simpan Perhitungan</Button></div>
    </section>
  )
}

export function PaperCalculatorView({ activeResult, calculations, hydrated, onDeleteCalculation, onDeleteSize, onDraftChange, onOpenCalculation, onSaveCalculation, onSaveSize, onTabChange, results, saveStatus, sizes, workspace }) {
  const status = STATUS[saveStatus] ?? STATUS.loading
  const StatusIcon = status.icon
  const commonProps = { onDeleteSize, onSaveSize, sizes }
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Production toolkit</p><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Kalkulator material dan waktu produksi</h2><p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">Hitung kebutuhan kertas, buku, plano, dan durasi produksi. Draft serta hasil tersimpan di Firestore.</p></div><span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-black ${status.className}`}><StatusIcon size={15} />{status.label}</span></section>
      <CalculatorTabs activeTab={workspace.activeTab} onSelect={onTabChange} />
      {!hydrated ? <div className="grid min-h-80 place-items-center rounded-4xl border border-white/80 bg-white text-sm font-bold text-slate-400 shadow-xl shadow-slate-300/30">Memuat workspace dari Firestore…</div> : (
        <section aria-labelledby={`paper-tab-${workspace.activeTab}`} id={`paper-panel-${workspace.activeTab}`} role="tabpanel">
          {workspace.activeTab === 'layout' ? <LayoutCalculatorPanel {...commonProps} draft={workspace.drafts.layout} onChange={(draft) => onDraftChange('layout', draft)} result={results.layout} /> : null}
          {workspace.activeTab === 'book' ? <BookCalculatorPanel {...commonProps} draft={workspace.drafts.book} onChange={(draft) => onDraftChange('book', draft)} result={results.book} /> : null}
          {workspace.activeTab === 'plano' ? <PlanoCalculatorPanel {...commonProps} draft={workspace.drafts.plano} onChange={(draft) => onDraftChange('plano', draft)} result={results.plano} /> : null}
          {workspace.activeTab === 'time' ? <TimeEstimatorPanel draft={workspace.drafts.time} onChange={(draft) => onDraftChange('time', draft)} result={results.time} /> : null}
        </section>
      )}
      <SaveCalculationBar activeResult={activeResult} module={workspace.activeTab} onSave={onSaveCalculation} />
      <SavedCalculationsPanel calculations={calculations} onDelete={onDeleteCalculation} onOpen={onOpenCalculation} />
    </div>
  )
}

