'use client'

import type { Role } from '@prisma/client'
import { useCallback, useState } from 'react'
import api from '~/utils/api'

interface Props {
  role: Role
}

export default function AddUserForm({ role }: Props) {
  const [email, setEmail] = useState('')
  console.log(email.replaceAll('\n', ','))

  const handleSubmit = useCallback(() => {
    api.post('/api/user', {
      email: email.replaceAll('\n', ','),
      role,
    })
  }, [email, role])

  return (
    <form>
      <label>
        Emails (inserir um por linha):
        <textarea onChange={(e) => setEmail(e.target.value)} />
      </label>
      <input
        type="submit"
        value="Submit"
        onClick={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      />
    </form>
  )
}
