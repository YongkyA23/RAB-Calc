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

export function TableSkeletonRows({ columns, rows = 4 }) {
  const widths = ['w-32', 'w-28', 'w-24', 'w-20', 'w-16', 'w-24']

  return Array.from({ length: rows }).map((_, rowIndex) => (
    <tr data-testid="table-skeleton-row" key={rowIndex}>
      {Array.from({ length: columns }).map((__, columnIndex) => (
        <td className="px-4 py-4" key={columnIndex}>
          <div className={`h-4 animate-pulse rounded-full bg-slate-200 ${widths[columnIndex] ?? 'w-24'}`} />
        </td>
      ))}
    </tr>
  ))
}
