import { prisma } from '~/server/db'
import EditQuestionnaireForm from './components/EditQuestionnaireForm'

export default async function EditQuestionnairePage({
  params,
}: {
  params: { collectionId: string; lessonId: string; questionnaireId: string }
}) {
  const { questionnaireId } = params
  const questionnaire = await prisma.questionnaire.findUnique({
    where: {
      id: questionnaireId,
    },
    include: {
      Questions: {
        include: {
          Image: true,
          Audio: true,
        },
      },
    },
  })

  if (!questionnaire) {
    return <h1>Questionnaire not found</h1>
  }

  return (
    <>
      <h1>Edit Lesson</h1>
      <EditQuestionnaireForm
        questionnaire={questionnaire}
        questions={questionnaire.Questions}
      />
    </>
  )
}
