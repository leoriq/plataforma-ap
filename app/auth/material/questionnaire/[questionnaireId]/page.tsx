import { prisma } from '~/server/db'
import QuestionnaireView from '~/components/molecules/QuestionnaireView'
import { shuffleArray } from '~/utils/shuffleArray'

export default async function MaterialQuestionnairePage({
  params,
}: {
  params: { questionnaireId: string }
}) {
  const { questionnaireId } = params
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

  questionnaire.Questions.map((question) => {
    if (question.answerType === 'OPTIONS') {
      shuffleArray(question.options)
    }
  })

  return <QuestionnaireView showControls questionnaire={questionnaire} />
}
