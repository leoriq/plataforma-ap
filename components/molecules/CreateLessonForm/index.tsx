'use client'

import { type ChangeEvent, useCallback, useState, Fragment } from 'react'
import DownloadFileIcon from '~/components/atoms/icons/DownloadFileIcon'
import api from '~/utils/api'

import styles from './CreateLessonForm.module.scss'
import Button from '~/components/atoms/Button'
import FormInput from '~/components/atoms/FormInput'
import { LessonCreateRequest } from '~/schemas/LessonRequest'
import Dropzone from 'react-dropzone'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

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
  const [lesson, setLesson] = useState<LessonCreateRequest>({
    title: '',
    body: '',
    videosIds: [],
    lessonCollectionId: collectionId,
    connectDocumentsIds: [],
    publicationDate: new Date().toISOString(),
  })

  const [documents, setDocuments] = useState<Document[]>([])

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

  const handleSubmit = useCallback(async () => {
    try {
      const documentPromises = documents.map(async (document) => {
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
    }
  }, [lesson, documents])

  return (
    <>
      <form className={styles.container}>
        <input
          className={styles.title}
          type="text"
          name="title"
          placeholder="Type a title for your lesson..."
          onChange={handleChange}
          value={lesson.title}
        />
        <div className={styles.body}>
          <section>
            <textarea
              className={styles.text}
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
            />
          </section>
          <section className={styles.videos}>
            <h2>Videos</h2>
            {lesson.videosIds.map((id, index) => (
              <Fragment key={index}>
                <div className={styles.videoControls}>
                  <FormInput
                    label={`YouTube ID ${index + 1}:`}
                    type="text"
                    name={String(index)}
                    value={id}
                    onChange={handleChangeVideo}
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveVideo(index)}
                    color="danger"
                  >
                    Delete
                  </Button>
                </div>
                {!!id && (
                  <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    title="YouTube video player"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </Fragment>
            ))}
            <Button type="button" onClick={handleAddVideo}>
              Add Video
            </Button>
          </section>

          <section>
            <h2>Files</h2>
            <p className={styles.text}>
              Download the files below to get started! 😉
            </p>
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
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
              )}
            </Dropzone>
          </section>
          <Button type="submit" color="success" onClick={handleSubmit}>
            Create Lesson
          </Button>
        </div>
      </form>
    </>
  )
}
