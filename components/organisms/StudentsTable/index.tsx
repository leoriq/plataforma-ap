'use client'

import { useRouter } from 'next/navigation'
import UserTable from '~/components/molecules/UserTable'
import { useModal } from '~/contexts/ModalContext'
import api from '~/utils/api'

interface Props {
  students: {
    id: string
    fullName: string | null
    email: string
  }[]
  classId: string
}

export default function StudentsTable({ students, classId }: Props) {
  const router = useRouter()
  const { displayModal, hideModal } = useModal()

  function handleClickUser(id: string) {
    router.push(`/auth/instructor/class/${classId}/students/${id}`)
  }

  function handleRemoveUsers(ids: string[]) {
    async function removeUsers() {
      try {
        await api.delete(`/api/class/students`, { data: { ids, classId } })
      } catch (err) {
        console.error(err)
        displayModal({
          title: 'Error',
          body: 'There was an error removing the students. Please try again.',
          buttons: [
            {
              text: 'Ok',
              onClick: hideModal,
            },
          ],
        })
      }
      router.refresh()
      hideModal()
    }
    displayModal({
      title: 'Remove Students',
      body: `Are you sure you want to remove ${ids.length} student${
        ids.length > 1 ? 's' : ''
      } from this class? ${
        ids.length > 1 ? 'These students' : 'This student'
      } will remain in the system, but will no longer be associated with this class.`,
      buttons: [
        {
          text: 'Cancel',
          onClick: hideModal,
        },
        {
          text: 'Remove',
          color: 'danger',
          onClick: removeUsers,
        },
      ],
    })
  }

  return (
    <UserTable
      title="Students"
      users={students}
      addUsersLink={`/auth/instructor/class/${classId}/students/add`}
      addText="Add Student to Class"
      removeUsers={handleRemoveUsers}
      onClickUser={handleClickUser}
    />
  )
}
