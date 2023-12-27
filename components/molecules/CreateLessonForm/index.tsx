'use client'

import { type ChangeEvent, useCallback, useState, useMemo } from 'react'
import DownloadFileIcon from '~/components/atoms/icons/DownloadFileIcon'
import api from '~/utils/api'

import styles from './CreateLessonForm.module.scss'
import Button from '~/components/atoms/Button'
import FormInput from '~/components/atoms/FormInput'
import {
  LessonCreateRequestZod,
  type LessonCreateRequest,
} from '~/schemas/LessonRequest'
import Dropzone from 'react-dropzone'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useModal } from '~/contexts/ModalContext'
import LessonView from '../LessonView/LessonView'
import FormTextArea from '~/components/atoms/FormTextArea'

interface Props {
  collectionId: string
}

interface Document {
  file: File
  title: string
  name: string
  error?: string
}

export default function CreateLessonForm({ collectionId }: Props) {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [lesson, setLesson] = useState<LessonCreateRequest>({
    title: '',
    body: '',
    videosIds: [],
    lessonCollectionId: collectionId,
    connectDocumentsIds: [],
    publicationDate: new Date().toISOString(),
  })
  const lessonPreview = useMemo(() => {
    return {
      id: 'preview',
      ...lesson,
      Documents: documents.map((document) => ({
        id: 'preview',
        ...document,
      })),
      Questionnaires: [],
    }
  }, [lesson, documents])

  const publicationDatetimeLocal = useMemo(() => {
    const date = new Date(lesson.publicationDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }, [lesson.publicationDate])
  const setPublicationDate = useCallback(
    (date: string) => {
      setLesson((prevFormData) => ({
        ...prevFormData,
        publicationDate: new Date(date).toISOString(),
      }))
    },
    [setLesson]
  )

  const errors = useMemo(() => {
    const parse = LessonCreateRequestZod.safeParse(lesson)
    return parse.success ? undefined : parse.error.format()
  }, [lesson])

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

  const handleAddVideo = useCallback(() => {
    setLesson((prevFormData) => ({
      ...prevFormData,
      videosIds: [...prevFormData.videosIds, ''],
    }))
  }, [setLesson])

  const handleRemoveVideo = useCallback(
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
    [setLesson]
  )

  const addFiles = useCallback(
    (files: File[]) => {
      setDocuments((oldDocuments) => [
        ...oldDocuments,
        ...files.map((file) => ({
          file,
          title: '',
          name: file.name,
        })),
      ])
    },
    [setDocuments]
  )

  const removeFile = useCallback(
    (index: number) => {
      setDocuments((oldDocuments) => {
        const newDocuments = [...oldDocuments]
        newDocuments.splice(index, 1)
        return newDocuments
      })
    },
    [setDocuments]
  )

  const changeFileTitle = useCallback(
    (index: number, title: string) => {
      setDocuments((oldDocuments) => {
        const newDocuments = [...oldDocuments]
        const document = newDocuments[index]
        if (document) {
          document.title = title
        }
        return newDocuments
      })
    },
    [setDocuments]
  )

  const fileTitleSchema = z
    .string()
    .min(1, 'A title is required')
    .max(100, 'Title should be less than 100 characters')

  const { displayModal, hideModal } = useModal()

  async function handleSubmit() {
    if (errors) {
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
      const documentPromises = documents.map(async (document) => {
        if (!document.title) throw new Error('No file title')
        const formData = new FormData()
        formData.append('file', document.file)
        formData.append('title', document.title)
        const promise = api.post('/api/upload', formData)
        return promise
      })

      const documentsIds = (await Promise.all(documentPromises)).map(
        (response) => response.data.file.id as string
      )

      const lessonCreateRequest: LessonCreateRequest = {
        ...lesson,
        connectDocumentsIds: documentsIds,
      }

      await api.post('/api/lesson', lessonCreateRequest)

      router.push('/auth/material/collections')
      router.refresh()
    } catch (error) {
      console.log(error)
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
        <h1>Create a Lesson</h1>
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
            onInput={(e) => {
              e.currentTarget.style.height = 'auto'
              e.currentTarget.style.height = `${
                e.currentTarget.scrollHeight + 2
              }px`
            }}
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
            {documents.map((document, index) => {
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
                      value={document.title}
                      onChange={(e) => changeFileTitle(index, e.target.value)}
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
            Create Lesson
          </Button>
        </form>
      </div>

      <div className={styles.lessonViewContainer}>
        <LessonView lesson={lessonPreview} />
      </div>
    </div>
  )
}
