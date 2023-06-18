import { prisma } from '~/server/db'

export default async function MaterialLessonPage({
  params,
}: {
  params: { collectionId: string; lessonId: string }
}) {
  const { lessonId } = params
  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
  })

  if (!lesson) {
    return <h1>Lesson not found</h1>
  }

  return (
    <>
      <h1>{lesson.title}</h1>
      <p>{lesson.body}</p>
      {lesson.videoUrl.map((url, index) => (
        <iframe
          key={index}
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${url}`}
          title="YouTube video player"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ))}
    </>
  )
}
