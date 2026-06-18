import { useEffect, useState } from 'react'
import { COLLECTIONS } from '../../firebase/collections'
import { listCollection, listUserInvites, saveUserInvite, updateUserProfile } from '../../firebase/firestoreHelpers'
import { UserManagementView } from './UserManagementView'

function mergeUsersAndInvites(users, invites) {
  const userEmails = new Set(users.map((user) => user.email?.toLowerCase()).filter(Boolean))
  const pendingInvites = invites.filter((invite) => !userEmails.has(invite.email?.toLowerCase()))
  return [...users, ...pendingInvites]
}

export function UserManagementContainer({ currentUser }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [users, setUsers] = useState([])

  async function loadUsers() {
    const [nextUsers, nextInvites] = await Promise.all([
      listCollection(COLLECTIONS.users),
      listUserInvites(),
    ])
    setUsers(mergeUsersAndInvites(nextUsers, nextInvites))
  }

  useEffect(() => {
    let ignore = false

    async function loadInitialUsers() {
      try {
        const [nextUsers, nextInvites] = await Promise.all([
          listCollection(COLLECTIONS.users),
          listUserInvites(),
        ])
        if (!ignore) setUsers(mergeUsersAndInvites(nextUsers, nextInvites))
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

  async function handleAddUser(input) {
    if (!currentUser) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await saveUserInvite({ ...input, invitedBy: currentUser.email })
      await loadUsers()
      setSuccess(`Added ${input.email} to users`)
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
        currentUser={currentUser}
        loading={loading}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        users={users}
      />
    </div>
  )
}
