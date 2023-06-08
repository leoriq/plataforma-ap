'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'
import api from '~/utils/api'

interface Props {
  id: string
}

export default function DeleteUserButton({ id }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleDelete = useCallback(async () => {
    await api.delete('/api/user', { params: { id, revalidate: pathname } })
    router.refresh()
  }, [id, pathname, router])

  return <button onClick={() => void handleDelete()}>Delete</button>
}
