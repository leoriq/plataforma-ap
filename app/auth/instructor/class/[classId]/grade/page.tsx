import { redirect } from 'next/navigation'
import QuestionnaireView from '~/components/molecules/QuestionnaireView'
import { prisma } from '~/server/db'

export default async function GradePage({
  params,
}: {
  params: { classId: string }
}) {
  const { classId } = params
  if (!classId || classId === 'redirect')
    redirect('/auth/instructor/classes?redirect=grade')

  const questionnairesUngraded = await prisma.questionnaire.findMany({
    where: {
      Lesson: {
        Collection: {
          Classes: {
            some: {
              id: classId,
            },
          },
        },
      },

      Questions: {
        some: {
          UserAnswer: {
            some: {
              grade: null,
            },
          },
        },
      },
    },

    include: {
      Questions: {
        include: {
          UserAnswer: true,
        },
      },
    },
  })

  if (!questionnairesUngraded.length) {
    return <h1>No activities to be graded in this class</h1>
  }

  const possibleStudents = questionnairesUngraded.flatMap((q) =>
    q.Questions.flatMap((question) =>
      question.UserAnswer.map((answer) => answer.studentUserId)
    )
  )

  const dbQuestionnaire = questionnairesUngraded.reduce(
    (acc, q) => {
      if (acc) return acc

      const student = possibleStudents.find(
        (studentId) =>
          q.Questions.every((question) =>
            question.UserAnswer.some(
              (answer) => answer.studentUserId === studentId
            )
          ) &&
          q.Questions.some((question) =>
            question.UserAnswer.some(
              (answer) =>
                answer.studentUserId === studentId && answer.grade === null
            )
          )
      )

      if (!student) return acc
      return {
        ...q,
        Questions: q.Questions.map((question) => ({
          ...question,
          UserAnswer: question.UserAnswer.filter(
            (answer) => answer.studentUserId === student
          ),
        })),
      }
    },

    null as (typeof questionnairesUngraded)[0] | null
  )

  if (!dbQuestionnaire) {
    return <h1>No activities to be graded in this class</h1>
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
