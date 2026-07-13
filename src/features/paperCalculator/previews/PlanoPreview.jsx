export function PlanoPreview({ result, scheme }) {
  if (result.status !== 'ready' || !scheme) return <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">Preview skema tersedia setelah ukuran valid.</div>
  const { planoWidth, planoHeight } = result.data
  return (
    <figure aria-label={`Skema ${scheme.label} dengan ${scheme.totalCuts} potongan`} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="mb-3 flex items-center justify-between text-xs"><span className="font-black uppercase tracking-[0.16em] text-slate-400">Pola potong</span><strong className="text-blue-700">{scheme.label} · {scheme.totalCuts} potong</strong></div>
      <svg aria-label={`Plano ${planoWidth} × ${planoHeight} cm berisi ${scheme.totalCuts} potongan`} className="max-h-96 w-full rounded-2xl bg-white shadow-inner" role="img" viewBox={`0 0 ${planoWidth} ${planoHeight}`}>
        <rect fill="#f8fafc" height={planoHeight} stroke="#94a3b8" strokeWidth={Math.max(planoWidth, planoHeight) / 220} width={planoWidth} />
        {scheme.placements.map((item, index) => <rect fill={index < (scheme.columns * scheme.rows) ? '#2563eb' : '#10b981'} fillOpacity="0.8" height={item.height} key={`${item.x}-${item.y}-${index}`} rx="0.5" stroke="#ffffff" strokeWidth="0.2" width={item.width} x={item.x} y={item.y} />)}
      </svg>
      {scheme.totalCuts > scheme.placements.length ? <figcaption className="mt-3 text-xs font-medium text-slate-500">Preview dibatasi {scheme.placements.length} dari {scheme.totalCuts} potongan.</figcaption> : null}
    </figure>
  )
}

