import QuestionnaireForm from '~/components/organisms/QuestionnaireForm'
import { prisma } from '~/server/db'
import styles from './UpdateQuestionnairePage.module.scss'

export default async function UpdateQuestionnairePage({
  params,
}: {
  params: { questionnaireId: string }
}) {
  const { questionnaireId } = params
  if (!questionnaireId) {
    return <h1>Questionnaire id is required</h1>
  }

  const questionnaire = await prisma.questionnaire.findUnique({
    where: {
      id: questionnaireId,
    },
    select: {
      id: true,
      title: true,
      weight: true,
      Questions: {
        orderBy: { index: 'asc' },
        include: { UserAnswer: { select: { id: true }, take: 1 } },
      },
    },
  })

  if (!questionnaire) {
    return <h1 className={styles.alert}>Questionnaire not found</h1>
  }

  if (questionnaire.Questions.some((q) => q.UserAnswer.length > 0)) {
    return (
      <h1 className={styles.alert}>
        Questionnaire cannot be edited because it has already been answered
      </h1>
    )
  }

  const parsedQuestionnaire = {
    ...questionnaire,
    Questions: questionnaire.Questions.map((q) => ({
      ...q,
      UserAnswer: undefined,
    })),
  }

  return (
    <>
      <QuestionnaireForm questionnaire={parsedQuestionnaire} />
    </>
  )
}
