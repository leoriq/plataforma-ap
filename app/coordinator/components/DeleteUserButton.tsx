'use client'

import { usePathname } from 'next/navigation'
import api from '~/utils/api'

interface Props {
  id: string
}

export default function DeleteUserButton({ id }: Props) {
  const pathname = usePathname()

  return (
    <button
      onClick={() => {
        api.delete('/api/user', { params: { id, revalidate: pathname } })
      }}
    >
      Delete
    </button>
  )
}
