export function Field({ children, label }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}

export function Input(props) {
  return (
    <input
      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

export function Select(props) {
  return (
    <select
      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

export const TextInput = Input
export const SelectInput = Select
