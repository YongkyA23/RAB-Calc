import { useState } from 'react'
import { FileText, Image as ImageIcon, Save, Upload } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Form'
import { useToast } from '../../components/ui/Toast'
import { isCloudinaryConfigured, uploadToCloudinary } from '../../lib/cloudinary'
import { formatIdr } from '../../lib/format'
import { calculateVendorEstimateTotal } from './vendorEstimateModel'

export function VendorEstimateFormView({
  draft,
  errors,
  loading,
  onCancel,
  onChange,
  onSubmit,
  title,
}) {
  const toast = useToast()
  const [uploading, setUploading] = useState(false)
  const cloudinaryReady = isCloudinaryConfigured()
  const totalPrice = calculateVendorEstimateTotal(draft.quantity, draft.unitPrice)

  async function handleUpload(file) {
    if (!file) return

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      toast.error('File harus berupa PDF atau gambar')
      return
    }

    setUploading(true)
    try {
      const { url, fileName, kind } = await uploadToCloudinary(file)
      onChange('attachmentUrl', url)
      onChange('attachmentName', fileName)
      onChange('attachmentType', kind)
      toast.success('File berhasil diunggah')
    } catch (uploadError) {
      toast.error(uploadError.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <FileText size={20} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Vendor quote</p>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
        </div>
      </div>

      {errors.length ? (
        <ul className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errors.map((error) => <li key={error}>{error}</li>)}
        </ul>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Nama Job">
          <Input onChange={(event) => onChange('projectTitle', event.target.value)} value={draft.projectTitle} />
        </Field>
        <Field label="Nama vendor">
          <Input onChange={(event) => onChange('vendorName', event.target.value)} value={draft.vendorName} />
        </Field>
        <Field label="No Job">
          <Input onChange={(event) => onChange('jobNo', event.target.value)} value={draft.jobNo} />
        </Field>
        <Field label="Nama AE">
          <Input onChange={(event) => onChange('aeName', event.target.value)} value={draft.aeName ?? ''} />
        </Field>
        <Field label="Kuantiti">
          <Input min="1" onChange={(event) => onChange('quantity', event.target.value)} step="1" type="number" value={draft.quantity} />
        </Field>
        <Field label="Harga satuan">
          <Input min="0" onChange={(event) => onChange('unitPrice', event.target.value)} step="1" type="number" value={draft.unitPrice} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Total harga">
            <Input aria-live="polite" className="cursor-not-allowed bg-blue-50 font-black text-blue-900" readOnly value={formatIdr(totalPrice)} />
          </Field>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <span className="text-sm font-semibold text-slate-700">Lampiran (PDF atau gambar)</span>
        {cloudinaryReady ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <input
              accept="application/pdf,image/*"
              className="hidden"
              id="vendor-attachment-upload"
              onChange={(event) => handleUpload(event.target.files?.[0])}
              type="file"
            />
            <Button
              className="cursor-pointer"
              disabled={loading}
              loading={uploading}
              loadingText="Mengunggah..."
              onClick={() => document.getElementById('vendor-attachment-upload')?.click()}
            >
              <Upload size={16} />
              Pilih file
            </Button>
            {draft.attachmentUrl ? (
              <a className="inline-flex items-center gap-1.5 truncate text-sm font-semibold text-blue-600 hover:underline" href={draft.attachmentUrl} rel="noreferrer" target="_blank">
                {draft.attachmentType === 'image' ? <ImageIcon size={15} /> : <FileText size={15} />}
                {draft.attachmentName || 'Lihat file'}
              </a>
            ) : null}
          </div>
        ) : (
          <p className="mt-1.5 text-sm text-slate-500">Upload belum dikonfigurasi. Set VITE_CLOUDINARY_SIGN_URL di .env</p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button loading={loading} loadingText="Menyimpan..." onClick={onSubmit} variant="primary">
          <Save size={16} />
          Simpan Estimasi Vendor
        </Button>
        <Button disabled={loading} onClick={onCancel}>
          Batal
        </Button>
      </div>
    </section>
  )
}
