import Link from 'next/link'
import { prisma } from '~/server/db'

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
      Document: true,
      Questionnaires: true,
    },
  })

  if (!lesson) {
    return <h1>Lesson not found</h1>
  }

  return (
    <>
      <h1>{lesson.title}</h1>
      <p>{lesson.body}</p>
      {lesson.videoUrl.map((url, index) => (
        <iframe
          key={index}
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${url}`}
          title="YouTube video player"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ))}
      {lesson.Document && (
        <a
          href={`/api/upload?id=${lesson.Document.id}`}
          download={lesson.Document.name}
        >
          {lesson.Document.title}
        </a>
      )}
      <Link
        href={`/material/collections/${collectionId}/lessons/${lessonId}/edit`}
      >
        Editar
      </Link>
      {lesson.Questionnaires.map((questionnaire) => (
        <Link
          href={`/material/collections/${collectionId}/lessons/${lessonId}/questionnaire/${questionnaire.id}`}
          key={questionnaire.id}
        >
          {questionnaire.title}
        </Link>
      ))}
      <Link
        href={`/material/collections/${collectionId}/lessons/${lessonId}/questionnaire/add`}
      >
        Criar um questionário
      </Link>
    </>
  )
}
