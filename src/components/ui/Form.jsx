export function Field({ children, label }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', ...props }) {
  return (
    <select
      className={`mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${className}`}
      {...props}
    />
  )
}

export const TextInput = Input
export const SelectInput = Select
