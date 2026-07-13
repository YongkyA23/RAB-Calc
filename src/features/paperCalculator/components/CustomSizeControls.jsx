import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Field, Input } from '../../../components/ui/Form'

export function CustomSizeControls({ currentHeight, currentWidth, onApply, onDelete, onSave, sizes, type }) {
  const [label, setLabel] = useState('')

  async function handleSave() {
    const saved = await onSave({ type, label, width: currentWidth, height: currentHeight })
    if (saved) setLabel('')
  }

  const matching = sizes.filter((size) => size.type === type)
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1"><Field label="Nama ukuran custom"><Input onChange={(event) => setLabel(event.target.value)} placeholder="Contoh: Kertas supplier A" value={label} /></Field></div>
        <Button disabled={!label.trim()} onClick={handleSave} variant="secondary"><Plus size={16} /> Simpan ukuran</Button>
      </div>
      {matching.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {matching.map((size) => (
            <span className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white" key={size.id}>
              <button className="px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700" onClick={() => onApply(size)} type="button">{size.label} · {size.width}×{size.height}</button>
              {size.canDelete ? <button aria-label={`Hapus ukuran ${size.label}`} className="border-l border-slate-200 px-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => onDelete(size)} type="button"><Trash2 size={14} /></button> : null}
            </span>
          ))}
        </div>
      ) : <p className="mt-3 text-xs font-medium text-slate-400">Belum ada ukuran custom tersimpan.</p>}
    </div>
  )
}

