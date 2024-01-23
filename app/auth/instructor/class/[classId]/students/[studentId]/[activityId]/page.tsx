import QuestionnaireView from '~/components/molecules/QuestionnaireView'
import { prisma } from '~/server/db'

export default async function GradeActivityPage({
  params,
}: {
  params: { classId: string; studentId: string; activityId: string }
}) {
  if (!params.activityId) {
    return <div>Activity not found</div>
  }

  const dbQuestionnaire = await prisma.questionnaire.findUnique({
    where: { id: params.activityId },
    include: {
      Questions: {
        include: {
          UserAnswer: {
            where: { studentUserId: params.studentId },
          },
        },
      },
    },
  })

  if (!dbQuestionnaire) {
    return <div>Activity not found</div>
  }

  const questionnaire = {
    ...dbQuestionnaire,
    Questions: dbQuestionnaire.Questions.map((q) => ({
      ...q,
      imageFileUrl: q.imageFileId && `/api/upload?id=${q.imageFileId}`,
      audioFileUrl: q.audioFileId && `/api/upload?id=${q.audioFileId}`,
    })),
  }

  return (
    <QuestionnaireView
      questionnaire={questionnaire}
      disabled
      showInstructorControls
    />
  )
}
