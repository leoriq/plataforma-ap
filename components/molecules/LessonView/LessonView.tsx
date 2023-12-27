import Link from 'next/link'

import styles from './LessonView.module.scss'
import LinkButton from '~/components/atoms/LinkButton'

import DownloadFileIcon from '~/components/atoms/icons/DownloadFileIcon'

interface Props {
  showControls?: boolean
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

export default function LessonView({ lesson, showControls }: Props) {
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

        {showControls && (
          <LinkButton
            href={`/auth/material/collections/lessons/${lesson.id}/edit`}
            className={styles.editButton}
          >
            Edit Lesson
          </LinkButton>
        )}

        {!!lesson.Questionnaires.length && (
          <section>
            <h2>Let&apos;s Practice!</h2>
            <div className={styles.questionnaires}>
              {lesson.Questionnaires.map((questionnaire) => (
                <Link
                  className={styles.questionnaireLink}
                  href={`/auth/material/questionnaire/${questionnaire.id}`}
                  key={questionnaire.id}
                >
                  <h3>{questionnaire.title}</h3>
                </Link>
              ))}
            </div>
            {showControls && (
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
