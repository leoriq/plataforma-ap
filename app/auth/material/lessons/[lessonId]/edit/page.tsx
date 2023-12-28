import { prisma } from '~/server/db'
import LessonForm from '~/components/molecules/LessonForm'

export default async function EditLessonPage({
  params,
}: {
  params: { collectionId: string; lessonId: string }
}) {
  const { lessonId } = params
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    include: {
      Documents: true,
    },
  })

  if (!lesson) {
    return <h1>Lesson not found</h1>
  }

  return <LessonForm lesson={lesson} />
}
