import { ArrowLeft, Edit3, ExternalLink, FileDown, FileText, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatIdr } from '../../lib/format'

function DetailField({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
      <dt className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 font-black text-slate-900">{value || '-'}</dd>
    </div>
  )
}

function PdfPreview({ name, url }) {
  const [previewUrl, setPreviewUrl] = useState('')
  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let objectUrl = ''

    async function loadPreview() {
      try {
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error('PDF tidak dapat dimuat')

        const sourceBlob = await response.blob()
        const pdfBlob = sourceBlob.type === 'application/pdf'
          ? sourceBlob
          : new Blob([sourceBlob], { type: 'application/pdf' })
        objectUrl = URL.createObjectURL(pdfBlob)
        if (controller.signal.aborted) {
          URL.revokeObjectURL(objectUrl)
          objectUrl = ''
          return
        }
        setPreviewUrl(objectUrl)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setUsingFallback(true)
          setPreviewUrl(url)
        }
      }
    }

    loadPreview()

    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [url])

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-black text-slate-900">Preview PDF</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{name || 'Lampiran PDF'}</p>
        </div>
        {usingFallback ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Mode preview langsung</span>
        ) : null}
      </div>
      {previewUrl ? (
        <iframe
          className="h-[70vh] min-h-[520px] w-full bg-white"
          src={`${previewUrl}#view=FitH&toolbar=1`}
          title={`Preview PDF ${name || 'lampiran'}`}
        />
      ) : (
        <div className="grid min-h-[520px] place-items-center bg-white">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="animate-spin text-blue-600" size={28} />
            <p className="text-sm font-bold">Menyiapkan preview PDF...</p>
          </div>
        </div>
      )}
    </div>
  )
}

function AttachmentPreview({ estimate }) {
  if (!estimate.attachmentUrl) {
    return <p className="text-sm font-medium text-slate-500">Tidak ada lampiran.</p>
  }

  const isImage = estimate.attachmentType === 'image'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
          {isImage ? <ImageIcon size={16} /> : <FileText size={16} />}
          {estimate.attachmentName || (isImage ? 'Gambar' : 'PDF')}
        </span>
        <a className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50" href={estimate.attachmentUrl} rel="noreferrer" target="_blank">
          <ExternalLink size={16} />
          Buka di tab baru
        </a>
      </div>
      {isImage ? (
        <img alt={estimate.attachmentName || 'Lampiran'} className="max-h-[600px] w-full rounded-2xl border border-slate-200 object-contain" src={estimate.attachmentUrl} />
      ) : (
        <PdfPreview key={estimate.attachmentUrl} name={estimate.attachmentName} url={estimate.attachmentUrl} />
      )}
    </div>
  )
}

export function VendorEstimateDetailView({ estimate, loading, onBack, onDelete, onEdit, onGeneratePdf }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!estimate) {
    return (
      <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
        <p className="text-sm font-medium text-slate-600">Tidak ada estimasi vendor yang dipilih.</p>
      </section>
    )
  }

  const quantity = Number(estimate.quantity) > 0 ? Number(estimate.quantity) : 1
  const unitPrice = Number(estimate.unitPrice) > 0 ? Number(estimate.unitPrice) : Number(estimate.price) || 0

  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline" onClick={onBack} type="button">
              <ArrowLeft size={16} />
              Kembali ke estimasi vendor
            </button>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <FileText size={22} />
              </span>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-950">{estimate.projectTitle || 'Estimasi Vendor'}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Detail harga vendor dan lampiran quote.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {onGeneratePdf ? (
              <button aria-label="Buat PDF vendor" className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50" disabled={loading} onClick={() => onGeneratePdf(estimate)} type="button"><FileDown size={16} />PDF</button>
            ) : null}
            <button aria-label="Edit estimasi vendor" className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-3 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-50" disabled={loading} onClick={() => onEdit(estimate)} type="button"><Edit3 size={16} />Edit</button>
            <button aria-label="Hapus estimasi vendor" className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50" disabled={loading} onClick={() => setConfirmDelete(true)} type="button"><Trash2 size={16} />Hapus</button>
          </div>
        </div>

        {confirmDelete ? (
          <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-bold text-rose-800">Konfirmasi penghapusan "{estimate.projectTitle || estimate.id}"</p>
            <div className="mt-3 flex gap-2">
              <button aria-label="Konfirmasi penghapusan" className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white hover:bg-rose-700" onClick={() => onDelete(estimate)} type="button">Hapus permanen</button>
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => setConfirmDelete(false)} type="button">Batal</button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
        <h3 className="text-lg font-black tracking-tight text-slate-950">Ringkasan estimasi vendor</h3>
        <dl className="mt-4 grid gap-3 md:grid-cols-2">
          <DetailField label="Nama Job" value={estimate.projectTitle} />
          <DetailField label="Nama vendor" value={estimate.vendorName} />
          <DetailField label="Nama AE" value={estimate.aeName} />
          <DetailField label="No Job" value={estimate.jobNo} />
          <DetailField label="Kuantiti" value={quantity} />
          <DetailField label="Harga satuan" value={formatIdr(unitPrice)} />
          <DetailField label="Total harga" value={formatIdr(estimate.price)} />
          <DetailField label="Diperbarui" value={estimate.updatedAt ? new Date(estimate.updatedAt).toLocaleString('id-ID') : '-'} />
        </dl>
      </section>

      <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
        <h3 className="mb-4 text-lg font-black tracking-tight text-slate-950">Lampiran</h3>
        <AttachmentPreview estimate={estimate} />
      </section>
    </div>
  )
}
