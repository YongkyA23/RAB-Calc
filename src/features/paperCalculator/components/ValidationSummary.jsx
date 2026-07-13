import { AlertCircle, Info } from 'lucide-react'

export function ValidationSummary({ result }) {
  if (result.status === 'empty') {
    return <div className="flex gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"><Info className="mt-0.5 shrink-0" size={17} /> Isi data utama untuk mulai menghitung.</div>
  }
  const messages = result.status === 'invalid' ? result.errors : result.status === 'no-fit' ? result.warnings : []
  if (!messages.length) return null
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
      <div className="flex gap-2 font-bold"><AlertCircle className="mt-0.5 shrink-0" size={17} /><span>Periksa data berikut</span></div>
      <ul className="mt-2 list-disc space-y-1 pl-6 font-medium">{messages.map((message) => <li key={message}>{message}</li>)}</ul>
    </div>
  )
}

export function WarningList({ warnings }) {
  if (!warnings?.length) return null
  return <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"><ul className="list-disc space-y-1 pl-5">{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>
}

