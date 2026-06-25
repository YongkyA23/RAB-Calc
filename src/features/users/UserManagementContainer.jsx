import { useEffect, useState } from 'react'
import { COLLECTIONS } from '../../firebase/collections'
import { listCollection, listUserInvites, saveUserInvite, updateUserProfile } from '../../firebase/firestoreHelpers'
import { useToast } from '../../components/ui/Toast'
import { UserManagementView } from './UserManagementView'

function mergeUsersAndInvites(users, invites) {
  const userEmails = new Set(users.map((user) => user.email?.toLowerCase()).filter(Boolean))
  const pendingInvites = invites.filter((invite) => !userEmails.has(invite.email?.toLowerCase()))
  return [...users, ...pendingInvites]
}

export function UserManagementContainer({ currentUser }) {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
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
        if (!ignore) toast.error(loadError.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadInitialUsers()

    return () => {
      ignore = true
    }
  }, [toast])

  async function handleUpdateUser(uid, changes) {
    setLoading(true)

    try {
      await updateUserProfile(uid, changes)
      await loadUsers()
      toast.success('User profile updated')
    } catch (updateError) {
      toast.error(updateError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddUser(input) {
    if (!currentUser) return

    setLoading(true)

    try {
      await saveUserInvite({ ...input, invitedBy: currentUser.email })
      await loadUsers()
      toast.success(`Added ${input.email} to users`)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
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
