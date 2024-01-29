import { redirect } from 'next/navigation'

import styles from './StudentDashboard.module.scss'
import { prisma } from '~/server/db'
import getAuthorizedSessionUser from '~/utils/getAuthorizedSessionUser'
import CheckIcon from '~/components/atoms/icons/CheckIcon'
import classNames from 'classnames'
import Link from 'next/link'
import Image from 'next/image'

export default async function StudentDashboard({
  params,
}: {
  params: { classId: string }
}) {
  const user = await getAuthorizedSessionUser('STUDENT')
  if (!user) redirect('/sign-out')
  const { classId } = params
  if (!classId || classId === 'redirect')
    redirect('/auth/student?redirect=dashboard')

  const classObj = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      Instructors: true,
      SynchronousMeeting: {
        include: {
          AttendingStudents: {
            where: {
              id: user.id,
            },
          },
          AbsentStudents: {
            where: {
              id: user.id,
            },
          },
          ExcusedStudents: {
            where: {
              id: user.id,
            },
          },
        },
      },
      Collection: {
        include: {
          Lessons: {
            where: {
              publicationDate: {
                lte: new Date(),
              },
            },
            orderBy: {
              publicationDate: 'asc',
            },
            include: {
              Questionnaires: {
                include: {
                  Questions: {
                    include: {
                      UserAnswer: {
                        where: {
                          studentUserId: user.id,
                        },
                        select: {
                          grade: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!classObj) redirect('/auth/student?redirect=dashboard')

  const questionnaires = classObj.Collection.Lessons.flatMap(
    (lesson) => lesson.Questionnaires
  )

  const unansweredQuestionnairesIdsSet = new Set(
    questionnaires
      .filter((questionnaire) =>
        questionnaire.Questions.every((question) => !question.UserAnswer[0])
      )
      .map((questionnaire) => questionnaire.id)
  )
  const ungradedQuestionnairesIdsSet = new Set(
    questionnaires
      .filter((questionnaire) =>
        questionnaire.Questions.every(
          (question) =>
            question.UserAnswer[0] && question.UserAnswer[0].grade === null
        )
      )
      .map((questionnaire) => questionnaire.id)
  )

  const questionnaireGradeMap = new Map(
    questionnaires.map((questionnaire) => {
      if (unansweredQuestionnairesIdsSet.has(questionnaire.id))
        return [questionnaire.id, 'Unanswered']

      if (ungradedQuestionnairesIdsSet.has(questionnaire.id))
        return [questionnaire.id, 'Ungraded']

      const questionsWeightSum = questionnaire.Questions.reduce(
        (acc, question) => acc + question.weight,
        0
      )

      const grade = questionnaire.Questions.reduce(
        (acc, question) =>
          acc +
          (question.UserAnswer[0]?.grade ?? 0) *
            (question.weight / questionsWeightSum),
        0
      )

      return [questionnaire.id, grade.toString()]
    })
  )

  const lessonsInfos = classObj.Collection.Lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    completionPercentage: Math.round(
      (lesson.Questionnaires.filter(
        (questionnaire) => !unansweredQuestionnairesIdsSet.has(questionnaire.id)
      ).length / lesson.Questionnaires.length || 1) * 100
    ),
    Questionnaires: lesson.Questionnaires.map((questionnaire) => ({
      id: questionnaire.id,
      title: questionnaire.title,
      answered: !unansweredQuestionnairesIdsSet.has(questionnaire.id),
      graded: !ungradedQuestionnairesIdsSet.has(questionnaire.id),
      grade: questionnaireGradeMap.get(questionnaire.id),
    })),
  }))

  return (
    <div className={styles.outerContainer}>
      <h1>Welcome to {classObj.name}!</h1>

      <section className={styles.container}>
        <h2>Class Info</h2>
        <p>{classObj.description}</p>
        <div>
          <div className={styles.instructors}>
            <p>Instructors:</p>
            {classObj.Instructors.map((instructor) => (
              <div className={styles.instructorInfo} key={instructor.id}>
                {instructor.profilePictureFileId && (
                  <div className={styles.instructorImageContainer}>
                    <Image
                      src={`/api/upload?id=${instructor.profilePictureFileId}`}
                      sizes="3rem"
                      fill
                      alt="Instructor profile picture"
                    />
                  </div>
                )}
                <p>{instructor.fullName ?? instructor.email}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>Lessons</h2>

        <ul className={styles.lessonList}>
          {lessonsInfos.map((lesson) => (
            <li key={lesson.id} className={styles.lessonItem}>
              <Link
                className={styles.lessonLink}
                href={`/auth/student/class/${classId}/lesson/${lesson.id}`}
              >
                <h3>{lesson.title}</h3>
              </Link>

              <ul className={styles.questionnaireList}>
                {lesson.Questionnaires.map((questionnaire) => (
                  <Link
                    key={questionnaire.id}
                    href={`/auth/student/class/${classId}/questionnaire/${questionnaire.id}`}
                    className={classNames(
                      styles.questionnaireItem,
                      !questionnaire.answered && styles.unanswered
                    )}
                  >
                    <div className={styles.questionnaireTitleAndCheck}>
                      <div className={styles.checkContainer}>
                        <CheckIcon />
                      </div>
                      <h4>{questionnaire.title}</h4>
                    </div>
                    <p>
                      {questionnaire.answered
                        ? questionnaire.graded
                          ? `${questionnaire.grade || '0'}/10`
                          : 'Ungraded'
                        : 'Unanswered'}
                    </p>
                  </Link>
                ))}
              </ul>
              <div className={styles.completionPercentageOuter}>
                <div
                  className={classNames(
                    lesson.completionPercentage === 100 && styles.completed
                  )}
                  style={{
                    width: `${lesson.completionPercentage}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
