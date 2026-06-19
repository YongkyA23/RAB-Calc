const variants = {
  primary: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 focus:ring-blue-200 disabled:bg-slate-300 disabled:shadow-none',
  secondary: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-200 disabled:text-slate-300',
  danger: 'border border-rose-200 bg-white text-rose-700 shadow-sm hover:border-rose-300 hover:bg-rose-50 focus:ring-rose-100 disabled:text-rose-300',
  dark: 'bg-slate-950 text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800 focus:ring-slate-300 disabled:bg-slate-300 disabled:shadow-none',
}

export function Button({ children, className = '', variant = 'secondary', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
