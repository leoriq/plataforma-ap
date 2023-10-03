import { prisma } from '~/server/db'

export default async function ClassAttendancePage({
  params,
}: {
  params: { classId: string }
}) {
  const { classId } = params
  const classObj = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      SynchronousMeeting: true,
      Students: {
        include: {
          MeetingsAttended: true,
          MeetingsExcused: true,
          MeetingsAbsent: true,
        },
      },
    },
  })

  if (!classObj) {
    return <h1>Class not found</h1>
  }

  const meetingsAttendedByStudent = new Map(
    classObj.Students.map((student) => [
      student.id,
      new Set(student.MeetingsAttended.map((meeting) => meeting.id)),
    ])
  )

  const meetingsJustifiedByStudent = new Map(
    classObj.Students.map((student) => [
      student.id,
      new Set(student.MeetingsExcused.map((meeting) => meeting.id)),
    ])
  )

  return (
    <>
      <h1>Attendance</h1>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            {classObj.SynchronousMeeting.map((meeting) => (
              <th key={meeting.id}>{meeting.date.toDateString()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {classObj.Students.map((student) => (
            <tr key={student.id}>
              <td>{student.fullName}</td>
              {classObj.SynchronousMeeting.map((meeting) => (
                <td key={meeting.id}>
                  <input
                    type="checkbox"
                    checked={meetingsAttendedByStudent
                      .get(student.id)
                      ?.has(meeting.id)}
                  />
                  <input
                    type="checkbox"
                    checked={meetingsJustifiedByStudent
                      .get(student.id)
                      ?.has(meeting.id)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
