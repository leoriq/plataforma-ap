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
    videosIds: [],
    lessonCollectionId: collectionId,
    publicationDate: new Date(),
  })
  const [fileTitle, setFileTitle] = useState('')
  const [file, setFile] = useState<File>()

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
      videosIds: [...prevFormData.videosIds, ''],
    }))
  }, [setLesson])

  const handleRemoveVideoUrl = useCallback(
    (index: number) => {
      setLesson((prevFormData) => {
        const newVideoUrl = [...prevFormData.videosIds]
        newVideoUrl.splice(index, 1)
        return {
          ...prevFormData,
          videosIds: newVideoUrl,
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
        const newVideoUrl = [...prevFormData.videosIds]
        newVideoUrl[index] = value
        return {
          ...prevFormData,
          videosIds: newVideoUrl,
        }
      })
    },
    [setLesson]
  )

  const handleSubmit = useCallback(async () => {
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', fileTitle)
      // lesson.documentFileId = (
      //   (await api.post('/api/upload', formData)).data as {
      //     file: { id: string }
      //   }
      // ).file.id
    }

    await api.post('/api/lesson', lesson)
  }, [lesson, file, fileTitle])

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

      {lesson.videosIds.map((url, index) => (
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

      <label>
        Arquivo:
        <input
          type="file"
          name="documentFileId"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
      </label>

      <label>
        Título do arquivo:
        <input
          type="text"
          name="fileTitle"
          value={fileTitle}
          onChange={(e) => setFileTitle(e.target.value)}
        />
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
