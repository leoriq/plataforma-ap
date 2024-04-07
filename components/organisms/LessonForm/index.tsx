'use client'

import { type ChangeEvent, useCallback, useState, useMemo } from 'react'
import DownloadFileIcon from '~/components/atoms/icons/DownloadFileIcon'
import api from '~/utils/api'

import styles from './LessonForm.module.scss'
import Button from '~/components/atoms/Button'
import FormInput from '~/components/atoms/FormInput'
import {
  LessonCreateRequestZod,
  type LessonCreateRequest,
  type LessonUpdateRequest,
  LessonUpdateRequestZod,
} from '~/schemas/LessonRequest'
import Dropzone from 'react-dropzone'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useModal } from '~/contexts/ModalContext'
import LessonView from '../../molecules/LessonView'
import FormTextArea from '~/components/atoms/FormTextArea'
import { uploadDocument } from '~/utils/uploadDocument'

interface Props {
  collectionId?: string
  lesson?: {
    id: string
    title: string
    body: string
    videosIds: string[]
    publicationDate: Date
    Documents: {
      id: string
      title: string | null
      name: string
    }[]
  }
}

interface Document {
  id?: string
  file: File
  title: string
  name: string
  error?: string
}

export default function LessonForm({ collectionId, lesson: dbLesson }: Props) {
  const router = useRouter()
  const [newDocuments, setNewDocuments] = useState<Document[]>(() => {
    if (!dbLesson) return []

    return dbLesson.Documents.map((document) => ({
      id: document.id,
      file: new File([], ''),
      title: document.title ?? '',
      name: document.name,
    }))
  })
  const startingLesson = useMemo(() => {
    if (!dbLesson)
      return {
        title: '',
        body: '',
        videosIds: [],
        lessonCollectionId: collectionId ?? '',
        publicationDate: new Date().toISOString(),
      }
    return {
      id: dbLesson.id,
      title: dbLesson.title,
      body: dbLesson.body,
      videosIds: dbLesson.videosIds,
      publicationDate: dbLesson.publicationDate.toISOString(),
      disconnectDocumentsIds: [],
    }
  }, [dbLesson, collectionId])

  const [lesson, setLesson] = useState<
    LessonCreateRequest | LessonUpdateRequest
  >(startingLesson)
  const lessonPreview = useMemo(() => {
    return {
      id: 'preview',
      ...lesson,
      Documents: newDocuments.map((document) => ({
        id: 'preview',
        ...document,
      })),
      Questionnaires: [],
    }
  }, [lesson, newDocuments])

  const publicationDatetimeLocal = useMemo(() => {
    const date = new Date(lesson.publicationDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }, [lesson.publicationDate])
  const setPublicationDate = useCallback((date: string) => {
    setLesson((prevFormData) => ({
      ...prevFormData,
      publicationDate: new Date(date).toISOString(),
    }))
  }, [])

  const errors = useMemo(() => {
    const parse = !dbLesson
      ? LessonCreateRequestZod.safeParse(lesson)
      : LessonUpdateRequestZod.safeParse(lesson)
    return parse.success ? undefined : parse.error.format()
  }, [lesson, dbLesson])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target
      setLesson((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }))
    },
    []
  )

  const handleAddVideo = useCallback(() => {
    setLesson((prevFormData) => ({
      ...prevFormData,
      videosIds: [...prevFormData.videosIds, ''],
    }))
  }, [])

  const handleRemoveVideo = useCallback((index: number) => {
    setLesson((prevFormData) => {
      const newVideoUrl = [...prevFormData.videosIds]
      newVideoUrl.splice(index, 1)
      return {
        ...prevFormData,
        videosIds: newVideoUrl,
      }
    })
  }, [])

  const handleChangeVideo = useCallback(
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
    []
  )

  const addFiles = useCallback((files: File[]) => {
    setNewDocuments((oldDocuments) => [
      ...oldDocuments,
      ...files.map((file) => ({
        file,
        title: '',
        name: file.name,
      })),
    ])
  }, [])

  const removeFile = useCallback((index: number) => {
    setNewDocuments((oldDocuments) => {
      const newDocuments = [...oldDocuments]
      const removed = newDocuments.splice(index, 1)
      const id = removed[0]?.id
      if (id) {
        setLesson((prev) => {
          if ('disconnectDocumentsIds' in prev)
            return {
              ...prev,
              disconnectDocumentsIds: [
                ...(prev.disconnectDocumentsIds ?? []),
                id,
              ],
            }
          return prev
        })
      }
      return newDocuments
    })
  }, [])

  const changeFileTitle = useCallback((index: number, title: string) => {
    setNewDocuments((oldDocuments) => {
      const newDocuments = [...oldDocuments]
      const document = newDocuments[index]
      if (document) {
        document.title = title
      }
      return newDocuments
    })
  }, [])

  const fileTitleSchema = z
    .string()
    .min(1, 'A title is required')
    .max(100, 'Title should be less than 100 characters')

  const { displayModal, hideModal } = useModal()

  async function handleSubmit() {
    if (errors) {
      console.error(errors)
      displayModal({
        title: 'Error',
        body: 'Please fill all the fields correctly.',
        buttons: [
          {
            text: 'Close',
            onClick: hideModal,
          },
        ],
      })
      return
    }

    try {
      const documentPromises = newDocuments
        .filter((document) => !document.id)
        .map(async (document) => {
          if (!document.title) throw new Error('No file title')
          return uploadDocument(document.file, document.title)
        })

      const documentsIds = await Promise.all(documentPromises)

      const lessonRequest = {
        ...lesson,
        connectDocumentsIds: documentsIds,
      }

      if (dbLesson) {
        await api.put('/api/lesson', lessonRequest)
      } else {
        await api.post('/api/lesson', lessonRequest)
      }

      router.push('/auth/material/collections')
      router.refresh()
    } catch (error) {
      console.error(error)
      displayModal({
        title: 'Error',
        body: 'An error occurred while creating the lesson. Please fix any errors and try again.',
        buttons: [
          {
            text: 'Close',
            onClick: hideModal,
          },
        ],
      })
    }
  }

  return (
    <div className={styles.outerContainer}>
      <div className={styles.formContainer}>
        <h1>{!dbLesson ? 'Create a' : 'Edit'} Lesson</h1>
        <form className={styles.form}>
          <h2>Info</h2>
          <FormInput
            label="Publication Date:"
            type="datetime-local"
            name="publicationDate"
            onChange={(e) => setPublicationDate(e.target.value)}
            value={publicationDatetimeLocal}
            errors={errors?.publicationDate?._errors}
          />
          <FormInput
            label="Lesson Title:"
            type="text"
            name="title"
            value={lesson.title}
            onChange={handleChange}
            errors={errors?.title?._errors}
          />
          <FormTextArea
            label="Body:"
            name="body"
            onChange={handleChange}
            value={lesson.body}
            placeholder="Type the lesson body here..."
            errors={errors?.body?._errors}
          />

          <h2>Videos</h2>
          <div className={styles.videos}>
            {lesson.videosIds.map((id, index) => (
              <div key={index} className={styles.videoControls}>
                <FormInput
                  label={`YouTube ID ${index + 1}:`}
                  type="text"
                  name={String(index)}
                  value={id}
                  onChange={handleChangeVideo}
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  errors={errors?.videosIds?.[index]?._errors}
                />
                <Button
                  type="button"
                  onClick={() => handleRemoveVideo(index)}
                  color="danger"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={handleAddVideo}>
            Add Video
          </Button>

          <h2>Files</h2>
          <div className={styles.files}>
            {newDocuments.map((document, index) => {
              const parse = fileTitleSchema.safeParse(document.title)
              const errors = parse.success
                ? undefined
                : parse.error.format()._errors

              return (
                <div className={styles.fileContainer} key={index}>
                  <div className={styles.fileControls}>
                    <FormInput
                      label={`Title of file ${index + 1}:`}
                      type="text"
                      name={String(index)}
                      value={document.title ?? ''}
                      onChange={(e) => changeFileTitle(index, e.target.value)}
                      disabled={!!document.id}
                      eager
                      errors={errors}
                    />
                    <Button
                      type="button"
                      onClick={() => removeFile(index)}
                      color="danger"
                    >
                      Delete
                    </Button>
                  </div>

                  <a className={styles.downloadButton}>
                    <DownloadFileIcon />
                    <div className={styles.fileDetails}>
                      <h4>{document.title}</h4>
                      <p>{document.name} - Download</p>
                    </div>
                  </a>
                </div>
              )
            })}
          </div>
          <Dropzone onDrop={addFiles}>
            {({ getRootProps, getInputProps }) => (
              <div className={styles.drop} {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag and drop some files here, or click to select files</p>
              </div>
            )}
          </Dropzone>

          <Button
            type="submit"
            color="success"
            onClick={async (e) => {
              e.preventDefault()
              await handleSubmit()
            }}
          >
            {!dbLesson ? 'Create Lesson' : 'Save'}
          </Button>
        </form>
      </div>

      <div className={styles.lessonViewContainer}>
        <LessonView lesson={lessonPreview} />
      </div>
    </div>
  )
}
