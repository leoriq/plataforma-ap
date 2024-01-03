import { prisma } from '~/server/db'

import LessonView from '~/components/molecules/LessonView'

export default async function MaterialLessonPage({
  params,
}: {
  params: { lessonId: string }
}) {
  const { lessonId } = params
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    include: {
      Documents: true,
      Questionnaires: true,
    },
  })

  if (!lesson) {
    return <h1>Lesson not found</h1>
  }

  return <LessonView lesson={lesson} showControls />
}
