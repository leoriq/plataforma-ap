import { prisma } from '~/server/db'
import styles from './ClassDashboard.module.scss'
import { redirect } from 'next/navigation'
import BarChartClient from '~/components/atoms/BarChartClient'

export default async function ClassDashboard({
  params,
}: {
  params: { classId?: string }
}) {
  const { classId } = params
  if (!classId || classId === 'redirect')
    redirect('/auth/instructor/classes?redirect=dashboard')

  const classObj = await prisma.class.findUnique({
    where: { id: params.classId },
    include: {
      Instructors: true,
      SynchronousMeeting: {
        orderBy: { date: 'asc' },
        include: {
          AttendingStudents: true,
          AbsentStudents: true,
          ExcusedStudents: true,
        },
      },
      Students: {
        include: {
          Answers: {
            include: {
              Question: true,
            },
          },
        },
      },
      Collection: {
        include: {
          Lessons: {
            where: { publicationDate: { lte: new Date() } },
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
  })

  if (!classObj) redirect('/auth/instructor/classes?redirect=dashboard')

  const allQuestionnaires = classObj.Collection.Lessons.flatMap(
    (lesson) => lesson.Questionnaires
  )
  const questionnairesTotalWeight = allQuestionnaires.reduce(
    (total, questionnaire) => total + questionnaire.weight,
    0
  )

  const studentsAverages = new Map(
    classObj.Students.map((student) => {
      const averageGrade =
        allQuestionnaires.reduce((accQuestionnaires, questionnaire) => {
          const questionsTotalWeight = questionnaire.Questions.reduce(
            (acc, question) => acc + question.weight,
            0
          )
          const questionnaireGrade =
            student.Answers.reduce((accAnswers, answer) => {
              if (answer.Question.questionnaireId === questionnaire.id) {
                if (answer.grade !== null) {
                  return accAnswers + answer.grade * answer.Question.weight
                }
              }
              return accAnswers
            }, 0) / questionsTotalWeight

          return accQuestionnaires + questionnaireGrade * questionnaire.weight
        }, 0) / questionnairesTotalWeight

      return [student.id, averageGrade]
    })
  )

  const questionnairesAverages = new Map(
    allQuestionnaires.map((questionnaire) => {
      const questionsTotalWeight = questionnaire.Questions.reduce(
        (acc, question) => acc + question.weight,
        0
      )
      const questionnaireAverage =
        classObj.Students.reduce((accStudents, student) => {
          const studentAnswer = student.Answers.find(
            (answer) => answer.Question.questionnaireId === questionnaire.id
          )
          if (studentAnswer) {
            return (
              accStudents +
              (studentAnswer.grade ?? 0) * studentAnswer.Question.weight
            )
          }
          return accStudents
        }, 0) / questionsTotalWeight

      return [questionnaire.id, questionnaireAverage]
    })
  )

  const meetingAttendance = classObj.SynchronousMeeting.map((meeting) => ({
    date: meeting.date,
    totalAbsent: meeting.AbsentStudents.length,
    totalExcused: meeting.ExcusedStudents.length,
    totalPresent: meeting.AttendingStudents.length,
  }))

  const attendanceSeries = [
    {
      data: meetingAttendance.map((meeting) => meeting.totalPresent),
      label: 'Present',
      stack: 'A',
      color: '#79cdb3',
    },
    {
      data: meetingAttendance.map((meeting) => meeting.totalExcused),
      label: 'Excused',
      stack: 'A',
      color: '#404266',
    },
    {
      data: meetingAttendance.map((meeting) => meeting.totalAbsent),
      label: 'Absent',
      stack: 'A',
      color: '#d5403d',
    },
  ]
  const xAxis = meetingAttendance.map((meeting) =>
    Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
    }).format(meeting.date)
  )

  return (
    <div className={styles.outerContainer}>
      <h1>Class Dashboard</h1>

      <section className={styles.container}>
        <h2>Attendance</h2>

        {!xAxis.length ? (
          <p>No data.</p>
        ) : (
          <div className={styles.chartWrapper}>
            <BarChartClient
              series={attendanceSeries}
              xAxis={[{ data: xAxis, scaleType: 'band' }]}
            />
          </div>
        )}
      </section>

      <div className={styles.doubleColumn}>
        <section className={styles.container}>
          <h2>Student Averages</h2>
          <table className={styles.averageTable}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {classObj.Students.length ? (
                classObj.Students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.fullName ?? student.email}</td>
                    <td>{studentsAverages.get(student.id)?.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>No students in this class.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className={styles.container}>
          <h2>Activity Averages</h2>

          <table className={styles.averageTable}>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody>
              {allQuestionnaires.length ? (
                allQuestionnaires.map((questionnaire) => (
                  <tr key={questionnaire.id}>
                    <td>{questionnaire.title}</td>
                    <td>
                      {questionnairesAverages.get(questionnaire.id)?.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>No activities in this class.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}
