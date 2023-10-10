'use client'

import type { LessonCollection, User } from '@prisma/client'
import { type ChangeEvent, useCallback, useState } from 'react'
import type { ClassRequestBody } from '~/app/api/class/route'
import api from '~/utils/api'

interface Props {
  collections: LessonCollection[]
  instructors: User[]
  selectedClass: ClassRequestBody
}

export default function EditClassForm({
  collections,
  instructors,
  selectedClass,
}: Props) {
  const [newClass, setNewClass] = useState<ClassRequestBody>(selectedClass)

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target
      setNewClass((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    [setNewClass]
  )

  const handleSubmit = useCallback(() => {
    const payload = { ...newClass, id: selectedClass.id }
    api.put('/api/collection', payload)
  }, [newClass, selectedClass.id])

  return (
    <form>
      <label>
        Nome:
        <input
          type="text"
          name="name"
          value={newClass.name}
          onChange={handleChange}
        />
      </label>

      <label>
        Descrição:
        <input
          type="text"
          name="description"
          value={newClass.description}
          onChange={handleChange}
        />
      </label>

      <label>
        Coleção:
        <select
          name="lessonCollectionId"
          value={newClass.lessonCollectionId}
          onChange={handleChange}
        >
          <option value="">Selecione uma coleção</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Instrutores:
        <select
          multiple
          name="instructorsIds"
          value={newClass.instructorsIds}
          onChange={handleChange}
        >
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.fullName}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        onClick={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        Cadastrar
      </button>
    </form>
  )
}
