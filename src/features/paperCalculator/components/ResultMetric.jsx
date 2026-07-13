export function ResultMetric({ accent = false, label, suffix, value }) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? 'border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'border-slate-100 bg-slate-50/80 text-slate-950'}`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${accent ? 'text-blue-100' : 'text-slate-400'}`}>{label}</p>
      <p className="mt-2 text-xl font-black tracking-tight">{value ?? '—'}</p>
      {suffix ? <p className={`mt-0.5 text-xs font-semibold ${accent ? 'text-blue-100' : 'text-slate-400'}`}>{suffix}</p> : null}
    </div>
  )
}

