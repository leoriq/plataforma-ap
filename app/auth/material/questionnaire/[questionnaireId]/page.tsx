import { prisma } from '~/server/db'
import QuestionnaireView from '~/components/molecules/QuestionnaireView'
import { shuffleArray } from '~/utils/shuffleArray'

export default async function MaterialQuestionnairePage({
  params,
}: {
  params: { questionnaireId: string }
}) {
  const { questionnaireId } = params
  const dbQuestionnaire = await prisma.questionnaire.findUnique({
    where: {
      id: questionnaireId,
    },
    include: {
      Questions: { orderBy: { index: 'asc' } },
    },
  })

  if (!dbQuestionnaire) {
    return <h1>Questionnaire not found</h1>
  }

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

  return <QuestionnaireView showControls questionnaire={questionnaire} />
}
