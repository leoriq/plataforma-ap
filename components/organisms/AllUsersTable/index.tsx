'use client'

import { useRouter } from 'next/navigation'
import UserTable from '~/components/molecules/UserTable'

interface Props {
  users: {
    id: string
    fullName: string | null
    email: string
  }[]
}

export default function AllUsersTable({ users }: Props) {
  const router = useRouter()

  return (
    <UserTable
      onClickUser={(id) => router.push(`/auth/coordinator/users/${id}`)}
      canDeleteUser
      title="All Users"
      users={users}
    />
  )
}
