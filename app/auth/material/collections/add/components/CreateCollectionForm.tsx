'use client'

import type { LessonCollection } from '@prisma/client'
import { type ChangeEvent, useCallback, useState } from 'react'
import api from '~/utils/api'

type LessonFormData = Omit<LessonCollection, 'id' | 'createdAt' | 'updatedAt'>

export default function CreateCollectionForm() {
  const [collection, setCollection] = useState<LessonFormData>({
    name: '',
    description: '',
  })

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target
      setCollection((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }))
    },
    [setCollection]
  )

  const handleSubmit = useCallback(() => {
    api.post('/api/collection', collection)
  }, [collection])

  return (
    <form>
      <label>
        Nome:
        <input type="text" name="name" onChange={handleChange} />
      </label>
      <label>
        Descrição:
        <input type="text" name="description" onChange={handleChange} />
      </label>

      <button
        type="submit"
        onClick={(e) => {
          e.preventDefault()
          void handleSubmit()
        }}
      >
        Cadastrar
      </button>
    </form>
  )
}
