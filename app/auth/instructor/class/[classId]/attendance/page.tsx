import { prisma } from '~/server/db'

import styles from './ClassAttendancePage.module.scss'
import { redirect } from 'next/navigation'
import AttendanceTable from '~/components/molecules/AttendanceTable'

export default async function ClassAttendancePage({
  params,
}: {
  params: { classId: string }
}) {
  const { classId } = params
  if (!classId || classId === 'redirect')
    redirect('/auth/instructor/classes?redirect=attendance')

  const classObj = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      SynchronousMeeting: {
        orderBy: { date: 'asc' },
        include: {
          AttendingStudents: { select: { id: true } },
          AbsentStudents: { select: { id: true } },
          ExcusedStudents: { select: { id: true } },
        },
      },
      Students: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  })

  if (!classObj) redirect('/auth/instructor/classes?redirect=attendance')

  return (
    <div className={styles.outerContainer}>
      <h1>Attendance</h1>

      <section className={styles.container}>
        {classObj.Students.length ? (
          <AttendanceTable class={classObj} />
        ) : (
          <p>No students in this class.</p>
        )}
      </section>
    </div>
  )
}
