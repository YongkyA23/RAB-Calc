export function TableWrap({ children }) {
  return <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">{children}</div>
}

export function Table({ children }) {
  return <table className="min-w-full divide-y divide-slate-200 text-left text-sm">{children}</table>
}

export function Th({ children }) {
  return <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</th>
}

export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-slate-600 ${className}`}>{children}</td>
}
