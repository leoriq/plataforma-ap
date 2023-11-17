import { prisma } from '~/server/db'
import Image from 'next/image'
import Link from 'next/link'

export default async function MaterialLessonPage({
  params,
}: {
  params: { collectionId: string; lessonId: string; questionnaireId: string }
}) {
  const { questionnaireId, collectionId, lessonId } = params
  const questionnaire = await prisma.questionnaire.findUnique({
    where: {
      id: questionnaireId,
    },
    include: {
      Questions: true,
    },
  })

  if (!questionnaire) {
    return <h1>Questionnaire not found</h1>
  }

  console.log(questionnaire)

  return (
    <>
      <h1>{questionnaire.title}</h1>
      <ul>
        {questionnaire.Questions.map((question, index) => (
          <li key={index}>
            <h3>{question.title}</h3>
            {!!question.description && <p>{question.description}</p>}
            {!!question.videoUrl && (
              <iframe
                key={index}
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${question.videoUrl}`}
                title="YouTube video player"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
            {!!question.imageFileId && (
              <Image
                src={`/api/upload?id=${question.imageFileId}`}
                alt={question.title}
                width={500}
                height={500}
              />
            )}
            {!!question.audioFileId && (
              <audio controls src={`/api/upload?id=${question.audioFileId}`} />
            )}
            <p>Tipo de resposta: {question.answerType}</p>
            {!!question.options && (
              <ul>
                {question.options.map((option) => (
                  <li key={option}>{option}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <Link href={`/material/questionnaire/${questionnaire.id}/edit`}>
        Editar
      </Link>
    </>
  )
}
