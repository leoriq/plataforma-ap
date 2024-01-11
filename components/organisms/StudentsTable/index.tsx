'use client'

import { useRouter } from 'next/navigation'
import UserTable from '~/components/molecules/UserTable'

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

  function handleClickUser(id: string) {
    router.push(`/auth/instructor/class/${classId}/students/${id}`)
  }

  return (
    <UserTable
      title="Students"
      users={students}
      addUsersLink={`/auth/instructor/class/${classId}/students/add`}
      onClickUser={handleClickUser}
    />
  )
}
