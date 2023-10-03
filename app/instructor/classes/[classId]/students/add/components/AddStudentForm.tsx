'use client'

import { useCallback, useState } from 'react'
import api from '~/utils/api'

interface Props {
  classId: String
}

export default function AddStudentForm({ classId }: Props) {
  const [email, setEmail] = useState('')
  console.log(email.replaceAll('\n', ','))

  const handleSubmit = useCallback(() => {
    api.post('/api/class/student', {
      email: email.replaceAll('\n', ','),
      classId,
    })
  }, [email])

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
