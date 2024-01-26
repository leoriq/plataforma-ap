import { redirect } from 'next/navigation'
import { prisma } from '~/server/db'
import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'

import styles from './StudentPractice.module.scss'
import QuestionnaireView from '~/components/molecules/QuestionnaireView'
import { shuffleArray } from '~/utils/shuffleArray'

export default async function StudentPractice({
  params,
}: {
  params: { classId: string }
}) {
  const user = await getAuthorizedSessionUser('STUDENT')
  if (!user) redirect('/login')

  const { classId } = params
  if (!classId || classId === 'redirect')
    redirect('/auth/student?redirect=practice')

  const questionnaireUnanswered = await prisma.questionnaire.findFirst({
    where: {
      Lesson: {
        publicationDate: {
          lte: new Date(),
        },
        Collection: {
          Classes: {
            some: {
              id: classId,
              Students: {
                some: {
                  id: user.id,
                },
              },
            },
          },
        },
      },

      Questions: {
        some: {
          UserAnswer: {
            none: {
              studentUserId: user.id,
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

  if (!questionnaireUnanswered) {
    return (
      <div className={styles.container}>
        <h1>Congrats! 🎉</h1>
        <p>
          You have completed all the activities available in this class for now!
          You can use that time to review your lessons or practice your skills
          by listening to songs, watching movies, reading, writing or talking.
          In English, of course! 😝
        </p>
      </div>
    )
  }

  const questionnaire = {
    ...questionnaireUnanswered,
    Questions: questionnaireUnanswered.Questions.map((q) => ({
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

  return <QuestionnaireView questionnaire={questionnaire} showSubmit />
}
