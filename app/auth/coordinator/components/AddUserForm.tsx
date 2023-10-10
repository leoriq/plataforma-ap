'use client'

import type { roles } from '@prisma/client'
import { useCallback, useState } from 'react'
import api from '~/utils/api'

interface Props {
  roles: roles
}

export default function AddUserForm({ roles }: Props) {
  const [email, setEmail] = useState('')
  console.log(email.replaceAll('\n', ','))

  const handleSubmit = useCallback(() => {
    api.post('/api/user', {
      email: email.replaceAll('\n', ','),
      roles,
    })
  }, [email, roles])

  return (
    <form>
      <label>
        Emails (inserir um por linha):
        <textarea value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <input
        type="submit"
        onClick={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      />
    </form>
  )
}
