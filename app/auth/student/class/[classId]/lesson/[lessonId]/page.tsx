import { redirect } from 'next/navigation'
import LessonView from '~/components/molecules/LessonView'
import { prisma } from '~/server/db'

export default async function StudentLessonPage({
  params,
}: {
  params: { lessonId: string; classId: string }
}) {
  const { lessonId, classId } = params
  if (!lessonId) redirect(`/auth/student/class/${classId}/dashboard`)

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
      publicationDate: {
        lte: new Date(),
      },
    },
    include: {
      Documents: true,
      Questionnaires: true,
    },
  })

  if (!lesson) {
    return <h1>Lesson not found</h1>
  }

  return <LessonView lesson={lesson} />
}
