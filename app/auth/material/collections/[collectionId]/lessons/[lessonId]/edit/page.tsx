import { prisma } from '~/server/db'
import EditLessonForm from './components/EditLessonForm'

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

  return (
    <>
      <h1>Edit Lesson</h1>
      <EditLessonForm lesson={lesson} />
    </>
  )
}
