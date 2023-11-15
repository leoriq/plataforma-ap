'use client'

import type { Lesson, File as DBFile } from '@prisma/client'
import { type ChangeEvent, useCallback, useState } from 'react'
import api from '~/utils/api'

interface Props {
  lesson: Lesson & {
    Documents: DBFile[]
  }
}

export default function EditLessonForm({ lesson: uneditedLesson }: Props) {
  const [lesson, setLesson] = useState(uneditedLesson)
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

    await api.put('/api/lesson', lesson)
  }, [lesson, file, fileTitle])

  return (
    <form>
      <label>
        Título:
        <input
          type="text"
          name="title"
          value={lesson.title}
          onChange={handleChange}
        />
      </label>
      <label>
        Corpo:
        <textarea name="body" value={lesson.body} onChange={handleChange} />
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
      {/* 
      {lesson.Document ? (
        <>
          <p>
            {lesson.Document.title} - {lesson.Document.name}
          </p>
          <button
            type="button"
            onClick={() =>
              setLesson((prevFormData) => ({
                ...prevFormData,
                document: null,
                documentFileId: null,
              }))
            }
          >
            Remover arquivo
          </button>
        </>
      ) : (
        <>
          <label>
            Arquivo:
            <input
              type="file"
              name="documentFile"
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
        </>
      )} */}

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
