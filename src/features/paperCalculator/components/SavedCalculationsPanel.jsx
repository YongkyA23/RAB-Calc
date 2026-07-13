import { Clock3, FolderOpen, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

const MODULE_LABELS = { layout: 'Layout', book: 'Buku', plano: 'Plano', time: 'Waktu' }

export function SavedCalculationsPanel({ calculations, onDelete, onOpen }) {
  return (
    <section className="overflow-hidden rounded-4xl border border-white/80 bg-white shadow-xl shadow-slate-300/40">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Clock3 size={20} /></span>
        <div><h2 className="text-lg font-black tracking-tight text-slate-950">Riwayat Perhitungan</h2><p className="text-sm font-medium text-slate-500">Snapshot hasil yang tersimpan di Firestore.</p></div>
      </div>
      {calculations.length ? (
        <div className="divide-y divide-slate-100">
          {calculations.map((item) => (
            <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center" key={item.id}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">{MODULE_LABELS[item.module] ?? item.module}</span><p className="truncate text-sm font-black text-slate-900">{item.title}</p></div>
                <p className="mt-1 text-xs font-medium text-slate-400">{item.createdByName} · {new Date(item.createdAt).toLocaleString('id-ID')}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => onOpen(item)} variant="secondary"><FolderOpen size={15} /> Buka</Button>
                {item.canDelete ? <Button aria-label={`Hapus ${item.title}`} onClick={() => onDelete(item)} variant="danger"><Trash2 size={15} /></Button> : null}
              </div>
            </div>
          ))}
        </div>
      ) : <p className="px-6 py-10 text-center text-sm font-medium text-slate-400">Belum ada perhitungan tersimpan.</p>}
    </section>
  )
}

