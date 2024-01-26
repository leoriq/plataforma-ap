import { redirect } from 'next/navigation'
import QuestionnaireView from '~/components/molecules/QuestionnaireView'
import { prisma } from '~/server/db'
import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'
import { shuffleArray } from '~/utils/shuffleArray'

export default async function StudentQuestionnairePage({
  params,
}: {
  params: { classId: string; questionnaireId: string }
}) {
  const { questionnaireId } = params
  if (!questionnaireId) return <div>No questionnaire provided</div>

  const user = await getAuthorizedSessionUser('STUDENT')
  if (!user) redirect('/login')

  const dbQuestionnaire = await prisma.questionnaire.findUnique({
    where: {
      id: questionnaireId,
      Lesson: {
        publicationDate: {
          lte: new Date(),
        },
        Collection: {
          Classes: {
            some: {
              Students: {
                some: {
                  id: user.id,
                },
              },
            },
          },
        },
      },
    },

    include: {
      Questions: {
        include: {
          UserAnswer: {
            where: {
              studentUserId: user.id,
            },
          },
        },
      },
    },
  })

  if (!dbQuestionnaire) return <div>Questionnaire not found</div>

  const isAnswered = dbQuestionnaire.Questions.some(
    (q) => q.UserAnswer.length > 0
  )

  const questionnaire = {
    ...dbQuestionnaire,
    Questions: dbQuestionnaire.Questions.map((q) => ({
      ...q,
      imageFileUrl: q.imageFileId && `/api/upload?id=${q.imageFileId}`,
      audioFileUrl: q.audioFileId && `/api/upload?id=${q.audioFileId}`,
    })),
  }

  questionnaire.Questions.forEach((question) => {
    if (question.answerType === 'OPTIONS') {
      shuffleArray(question.options)
    }
  })

  return (
    <QuestionnaireView
      questionnaire={questionnaire}
      disabled={isAnswered}
      showSubmit={!isAnswered}
    />
  )
}
