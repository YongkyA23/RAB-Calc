export function LayoutPreview({ result }) {
  if (result.status !== 'ready') return <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-sm font-semibold text-slate-400">Preview tersedia setelah ukuran valid.</div>
  const { paperWidth, paperHeight, placements, placementCount, columns, rows } = result.data
  return (
    <figure aria-label={`${placementCount} desain tersusun ${columns} kolom dan ${rows} baris`} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="mb-3 flex items-center justify-between text-xs"><span className="font-black uppercase tracking-[0.16em] text-slate-400">Preview lembar</span><strong className="text-slate-700">{columns} × {rows}</strong></div>
      <svg aria-label={`Susunan ${placementCount} desain pada kertas ${paperWidth} × ${paperHeight} cm`} className="max-h-96 w-full rounded-2xl bg-white shadow-inner" role="img" viewBox={`0 0 ${paperWidth} ${paperHeight}`}>
        <rect fill="#eff6ff" height={paperHeight} stroke="#93c5fd" strokeWidth={Math.max(paperWidth, paperHeight) / 180} width={paperWidth} />
        {placements.map((item) => <rect fill="#2563eb" fillOpacity="0.82" height={item.height} key={item.index} rx="0.35" stroke="#ffffff" strokeWidth="0.18" width={item.width} x={item.x} y={item.y} />)}
      </svg>
      {placementCount > placements.length ? <figcaption className="mt-3 text-xs font-medium text-slate-500">Preview dibatasi {placements.length} dari {placementCount} item untuk menjaga performa.</figcaption> : null}
    </figure>
  )
}

