'use client'

import type { Lesson } from '@prisma/client'
import { type ChangeEvent, useCallback, useState } from 'react'
import api from '~/utils/api'

type LessonFormData = Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>

interface Props {
  collectionId: string
}

export default function CreateLessonForm({ collectionId }: Props) {
  const [lesson, setLesson] = useState<LessonFormData>({
    title: '',
    body: '',
    videoUrl: [],
    lessonCollectionId: collectionId,
    fileId: null,
  })

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target
      setLesson((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }))
    },
    [setLesson]
  )

  const handleAddVideoUrl = useCallback(() => {
    setLesson((prevFormData) => ({
      ...prevFormData,
      videoUrl: [...prevFormData.videoUrl, ''],
    }))
  }, [setLesson])

  const handleRemoveVideoUrl = useCallback(
    (index: number) => {
      setLesson((prevFormData) => {
        const newVideoUrl = [...prevFormData.videoUrl]
        newVideoUrl.splice(index, 1)
        return {
          ...prevFormData,
          videoUrl: newVideoUrl,
        }
      })
    },
    [setLesson]
  )

  const handleChangeVideoUrl = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target
      const index = Number(name)
      setLesson((prevFormData) => {
        const newVideoUrl = [...prevFormData.videoUrl]
        newVideoUrl[index] = value
        return {
          ...prevFormData,
          videoUrl: newVideoUrl,
        }
      })
    },
    [setLesson]
  )

  const handleSubmit = useCallback(() => {
    api.post('/api/lesson', lesson)
  }, [lesson])

  return (
    <form>
      <label>
        Título:
        <input type="text" name="title" onChange={handleChange} />
      </label>
      <label>
        Corpo:
        <textarea name="body" onChange={handleChange} />
      </label>

      {lesson.videoUrl.map((url, index) => (
        <label key={index}>
          ID do YouTube {index + 1}:
          <input
            type="text"
            name={String(index)}
            value={url}
            onChange={handleChangeVideoUrl}
          />
          <button type="button" onClick={() => handleRemoveVideoUrl(index)}>
            Remover vídeo
          </button>
        </label>
      ))}
      <button type="button" onClick={handleAddVideoUrl}>
        Adicionar vídeo
      </button>

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
