'use client'

import type { LessonCollection } from '@prisma/client'
import { type ChangeEvent, useCallback, useState } from 'react'
import api from '~/utils/api'

interface Props {
  collection: LessonCollection
}

export default function EditCollectionForm({
  collection: uneditedCollection,
}: Props) {
  const [collection, setCollection] = useState(uneditedCollection)

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target
      setCollection((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }))
    },
    []
  )

  const handleSubmit = useCallback(() => {
    api.put('/api/collection', collection)
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
        Salvar
      </button>
    </form>
  )
}
