'use client'

import Link from 'next/link'

import styles from './LessonView.module.scss'
import LinkButton from '~/components/atoms/LinkButton'

import DownloadFileIcon from '~/components/atoms/icons/DownloadFileIcon'
import Button from '~/components/atoms/Button'
import { useModal } from '~/contexts/ModalContext'
import api from '~/utils/api'
import { useParams, useRouter } from 'next/navigation'

interface Props {
  showMaterialControls?: boolean
  lesson: {
    id: string
    title: string
    body: string
    videosIds: string[]
    Documents: {
      id: string
      title: string | null
      name: string
    }[]
    Questionnaires: {
      id: string
      title: string
    }[]
  }
}

export default function LessonView({ lesson, showMaterialControls }: Props) {
  const { displayModal, hideModal } = useModal()
  const router = useRouter()
  const { classId } = useParams()

  async function deleteLesson() {
    try {
      await api.delete('/api/lesson', { data: { id: lesson.id } })
      router.push('/auth/material/collections')
      router.refresh()
      hideModal()
    } catch (error) {
      console.error(error)
      displayModal({
        title: 'Error',
        body: 'An error has occurred while deleting the lesson. Please try again.',
        buttons: [
          {
            text: 'Close',
            onClick: hideModal,
          },
        ],
      })
    }
  }

  function handleDelete() {
    displayModal({
      title: 'Delete Lesson',
      body: 'This will also delete any questionnaires and grades associated with this lesson. Are you sure you want to delete this lesson?',
      buttons: [
        {
          text: 'Cancel',
          onClick: hideModal,
        },
        {
          text: 'Delete',
          color: 'danger',
          onClick: deleteLesson,
        },
      ],
    })
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{lesson.title}</h1>
      <div className={styles.body}>
        <section>
          <p className={styles.text}>{lesson.body}</p>
        </section>
        {!!lesson.videosIds.length && (
          <section className={styles.videos}>
            <h2>Videos</h2>
            {lesson.videosIds.map((id, index) => (
              <iframe
                key={index}
                src={`https://www.youtube.com/embed/${id}`}
                title="YouTube video player"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ))}
          </section>
        )}

        {!!lesson.Documents.length && (
          <section>
            <h2>Files</h2>
            <p className={styles.text}>
              Download the files below to get started! 😉
            </p>
            <div className={styles.files}>
              {lesson.Documents.map((document) => (
                <a
                  className={styles.downloadButton}
                  href={`/api/upload?id=${document.id}`}
                  download={document.name}
                  key={document.id}
                >
                  <DownloadFileIcon />
                  <div className={styles.fileDetails}>
                    <h4>{document.title}</h4>
                    <p>{document.name} - Download</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {showMaterialControls && (
          <>
            <LinkButton
              href={`/auth/material/lessons/${lesson.id}/edit`}
              className={styles.editButton}
            >
              Edit Lesson
            </LinkButton>
            <Button color="danger" onClick={handleDelete}>
              Delete Lesson
            </Button>
          </>
        )}

        {(!!lesson.Questionnaires.length || showMaterialControls) && (
          <section>
            <h2>Let&apos;s Practice!</h2>
            <div className={styles.questionnaires}>
              {lesson.Questionnaires.map((questionnaire) => (
                <Link
                  className={styles.questionnaireLink}
                  href={
                    showMaterialControls
                      ? `/auth/material/questionnaire/${questionnaire.id}`
                      : `/auth/student/class/${
                          classId?.toString() ?? ''
                        }/questionnaire/${questionnaire.id}`
                  }
                  key={questionnaire.id}
                >
                  <h3>{questionnaire.title}</h3>
                </Link>
              ))}
            </div>
            {showMaterialControls && (
              <LinkButton
                href={`/auth/material/lessons/${lesson.id}/add-questionnaire`}
                color="success"
              >
                Create a Questionnaire
              </LinkButton>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
