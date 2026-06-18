const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200 disabled:bg-slate-300',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200 disabled:text-slate-300',
  danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50 focus:ring-red-100 disabled:text-red-300',
  dark: 'bg-slate-950 text-white hover:bg-slate-800 focus:ring-slate-300 disabled:bg-slate-300',
}

export function Button({ children, className = '', variant = 'secondary', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
