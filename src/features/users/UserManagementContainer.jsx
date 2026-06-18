import { useEffect, useState } from 'react'
import { COLLECTIONS } from '../../firebase/collections'
import { addAllowedEmail, getAllowlistEmails, listCollection, removeAllowedEmail, updateUserProfile } from '../../firebase/firestoreHelpers'
import { UserManagementView } from './UserManagementView'

export function UserManagementContainer({ currentUser }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [users, setUsers] = useState([])
  const [allowlistEmails, setAllowlistEmails] = useState([])

  async function loadUsers() {
    const nextUsers = await listCollection(COLLECTIONS.users)
    setUsers(nextUsers)
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialUsers() {
      try {
        const nextUsers = await listCollection(COLLECTIONS.users)
        if (!ignore) setUsers(nextUsers)
      } catch (loadError) {
        if (!ignore) setError(loadError.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadInitialUsers()

    return () => {
      ignore = true
    }
  }, [])

  async function handleUpdateUser(uid, changes) {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await updateUserProfile(uid, changes)
      await loadUsers()
      setSuccess('User profile updated')
    } catch (updateError) {
      setError(updateError.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadAllowlist() {
    try {
      const emails = await getAllowlistEmails()
      setAllowlistEmails(emails)
    } catch (error) {
      console.error('Failed to load allowlist:', error)
    }
  }

  useEffect(() => {
    loadAllowlist()
  }, [])

  async function handleAddEmail(email) {
    if (!currentUser) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await addAllowedEmail(email.toLowerCase(), currentUser.email)
      await loadAllowlist()
      setSuccess(`Added ${email} to approved list`)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveEmail(email) {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await removeAllowedEmail(email)
      await loadAllowlist()
      setSuccess(`Removed ${email} from approved list`)
    } catch (error) {
      setError(error.message)
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
      <UserManagementView
        allowlistEmails={allowlistEmails}
        currentUser={currentUser}
        loading={loading}
        onUpdateUser={handleUpdateUser}
        onAddEmail={handleAddEmail}
        onRemoveEmail={handleRemoveEmail}
        users={users}
      />
    </div>
  )
}
