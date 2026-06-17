import { useEffect, useState } from 'react'
import { listActivePriceItems, saveQuote } from '../../firebase/firestoreHelpers'
import { EstimationView } from './EstimationView'

export function EstimationContainer({ initialDraft, profile }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [priceItems, setPriceItems] = useState([])
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadPriceItems() {
      try {
        const nextPriceItems = await listActivePriceItems()
        if (!ignore) setPriceItems(nextPriceItems)
      } catch (loadError) {
        if (!ignore) setError(loadError.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadPriceItems()

    return () => {
      ignore = true
    }
  }, [])

  async function handleSaveQuote(quote) {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await saveQuote({
        ...quote,
        createdBy: { uid: profile.uid, name: profile.name || profile.email },
      })
      setSuccess('Quote saved to job log')
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      ) : null}
      <EstimationView initialDraft={initialDraft} loading={loading} onSaveQuote={handleSaveQuote} priceItems={priceItems} />
    </div>
  )
}
