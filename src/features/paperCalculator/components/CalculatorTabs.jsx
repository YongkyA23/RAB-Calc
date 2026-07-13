import { BookOpen, Clock3, Grid3X3, Scissors } from 'lucide-react'

const CALCULATOR_TABS = [
  { id: 'layout', label: 'Layout Cetak', short: 'Layout', icon: Grid3X3 },
  { id: 'book', label: 'Kalkulator Buku', short: 'Buku', icon: BookOpen },
  { id: 'plano', label: 'Potong Plano', short: 'Plano', icon: Scissors },
  { id: 'time', label: 'Estimasi Waktu', short: 'Waktu', icon: Clock3 },
]

export function CalculatorTabs({ activeTab, onSelect }) {
  function handleKeyDown(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const current = CALCULATOR_TABS.findIndex((tab) => tab.id === activeTab)
    let next = current
    if (event.key === 'ArrowLeft') next = (current - 1 + CALCULATOR_TABS.length) % CALCULATOR_TABS.length
    if (event.key === 'ArrowRight') next = (current + 1) % CALCULATOR_TABS.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = CALCULATOR_TABS.length - 1
    onSelect(CALCULATOR_TABS[next].id)
    requestAnimationFrame(() => document.getElementById(`paper-tab-${CALCULATOR_TABS[next].id}`)?.focus())
  }

  return (
    <div className="overflow-x-auto rounded-3xl border border-white/80 bg-white p-2 shadow-xl shadow-slate-300/30">
      <div aria-label="Modul Hitung Kertas" className="flex min-w-max gap-2 lg:min-w-0" onKeyDown={handleKeyDown} role="tablist">
        {CALCULATOR_TABS.map(({ id, label, short, icon: Icon }) => {
          const selected = id === activeTab
          return (
            <button
              aria-controls={`paper-panel-${id}`}
              aria-label={label}
              aria-selected={selected}
              className={`flex min-w-36 flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${selected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              id={`paper-tab-${id}`}
              key={id}
              onClick={() => onSelect(id)}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              <Icon size={17} />
              <span className="hidden sm:inline">{label}</span><span className="sm:hidden">{short}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
