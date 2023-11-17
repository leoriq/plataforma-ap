import Link from 'next/link'
import { prisma } from '~/server/db'

import styles from './MaterialLessonPage.module.scss'
import LinkButton from '~/components/atoms/LinkButton'

import DownloadFileIcon from '~/components/atoms/icons/DownloadFileIcon'

export default async function MaterialLessonPage({
  params,
}: {
  params: { collectionId: string; lessonId: string }
}) {
  const { lessonId, collectionId } = params
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    include: {
      Documents: true,
      Questionnaires: true,
    },
  })

  if (!lesson) {
    return <h1>Lesson not found</h1>
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
            <p>Download the files below to get started! 😉</p>
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

        <LinkButton
          href={`/auth/material/collections/${collectionId}/lessons/${lessonId}/edit`}
          className={styles.editButton}
        >
          Edit Lesson
        </LinkButton>

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
            <LinkButton
              href={`/auth/material/lessons/${lessonId}/add-questionnaire`}
              color="success"
            >
              Create a Questionnaire
            </LinkButton>
          </section>
        )}
      </div>
    </div>
  )
}
