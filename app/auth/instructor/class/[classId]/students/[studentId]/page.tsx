import { prisma } from '~/server/db'

import styles from './InstructorStudentPage.module.scss'
import ChartClient from '~/components/atoms/ChartClient'
import Link from 'next/link'

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
                where: {
                  publicationDate: { lte: new Date() },
                  Collection: { Classes: { some: { id: classId } } },
                },
                include: {
                  Questionnaires: {
                    include: {
                      Questions: {
                        include: {
                          UserAnswer: {
                            where: {
                              studentUserId: studentId,
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
      },
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

  const questionnaires = studentClass.Collection.Lessons.flatMap(
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

      return [questionnaire.id, grade]
    })
  )

  const meetings = [
    ...student.MeetingsAbsent.map((meeting) => ({
      ...meeting,
      status: 'Absent',
    })),
    ...student.MeetingsAttended.map((meeting) => ({
      ...meeting,
      status: 'Present',
    })),
    ...student.MeetingsExcused.map((meeting) => ({
      ...meeting,
      status: 'Excused',
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  const pieChartData = [
    ['Status', 'Count'],
    ['Present', student.MeetingsAttended.length],
    ['Excused', student.MeetingsExcused.length],
    ['Absent', student.MeetingsAbsent.length],
  ]

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
                <td>
                  <Link
                    href={`/auth/instructor/class/${classId}/students/${studentId}/${questionnaire.id}`}
                  >
                    {questionnaire.title}
                  </Link>
                </td>
                <td>
                  <Link
                    href={`/auth/instructor/class/${classId}/students/${studentId}/${questionnaire.id}`}
                  >
                    {unansweredQuestionnairesIdsSet.has(questionnaire.id)
                      ? 'Unanswered'
                      : ungradedQuestionnairesIdsSet.has(questionnaire.id)
                      ? 'Ungraded'
                      : questionnaireGradeMap.get(questionnaire.id)}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.container}>
        <h2>Attendance</h2>
        {meetings.length ? (
          <div className={styles.attendanceContentWrapper}>
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
                  <tr
                    key={meeting.id}
                    className={styles[`row${meeting.status}`]}
                  >
                    <td>{index + 1}</td>
                    <td>
                      {Intl.DateTimeFormat('en-US', {
                        timeZone: 'UTC',
                        dateStyle: 'medium',
                      }).format(meeting.date)}
                    </td>
                    <td>{meeting.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.chartWrapper}>
              <ChartClient
                chartType="PieChart"
                data={pieChartData}
                options={{
                  colors: ['#79cdb3', '#404266', '#d5403d'],
                  is3D: true,
                  legend: 'none',
                  backgroundColor: 'transparent',
                }}
                className={styles.chart}
                style={{
                  height: '100%',
                }}
              />
            </div>
          </div>
        ) : (
          <p>No attendance data.</p>
        )}
      </section>
    </div>
  )
}
