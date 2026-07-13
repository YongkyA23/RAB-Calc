import { Clock3 } from 'lucide-react'
import { Field, Input, Select } from '../../../components/ui/Form'
import { CalculatorField } from '../components/CalculatorField'
import { ResultMetric } from '../components/ResultMetric'
import { ValidationSummary, WarningList } from '../components/ValidationSummary'
import { formatDuration } from '../domain/numbers'

const JOBS = [
  { id: 'a3', label: 'Lembaran A3+', description: 'Cetak lembar simplex atau duplex' },
  { id: 'meter', label: 'Cetak Meteran', description: 'Estimasi berdasarkan luas m²' },
  { id: 'businessCards', label: 'Kartu Nama', description: '20 lembar A3 per box' },
  { id: 'saddle', label: 'Buku Saddle Stitch', description: 'Cetak isi dan jilid staples' },
  { id: 'perfect', label: 'Buku Perfect Binding', description: 'Cetak isi dan lem punggung' },
  { id: 'hardCover', label: 'Buku Hard Cover', description: 'Cetak isi dan pengerjaan manual cover' },
]

const FINISHING = [
  { id: 'laminate', label: 'Laminasi 1 jenis' },
  { id: 'secondRoll', label: 'Ganti roll laminasi kedua' },
  { id: 'standardCut', label: 'Potong ukuran standar' },
  { id: 'customCut', label: 'Potong ukuran custom' },
  { id: 'dieCut', label: 'Die cut' },
  { id: 'kissCut', label: 'Kiss cut' },
]

function formatFinish(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function JobFields({ id, job, onUpdate }) {
  if (id === 'a3') return <div className="grid gap-3 sm:grid-cols-2"><CalculatorField label="Jumlah lembar" onChange={(event) => onUpdate('sheets', event.target.value)} unit="lembar" value={job.sheets} /><Field label="Mode cetak"><Select aria-label="Mode cetak A3+" onChange={(event) => onUpdate('mode', event.target.value)} value={job.mode}><option value="duplex">Bolak-balik / duplex</option><option value="simplex">Satu sisi / simplex</option></Select></Field></div>
  if (id === 'meter') return <CalculatorField label="Luas cetak" onChange={(event) => onUpdate('areaM2', event.target.value)} unit="m²" value={job.areaM2} />
  if (id === 'businessCards') return <CalculatorField label="Jumlah box" onChange={(event) => onUpdate('boxes', event.target.value)} unit="box" value={job.boxes} />
  return <div className="grid gap-3 sm:grid-cols-3"><CalculatorField label="Jumlah halaman" onChange={(event) => onUpdate('pages', event.target.value)} unit="halaman" value={job.pages} /><CalculatorField label="Eksemplar" onChange={(event) => onUpdate('copies', event.target.value)} unit="buku" value={job.copies} /><Field label="Ukuran buku"><Select aria-label={`Ukuran buku ${id}`} onChange={(event) => onUpdate('size', event.target.value)} value={job.size}><option value="A5">A5</option><option value="A4">A4</option><option value="A6">A6</option>{id !== 'saddle' ? <option value="17x24">17×24</option> : null}</Select></Field></div>
}

export function TimeEstimatorPanel({ draft, onChange, result }) {
  function updateJob(id, field, value) {
    onChange({ ...draft, jobs: { ...draft.jobs, [id]: { ...draft.jobs[id], [field]: value } } })
  }
  function updateFinishing(id, value) {
    const next = { ...draft.finishing, [id]: value }
    if (id === 'laminate' && !value) next.secondRoll = false
    onChange({ ...draft, finishing: next })
  }
  const data = result.data ?? {}
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Clock3 size={20} /></span><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Durasi produksi</p><h2 className="text-xl font-black tracking-tight text-slate-950">Estimasi Waktu</h2></div></div><div className="mt-6 space-y-6"><div><h3 className="text-sm font-black text-slate-900">Jenis pekerjaan</h3><div className="mt-3 space-y-3">{JOBS.map((item) => { const job = draft.jobs[item.id]; return <div className={`rounded-3xl border p-4 transition ${job.active ? 'border-blue-200 bg-blue-50/60' : 'border-slate-100 bg-slate-50/70'}`} key={item.id}><label className="flex cursor-pointer items-center gap-3"><input aria-label={`Aktifkan ${item.label}`} checked={job.active} className="h-4 w-4 accent-blue-600" onChange={(event) => updateJob(item.id, 'active', event.target.checked)} type="checkbox" /><span className="flex-1"><strong className="block text-sm text-slate-900">{item.label}</strong><small className="font-medium text-slate-400">{item.description}</small></span></label>{job.active ? <div className="mt-4 border-t border-blue-100 pt-4"><JobFields id={item.id} job={job} onUpdate={(field, value) => updateJob(item.id, field, value)} /></div> : null}</div> })}</div></div><div className="border-t border-slate-100 pt-6"><h3 className="text-sm font-black text-slate-900">Finishing tambahan</h3><div className="mt-3 grid gap-2 sm:grid-cols-2">{FINISHING.map((item) => { const disabled = item.id === 'secondRoll' && !draft.finishing.laminate; return <label className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${disabled ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200'}`} key={item.id}><input aria-label={item.label} checked={draft.finishing[item.id]} className="h-4 w-4 accent-blue-600" disabled={disabled} onChange={(event) => updateFinishing(item.id, event.target.checked)} type="checkbox" />{item.label}</label> })}</div></div><div className="border-t border-slate-100 pt-6"><Field label="Mulai produksi"><Input aria-label="Mulai produksi" onChange={(event) => onChange({ ...draft, startAt: event.target.value })} type="datetime-local" value={draft.startAt} /></Field></div></div></section>
      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start"><section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40"><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Rentang estimasi</p><h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">Waktu pengerjaan</h2><div className="mt-5 space-y-3"><ValidationSummary result={result} /><WarningList warnings={result.warnings} /></div><div className="mt-5 grid grid-cols-2 gap-3"><ResultMetric accent label="Durasi minimum" value={data.minTotalMinutes == null ? null : formatDuration(data.minTotalMinutes)} /><ResultMetric label="Durasi maksimum" value={data.maxTotalMinutes == null ? null : formatDuration(data.maxTotalMinutes)} /><ResultMetric label="Lembar finishing" value={data.totalFinishingSheets} /><ResultMetric label="Pekerjaan aktif" value={data.activeCount} /><ResultMetric label="Selesai tercepat" value={formatFinish(data.estimatedFinishMin)} /><ResultMetric label="Selesai terlama" value={formatFinish(data.estimatedFinishMax)} /></div>{data.activeJobs?.length ? <div className="mt-5 space-y-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Breakdown pekerjaan</p>{data.activeJobs.map((job) => <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm" key={job.id}><span className="font-bold text-slate-700">{job.label}<small className="ml-2 text-slate-400">{job.detail}</small></span><strong>{formatDuration(job.minutes)}</strong></div>)}{data.finishingBreakdown?.map((item) => <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3 text-sm" key={item.id}><span className="font-bold text-blue-700">{item.label}</span><strong className="text-blue-900">{formatDuration(item.minMinutes)}{item.maxMinutes !== item.minMinutes ? ` – ${formatDuration(item.maxMinutes)}` : ''}</strong></div>)}</div> : null}<div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs font-medium leading-5 text-slate-500">Ukuran buku masih informatif sampai rate berbasis ukuran disetujui. Estimasi memakai menit kalender dan belum memperhitungkan antrean mesin, jam kerja, atau hari libur.</div></section></aside>
    </div>
  )
}

