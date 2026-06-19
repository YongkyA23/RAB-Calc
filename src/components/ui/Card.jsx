export function Card({ children, className = '' }) {
  return <section className={`rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/80 ${className}`}>{children}</section>
}

export function CardHeader({ action, children, description, title }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-black tracking-tight text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}
