import { prisma } from '~/server/db'

import styles from './InstructorStudentPage.module.scss'
import type { Question, Questionnaire } from '@prisma/client'

export default async function InstructorStudentPage({
  params,
}: {
  params: { classId: string; studentId: string }
}) {
  const { classId, studentId } = params
  const student = await prisma.user.findUnique({
    where: { id: studentId, roles: { has: 'STUDENT' } },
    include: {
      StudentClass: {
        include: {
          Collection: {
            include: {
              Lessons: {
                include: {
                  Questionnaires: {
                    include: {
                      Questions: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      Answers: { include: { Question: true } },
      MeetingsAbsent: {
        where: {
          classId,
        },
        orderBy: {
          date: 'asc',
        },
      },
      MeetingsAttended: {
        where: {
          classId,
        },
        orderBy: {
          date: 'asc',
        },
      },
      MeetingsExcused: {
        where: {
          classId,
        },
        orderBy: {
          date: 'asc',
        },
      },
    },
  })

  if (!student) {
    return <div>Student not found</div>
  }

  const studentClass = student.StudentClass.find(
    (studentClass) => studentClass.id === classId
  )
  if (!studentClass) {
    return <div>Student not found in class</div>
  }

  const questionnaires = studentClass.Collection.Lessons.reduce(
    (acc, lesson) => [...acc, ...lesson.Questionnaires],
    [] as (Questionnaire & { Questions: Question[] })[]
  )
  const questionnairesIds = questionnaires.map((q) => q.id)
  const unansweredQuestionnairesSet = new Set(questionnairesIds)
  const ungradedQuestionnairesSet = new Set(questionnairesIds)
  const questionnaireGradeMap = new Map(
    questionnaires.map((questionnaire) => {
      const questionsWeightSum = questionnaire.Questions.reduce(
        (acc, question) => acc + question.weight,
        0
      )
      return [
        questionnaire.id,
        student.Answers.reduce((acc, answer) => {
          if (answer.Question.questionnaireId === questionnaire.id) {
            unansweredQuestionnairesSet.delete(questionnaire.id)
            if (answer.grade !== null) {
              ungradedQuestionnairesSet.delete(questionnaire.id)
              return (
                acc +
                (answer.grade * answer.Question.weight) / questionsWeightSum
              )
            }
          }
          return acc
        }, 0).toFixed(2),
      ]
    })
  )

  const meetings = [
    ...student.MeetingsAbsent.map((meeting) => ({
      ...meeting,
      status: 'Absent',
    })),
    ...student.MeetingsAttended.map((meeting) => ({
      ...meeting,
      status: 'Attended',
    })),
    ...student.MeetingsExcused.map((meeting) => ({
      ...meeting,
      status: 'Excused',
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <div className={styles.outerContainer}>
      <h1>
        {student.fullName ?? student.email} - {studentClass.name}
      </h1>
      <section className={styles.container}>
        <h2>Info</h2>
        <div className={styles.info}>
          <p>Full name: {student.fullName ?? 'No data.'}</p>
          <p>Email: {student.email}</p>
          <p>Registered at: {student.createdAt.toLocaleString()}</p>

          <p>Classes: {student.StudentClass.map((c) => c.name).join(', ')}</p>
        </div>
      </section>

      <section className={styles.container}>
        <h2>Activities</h2>
        <table className={styles.gradeTable}>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {questionnaires.map((questionnaire) => (
              <tr key={questionnaire.id}>
                <td>{questionnaire.title}</td>
                <td>
                  {unansweredQuestionnairesSet.has(questionnaire.id)
                    ? 'Unanswered'
                    : ungradedQuestionnairesSet.has(questionnaire.id)
                    ? 'Ungraded'
                    : questionnaireGradeMap.get(questionnaire.id)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.container}>
        <h2>Attendance</h2>
        <table className={styles.attendanceTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting, index) => (
              <tr key={meeting.id}>
                <td>{index + 1}</td>
                <td>{meeting.date.toLocaleDateString()}</td>
                <td>{meeting.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
