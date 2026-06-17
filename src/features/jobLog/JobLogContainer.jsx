import { useEffect, useState } from 'react'
import { listQuotes } from '../../firebase/firestoreHelpers'
import { JobLogView } from './JobLogView'

function downloadCsv(csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'job-log.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function JobLogContainer({ onDuplicateQuote }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [quotes, setQuotes] = useState([])

  useEffect(() => {
    let ignore = false

    async function loadQuotes() {
      try {
        const nextQuotes = await listQuotes()
        if (!ignore) setQuotes(nextQuotes)
      } catch (loadError) {
        if (!ignore) setError(loadError.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadQuotes()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <JobLogView
        loading={loading}
        onDuplicateQuote={onDuplicateQuote}
        onExportCsv={(_visibleQuotes, csv) => downloadCsv(csv)}
        quotes={quotes}
      />
    </div>
  )
}
