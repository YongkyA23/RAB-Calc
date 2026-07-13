export function PresetButtons({ label, onSelect, presets, selectedWidth, selectedHeight }) {
  return (
    <fieldset>
      <legend className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {presets.map((preset) => {
          const selected = String(selectedWidth) === String(preset.width) && String(selectedHeight) === String(preset.height)
          return (
            <button
              aria-pressed={selected}
              className={`rounded-2xl border px-3.5 py-2 text-left transition ${selected ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'}`}
              key={preset.id}
              onClick={() => onSelect(preset)}
              type="button"
            >
              <strong className="block text-sm font-black">{preset.label}</strong>
              <span className={`text-[11px] font-semibold ${selected ? 'text-blue-100' : 'text-slate-400'}`}>{preset.width}×{preset.height} cm</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

