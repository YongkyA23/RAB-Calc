import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, X, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

let nextToastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback((message, type) => {
    nextToastId += 1
    const id = nextToastId
    setToasts((current) => [...current, { id, message, type }])
    return id
  }, [])

  const toast = useMemo(
    () => ({
      success: (message) => push(message, 'success'),
      error: (message) => push(message, 'error'),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((item) => (
          <ToastItem dismiss={dismiss} key={item.id} toast={item} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, dismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), 3500)
    return () => clearTimeout(timer)
  }, [dismiss, toast.id])

  const isError = toast.type === 'error'
  const Icon = isError ? XCircle : CheckCircle2

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl shadow-slate-400/20 backdrop-blur ${
        isError ? 'border-rose-200 bg-rose-50/95 text-rose-800' : 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
      }`}
      role="alert"
    >
      <Icon className="mt-0.5 shrink-0" size={18} />
      <p className="flex-1 text-sm font-semibold">{toast.message}</p>
      <button aria-label="Dismiss notification" className="shrink-0 text-slate-400 transition hover:text-slate-600" onClick={() => dismiss(toast.id)} type="button">
        <X size={16} />
      </button>
    </div>
  )
}

export function useToast() {
  const toast = useContext(ToastContext)
  if (!toast) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return toast
}
